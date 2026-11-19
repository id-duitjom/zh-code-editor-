# Tutorial Lengkap Cloudflare Worker untuk Sistem OTP dan Log Masuk

Panduan ini menggunakan bahasa Malaysia. Panduan ini menunjukkan cara memasang semua kod
yang terdapat dalam folder `cloudflare-code` tanpa mengubah kod aplikasi terminal yang
sedia ada.

## 1. Apa yang akan dipasang

Folder ini mengandungi:

```text
cloudflare-code/
|-- TUTORIAL.md
|-- README.md
|-- worker/
|   |-- src/
|   |   `-- index.ts
|   |-- schema.sql
|   |-- package.json
|   |-- tsconfig.json
|   `-- wrangler.toml
`-- email-templates/
    |-- email-otp.html
    |-- welcome.html
    |-- verify-account.html
    |-- magic-link.html
    |-- forgot-password.html
    `-- promotional.html
```

Bahagian ini menyediakan:

- pendaftaran akaun
- log masuk menggunakan e-mel atau nama pengguna
- log masuk Google
- log masuk GitHub
- kod OTP e-mel
- pengesahan akaun
- lupa kata laluan
- pautan ajaib
- e-mel selamat datang
- e-mel promosi

## 2. Syarat awal

Anda memerlukan:

- akaun Cloudflare
- akaun GitHub
- domain yang aktif dalam Cloudflare
- akaun Resend
- domain penghantar e-mel yang disahkan
- Node.js 20 atau baharu
- domain atau URL aplikasi website anda

Contoh domain dalam panduan ini:

```text
Website: https://terminal.contoh.com
Worker:  https://zh-code-auth.nama-pengguna.workers.dev
E-mel:   noreply@contoh.com
```

Gantikan semua contoh `terminal.contoh.com`, `contoh.com`, dan Worker URL dengan domain
anda sendiri.

## 3. Cara memahami GitHub dan website

Terdapat dua perkara berbeza:

### A. Worker membaca kod dari GitHub

Ini membolehkan Cloudflare mengunci/deploy terus apabila kod dalam GitHub berubah.
GitHub hanya menjadi lokasi penyimpanan kod. GitHub tidak menghantar OTP.

### B. GitHub OAuth

Ini membolehkan pengguna menekan butang **Sign in with GitHub**.
GitHub menyediakan maklumat profil pengguna kepada Worker.

### C. Worker menghantar e-mel

Pendaftaran dan permintaan OTP dihantar daripada browser website kepada Worker.
Worker kemudiannya menghantar e-mel melalui Resend.

Alirannya ialah:

```text
Browser website
  -> Endpoint Worker
  -> Simpan kod OTP dalam D1
  -> Simpan had resend dalam KV
  -> Hantar e-mel melalui Resend
  -> Pengguna masukkan 6 digit OTP
  -> Worker semak hash OTP
  -> Akaun disahkan atau kata laluan ditukar
```

## 4. Buat projek Worker menggunakan GitHub

### Cara melalui Dashboard Cloudflare

1. Log masuk ke Cloudflare Dashboard.
2. Pilih **Workers & Pages**.
3. Pilih **Create**.
4. Pilih **Import a repository** atau **Connect to Git**.
5. Benarkan Cloudflare mengakses GitHub anda.
6. Pilih repository `zh-code-editor-`.
7. Pilih branch `main`.
8. Masukkan tetapan build berikut:

```text
Root directory: cloudflare-code/worker
Build command:  npm install
Deploy command: npx wrangler deploy
```

9. Jangan masukkan nilai rahsia dalam repository.
10. Deploy satu kali selepas D1, KV, dan secrets sudah disiapkan.

Jika anda tidak mahu GitHub deploy automatik, anda boleh terus masuk ke folder
`cloudflare-code/worker` dan jalankan:

```bash
npm install
npx wrangler login
npx wrangler deploy
```

Arahan ini men-deploy code tersebut secara manual.

## 5. Buat D1 Database

### Cara melalui Dashboard

1. Buka Cloudflare Dashboard.
2. Pilih **Workers & Pages**.
3. Pilih **D1**.
4. Pilih **Create database**.
5. Masukkan nama:

```text
zh-code-auth
```

6. Tekan **Create**.
7. Buka tab **Console**.
8. Buka fail `cloudflare-code/worker/schema.sql`.
9. Paste keseluruhan kandungan `schema.sql`.
10. Tekan **Execute**.

Kod `schema.sql` ialah:

