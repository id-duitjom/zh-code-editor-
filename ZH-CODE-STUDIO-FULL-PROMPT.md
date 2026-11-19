# Prompt penuh ZH Code Studio

Bina atau sambung pembangunan **ZH Code Studio**, editor kod dan terminal Docker sebenar dalam pelayar. Ikut teks, susunan butang, warna, ikon, fungsi dan struktur fail di bawah. Gunakan kod asal yang dipautkan pada akhir dokumen untuk setiap butiran implementasi, termasuk CSS, laluan SVG, templat, migrasi dan ujian.

## 1. Repo dan cara mendapatkan semua fail

1. Buka repo GitHub `id-duitjom/zh-code-editor-`. Pilih branch `main` pada tab **Code**.
2. Untuk menyalin semua fail yang dijejak Git dan sejarah commit, jalankan arahan ini.

   ```bash
   git clone https://github.com/id-duitjom/zh-code-editor-.git
   cd zh-code-editor-
   git switch main
   ```

3. Jika repo sudah diklon, dapatkan perubahan dengan `git pull --ff-only origin main`. Untuk menghantar perubahan dengan akses tulis, semak `git status --short`, jalankan `git add -A`, semak `git diff --cached --stat`, kemudian `git commit -m "Terangkan perubahan"` dan `git push origin main`.
4. Git menjejak fail. Untuk menyertakan folder kosong, letakkan fail seperti `.gitkeep` di dalamnya. Simpan `.env` sebenar, kunci, token, data runtime, `node_modules`, `dist` dan hasil ujian di luar commit. Guna `.env.example` dan lockfile repo untuk setup.
5. Gunakan snapshot kod dan inventori fail di bahagian 10 sebagai rujukan lengkap. [FEATURE-MATRIX.md](FEATURE-MATRIX.md) mengandungi inventori terminal, bahasa dan jurang fungsi. [Prompt asal](VS-CODE-COMPLETE-BUILD-PROMPT.md) mengandungi sasaran lanjutan.

## 2. Seni bina, halaman dan templat

- Monorepo pnpm. Frontend menggunakan Vue 3, TypeScript, Vite, Vue Router, Pinia, Monaco, xterm.js dan Axios. Menu Settings menggunakan React + TypeScript + Tailwind melalui host Vue.
- Backend menggunakan Express, PostgreSQL, Drizzle, sesi PostgreSQL, Argon2, Dockerode, node-pty, WebSocket, Zod dan Resend/SMTP. Fail sebenar di storan hos dikongsi dengan kontena melalui mount `/workspace`. Editor, Explorer, terminal dan Git mengendalikan fail yang sama.
- Route UI `/`, `/signin`, `/register`, `/verify-email`, `/workspace/:id`. Route terlindung mengarahkan pengguna ke Sign In bersama destinasi asal.
- **Sign In** memaparkan ZH Code Studio, Email, Password, Show/Hide, Sign In dan Create Account. **Register** menerima nama penuh, e-mel dan kata laluan serta mengarahkan pengguna menyemak e-mel. **Verify Email** membaca token URL, memaparkan status pengesahan dan menyediakan pautan Sign In. Kekalkan label, atribut input dan keadaan ralat/loading daripada view asal.
- **Dashboard** memaparkan Workspace Saya dan Sign Out di header. Bahagian New Workspace mempunyai input Nama workspace, pilihan templat dan Cipta. Senarai workspace di bawah memaparkan pautan nama dan status. Urutan templat ialah Empty, HTML/CSS/JS, Vue + Vite, Node.js dan Python. Vue + Vite dipilih secara lalai.
- Empty kosong. HTML/CSS/JS mempunyai `index.html`, `style.css` dan `index.js`. Vue + Vite menjana `index.html`, `main.ts`, `App.vue`, `vite.config.ts` dan `package.json`. Node.js menjana `index.js` dan `package.json`. Python menjana `main.py`. Ambil kandungan literal dan skrip setiap templat daripada `workspace/routes.ts`.
- Kekalkan banner, badges, logo Linux dan logo Terminal Studio dalam `resources/logos/`. Ikut `index.html` untuk gaya global, termasuk fon, warna halaman dan borang.

## 3. Kedudukan, ikon dan warna workspace

Susun workspace dari kiri ke kanan sebagai Activity Bar, sidebar dan ruang utama. Susun ruang utama dari atas ke bawah sebagai toolbar tab, editor atau pratonton, breadcrumb/status dan terminal. Editor dan terminal mempunyai kawalan split berasingan.

