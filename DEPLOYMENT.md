# Deployment

## Servis
1. **PostgreSQL** terurus (RDS/Neon/Supabase).
2. **Backend API** (Railway/Fly.io/VPS) — perlu akses Docker socket atau Docker host jauh.
3. **Workspace Runner** — host berasingan dengan Docker; backend hubungi melalui Docker API/TCP TLS.
4. **Frontend statik** (Cloudflare Pages/Vercel) — `VITE_API_URL` ke backend.
5. **Preview domain** — wildcard DNS `*.preview.zhcode.app` → reverse proxy ke port workspace.

## E-mel
- Resend: `RESEND_API_KEY`, sahkan domain penghantar.
- SMTP: `SMTP_URL=smtps://user:pass@smtp.host:465`.

## GitHub App
1. Cipta GitHub App → kebenaran `Contents: Read & Write`, `Metadata: Read`.
2. Muat turun private key → `secrets/github-app.pem`.
3. Pasang pada repo pengguna → simpan `installation_id`.
4. Backend tukar JWT → installation token (1 jam) untuk clone/push.

## Keselamatan
- Jalankan backend tanpa root; Docker socket dihadkan.
- Set `COOKIE_SECURE=true`, HTTPS wajib.
- Preview pada domain berasingan (bukan subdomain same-site).