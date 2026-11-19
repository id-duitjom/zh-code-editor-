export interface Env {
  DB: D1Database;
  AUTH_KV: KVNamespace;
  APP_NAME: string;
  APP_ORIGIN: string;
  AUTH_WORKER_ORIGIN: string;
  FROM_EMAIL: string;
  ALLOWED_ORIGINS: string;
  RESEND_API_KEY: string;
  SESSION_SECRET: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
}

type JsonRecord = Record<string, unknown>;

function json(env: Env, body: unknown, status = 200, extraHeaders: HeadersInit = {}) {
  const origin = env.APP_ORIGIN;
  const headers = new Headers(extraHeaders);
  headers.set("content-type", "application/json; charset=utf-8");
  headers.set("access-control-allow-origin", origin);
  headers.set("access-control-allow-credentials", "true");
  headers.set("vary", "Origin");
  return new Response(JSON.stringify(body), { status, headers });
}

function allowedOrigins(env: Env) {
  return (env.ALLOWED_ORIGINS || env.APP_ORIGIN).split(",").map((value) => value.trim());
}

function corsJson(
  env: Env,
  request: Request,
  body: unknown,
  status = 200,
  extraHeaders: HeadersInit = {},
) {
  const origin = request.headers.get("Origin");
  const allowed = allowedOrigins(env);
  const headers = new Headers(extraHeaders);
  if (origin && allowed.includes(origin)) {
    headers.set("access-control-allow-origin", origin);
  }
  return json(env, body, status, headers);
}

function randomId() {
  return crypto.randomUUID();
}

function randomCode() {
  return String(crypto.getRandomValues(new Uint32Array(1))[0] % 1000000).padStart(6, "0");
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function derivePassword(password: string, saltHex: string) {
  const salt = new Uint8Array(saltHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 150000, hash: "SHA-256" },
    keyMaterial,
    256,
  );
  return [...new Uint8Array(bits)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function hashPassword(password: string) {
  const salt = [...crypto.getRandomValues(new Uint8Array(16))]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  return `pbkdf2_sha256$150000$${salt}$${await derivePassword(password, salt)}`;
}

async function verifyPassword(password: string, stored: string) {
  const parts = stored.split("$");
  if (parts.length !== 4) return false;
  return (await derivePassword(password, parts[2])) === parts[3];
}

function validatePassword(password: string) {
  return password.length >= 8 &&
    /[A-Za-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password);
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function signSession(env: Env, userId: string) {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(JSON.stringify({ sub: userId, exp: Math.floor(Date.now() / 1000) + 7 * 86400 }));
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(env.SESSION_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${header}.${payload}`));
  const encoded = [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${header}.${payload}.${encoded}`;
}

async function readJson(request: Request): Promise<JsonRecord> {
  try {
    return await request.json() as JsonRecord;
  } catch {
    return {};
  }
}

async function sendEmail(env: Env, to: string, subject: string, html: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ from: env.FROM_EMAIL, to: [to], subject, html }),
  });
  if (!response.ok) {
    throw new Error(`Email delivery failed: ${await response.text()}`);
  }
}

function emailShell(title: string, body: string) {
  return `<!doctype html><html><body style="margin:0;background:#0b1220;font-family:Arial,sans-serif;color:#1f2937">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 12px"><tr><td align="center">
  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:12px;padding:32px">
  <h1 style="color:#6d28d9;margin-top:0">${envName(title)}</h1>${body}
  </table></td></tr></table></body></html>`;
}

function envName(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
  }[character]!));
}