```sql
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  email_verified INTEGER NOT NULL DEFAULT 0,
  google_sub TEXT UNIQUE,
  github_id TEXT UNIQUE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS auth_codes (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  email TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  purpose TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS auth_codes_lookup
  ON auth_codes(email, purpose, expires_at);
```

Perhatian: kod sebenar dalam [schema.sql](/workspaces/zh-code-editor-/cloudflare-code/worker/schema.sql)
ada pertindihan untuk memastikan jenis jadual adalah betul. Pastikan kod SQL menggunakan
satu baris sahaja:

```sql
email_verified INTEGER NOT NULL DEFAULT 0,
```

### Cara melalui Wrangler

Di terminal komputer:

```bash
cd cloudflare-code/worker
npm install
npx wrangler login
npx wrangler d1 create zh-code-auth
```

Simpan nilai `database_id` yang dipaparkan.

Masukkan database schema:

```bash
npx wrangler d1 execute zh-code-auth --file=./schema.sql --remote
```

Untuk database local semasa ujian:

```bash
npx wrangler d1 execute zh-code-auth --file=./schema.sql
```

## 6. Buat KV Namespace

### Cara melalui Dashboard

1. Buka **Workers & Pages**.
2. Pilih **KV**.
3. Pilih **Create a namespace**.
4. Masukkan nama:

```text
AUTH_KV
```

5. Tekan **Create**.
6. Salin **Namespace ID**.

KV digunakan untuk:

- had 60 saat penghantaran OTP baharu
- OAuth state Google/GitHub
- token magic link

### Cara melalui Wrangler

```bash
cd cloudflare-code/worker
npx wrangler kv namespace create AUTH_KV
```

Salin nilai `id` yang dipaparkan.

## 7. Ikat D1 dan KV kepada Worker

Buka [wrangler.toml](/workspaces/zh-code-editor-/cloudflare-code/worker/wrangler.toml).

Ubah bahagian:

```toml
[[d1_databases]]
binding = "DB"
database_name = "zh-code-auth"
database_id = "GANTIKAN_DENGAN_DATABASE_ID"

[[kv_namespaces]]
binding = "AUTH_KV"
id = "GANTIKAN_DENGAN_KV_NAMESPACE_ID"
```

Bahagian binding ini **tidak boleh ditukar**:

```text
DB
AUTH_KV
```

Kerana kod Worker membaca nama binding tersebut. Pastikan nama dalam dashboard sama
persis seperti dalam `wrangler.toml`.

Juga ubah:

```toml
[vars]
APP_NAME = "ZH Code Studio"
APP_ORIGIN = "https://terminal.contoh.com"
AUTH_WORKER_ORIGIN = "https://zh-code-auth.nama-pengguna.workers.dev"
FROM_EMAIL = "ZH Code Studio <noreply@contoh.com>"
ALLOWED_ORIGINS = "https://terminal.contoh.com,http://localhost:5173"
```

`ALLOWED_ORIGINS` mesti mengandungi URL tepat website yang memanggil Worker.
Jika website menggunakan `www`, tulis kedua-duanya jika perlu:

```toml
ALLOWED_ORIGINS = "https://terminal.contoh.com,https://www.terminal.contoh.com"
```

Jangan masukkan slash `/` pada hujung domain.

## 8. Buat secret Resend

### Buat domain dan API key di Resend

1. Buka <https://resend.com>.
2. Pergi ke **Domains**.
3. Tekan **Add Domain**.
4. Masukkan domain anda, contoh `contoh.com`.
5. Copy semua DNS record yang diberikan.
6. Pergi ke Cloudflare DNS domain anda.
7. Tambah setiap MX, TXT, DKIM atau CNAME record yang diberikan oleh Resend.
8. Tunggu sehingga status di Resend menjadi **Verified**.
9. Pergi ke **API Keys**.
10. Cipta API key dengan hak menghantar e-mel.
11. Simpan kunci itu sementara. Jangan publish atau commit kunci itu.

Contoh penghantar yang sah:

```text
ZH Code Studio <noreply@contoh.com>
```

Alamat `noreply` mesti berada di domain yang sudah disahkan oleh Resend.

### Masukkan secret melalui Wrangler

```bash
cd cloudflare-code/worker
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put SESSION_SECRET
```

Untuk `SESSION_SECRET`, buat kunci kuat dahulu:

```bash
openssl rand -hex 32
```

Salin hasil 64 aksara dan tampal apabila Wrangler bertanya nilai secret.