| Permukaan | Susun atur | Warna |
|---|---|---|
| Workspace | Flex mendatar, tinggi `100dvh`, fon `14px system-ui, sans-serif` | Latar `#1e222a`, teks `#dbe3ef` |
| Activity Bar | Paling kiri, padding 6px, gap 4px. Akaun di atas gear pada bahagian bawah | `#1b2230` |
| Sidebar | Di kanan Activity Bar, lebar `min(280px, 36vw)`, header padding 8px 12px | `#252b35`, garis `#394352` |
| Toolbar | Padding 5px, gap 6px | `#252b35` |
| Butang dan select | Padding 4px 7px, jejari 4px | Latar `#343e4e`, border `#4c5b70`, aktif `#26507c` |
| Item sidebar dan Explorer | Lebar penuh, anak folder berinden 14px | Hover sidebar `#35465c`, hover/pilihan fail `#263c49`, petikan carian `#adc0d6` |
| Tab aktif | Garis atas 2px | Garis `#3794ff`, latar `#1e1e1e` |
| Breadcrumb dan ralat | Di bawah editor, pisahkan segmen laluan dengan `›` | Latar `#252b35`, teks ralat `#ffb6ad` |
| Terminal | Tinggi awal 32%, minimum 120px | Latar `#1e1e1e`, teks `#ebedf0`, pemisah `#394352` |
| Tema terang | Workspace, panel, editor dan terminal | Latar `#f0f3f8`, teks `#1d2837`, panel `#e0e7f0`, butang `#edf2f8`, garis `#9daec2` |
| Tetapan visual | Mod Padat menggunakan padding menegak 2px untuk baris fail dan toolbar | Pautan Settings `#8dc6fb` |

Activity Bar dari atas ialah **Menu, File Explorer, Carian projek, Git, Debug, Extensions, GitHub dan Workspaces**. Menu menukar paparan sidebar. Workspaces ke dashboard. Akaun membuka e-mel akaun dan Log keluar. GitHub menunjukkan aliran CLI. Debug dan Extensions membuka panel status.

Salin SVG daripada `WorkspaceIcon.vue` dengan ID `menu`, `explorer`, `search`, `git`, `debug`, `extensions`, `github`, `box`, `user`, `settings`, `plus`, `split`, `expand`, `minimize`, `close`, `chevron` dan `dots`. Saiz ikon 17×17, viewBox 24×24, strok `currentColor` 1.65 dan hujung bulat. Gear React menggunakan `⚙`, Explorer `▾` dan `▸`, tab `×`, submenu `›`. Kekalkan label ARIA dan tooltip ikon.

Untuk ikon fail, ikut keseluruhan pemetaan `utils/fileIcons.ts` dan bentuk SVG `FileIcon.vue`. Contoh warna utama ialah folder `#DCB67A`, fallback `#AAB2BF`, HTML `#E34F26`, Vue `#42B883`, JS `#F7DF1E`, TS/TSX `#3178C6`, JSX `#61DAFB`, CSS `#663399`, Sass `#CD6799`, JSON/SQL `#E5C07B`, Markdown `#519ABA`, Python `#3776AB`, PHP `#8892BF`, Git `#F05032`, env `#ECD53F`, shell `#89E051`, PowerShell `#5391FE`, ZH `#A78BFA`, imej raster `#A074C4` dan SVG `#FFB13B`. Kekalkan aturan keutamaan nama khusus, env, config, extension dan fallback, termasuk warna khusus lockfile.

## 4. Editor, Explorer dan Search Bar