async function createCode(env: Env, email: string, purpose: string, userId?: string) {
  const code = randomCode();
  const codeHash = await sha256(code);
  const now = new Date();
  await env.DB.prepare(
    "INSERT INTO auth_codes (id,user_id,email,code_hash,purpose,expires_at,used_at,created_at) VALUES (?,?,?,?,?,?,NULL,?)",
  ).bind(randomId(), userId || null, email.toLowerCase(), codeHash, purpose,
    new Date(now.getTime() + 10 * 60 * 1000).toISOString(), now.toISOString()).run();

  const html = emailShell(
    `${purpose.replaceAll("_", " ")} code`,
    `<p>Your verification code is:</p>
     <div style="font-size:32px;letter-spacing:8px;font-weight:bold;text-align:center;padding:20px;background:#f3f4f6;border-radius:8px">${code}</div>
     <p>This code expires in 10 minutes. If you did not request it, ignore this email.</p>`,
  );
  await sendEmail(env, email, `${code} - ${purpose.replaceAll("_", " ")}`, html);
  return code;
}

async function resendLimit(env: Env, email: string) {
  const key = `otp_limit:${email.toLowerCase()}`;
  const existing = await env.AUTH_KV.get(key);
  if (existing) return false;
  await env.AUTH_KV.put(key, "1", { expirationTtl: 60 });
  return true;
}