### Masukkan secret melalui Dashboard

1. Buka **Workers & Pages**.
2. Pilih Worker `zh-code-auth`.
3. Pilih **Settings**.
4. Pilih **Variables and Secrets**.
5. Tambah `RESEND_API_KEY` sebagai **Secret**.
6. Tambah `SESSION_SECRET` sebagai **Secret**.
7. Tekan **Deploy** atau **Save**.

## 9. Sediakan Google OAuth

1. Buka Google Cloud Console.
2. Pergi ke **APIs & Services**.
3. Pilih **OAuth consent screen**.
4. Pilih **External** jika pengguna awam.
5. Isi nama aplikasi dan e-mel sokongan.
6. Pergi ke **Credentials**.
7. Pilih **Create Credentials > OAuth client ID**.
8. Pilih **Web application**.
9. Isi Authorized JavaScript origins:

```text
https://terminal.contoh.com
https://zh-code-auth.nama-pengguna.workers.dev
```

10. Isi Authorized redirect URI:

```text
https://zh-code-auth.nama-pengguna.workers.dev/auth/google/callback
```

11. Cipta credential.
12. Salin Client ID dan Client Secret.

Tambahkan variable dan secret:

```text
GOOGLE_CLIENT_ID     = ID Google OAuth
GOOGLE_CLIENT_SECRET = Secret Google OAuth
```

`GOOGLE_CLIENT_ID` boleh menjadi text variable.
`GOOGLE_CLIENT_SECRET` mesti menjadi secret.

Masukkan melalui Wrangler:

```bash
npx wrangler secret put GOOGLE_CLIENT_SECRET
```

Masukkan Client ID dalam `wrangler.toml` sebagai `[vars]`:

```toml
GOOGLE_CLIENT_ID = "GANTIKAN_ID_GOOGLE"
```

## 10. Sediakan GitHub OAuth

1. Log masuk GitHub.
2. Buka **Settings**.
3. Pilih **Developer settings**.
4. Pilih **OAuth Apps**.
5. Pilih **New OAuth App**.
6. Isi:

```text
Application name: ZH Code Studio
Homepage URL:     https://terminal.contoh.com
Callback URL:     https://zh-code-auth.nama-pengguna.workers.dev/auth/github/callback
```

7. Cipta aplikasi.
8. Salin Client ID.
9. Pilih **Generate a new client secret**.
10. Salin secret tersebut sekali.

Masukkan:

```text
GITHUB_CLIENT_ID     = ID GitHub OAuth
GITHUB_CLIENT_SECRET = Secret GitHub OAuth
```

Melalui Wrangler:

```bash
npx wrangler secret put GITHUB_CLIENT_SECRET
```

Dalam `wrangler.toml`:

```toml
GITHUB_CLIENT_ID = "GANTIKAN_ID_GITHUB"
```

GitHub OAuth tidak menghantar OTP. Ia hanya log masuk pengguna melalui GitHub.
Resend tetap diperlukan untuk OTP e-mel.

## 11. Sediakan sambungan GitHub untuk deploy Worker

Ini berbeza daripada GitHub OAuth.

1. Buka repository GitHub anda.
2. Pastikan fail-fail dalam folder `cloudflare-code/worker` sudah di-push.
3. Di Cloudflare, pilih **Workers & Pages > Create application**.
4. Pilih **Workers > Import from a Git repository**.
5. Benarkan aplikasi Cloudflare GitHub.
6. Pilih repository `id-duitjom/zh-code-editor-`.
7. Pilih branch `main`.
8. Tetapkan Root directory:

```text
cloudflare-code/worker
```

9. Tetapkan Build command:

```text
npm install
```

10. Tetapkan Deploy command:

```text
npx wrangler deploy
```

11. Simpan bindings dan secrets dalam Dashboard Worker selepas deploy pertama.

Selepas itu, setiap push ke branch yang dipilih akan memicu deploy baharu jika
Cloudflare GitHub integration sudah aktif.

Jangan masukkan `database_id`, `KV id`, API key, atau OAuth secret secara sebenar ke dalam
GitHub. `wrangler.toml` boleh memegang placeholder atau variable bukan rahsia; semua secret
mestilah di Cloudflare.

## 12. Deploy Worker

Semak fail dalam terminal:

```bash
cd cloudflare-code/worker
npm install
npx tsc --noEmit
npx wrangler deploy
```

Selepas berjaya, Wrangler akan memaparkan URL seperti:

```text
https://zh-code-auth.nama-pengguna.workers.dev
```