- Toolbar editor mempunyai tab di kiri, pilihan **Satu editor** atau fail kedua dan butang **Simpan** di kanan. Tab mempunyai ikon, nama, tooltip laluan, tanda `*` untuk draf dan butang ×. Minta pengesahan sebelum menutup draf. Kekalkan editor kosong, pratonton imej dengan **Tutup pratonton**, editor sebelah-menyebelah dan status laluan.
- Monaco menggunakan `vs-dark` / `vs`, fon 14, tab dua ruang, minimap, automatic layout, Find & Replace, multi-cursor dan worker untuk JS/TS, JSON, CSS, HTML dan editor fallback. Vue menggunakan mod HTML. Kekalkan semua pemetaan bahasa dan tokenizer `.zh` daripada `useMonaco.ts`.
- Simpan keadaan tab dan draf mengikut akaun serta workspace dalam pelayar. Selepas refresh, bandingkan dengan fail pelayan. Paparkan amaran konflik dan tindakan **Timpa dengan draf** serta **Ambil versi pelayan**. Auto-simpan pilihan menggunakan sela 750ms. Gunakan prasyarat hash/kandungan serta respons 409, dan kekalkan aturan write serentak bagi fail sama.
- Explorer mempunyai **Fail +**, **Folder +** dan ikon tiga titik. Pilihan panel ialah **Open Editors**, **Folder**, **Outline** dan **Timeline**. Folder mempunyai **Muat semula**, dengan **Namakan semula** dan **Padam** bagi pilihan. Buka subfolder secara berperingkat. Outline memanggil simbol Monaco. Timeline menunjukkan sejarah simpanan setempat. Rename atau Cut mengemas kini tab terlibat.
- Search Bar projek ada input **Cari fail, teks atau tindakan** dan butang **Cari**. Cari nama fail, kandungan dan tindakan. Sokong **Find in Folder**, **Kosongkan penapis**, hasil dengan fail/baris/petikan, klik untuk lompat ke editor, dan mesej kosong, ralat dan had.

| Pintasan | Tindakan |
|---|---|
| Ctrl+P / Ctrl+Shift+F | Carian projek |
| Ctrl+Shift+P | Command Palette melalui carian tindakan |
| Ctrl+B | Tukar paparan sidebar |
| Ctrl+S / Cmd+S | Simpan dalam editor |
| Ctrl+backtick | Papar/sembunyi terminal |
| Ctrl+Shift+backtick | Terminal baharu |
| Ctrl+, | Settings |
| Ctrl+Shift+X | Extensions |
| Ctrl+K diikuti Ctrl+S | Keyboard Shortcuts |

## 5. Menu konteks dan menu gear

Buka menu Explorer dan terminal dengan klik kanan atau tekan lama 550ms. Batal apabila penuding bergerak melebihi ambang atau dilepas sebelum masa. Letakkan menu dekat penuding dan dalam viewport. Guna z-index 1100, latar `#181818`, border `#2d2d2d`, jejari 10px, teks `#eceef2`, hover/fokus `#22394f` dan shadow `0 10px 30px #0009`. Sokong klik luar, Escape, panah, Enter dan pemulihan fokus.

| Urutan Explorer | Tindakan |
|---|---|
| New File… | Cipta fail melalui prompt nama |
| New Folder… | Cipta folder melalui prompt nama |
| Open in Images Preview | Pratonton PNG/JPEG/GIF/WebP/AVIF |
| Open in Integrated Terminal | Mulakan sesi dalam folder pilihan atau induk fail |
| Share | Kongsi atau salin pautan workspace/fail/folder dengan izin sedia ada |
| Find in Folder | Carian projek berskop |
| Open Timeline | Papar Timeline |
| Add Folder to Chat | Simpan folder setempat dan paparkan status sambungan |
| Cut | Tanda fail/folder untuk dipindah |
| Copy | Simpan sumber untuk salinan serta salin laluan |
| Paste | Pindah atau salin ke destinasi. Beri nama unik untuk salinan dalam folder sama |
| Upload… | Muat naik satu atau beberapa fail |
| Copy Path | Salin laluan mutlak dalam `/workspace` |
| Copy Relative Path | Salin laluan relatif |
| Rename | Namakan semula pilihan |
| Delete Permanently | Sahkan sebelum padam, termasuk amaran draf terlibat |
| Select All | Pilih semua baris dipaparkan |

Menu terminal ialah **Copy**, **Paste** dan **Select All**. Gunakan pemilihan xterm dan papan klip pelayar. Paparkan status jika akses papan klip ditolak.

Menu **Settings** muncul di atas gear, dengan fade + slide up 200ms dari 8px, sokongan reduced motion, lebar 296px yang dikekang viewport, z-index 1000, radius 10px, latar `#181818`, garis `#2d2d2d`, shadow `0 10px 30px #0009`, teks `#eceef2`, pintasan `#a9bbcd`, hover/fokus `#22394f` dan pemisah `#34343a`. Sokong Escape, klik luar, Arrow Up/Down, Enter, Home/End dan navigasi submenu. Kekalkan `SettingsMenu.tsx`, `MenuItem.tsx`, `settingsMenuData.ts`, CSS serta `SettingsMenuHost.vue` sebagai fail berasingan.