async function verifyCode(env: Env, email: string, code: string, purpose: string) {
  const codeHash = await sha256(code);
  const row = await env.DB.prepare(
    `SELECT id FROM auth_codes
     WHERE email=? AND purpose=? AND code_hash=? AND used_at IS NULL AND expires_at > ?
     ORDER BY created_at DESC LIMIT 1`,
  ).bind(email.toLowerCase(), purpose, codeHash, new Date().toISOString()).first();
  if (!row) return false;
  await env.DB.prepare("UPDATE auth_codes SET used_at=? WHERE id=?")
    .bind(new Date().toISOString(), row.id).run();
  return true;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === "OPTIONS") {
      const origin = request.headers.get("Origin");
      const allowed = allowedOrigins(env);
      return new Response(null, {
        status: 204,
        headers: {
          "access-control-allow-origin": origin && allowed.includes(origin) ? origin : "null",
          "access-control-allow-methods": "GET,POST,OPTIONS",
          "access-control-allow-headers": "Content-Type",
          "access-control-allow-credentials": "true",
        },
      });
    }

    if (path === "/health") return corsJson(env, request, { ok: true });

    if (path === "/auth/register" && request.method === "POST") {
      const data = await readJson(request);
      const username = String(data.username || "").trim();
      const fullName = String(data.full_name || "").trim();
      const email = String(data.email || "").trim().toLowerCase();
      const phone = String(data.phone || "").trim();
      const password = String(data.password || "");
      if (!username || !fullName || !isEmail(email) || !validatePassword(password)) {
        return corsJson(env, request, { error: "Invalid registration details or password." }, 400);
      }
      const existing = await env.DB.prepare(
        "SELECT id FROM users WHERE email=? OR username=?",
      ).bind(email, username).first();
      if (existing) return corsJson(env, request, { error: "Email or username already exists." }, 409);

      const id = randomId();
      const now = new Date().toISOString();
      await env.DB.prepare(
        "INSERT INTO users (id,username,full_name,phone,email,password_hash,email_verified,created_at,updated_at) VALUES (?,?,?,?,?,?,0,?,?)",
      ).bind(id, username, fullName, phone, email, await hashPassword(password), now, now).run();
      await createCode(env, email, "VERIFY_ACCOUNT", id);
      return corsJson(env, request, {
        ok: true,
        message: "A verification email has been sent. Check your inbox or spam folder.",
      }, 201);
    }

    if (path === "/auth/resend-otp" && request.method === "POST") {
      const data = await readJson(request);
      const email = String(data.email || "").trim().toLowerCase();
      const purpose = String(data.purpose || "EMAIL_OTP").toUpperCase();
      if (!isEmail(email)) return corsJson(env, request, { error: "Invalid email." }, 400);
      if (!["VERIFY_ACCOUNT", "PASSWORD_RESET", "EMAIL_OTP"].includes(purpose)) {
        return corsJson(env, request, { error: "Invalid purpose." }, 400);
      }
      if (!(await resendLimit(env, email))) {
        return corsJson(env, request, { error: "Please wait 60 seconds before requesting another code." }, 429);
      }
      const user = await env.DB.prepare("SELECT id FROM users WHERE email=?").bind(email).first();
      await createCode(env, email, purpose, user ? String(user.id) : undefined);
      return corsJson(env, request, {
        ok: true,
        message: "A one-time password was sent to your email address.",
      });
    }

    if (path === "/auth/verify-email" && request.method === "POST") {
      const data = await readJson(request);
      const email = String(data.email || "").trim().toLowerCase();
      const code = String(data.code || "").trim();
      const purpose = String(data.purpose || "VERIFY_ACCOUNT").toUpperCase();
      if (!(await verifyCode(env, email, code, purpose))) {
        return corsJson(env, request, { error: "Invalid or expired code." }, 400);
      }
      if (purpose === "VERIFY_ACCOUNT") {
        await env.DB.prepare("UPDATE users SET email_verified=1,updated_at=? WHERE email=?")
          .bind(new Date().toISOString(), email).run();
        const user = await env.DB.prepare(
          "SELECT id,full_name,username,email FROM users WHERE email=?",
        ).bind(email).first();
        if (user) {
          await sendEmail(env, email, `Welcome to ${env.APP_NAME}`,
            emailShell("Welcome!", `<p>Hi ${envName(String(user.full_name))},</p><p>Your account is ready. Welcome to ${envName(env.APP_NAME)}.</p>`));
        }
      }
      return corsJson(env, request, { ok: true });
    }

    if (path === "/auth/signin/password" && request.method === "POST") {
      const data = await readJson(request);
      const identifier = String(data.identifier || "").trim();
      const password = String(data.password || "");
      const user = await env.DB.prepare(
        "SELECT id,email,password_hash,email_verified FROM users WHERE email=? OR username=?",
      ).bind(identifier.toLowerCase(), identifier).first();
      if (!user || !user.password_hash || !(await verifyPassword(password, String(user.password_hash)))) {
        return corsJson(env, request, { error: "Invalid email, username, or password." }, 401);
      }
      if (!user.email_verified) {
        return corsJson(env, request, { error: "Please verify your email before signing in.", code: "EMAIL_NOT_VERIFIED" }, 403);
      }
      const token = await signSession(env, String(user.id));
      return corsJson(env, request, { ok: true, token }, 200, {
        "set-cookie": `zh_session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`,
      });
    }

    if (path === "/auth/forgot-password/request" && request.method === "POST") {
      const data = await readJson(request);
      const email = String(data.email || "").trim().toLowerCase();
      const oldPassword = String(data.old_password || "");
      if (!isEmail(email)) return corsJson(env, request, { error: "Invalid email." }, 400);
      if (!(await resendLimit(env, email))) {
        return corsJson(env, request, { error: "Please wait 60 seconds before requesting another code." }, 429);
      }
      const user = await env.DB.prepare(
        "SELECT id,password_hash FROM users WHERE email=?",
      ).bind(email).first();
      if (!user || !user.password_hash || !oldPassword ||
          !(await verifyPassword(oldPassword, String(user.password_hash)))) {
        return corsJson(env, request, { error: "Invalid email or old password." }, 400);
      }
      await createCode(env, email, "PASSWORD_RESET", String(user.id));
      return corsJson(env, request, {
        ok: true,
        message: "A one-time password was sent to your email address.",
      });
    }

    if (path === "/auth/forgot-password/reset" && request.method === "POST") {
      const data = await readJson(request);
      const email = String(data.email || "").trim().toLowerCase();
      const code = String(data.code || "").trim();
      const password = String(data.password || "");
      if (!validatePassword(password)) {
        return corsJson(env, request, { error: "Password does not meet requirements." }, 400);
      }
      if (!(await verifyCode(env, email, code, "PASSWORD_RESET"))) {
        return corsJson(env, request, { error: "Invalid or expired code." }, 400);
      }
      await env.DB.prepare("UPDATE users SET password_hash=?,updated_at=? WHERE email=?")
        .bind(await hashPassword(password), new Date().toISOString(), email).run();
      return corsJson(env, request, { ok: true, message: "Password updated." });
    }

    if (path === "/auth/magic-link/request" && request.method === "POST") {
      const data = await readJson(request);
      const email = String(data.email || "").trim().toLowerCase();
      if (!isEmail(email)) return corsJson(env, request, { error: "Invalid email." }, 400);
      const token = crypto.randomUUID();
      await env.AUTH_KV.put(`magic:${token}`, email, { expirationTtl: 900 });
      const link = `${env.AUTH_WORKER_ORIGIN}/auth/magic-link/verify?token=${encodeURIComponent(token)}`;
      await sendEmail(env, email, `Sign in to ${env.APP_NAME}`,
        emailShell("Sign in securely",
          `<p>Click the button below to sign in. This link expires in 15 minutes.</p>
           <p><a href="${link}" style="display:inline-block;padding:12px 20px;background:#6d28d9;color:white;text-decoration:none;border-radius:8px">Sign in</a></p>`));
      return corsJson(env, request, { ok: true });
    }

    if (path === "/auth/magic-link/verify" && request.method === "GET") {
      const token = url.searchParams.get("token") || "";
      const email = await env.AUTH_KV.get(`magic:${token}`);
      if (!email) return Response.redirect(`${env.APP_ORIGIN}/signin?error=invalid_magic_link`, 302);
      await env.AUTH_KV.delete(`magic:${token}`);
      const user = await env.DB.prepare("SELECT id,email_verified FROM users WHERE email=?").bind(email).first();
      if (!user) return Response.redirect(`${env.APP_ORIGIN}/signin?error=unknown_account`, 302);
      if (!user.email_verified) {
        await env.DB.prepare("UPDATE users SET email_verified=1,updated_at=? WHERE email=?")
          .bind(new Date().toISOString(), email).run();
      }
      const session = await signSession(env, String(user.id));
      return new Response(null, {
        status: 302,
        headers: {
          location: `${env.APP_ORIGIN}/dashboard`,
          "set-cookie": `zh_session=${session}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`,
        },
      });
    }

    if (path === "/auth/google" && request.method === "GET") {
      const state = randomId();
      await env.AUTH_KV.put(`oauth:${state}`, "google", { expirationTtl: 600 });
      const callback = `${env.AUTH_WORKER_ORIGIN}/auth/google/callback`;
      const params = new URLSearchParams({
        client_id: env.GOOGLE_CLIENT_ID || "",
        redirect_uri: callback,
        response_type: "code",
        scope: "openid email profile",
        state,
        prompt: "select_account",
      });
      return Response.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`, 302);
    }

    if (path === "/auth/google/callback" && request.method === "GET") {
      const state = url.searchParams.get("state") || "";
      if (await env.AUTH_KV.get(`oauth:${state}`) !== "google") {
        return Response.redirect(`${env.APP_ORIGIN}/signin?error=invalid_oauth_state`, 302);
      }
      await env.AUTH_KV.delete(`oauth:${state}`);
      const code = url.searchParams.get("code");
      if (!code) return Response.redirect(`${env.APP_ORIGIN}/signin?error=oauth_cancelled`, 302);
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: env.GOOGLE_CLIENT_ID || "",
          client_secret: env.GOOGLE_CLIENT_SECRET || "",
          redirect_uri: `${env.AUTH_WORKER_ORIGIN}/auth/google/callback`,
          grant_type: "authorization_code",
        }),
      });
      const tokenData = await tokenResponse.json() as JsonRecord;
      const profileResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { authorization: `Bearer ${tokenData.access_token}` },
      });
      const profile = await profileResponse.json() as JsonRecord;
      const email = String(profile.email || "").toLowerCase();
      if (!email) return Response.redirect(`${env.APP_ORIGIN}/signin?error=oauth_email_missing`, 302);
      let user = await env.DB.prepare("SELECT id FROM users WHERE google_sub=? OR email=?")
        .bind(String(profile.id), email).first();
      if (!user) {
        const id = randomId();
        const now = new Date().toISOString();
        await env.DB.prepare(
          "INSERT INTO users (id,username,full_name,phone,email,password_hash,email_verified,google_sub,created_at,updated_at) VALUES (?,?,?,?,?,NULL,1,?,?,?)",
        ).bind(id, `google_${String(profile.id).slice(-12)}`, String(profile.name || email),
          null, email, String(profile.id), now, now).run();
        user = await env.DB.prepare("SELECT id FROM users WHERE id=?").bind(id).first();
      }
      const session = await signSession(env, String(user!.id));
      return new Response(null, { status: 302, headers: {
        location: `${env.APP_ORIGIN}/dashboard`,
        "set-cookie": `zh_session=${session}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`,
      } });
    }

    if (path === "/auth/github" && request.method === "GET") {
      const state = randomId();
      await env.AUTH_KV.put(`oauth:${state}`, "github", { expirationTtl: 600 });
      const params = new URLSearchParams({
        client_id: env.GITHUB_CLIENT_ID || "",
        redirect_uri: `${env.AUTH_WORKER_ORIGIN}/auth/github/callback`,
        scope: "read:user user:email",
        state,
      });
      return Response.redirect(`https://github.com/login/oauth/authorize?${params}`, 302);
    }

    if (path === "/auth/github/callback" && request.method === "GET") {
      const state = url.searchParams.get("state") || "";
      if (await env.AUTH_KV.get(`oauth:${state}`) !== "github") {
        return Response.redirect(`${env.APP_ORIGIN}/signin?error=invalid_oauth_state`, 302);
      }
      await env.AUTH_KV.delete(`oauth:${state}`);
      const code = url.searchParams.get("code");
      if (!code) return Response.redirect(`${env.APP_ORIGIN}/signin?error=oauth_cancelled`, 302);
      const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: { accept: "application/json", "content-type": "application/json" },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
        }),
      });
      const tokenData = await tokenResponse.json() as JsonRecord;
      const profileResponse = await fetch("https://api.github.com/user", {
        headers: {
          authorization: `Bearer ${tokenData.access_token}`,
          "user-agent": env.APP_NAME,
          accept: "application/vnd.github+json",
        },
      });
      const profile = await profileResponse.json() as JsonRecord;
      let email = String(profile.email || "").toLowerCase();
      if (!email) {
        const emailResponse = await fetch("https://api.github.com/user/emails", {
          headers: {
            authorization: `Bearer ${tokenData.access_token}`,
            "user-agent": env.APP_NAME,
            accept: "application/vnd.github+json",
          },
        });
        const emails = await emailResponse.json() as Array<JsonRecord>;
        email = String(emails.find((item) => item.primary && item.verified)?.email || "");
      }
      if (!email) return Response.redirect(`${env.APP_ORIGIN}/signin?error=oauth_email_missing`, 302);
      let user = await env.DB.prepare("SELECT id FROM users WHERE github_id=? OR email=?")
        .bind(String(profile.id), email).first();
      if (!user) {
        const id = randomId();
        const now = new Date().toISOString();
        await env.DB.prepare(
          "INSERT INTO users (id,username,full_name,phone,email,password_hash,email_verified,github_id,created_at,updated_at) VALUES (?,?,?,?,?,NULL,1,?,?,?)",
        ).bind(id, `github_${String(profile.login || profile.id)}`, String(profile.name || profile.login || email),
          null, email, String(profile.id), now, now).run();
        user = await env.DB.prepare("SELECT id FROM users WHERE id=?").bind(id).first();
      }
      const session = await signSession(env, String(user!.id));
      return new Response(null, { status: 302, headers: {
        location: `${env.APP_ORIGIN}/dashboard`,
        "set-cookie": `zh_session=${session}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`,
      } });
    }

    if (path === "/auth/logout" && request.method === "POST") {
      return corsJson(env, request, { ok: true }, 200, {
        "set-cookie": "zh_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0",
      });
    }

    return corsJson(env, request, { error: "Not found" }, 404);
  },
};