Jika anda menggunakan custom domain:

1. Buka Worker.
2. Pilih **Settings**.
3. Pilih **Domains & Routes**.
4. Tambah custom domain:

```text
auth.terminal.contoh.com
```

Kemudian ubah:

```toml
AUTH_WORKER_ORIGIN = "https://auth.terminal.contoh.com"
```

Gunakan custom domain yang konsisten dalam OAuth callback dan e-mel.

## 13. Masukkan binding melalui Dashboard

Selepas Worker dibina, buka:

```text
Workers & Pages
  -> zh-code-auth
  -> Settings
  -> Bindings
```

Tambahkan binding berikut:

### D1 Database

```text
Variable name: DB
D1 database:   zh-code-auth
```

### KV Namespace

```text
Variable name: AUTH_KV
KV namespace:  AUTH_KV
```

Jika nama binding dalam dashboard tidak tepat, code Worker tidak dapat membaca D1 atau KV.

## 14. Senarai variable dan secret lengkap

Variable boleh dilihat di Dashboard dan tidak rahsia:

| Nama | Nilai contoh |
|---|---|
| `APP_NAME` | `ZH Code Studio` |
| `APP_ORIGIN` | `https://terminal.contoh.com` |
| `AUTH_WORKER_ORIGIN` | `https://auth.terminal.contoh.com` |
| `FROM_EMAIL` | `ZH Code Studio <noreply@contoh.com>` |
| `ALLOWED_ORIGINS` | `https://terminal.contoh.com,http://localhost:5173` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `GITHUB_CLIENT_ID` | GitHub OAuth Client ID |

Secret mesti dirahsiakan:

| Nama | Tujuan |
|---|---|
| `RESEND_API_KEY` | Menghantar e-mel |
| `SESSION_SECRET` | Menandatangani sesi login |
| `GOOGLE_CLIENT_SECRET` | Google OAuth |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth |

## 15. Template e-mel

Setiap jenis e-mel mempunyai satu file HTML tersendiri:

| Kod email | File |
|---|---|
| Email OTP | [email-otp.html](/workspaces/zh-code-editor-/cloudflare-code/email-templates/email-otp.html) |
| Welcome | [welcome.html](/workspaces/zh-code-editor-/cloudflare-code/email-templates/welcome.html) |
| Verify Account | [verify-account.html](/workspaces/zh-code-editor-/cloudflare-code/email-templates/verify-account.html) |
| Magic Link | [magic-link.html](/workspaces/zh-code-editor-/cloudflare-code/email-templates/magic-link.html) |
| Forgot Password | [forgot-password.html](/workspaces/zh-code-editor-/cloudflare-code/email-templates/forgot-password.html) |
| Promotional | [promotional.html](/workspaces/zh-code-editor-/cloudflare-code/email-templates/promotional.html) |

Anda boleh:

1. Buka satu file HTML.
2. Copy semua kandungannya.
3. Paste ke **Resend Email Template Editor**.
4. Guna nama template berasingan untuk setiap jenis e-mel.
5. Jangan paste semua file HTML dalam satu template.

Templat semasa Worker ialah HTML laluan terus. Ini bermakna Worker dapat menghantar
OTP tanpa konfigurasi template Resend. File HTML dalam folder hanya untuk salinan,
penyuntingan, atau penggunaan template visual dalam Resend.

## 16. Endpoint yang tersedia

Semak health Worker:

```text
GET https://auth.terminal.contoh.com/health
```

Jawapan berjaya:

```json
{"ok":true}
```

Pendaftaran:

```text
POST /auth/register
Content-Type: application/json
```

Contoh:

```json
{
  "username": "terminal_user",
  "full_name": "Terminal User",
  "phone": "+60123456789",
  "email": "pelanggan@example.com",
  "password": "StrongPass1!"
}
```

Sahkan OTP:

```text
POST /auth/verify-email
Content-Type: application/json
```

```json
{
  "email": "pelanggan@example.com",
  "code": "123456",
  "purpose": "VERIFY_ACCOUNT"
}
```

Minta OTP baharu:

```text
POST /auth/resend-otp
Content-Type: application/json
```

```json
{
  "email": "pelanggan@example.com",
  "purpose": "VERIFY_ACCOUNT"
}
```

`purpose` yang sah:

```text
VERIFY_ACCOUNT
PASSWORD_RESET
EMAIL_OTP
```

Log masuk:

```text
POST /auth/signin/password
Content-Type: application/json
```