| Urutan Settings | Pintasan dan callback |
|---|---|
| Command Palette… | Ctrl+Shift+P, fokus carian tindakan |
| Profiles | Pilih shell terminal baharu |
| Settings | Pintasan Ctrl+, untuk Auto-simpan, muat turun ZIP dan import ZIP |
| Extensions | Ctrl+Shift+X, buka panel |
| Keyboard Shortcuts | Ctrl+K Ctrl+S, buka rujukan pintasan |
| Snippets | Simpan teks setempat dan tambah di hujung fail aktif |
| Tasks | Baca skrip package.json dan tampal arahan npm run ke terminal |
| Themes › | Gelap atau Terang |
| Layout Density › | Selesa atau Padat |
| Backup and Sync Settings… | Pemisah sebelum item. Eksport/import JSON, simpan/pulihkan tetapan workspace, muat turun ZIP |
| Switch to Insiders Version… | Pemisah sebelum item. Papar status ketersediaan edisi |

## 6. Terminal, runtime, Git dan backup

- Toolbar terminal meletakkan tajuk **Terminal** di kiri. Di kanan, ikut urutan pemilih sesi, **Terminal baharu**, **Pisah terminal**, **Maksimumkan / Pulihkan saiz terminal**, **Sembunyikan / Paparkan terminal** dan **Tutup sesi aktif**. Carian tepat di atas output mempunyai **Cari dalam terminal**, **Sebelum**, **Seterusnya**, **Aa**, **Regex** dan status **Tiada padanan**.
- xterm.js dengan Fit, Search dan WebLinks, fon 13px dan scrollback 5000. Hubungkan kepada PTY sebenar. Sesi berasingan, split, resize, fokus, tutup, replay terhad dan percubaan sambung semula selepas refresh atau gangguan. Had enam sesi/workspace, tamat masa lalai 30 minit untuk sesi terputus. Pemulihan sesi bergantung pada proses backend yang sama.
- Imej `zhcode/workspace:latest` berasaskan Debian Bookworm, UID/GID 1000, dengan Bash, Sh, Zsh, Fish, PowerShell 7, Node.js, npm/npx, pnpm, Yarn, Git, Python, OpenSSH dan Codex CLI. Ikut pakej/versi sebenar `Dockerfile.workspace`. Kekalkan had CPU, memori dan proses. Gunakan skrip dev/build/preview/start yang benar-benar ditakrifkan oleh templat atau projek pengguna. Ikut README untuk pilihan Codex/Firecrawl.
- Panel **Git** mempunyai **Semak status Git**, kumpulan Staged/Perubahan/Fail baharu, butang nama fail untuk diff, Stage/Unstage, medan mesej, **Commit fail staged** dan **Commit semua perubahan**. Papar diff, maklum balas dan ralat. Kekalkan semantik staging, commit dan Git CLI untuk init, clone, push, pull dan remote.
- Settings menyokong ZIP untuk eksport dan import ke workspace kosong, muat naik fail, serta pilihan tetapan disimpan ke PostgreSQL dan dipulihkan. Skrip backup menyimpan dump, tar dan checksum, dan memulihkan ke pangkalan data kosong serta direktori baharu. Ikut cron dan konfigurasi dalam [DEPLOYMENT.md](DEPLOYMENT.md).

## 7. Kontrak backend dan storan

| Route | Kaedah dan fungsi |
|---|---|
| `/api/health` | GET 204 |
| `/api/auth` | POST register, verify-email, signin, signout. GET me |
| `/api/workspaces` | GET senarai pemilik, POST cipta |
| `/api/workspaces/:workspaceId/files` | GET direktori dengan path, nama, jenis, saiz dan mtime |
| `/api/workspaces/:workspaceId/search` | GET q, folder pilihan, nama/kandungan, had hasil |
| `/api/workspaces/:workspaceId/file` | GET baca, PUT simpan, POST cipta, DELETE padam |
| `/api/workspaces/:workspaceId/{rename,copy}` | POST from dan to |
| `/api/workspaces/:workspaceId/archive` | GET ZIP, POST import binari |
| `/api/workspaces/:workspaceId/upload` | POST binari dan query path |
| `/api/workspaces/:workspaceId/image` | GET imej melalui query path |
| `/api/workspaces/:workspaceId/settings` | GET/PUT pilihan tema, kepadatan, auto-simpan, shell dan snippet |
| `/api/workspaces/:workspaceId/git` | POST status, changes, change, commit, push. Change menyokong stage, unstage, diff, staged-diff dan untracked-diff |
| `/ws/terminal/:workspaceId` | Upgrade WebSocket dengan session, shell dan cwd. Kekalkan protokol input, resize dan close dalam kod |
| Preview | Origin berasingan dan rangkaian runner mengikut `previewProxy.ts` serta panduan deployment |

