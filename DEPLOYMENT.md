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
## Sandaran workspace dan PostgreSQL

Gunakan `scripts/workspace-backup.sh backup` pada mesin yang boleh membaca `WORKSPACE_STORAGE_ROOT`
dan mempunyai `pg_dump` yang serasi dengan PostgreSQL. Tetapkan `WORKSPACE_BACKUP_DIR` pada
storan sandaran berasingan. Jadualkan arahan ini dalam cron atau systemd menggunakan fail persekitaran
dengan kebenaran baca terhad. Contoh cron harian pada pukul 02:00 UTC:

```cron
0 2 * * * /bin/bash -c 'set -a; source /etc/zh-code-studio/backup.env; set +a; /opt/zh-code-studio/scripts/workspace-backup.sh backup'
```

Sandaran menyimpan dump pangkalan data, arkib fail dan checksum. Jalankan pada waktu penyelenggaraan
atau gunakan snapshot storan yang konsisten supaya perubahan workspace dan pangkalan data sepadan.
Gunakan nama direktori sandaran yang dikeluarkan oleh skrip untuk menguji pemulihan:

```bash
RESTORE_DATABASE_URL=postgres://user@db/zh_restore \
  scripts/workspace-backup.sh restore /backup/SNAPSHOT /data/workspaces-restored
```

Sediakan pangkalan data kosong dan direktori induk pemulihan dahulu. Gunakan sandaran yang dikawal
operator. Uji log masuk dan buka sekurang-kurangnya satu projek dalam pemasangan pemulihan.

## Had workspace

Terminal menerima sehingga enam sesi bagi setiap workspace. Sesi terputus dikekalkan sehingga
`WORKSPACE_IDLE_TIMEOUT_MS` selagi proses backend yang sama berjalan. Kontena mempunyai had CPU,
memori dan proses. Bagi hos awam, pasang kuota pada sistem fail atau volume setiap workspace supaya
had cakera juga terpakai pada proses yang menulis terus daripada terminal. Sediakan pengasingan
runner dan storan mengikut model ancaman hos sebelum membuka pendaftaran awam.