```json
{
  "identifier": "terminal_user",
  "password": "StrongPass1!"
}
```

`identifier` boleh menjadi e-mel atau nama pengguna.

Permintaan lupa kata laluan:

```text
POST /auth/forgot-password/request
Content-Type: application/json
```

```json
{
  "email": "pelanggan@example.com",
  "old_password": "OldPassword1!"
}
```

Tukar kata laluan:

```text
POST /auth/forgot-password/reset
Content-Type: application/json
```

```json
{
  "email": "pelanggan@example.com",
  "code": "123456",
  "password": "NewPassword1!"
}
```

Magic link:

```text
POST /auth/magic-link/request
Content-Type: application/json
```

```json
{
  "email": "pelanggan@example.com"
}
```

Pengesahan pautan dilakukan oleh:

```text
GET /auth/magic-link/verify?token=NILAI_TOKEN
```

Google OAuth:

```text
https://auth.terminal.contoh.com/auth/google
```

GitHub OAuth:

```text
https://auth.terminal.contoh.com/auth/github
```

## 17. Ujian OTP menggunakan curl

Gantikan URL dan e-mel anda sendiri.

Semak Worker:

```bash
curl -i https://auth.terminal.contoh.com/health
```

Daftar pengguna ujian:

```bash
curl -i https://auth.terminal.contoh.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username":"test_user",
    "full_name":"Test User",
    "phone":"+60123456789",
    "email":"pelanggan@example.com",
    "password":"StrongPass1!"
  }'
```

Semakan di Resend:

```text
Sent > Email User
```

Semak juga **Spam/Junk**.

Sahkan 6-digit OTP:

```bash
curl -i https://auth.terminal.contoh.com/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "email":"pelanggan@example.com",
    "code":"123456",
    "purpose":"VERIFY_ACCOUNT"
  }'
```

Jangan gunakan `123456` melainkan kod tersebut ialah kod sebenar yang dihantar.

Log masuk:

```bash
curl -i https://auth.terminal.contoh.com/auth/signin/password \
  -H "Content-Type: application/json" \
  -d '{
    "identifier":"test_user",
    "password":"StrongPass1!"
  }'
```

## 18. Sambungkan endpoint kepada website

Untuk website Vite, tetapkan variable environment frontend:

```text
VITE_AUTH_API_URL=https://auth.terminal.contoh.com
```

Contoh panggilan JavaScript:

```javascript
const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL;

const response = await fetch(`${AUTH_API_URL}/auth/register`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  credentials: "include",
  body: JSON.stringify({
    username: "test_user",
    full_name: "Test User",
    phone: "+60123456789",
    email: "pelanggan@example.com",
    password: "StrongPass1!",
  }),
});

const result = await response.json();
console.log(result);
```

Contoh meminta OTP baharu:

```javascript
await fetch(`${AUTH_API_URL}/auth/resend-otp`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  credentials: "include",
  body: JSON.stringify({
    email: "pelanggan@example.com",
    purpose: "VERIFY_ACCOUNT",
  }),
});
```

Contoh log masuk Google:

```html
<a href="https://auth.terminal.contoh.com/auth/google">
  Sign in with Google
</a>
```

Contoh log masuk GitHub:

```html
<a href="https://auth.terminal.contoh.com/auth/github">
  Sign in with GitHub
</a>
```

Frontend tidak perlu menggunakan secret. Semua secret mesti berada di Worker.

## 19. Tetapan CORS

Jika browser memaparkan error CORS:

```text
Blocked by CORS policy
```

Semak:

```toml
ALLOWED_ORIGINS = "https://terminal.contoh.com,http://localhost:5173"
```

Pastikan URL browser tepat sama. Contohnya, domain ini berbeza:

```text
https://terminal.contoh.com
https://www.terminal.contoh.com
http://localhost:5173
```

Tulis semua origin yang sah secara pisah dengan koma.
Worker sudah menyokong HTTP OPTIONS.

## 20. Aturan kata laluan

Password mesti mengandungi sekurang-kurangnya:

- 8 aksara
- sekurang-kurangnya satu huruf
- sekurang-kurangnya satu angka
- sekurang-kurangnya satu simbol

Contoh sah:

```text
StrongPass1!
NewPassword1@
```

Contoh tidak sah:

```text
password
Password
12345678
```

Gunakan teks UI:

```text
Password must contain at least 8 characters, at least one letter,
at least one number, and at least one symbol.
```

## 21. Peraturan OTP