- Storan `WORKSPACE_STORAGE_ROOT/<userId>/<workspaceId>/`. Sahkan cookie sesi, UUID dan pemilikan, semak path dan symlink, dan gunakan respons 404 untuk workspace di luar akses. Kekalkan validasi origin terminal. ZIP upload sehingga 32 MiB, ekstrak sehingga 256 MiB. Kekalkan had bilangan fail dan entri daripada kod. Carian menerima 2–200 aksara dan sehingga 200 padanan. Explorer mengecualikan `.git` dan `node_modules`.
- PostgreSQL menyimpan jadual pengguna, sesi, token auth, workspace dan sambungan GitHub. Gunakan Argon2 dan pengesahan e-mel 24 jam dengan token berhash. Kekalkan schema dan migrasi Drizzle, middleware sesi/ralat, rate limit, Helmet dan CORS.
- Ambil setiap pemboleh ubah daripada `.env.example` dan `config.ts`, termasuk database, penyedia e-mel Resend/SMTP, origin aplikasi, secret sesi, cookie, preview, GitHub App, Docker socket, imej dan had resource. Guna `SMTP_URL` bagi SMTP dan nilai contoh selamat dalam repo.

## 8. Arahan bina dan ujian

```bash
cp .env.example .env
pnpm install --frozen-lockfile
docker compose up -d postgres
docker build -f packages/backend/Dockerfile.workspace -t zhcode/workspace:latest .
set -a
. ./.env
set +a
pnpm db:migrate
pnpm dev
```

Isi konfigurasi database, e-mel, origin dan storan sebelum menjalankan arahan. Frontend menggunakan 5173 dan backend 4000 secara lalai. Untuk ujian E2E, rujuk workflow CI, gunakan PostgreSQL ujian berasingan, imej Docker workspace dan `NODE_ENV=test`. Gunakan Node.js 24 untuk mengikuti konfigurasi CI.

```bash
pnpm build
node --test packages/frontend/tests/*.test.mjs
pnpm --filter @zh/backend exec tsx src/db/seedE2E.ts
pnpm exec playwright install --with-deps chromium
pnpm exec playwright test
bash -n scripts/workspace-backup.sh
git diff --check
```

Sahkan aliran daftar/sah e-mel/log masuk, cipta workspace, edit/simpan, draf/konflik selepas refresh, sambung terminal, paste, klik kanan/tekan lama, carian, navigasi Settings, akses ditolak kepada akaun lain, eksport/import ZIP, Git diff/stage dan pemulihan backup. Uji juga tema, kepadatan, split, pratonton dan muat naik apabila mengubahnya. Laporkan hasil sebenar.

## 9. Status integrasi

Kekalkan panel status untuk Chat, Extensions, Debug dan Insiders sehingga integrasi masing-masing disediakan. Add Folder to Chat menyimpan pilihan setempat. Jadual sandaran, kuota cakera keras, akses GitHub App, penyedia e-mel dan preview domain bergantung pada konfigurasi hos. Inventori aspirasi lanjut termasuk LSP khusus, runtime OS tambahan, kolaborasi dan plugin marketplace dalam dokumen rujukan.

## 10. Kod sumber lengkap dan struktur bersarang

Baca fail asal bagi setiap blok kod, aturan CSS, label, bentuk SVG, byte aset, konfigurasi dan ujian. Inventori ini meliputi semua fail Git dalam snapshot asas serta prompt ini. Untuk pembangunan daripada kosong, ambil fail dalam struktur yang sama, termasuk dotfiles, migrasi bersarang dan lockfile.

