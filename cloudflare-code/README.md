# Cloudflare Authentication Worker

This standalone package does not modify the existing ZH Code Studio application.
It provides the authentication API and email templates for:

- Google OAuth
- GitHub OAuth
- Email and password sign-in/register
- Username and password sign-in/register
- Email verification
- OTP verification
- Forgot-password/reset-password OTP
- Magic links
- Welcome emails
- Promotional emails

The login UI must call these endpoints from the existing frontend, but the current
application code is not modified. Copy this folder to your own Cloudflare project
only if you want to deploy the worker separately.

## 1. Create Cloudflare resources

Create a D1 database and KV namespace:

```bash
cd cloudflare-code/worker
npm install
npx wrangler d1 create zh-code-auth
npx wrangler kv namespace create AUTH_KV
```

Copy the D1 `database_id` and KV namespace `id` into `wrangler.toml`.

Run the database schema:

```bash
npx wrangler d1 execute zh-code-auth --file=./schema.sql
npx wrangler d1 execute zh-code-auth --file=./schema.sql --remote
```

## 2. Configure variables and secrets

Set these in Cloudflare Dashboard:
**Workers & Pages > your worker > Settings > Variables and Secrets**.

### Plain text variables

| Name | Example |
|---|---|
| `APP_NAME` | `ZH Code Studio` |
| `APP_ORIGIN` | `https://code.example.com` |
| `AUTH_WORKER_ORIGIN` | `https://auth.example.workers.dev` |
| `FROM_EMAIL` | `ZH Code Studio <noreply@example.com>` |
| `GOOGLE_CLIENT_ID` | OAuth client ID |
| `GITHUB_CLIENT_ID` | OAuth client ID |

Set `ALLOWED_ORIGINS` as plain text with a comma-separated list, or configure it
in `wrangler.toml`.

### Secrets

| Name | Purpose |
|---|---|
| `RESEND_API_KEY` | Send email through Resend |
| `SESSION_SECRET` | Sign authentication session JWTs |
| `GOOGLE_CLIENT_SECRET` | Google OAuth |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth |

Create secrets with Wrangler:

```bash
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put SESSION_SECRET
npx wrangler secret put GOOGLE_CLIENT_SECRET
npx wrangler secret put GITHUB_CLIENT_SECRET
```

Generate a strong session secret:

```bash
openssl rand -hex 32
```

## 3. Verify sender and domain

In Resend:

1. Add and verify `example.com`.
2. Add the generated DNS records.
3. Create an API key.
4. Set `FROM_EMAIL` to an address in the verified domain.

Copy the HTML files in `../email-templates` into a Resend template or send their
contents from the Worker. The Worker currently uses inline Resend-compatible HTML
helpers, while the template files are ready for the Resend visual/editor interface.

## 4. Configure Google OAuth

In Google Cloud Console:

1. Create an OAuth 2.0 Web application.
2. Add `https://auth.example.workers.dev/auth/google/callback` to Authorized redirect URIs.
3. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
4. Add `APP_ORIGIN` as an authorized JavaScript origin if needed.

## 5. Configure GitHub OAuth

In GitHub:

1. Open **Settings > Developer settings > OAuth Apps > New OAuth App**.
2. Set the homepage URL to `https://code.example.com`.
3. Set the callback URL to `https://auth.example.workers.dev/auth/github/callback`.
4. Save the client ID and generate a client secret.
5. Set `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`.

GitHub OAuth is only used for account sign-in. GitHub does not send verification
OTP emails. OTP and verification emails are sent through Resend.

## 6. Deploy

```bash
npx wrangler deploy
```

Your endpoints will be similar to:

- `https://auth.example.workers.dev/auth/register`
- `https://auth.example.workers.dev/auth/verify-email`
- `https://auth.example.workers.dev/auth/resend-otp`
- `https://auth.example.workers.dev/auth/signin/password`
- `https://auth.example.workers.dev/auth/forgot-password/request`
- `https://auth.example.workers.dev/auth/forgot-password/reset`
- `https://auth.example.workers.dev/auth/google`
- `https://auth.example.workers.dev/auth/github`

Configure the frontend API base URL to this Worker URL without changing existing
frontend files. CORS is restricted using `ALLOWED_ORIGINS`.

## 7. Connect GitHub repository deployment

The optional GitHub connection used in Cloudflare Pages/Workers is separate from
GitHub OAuth. It allows deployments when files in your repository change.

1. In Cloudflare, open **Workers & Pages > Create > Workers**.
2. Create a Git-backed Worker application.
3. Authorize GitHub and select this repository.
4. Set the build root to `cloudflare-code/worker`.
5. Set the build command to `npm install && npm run deploy`.
6. Set the deploy command to `npx wrangler deploy`.
7. Add the variables/secrets listed above to the deployed Worker.

For Worker deployments, commit only `cloudflare-code/worker` and do not commit
real secrets.

## API contract

### Register

`POST /auth/register`

```json
{
  "username": "terminal_user",
  "full_name": "Terminal User",
  "phone": "+60123456789",
  "email": "user@example.com",
  "password": "StrongPass1!"
}
```

The password must contain at least 8 characters, one number, and one symbol.

### Verify email / OTP

`POST /auth/verify-email`

```json
{"email":"user@example.com","code":"123456","purpose":"VERIFY_ACCOUNT"}
```

Valid purposes are `VERIFY_ACCOUNT`, `PASSWORD_RESET`, and `EMAIL_OTP`.

### Sign in

`POST /auth/signin/password`

```json
{"identifier":"terminal_user","password":"StrongPass1!"}
```

The identifier may be an email or username.

### Forgot password

1. `POST /auth/forgot-password/request`

```json
{"email":"user@example.com","old_password":"OldPass1!"}
```

2. `POST /auth/forgot-password/reset`

```json
{
  "email":"user@example.com",
  "code":"123456",
  "password":"NewStrongPass1!"
}
```

### Magic link

`POST /auth/magic-link/request`

```json
{"email":"user@example.com"}
```

`GET /auth/magic-link/verify?token=...`

### Health check

`GET /health`

## Security notes

- Passwords are hashed with PBKDF2-SHA-256 using a random salt.
- OTPs are stored only as SHA-256 hashes and expire after 10 minutes.
- OTP resend is limited through KV.
- OAuth state is stored in KV and expires after 10 minutes.
- Session cookies are `Secure`, `HttpOnly`, and `SameSite=Lax`.