Worker melaksanakan perkara berikut:

- OTP ialah 6 digit
- OTP tamat tempoh selepas 10 minit
- OTP lama ditandakan used selepas berjaya
- OTP hanya disimpan sebagai hash SHA-256
- resend dibenarkan sekali setiap 60 saat
- reset password memerlukan old password dan OTP
- magic link tamat tempoh selepas 15 minit

Mesej untuk pengguna:

```text
One-Time Password (OTP) has been sent to your email address.
Please check your Inbox or SPAM/JUNK folder.
```

Mesej ini boleh hilang selepas kira-kira 2 saat.

Untuk butang Continue:

```text
Processing...
Sending verification email...
Please wait...
Complete
```

Kod Worker tidak menyediakan UI, tetapi endpoint dan aliran OTP sudah tersedia.

## 22. Penyelesaian masalah

### Email tidak sampai

Semak:

- `RESEND_API_KEY` betul
- `FROM_EMAIL` berada dalam domain disahkan
- DNS Resend sudah berstatus Verified
- folder Spam/Junk
- log Worker dan log Resend
- alamat e-mel tidak mengandungi ruang atau aksara tidak sah

### Button OTP tidak berfungsi

Semak:

- website memanggil HTTPS Worker
- `ALLOWED_ORIGINS` mengandungi website URL
- browser tidak menyekat CORS
- endpoint adalah `/auth/resend-otp`
- JSON menggunakan `Content-Type: application/json`

### Database error

Semak:

- D1 binding bernama `DB`
- database_id dalam `wrangler.toml` betul
- `schema.sql` sudah dijalankan pada database remote
- nama tabel ialah `users` dan `auth_codes`

### KV error

Semak:

- KV binding bernama `AUTH_KV`
- namespace ID betul
- namespace sudah disambungkan dalam Dashboard

### OAuth error

Semak:

- callback URL tepat
- OAuth secret betul
- client ID betul
- Worker URL dalam `AUTH_WORKER_ORIGIN` betul
- origin Google/GitHub callback tidak menggunakan URL localhost di production

### GitHub tidak menghantar deploy

Semak:

- Cloudflare GitHub app sudah diberi akses kepada repository
- branch `main` dipilih
- root directory ialah `cloudflare-code/worker`
- deploy command ialah `npx wrangler deploy`
- commit baharu sudah dibuat di branch yang dipilih

### GitHub OAuth tidak berfungsi

GitHub OAuth bermasalah ini berbeza daripada deploy GitHub.
Semak OAuth callback, bukan **Git Actions** atau repository access.

## 23. Checklist akhir

Tandakan semua sebelum menguji:

- [ ] D1 `zh-code-auth` sudah dibuat
- [ ] `schema.sql` sudah dijalankan pada remote D1
- [ ] KV `AUTH_KV` sudah dibuat
- [ ] D1 binding `DB` sudah ditambah
- [ ] KV binding `AUTH_KV` sudah ditambah
- [ ] `APP_ORIGIN` mengandungi URL website
- [ ] `AUTH_WORKER_ORIGIN` mengandungi URL Worker
- [ ] `ALLOWED_ORIGINS` mengandungi website
- [ ] `FROM_EMAIL` menggunakan domain disahkan
- [ ] `RESEND_API_KEY` telah ditambah sebagai secret
- [ ] `SESSION_SECRET` telah ditambah sebagai secret
- [ ] Google OAuth redirect URI sudah ditambah
- [ ] GitHub OAuth callback URL sudah ditambah
- [ ] Google/GitHub secrets sudah ditambah
- [ ] Worker sudah deploy
- [ ] `/health` menunjukkan `{"ok":true}`
- [ ] E-mel ujian berjaya diterima
- [ ] OTP boleh disahkan
- [ ] Akaun baharu boleh log masuk

## 24. Ringkasan kod

Gunakan satu fail Worker:

```text
cloudflare-code/worker/src/index.ts
```

Gunakan satu file SQL untuk D1:

```text
cloudflare-code/worker/schema.sql
```

Gunakan satu file HTML bagi setiap jenis e-mel:

```text
cloudflare-code/email-templates/
  email-otp.html
  welcome.html
  verify-account.html
  magic-link.html
  forgot-password.html
  promotional.html
```

Setelah semua nilai sebenar dan binding dimasukkan, Worker boleh menerima permintaan
daripada website, menghantar OTP melalui Resend, menyemak OTP melalui D1 dan KV,
serta mengendalikan log masuk Google dan GitHub.
