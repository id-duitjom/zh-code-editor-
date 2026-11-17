# ZH Code Studio

Editor kod dalam browser berinspirasikan VS Code: Vue 3 + Monaco + terminal sebenar dalam container.

## Prasyarat
- Node.js 20+, pnpm 9+
- PostgreSQL 16 (atau Docker)
- Docker Engine (untuk workspace runner)
- Akaun Resend (atau SMTP) untuk e-mel

## Pasang & Jalankan
```bash
cp .env.example .env          # isi nilai sebenar
pnpm install
docker compose up -d postgres
pnpm db:generate && pnpm db:migrate
pnpm dev                      # frontend :5173, backend :4000
```

## Cipta akaun pertama
1. Buka `http://localhost:5173/register`.
2. Daftar → semak e-mel → klik pautan pengesahan.
3. Sign In → Dashboard → New Workspace (Vue + Vite).
4. Buka workspace → edit fail → Save → refresh browser.

## Ujian aliran kritikal
| Aliran | Perlu |
|---|---|
| Register → verify → Sign In | `RESEND_API_KEY` atau SMTP |
| Terminal `npm install && npm run dev` | Docker + image workspace |
| Git push | GitHub App / token repo ujian |
| Debug Node/Python | `launch.json` + debugger adapter |
| Preview | DNS wildcard `*.preview.domain` |