[Commit asas a7b26e7](https://github.com/id-duitjom/zh-code-editor-/tree/a7b26e79807e34e6661f76980cf1a9b830eb31c8)

```text
zh-code-editor-/
├── .env.example
├── .github/
│   └── workflows/
│       └── workspace.yml
├── .gitignore
├── .vscode/
│   └── mcp.json
├── DEPLOYMENT.md
├── FEATURE-MATRIX.md
├── README.md
├── VS-CODE-COMPLETE-BUILD-PROMPT.md
├── ZH-CODE-STUDIO-FULL-PROMPT.md
├── docker-compose.yml
├── package-lock.json
├── package.json
├── packages/
│   ├── backend/
│   │   ├── Dockerfile.workspace
│   │   ├── drizzle.config.ts
│   │   ├── drizzle/
│   │   │   ├── 0000_light_ezekiel.sql
│   │   │   └── meta/
│   │   │       ├── 0000_snapshot.json
│   │   │       └── _journal.json
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── auth/
│   │   │   │   ├── mailer.ts
│   │   │   │   ├── rateLimit.ts
│   │   │   │   ├── routes.ts
│   │   │   │   └── tokens.ts
│   │   │   ├── config.ts
│   │   │   ├── db/
│   │   │   │   ├── index.ts
│   │   │   │   ├── migrate.ts
│   │   │   │   ├── schema.ts
│   │   │   │   └── seedE2E.ts
│   │   │   ├── git/
│   │   │   │   └── routes.ts
│   │   │   ├── index.ts
│   │   │   ├── middleware/
│   │   │   │   ├── errorHandler.ts
│   │   │   │   ├── requireAuth.ts
│   │   │   │   └── requireWorkspaceAccess.ts
│   │   │   ├── session.d.ts
│   │   │   ├── terminal/
│   │   │   │   ├── pty.ts
│   │   │   │   └── ws.ts
│   │   │   └── workspace/
│   │   │       ├── docker.ts
│   │   │       ├── fileRoutes.ts
│   │   │       ├── files.ts
│   │   │       ├── previewProxy.ts
│   │   │       ├── routes.ts
│   │   │       ├── search.ts
│   │   │       ├── transferRoutes.ts
│   │   │       └── zip.ts
│   │   └── tsconfig.json
│   └── frontend/
│       ├── index.html
│       ├── package.json
│       ├── src/
│       │   ├── App.vue
│       │   ├── api/
│       │   │   └── client.ts
│       │   ├── components/
│       │   │   ├── editor/
│       │   │   │   ├── FileIcon.vue
│       │   │   │   ├── FileTree.vue
│       │   │   │   ├── FileTreeItem.vue
│       │   │   │   ├── MonacoEditor.vue
│       │   │   │   └── Tabs.vue
│       │   │   ├── layout/
│       │   │   │   ├── Sidebar.vue
│       │   │   │   ├── StatusBar.vue
│       │   │   │   ├── WorkspaceContextMenu.vue
│       │   │   │   └── WorkspaceIcon.vue
│       │   │   ├── settings/
│       │   │   │   ├── MenuItem.tsx
│       │   │   │   ├── SettingsMenu.tsx
│       │   │   │   ├── SettingsMenuHost.vue
│       │   │   │   ├── settingsMenu.css
│       │   │   │   └── settingsMenuData.ts
│       │   │   └── terminal/
│       │   │       ├── MockTerminal.vue
│       │   │       └── Terminal.vue
│       │   ├── composables/
│       │   │   ├── useFileSystem.ts
│       │   │   └── useMonaco.ts
│       │   ├── main.ts
│       │   ├── router.ts
│       │   ├── stores/
│       │   │   ├── auth.ts
│       │   │   ├── editor.ts
│       │   │   ├── editorRecovery.ts
│       │   │   ├── fileSystem.ts
│       │   │   └── terminal.ts
│       │   ├── utils/
│       │   │   └── fileIcons.ts
│       │   └── views/
│       │       ├── Dashboard.vue
│       │       ├── Register.vue
│       │       ├── SignIn.vue
│       │       ├── VerifyEmail.vue
│       │       └── Workspace.vue
│       ├── tests/
│       │   └── editorRecovery.test.mjs
│       ├── tsconfig.json
│       └── vite.config.ts
├── playwright.config.ts
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── resources/
│   └── logos/
│       ├── badges.png
│       ├── banner.png
│       ├── linux.svg
│       └── terminal-studio.svg
├── scripts/
│   └── workspace-backup.sh
└── tests/
    └── e2e/
        └── workspace.spec.ts
```

### Pautan kod, konfigurasi dan aset

- [`.env.example`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/.env.example)
- [`.github/workflows/workspace.yml`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/.github/workflows/workspace.yml)
- [`.gitignore`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/.gitignore)
- [`.vscode/mcp.json`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/.vscode/mcp.json)
- [`DEPLOYMENT.md`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/DEPLOYMENT.md)
- [`FEATURE-MATRIX.md`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/FEATURE-MATRIX.md)
- [`README.md`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/README.md)
- [`VS-CODE-COMPLETE-BUILD-PROMPT.md`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/VS-CODE-COMPLETE-BUILD-PROMPT.md)
- [`docker-compose.yml`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/docker-compose.yml)
- [`package-lock.json`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/package-lock.json)
- [`package.json`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/package.json)
- [`packages/backend/Dockerfile.workspace`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/backend/Dockerfile.workspace)
- [`packages/backend/drizzle.config.ts`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/backend/drizzle.config.ts)
- [`packages/backend/drizzle/0000_light_ezekiel.sql`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/backend/drizzle/0000_light_ezekiel.sql)
- [`packages/backend/drizzle/meta/0000_snapshot.json`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/backend/drizzle/meta/0000_snapshot.json)
- [`packages/backend/drizzle/meta/_journal.json`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/backend/drizzle/meta/_journal.json)
- [`packages/backend/package.json`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/backend/package.json)
- [`packages/backend/src/auth/mailer.ts`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/backend/src/auth/mailer.ts)
- [`packages/backend/src/auth/rateLimit.ts`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/backend/src/auth/rateLimit.ts)
- [`packages/backend/src/auth/routes.ts`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/backend/src/auth/routes.ts)
- [`packages/backend/src/auth/tokens.ts`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/backend/src/auth/tokens.ts)
- [`packages/backend/src/config.ts`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/backend/src/config.ts)
- [`packages/backend/src/db/index.ts`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/backend/src/db/index.ts)
- [`packages/backend/src/db/migrate.ts`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/backend/src/db/migrate.ts)
- [`packages/backend/src/db/schema.ts`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/backend/src/db/schema.ts)
- [`packages/backend/src/db/seedE2E.ts`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/backend/src/db/seedE2E.ts)
- [`packages/backend/src/git/routes.ts`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/backend/src/git/routes.ts)
- [`packages/backend/src/index.ts`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/backend/src/index.ts)
- [`packages/backend/src/middleware/errorHandler.ts`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/backend/src/middleware/errorHandler.ts)
- [`packages/backend/src/middleware/requireAuth.ts`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/backend/src/middleware/requireAuth.ts)
- [`packages/backend/src/middleware/requireWorkspaceAccess.ts`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/backend/src/middleware/requireWorkspaceAccess.ts)
- [`packages/backend/src/session.d.ts`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/backend/src/session.d.ts)
- [`packages/backend/src/terminal/pty.ts`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/backend/src/terminal/pty.ts)
- [`packages/backend/src/terminal/ws.ts`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/backend/src/terminal/ws.ts)
- [`packages/backend/src/workspace/docker.ts`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/backend/src/workspace/docker.ts)
- [`packages/backend/src/workspace/fileRoutes.ts`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/backend/src/workspace/fileRoutes.ts)
- [`packages/backend/src/workspace/files.ts`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/backend/src/workspace/files.ts)
- [`packages/backend/src/workspace/previewProxy.ts`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/backend/src/workspace/previewProxy.ts)
- [`packages/backend/src/workspace/routes.ts`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/backend/src/workspace/routes.ts)
- [`packages/backend/src/workspace/search.ts`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/backend/src/workspace/search.ts)
- [`packages/backend/src/workspace/transferRoutes.ts`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/backend/src/workspace/transferRoutes.ts)
- [`packages/backend/src/workspace/zip.ts`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/backend/src/workspace/zip.ts)
- [`packages/backend/tsconfig.json`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/backend/tsconfig.json)
- [`packages/frontend/index.html`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/frontend/index.html)
- [`packages/frontend/package.json`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/frontend/package.json)
- [`packages/frontend/src/App.vue`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/frontend/src/App.vue)
- [`packages/frontend/src/api/client.ts`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/frontend/src/api/client.ts)
- [`packages/frontend/src/components/editor/FileIcon.vue`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/frontend/src/components/editor/FileIcon.vue)
- [`packages/frontend/src/components/editor/FileTree.vue`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/frontend/src/components/editor/FileTree.vue)
- [`packages/frontend/src/components/editor/FileTreeItem.vue`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/frontend/src/components/editor/FileTreeItem.vue)
- [`packages/frontend/src/components/editor/MonacoEditor.vue`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/frontend/src/components/editor/MonacoEditor.vue)
- [`packages/frontend/src/components/editor/Tabs.vue`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/frontend/src/components/editor/Tabs.vue)
- [`packages/frontend/src/components/layout/Sidebar.vue`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/frontend/src/components/layout/Sidebar.vue)
- [`packages/frontend/src/components/layout/StatusBar.vue`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/frontend/src/components/layout/StatusBar.vue)
- [`packages/frontend/src/components/layout/WorkspaceContextMenu.vue`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/frontend/src/components/layout/WorkspaceContextMenu.vue)
- [`packages/frontend/src/components/layout/WorkspaceIcon.vue`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/frontend/src/components/layout/WorkspaceIcon.vue)
- [`packages/frontend/src/components/settings/MenuItem.tsx`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/frontend/src/components/settings/MenuItem.tsx)
- [`packages/frontend/src/components/settings/SettingsMenu.tsx`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/frontend/src/components/settings/SettingsMenu.tsx)
- [`packages/frontend/src/components/settings/SettingsMenuHost.vue`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/frontend/src/components/settings/SettingsMenuHost.vue)
- [`packages/frontend/src/components/settings/settingsMenu.css`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/frontend/src/components/settings/settingsMenu.css)
- [`packages/frontend/src/components/settings/settingsMenuData.ts`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/frontend/src/components/settings/settingsMenuData.ts)
- [`packages/frontend/src/components/terminal/MockTerminal.vue`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/frontend/src/components/terminal/MockTerminal.vue)
- [`packages/frontend/src/components/terminal/Terminal.vue`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/frontend/src/components/terminal/Terminal.vue)
- [`packages/frontend/src/composables/useFileSystem.ts`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/frontend/src/composables/useFileSystem.ts)
- [`packages/frontend/src/composables/useMonaco.ts`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/frontend/src/composables/useMonaco.ts)
- [`packages/frontend/src/main.ts`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/frontend/src/main.ts)
- [`packages/frontend/src/router.ts`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/frontend/src/router.ts)
- [`packages/frontend/src/stores/auth.ts`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/frontend/src/stores/auth.ts)
- [`packages/frontend/src/stores/editor.ts`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/frontend/src/stores/editor.ts)
- [`packages/frontend/src/stores/editorRecovery.ts`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/frontend/src/stores/editorRecovery.ts)
- [`packages/frontend/src/stores/fileSystem.ts`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/frontend/src/stores/fileSystem.ts)
- [`packages/frontend/src/stores/terminal.ts`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/frontend/src/stores/terminal.ts)
- [`packages/frontend/src/utils/fileIcons.ts`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/frontend/src/utils/fileIcons.ts)
- [`packages/frontend/src/views/Dashboard.vue`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/frontend/src/views/Dashboard.vue)
- [`packages/frontend/src/views/Register.vue`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/frontend/src/views/Register.vue)
- [`packages/frontend/src/views/SignIn.vue`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/frontend/src/views/SignIn.vue)
- [`packages/frontend/src/views/VerifyEmail.vue`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/frontend/src/views/VerifyEmail.vue)
- [`packages/frontend/src/views/Workspace.vue`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/frontend/src/views/Workspace.vue)
- [`packages/frontend/tests/editorRecovery.test.mjs`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/frontend/tests/editorRecovery.test.mjs)
- [`packages/frontend/tsconfig.json`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/frontend/tsconfig.json)
- [`packages/frontend/vite.config.ts`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/packages/frontend/vite.config.ts)
- [`playwright.config.ts`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/playwright.config.ts)
- [`pnpm-lock.yaml`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/pnpm-lock.yaml)
- [`pnpm-workspace.yaml`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/pnpm-workspace.yaml)
- [`resources/logos/badges.png`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/resources/logos/badges.png)
- [`resources/logos/banner.png`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/resources/logos/banner.png)
- [`resources/logos/linux.svg`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/resources/logos/linux.svg)
- [`resources/logos/terminal-studio.svg`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/resources/logos/terminal-studio.svg)
- [`scripts/workspace-backup.sh`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/scripts/workspace-backup.sh)
- [`tests/e2e/workspace.spec.ts`](https://github.com/id-duitjom/zh-code-editor-/blob/a7b26e79807e34e6661f76980cf1a9b830eb31c8/tests/e2e/workspace.spec.ts)
- [`ZH-CODE-STUDIO-FULL-PROMPT.md`](ZH-CODE-STUDIO-FULL-PROMPT.md)
