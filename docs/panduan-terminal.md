# Panduan Terminal: VS Code, Codespaces, Git, Node.js dan Cloudflare

Panduan ini menerangkan penggunaan terminal pada komputer sendiri, terminal bersepadu VS Code, GitHub Codespaces, Linux/Debian/Ubuntu dan Termux Android. Arahan terminal berbeza mengikut sistem operasi; jangan anggap semua arahan sesuai untuk semua tempat.

> **Ringkasan projek ini:** projek menggunakan Node.js 20+, pnpm 9+ dan workspace pnpm. Untuk memasang dependency projek, gunakan `pnpm install` dari direktori utama repositori, bukan `npm install`. Worker Cloudflare mempunyai direktori dan arahan berasingan.

## Kandungan

1. [Apa itu terminal?](#apa-itu-terminal)
2. [Terminal VS Code dan Codespaces](#terminal-vs-code-dan-codespaces)
3. [Asas arahan terminal](#asas-arahan-terminal)
4. [Node.js, npm, npx dan pnpm](#nodejs-npm-npx-dan-pnpm)
5. [Git asas](#git-asas)
6. [Bina repositori baru](#bina-repositori-baru)
7. [Clone repositori daripada pelbagai host](#clone-repositori-daripada-pelbagai-host)
8. [Pakej sistem: apt, sudo dan pkg](#pakej-sistem-apt-sudo-dan-pkg)
9. [Cloudflare Wrangler](#cloudflare-wrangler)
10. [Arahan projek ZH Code Studio](#arahan-projek-zh-code-studio)
11. [Masalah lazim](#masalah-lazim)
12. [Keselamatan terminal](#keselamatan-terminal)

## Apa itu terminal?

Terminal ialah antara muka teks untuk memberi arahan kepada sistem operasi. Ia boleh digunakan untuk menjalankan aplikasi, memasang alat, mengurus fail, membina program, menguji kod dan berkomunikasi dengan Git atau perkhidmatan awan.

| Istilah | Maksud |
| --- | --- |
| Terminal | Aplikasi atau panel tempat arahan ditaip. |
| Shell | Program yang membaca arahan, contohnya Bash, Zsh atau PowerShell. |
| Direktori | Folder semasa dalam terminal. |
| CLI | *Command-line interface*, iaitu aplikasi yang dikawal melalui arahan teks. |
| Prompt | Teks yang menunjukkan terminal sedia menerima arahan. |

Arahan dijalankan pada komputer atau container yang menjadi hos terminal itu. Terminal Codespaces, misalnya, berjalan dalam persekitaran awan Codespaces; memasang pakej di situ tidak semestinya memasangnya pada komputer peribadi.

## Terminal VS Code dan Codespaces

### Terminal bersepadu VS Code

1. Buka folder projek dalam VS Code melalui **File → Open Folder**.
2. Buka terminal melalui **Terminal → New Terminal**.
3. Pintasan lazim: <kbd>Ctrl</kbd>+<kbd>`</kbd> pada Windows/Linux atau <kbd>Control</kbd>+<kbd>`</kbd> pada macOS.
4. Semak folder semasa dengan `pwd` (macOS/Linux) atau `Get-Location` (PowerShell).
5. Pastikan anda berada di folder yang mempunyai fail projek, seperti `package.json`, sebelum menjalankan arahan projek.

VS Code biasanya memilih shell lalai sistem. Terminal itu bukan shell khas VS Code: ia menjalankan Bash, Zsh atau PowerShell yang telah dipasang pada mesin.

### GitHub Codespaces

Codespaces ialah persekitaran pembangunan awan. Buka repositori GitHub, pilih **Code → Codespaces → Create codespace**, atau sambung ke Codespace sedia ada. Terminal tersedia dalam editor web dan VS Code desktop apabila disambungkan ke Codespace.

- Fail dan arahan berada dalam Codespace, bukan secara automatik pada cakera komputer tempatan.
- Perubahan perlu disimpan dan dihantar ke remote dengan Git supaya berada dalam repositori.
- Persekitaran Codespace boleh dihentikan atau dipadam; commit dan push perubahan yang perlu disimpan.
- Pemasangan alat bergantung pada imej dan kebenaran Codespace. Dalam banyak container anda pengguna biasa dan `sudo` mungkin tiada.
- Semak persekitaran dengan `uname -a`, `node --version`, `git --version` dan `pwd`.

### Terminal lain

| Terminal/persekitaran | Contoh shell/pakej | Nota |
| --- | --- | --- |
| Windows Terminal | PowerShell, Command Prompt, WSL | `apt` hanya dalam Linux/WSL, bukan PowerShell biasa. |
| macOS Terminal | Zsh atau Bash | Pakej sistem lazimnya diurus dengan Homebrew, bukan `apt`. |
| Linux desktop/server | Bash/Zsh | Pengurus pakej bergantung pada distro, contohnya `apt` atau `dnf`. |
| Git Bash untuk Windows | Bash | Menyediakan banyak arahan Unix, tetapi bukan distro Linux penuh. |
| Android Termux | Shell Termux | Gunakan `pkg`; ia bukan Ubuntu dan `sudo apt` biasanya tidak sesuai. |

## Asas arahan terminal

| Arahan | Tujuan | Contoh / bila digunakan |
| --- | --- | --- |
| `pwd` | Paparkan laluan folder semasa (Unix). | Pastikan terminal berada di folder projek. |
| `ls` | Senaraikan fail dan folder (Unix). | `ls -la` turut menunjukkan fail tersembunyi. |
| `dir` | Senaraikan kandungan folder dalam PowerShell/CMD. | Alternatif Windows kepada `ls`. |
| `cd nama-folder` | Masuk ke folder. | `cd docs` |
| `cd ..` | Naik satu aras folder. | Kembali ke folder induk. |
| `mkdir nama-folder` | Cipta folder. | `mkdir latihan-terminal` |
| `touch nota.md` | Cipta fail kosong (Unix/Git Bash). | Dalam PowerShell: `New-Item nota.md -ItemType File`. |
| `cat nota.md` | Paparkan kandungan fail (Unix). | PowerShell juga menyokong `Get-Content nota.md`. |
| `clear` | Bersihkan paparan terminal (Unix). | Dalam PowerShell gunakan `Clear-Host` atau `cls`. |
| `whoami` | Paparkan nama pengguna semasa. | Membantu semak akaun/persekitaran. |
| `command --help` | Paparkan bantuan arahan. | Contoh: `git --help` atau `npm help install`. |

Nama fail dan huruf besar/kecil penting pada kebanyakan sistem Linux. Letakkan laluan yang mempunyai ruang dalam tanda petik, contohnya `cd "projek saya"`.

## Node.js, npm, npx dan pnpm

### Apakah kegunaan setiap alat?

- **Node.js** menjalankan JavaScript di luar pelayar dan diperlukan oleh banyak alat pembangunan web.
- **npm** ialah pengurus pakej yang disertakan bersama Node.js. Ia memasang dependency dan menjalankan skrip yang ditakrifkan dalam `package.json`.
- **npx** menjalankan alat pakej tanpa perlu memasangnya secara global (npm moden boleh memuat turun pakej jika perlu). Periksa nama dan sumber pakej sebelum menjalankannya.
- **pnpm** ialah pengurus pakej alternatif. Projek ini menetapkan `pnpm@9.15.0` dalam `package.json` dan menggunakan `pnpm-lock.yaml`.

Semak pemasangan:

```bash
node --version
npm --version
npx --version
pnpm --version
```

Jika arahan tidak ditemui, alat itu mungkin belum dipasang, atau direktori pemasangannya tiada dalam `PATH`. Pasang Node.js melalui kaedah rasmi sistem anda; untuk projek ini pasang/aktifkan versi pnpm yang ditetapkan.

### `npm install` — apa dan bila?

`npm install` membaca `package.json` dan memasang pakej yang diperlukan ke dalam `node_modules`. Ia lazim digunakan untuk projek npm yang mempunyai `package-lock.json`. Dalam sesetengah keadaan ia boleh mengemas kini lockfile jika manifest berubah.

```bash
npm install
npm install nama-pakej
npm install --save-dev nama-pakej
```

- `npm install`: pasang dependency projek semasa.
- `npm install nama-pakej`: tambah dependency untuk aplikasi.
- `npm install --save-dev nama-pakej`: tambah alat pembangunan seperti formatter atau test runner.

**Jangan campurkan pengurus pakej secara rawak dalam projek yang sama.** Jika projek menggunakan `pnpm-lock.yaml`, gunakan pnpm dan elakkan mencipta `package-lock.json` dengan `npm install`.

### `npm ci` berbanding `npm install`

`npm ci` memasang tepat berdasarkan `package-lock.json`, biasanya untuk CI/build yang perlu pemasangan boleh ulang. Ia memerlukan lockfile npm yang sepadan dan menggantikan `node_modules` sedia ada. Jangan gunakan ia sebagai pengganti terus bagi projek pnpm.

### Arahan pnpm

```bash
pnpm install
pnpm add nama-pakej
pnpm add -D nama-pakej
pnpm remove nama-pakej
pnpm run nama-skrip
pnpm dev
pnpm build
```

- `pnpm install`: pasang semua dependency workspace mengikut `pnpm-lock.yaml`.
- `pnpm add`: tambah dependency aplikasi.
- `pnpm add -D`: tambah dependency pembangunan.
- `pnpm run`: jalankan skrip dalam `package.json`.
- `pnpm dev` dan `pnpm build`: jalan pintas pnpm untuk skrip yang sepadan.

Jalankan arahan dari direktori yang mengandungi `package.json` berkaitan. Projek monorepo boleh mempunyai beberapa `package.json`; gunakan arahan root atau `pnpm --filter` yang dinyatakan oleh projek.

### `npx` dan arahan pakej sementara

```bash
npx nama-alat --help
```

`npx` berguna untuk mencuba CLI atau menjalankan alat projek tanpa pemasangan global. Semak dokumentasi alat dan nama pakej dahulu; arahan CLI pihak ketiga boleh membaca fail atau mengubah sistem anda.

### Jalankan skrip npm

Jika `package.json` mempunyai:

```json
{
  "scripts": {
    "dev": "vite"
  }
}
```

jalankan `npm run dev` dalam projek npm atau `pnpm dev` dalam projek pnpm. Nama skrip ialah khusus kepada projek; bukan semua projek mempunyai `dev`, `test` atau `build`.

## Git asas

Git merekod sejarah perubahan fail. Git setempat dan host remote (GitHub, GitLab, Bitbucket, Codeberg dan lain-lain) ialah dua perkara berlainan: Git boleh digunakan tanpa host, manakala push/pull memerlukan remote.

### Semak keadaan dan simpan perubahan

```bash
git status
git diff
git add nama-fail
git add .
git commit -m "Terangkan perubahan"
git log --oneline
```

| Arahan | Tujuan |
| --- | --- |
| `git status` | Semak branch dan fail yang berubah. Buat ini sebelum commit/pull. |
| `git diff` | Lihat perubahan yang belum di-stage. |
| `git add nama-fail` | Pilih fail tertentu untuk commit. |
| `git add .` | Stage perubahan dalam direktori semasa; semak `git status` supaya fail rahsia/binaan tidak tersertakan. |
| `git commit -m "..."` | Simpan snapshot perubahan yang telah di-stage dalam sejarah setempat. |
| `git log --oneline` | Lihat ringkasan sejarah commit. |

Commit hanya menyimpan perubahan pada mesin/clone setempat. Untuk menghantar commit kepada host, gunakan `git push`.

### Branch dan remote

```bash
git branch
git switch -c nama-branch
git switch main
git remote -v
git remote add origin https://HOST/PEMILIK/REPO.git
git push -u origin main
git pull
git fetch
```

- Branch membolehkan kerja perubahan dibuat berasingan daripada branch utama.
- `git switch -c` mencipta dan terus beralih ke branch baru.
- `origin` hanyalah nama konvensyen bagi remote; ia bukan arahan khas.
- `git fetch` mengambil maklumat remote tanpa menggabungkan perubahan ke branch semasa.
- `git pull` mengambil dan menggabungkan perubahan; semak status dan commit kerja anda terlebih dahulu.
- `git push -u origin nama-branch` menghantar branch dan menetapkan upstream untuk push seterusnya.

Jika diminta kata laluan melalui HTTPS, banyak host memerlukan token/kaedah log masuk yang disokong dan bukan kata laluan akaun biasa. Jangan tampal token ke dalam URL, kod, commit atau mesej.

### Abaikan fail tempatan

Fail seperti `node_modules/`, `.env` dan fail binaan biasanya tidak patut dimasukkan ke Git. Gunakan `.gitignore`, contohnya:

```gitignore
node_modules/
.env
.env.*
!.env.example
dist/
```

Semak dasar repositori sebelum menambah atau mengubah `.gitignore`. Jika rahsia pernah di-commit, memadam fail dalam commit baru tidak memadam rahsia daripada sejarah; batalkan/putar rahsia itu dan ikuti prosedur host.

## Bina repositori baru

Repositori boleh dicipta pada host melalui laman web atau CLI rasmi host. `git init` hanya menyediakan repositori Git setempat; ia **tidak** mencipta repositori di GitHub/GitLab secara automatik.

### Pilihan A: cipta setempat dahulu

```bash
mkdir projek-baru
cd projek-baru
git init
git branch -M main
```

Cipta fail projek, contohnya `README.md`, kemudian:

```bash
git add README.md
git commit -m "Cipta projek"
```

Selepas mencipta repositori kosong di host, sambungkan URL remote yang diberikan oleh host:

```bash
git remote add origin https://HOST/PEMILIK/projek-baru.git
git push -u origin main
```

Ganti `HOST`, `PEMILIK` dan nama repositori dengan nilai sebenar. Jika host mencipta README atau commit awal, sejarah remote mungkin berbeza; ikut arahan host untuk menggabungkan sejarah, jangan paksa push tanpa memahami kesannya.

### Pilihan B: cipta repositori melalui laman host

1. Log masuk ke host Git pilihan anda.
2. Pilih **New repository** atau fungsi yang setara.
3. Pilih nama, akses awam/peribadi dan pilihan README/license.
4. Jika repositori kosong, gunakan `git remote add origin URL` dan `git push -u origin main`.
5. Jika anda memilih untuk host mencipta README, biasanya lebih mudah clone repositori itu dahulu dan tambah fail ke clone.

### Pilihan C: GitHub CLI (pilihan)

Pasang `gh` daripada sumber rasmi GitHub CLI dan sahkan log masuk dengan `gh auth login`. Kemudian, dari folder projek:

```bash
gh repo create nama-repo --private --source=. --remote=origin --push
```

Buang `--private` atau tukar pilihan kepada `--public` jika anda memang mahu repositori awam. Semak kandungan dan rahsia sebelum menerbitkannya. CLI host lain mempunyai arahan mereka sendiri.

## Clone repositori daripada pelbagai host

`git clone` berfungsi dengan URL Git yang disediakan oleh host Git; ia bukan khusus untuk GitHub.

### Clone menggunakan HTTPS

```bash
git clone https://HOST/PEMILIK/NAMA-REPO.git
cd NAMA-REPO
```

Contoh bentuk URL (ganti dengan repositori sebenar):

```bash
git clone https://github.com/PEMILIK/NAMA-REPO.git
git clone https://gitlab.com/PEMILIK/NAMA-REPO.git
git clone https://codeberg.org/PEMILIK/NAMA-REPO.git
git clone https://bitbucket.org/PEMILIK/NAMA-REPO.git
```

Repositori awam lazimnya boleh di-clone tanpa log masuk. Repositori peribadi memerlukan kebenaran. Untuk host lain, salin URL HTTPS daripada butang **Clone** pada halaman repositori dan gantikannya dalam arahan:

```bash
git clone URL-YANG-DIBERI-HOST
```

### Clone menggunakan SSH

```bash
git clone git@HOST:PEMILIK/NAMA-REPO.git
```

SSH memerlukan kunci SSH yang disediakan dan didaftarkan pada host terlebih dahulu. HTTPS selalunya lebih mudah untuk permulaan; ikut panduan host untuk pengesahan.

### Clone ke folder pilihan

```bash
git clone URL-REPO nama-folder-tempatan
```

Untuk kemas kini selepas clone:

```bash
git status
git pull
```

Jika anda sudah mempunyai perubahan tempatan, semak dan commit/simpan dahulu. Konflik merge mungkin perlu diselesaikan secara manual.

## Pakej sistem: apt, sudo dan pkg

Pengurus pakej sistem memasang program pada OS/container; ia berbeza daripada `npm`/`pnpm`, yang mengurus dependency JavaScript projek.

### `apt` dan `apt install`

`apt` lazim pada Debian dan Ubuntu. Pada komputer/server milik anda yang menggunakan distro tersebut:

```bash
sudo apt update
sudo apt install git
sudo apt install python3
apt search nama-pakej
apt show nama-pakej
```

- `sudo` meminta keistimewaan pentadbir untuk arahan selepasnya. Gunakan hanya apabila perlu dan fahami arahan itu.
- `apt update` memuat semula senarai pakej; ia bukan arahan yang menaik taraf semua pakej.
- `apt install nama-pakej` memasang pakej sistem daripada repositori distro.
- `apt search` dan `apt show` membantu mencari dan memeriksa pakej.

`sudo apt install` tidak berfungsi pada setiap terminal: ia memerlukan distro yang menggunakan apt, akses rangkaian, dan kebenaran pentadbir. Dalam container/CI, anda mungkin sudah root atau tidak mempunyai `sudo`. Jangan cuba mengatasi polisi persekitaran terurus.

### `pkg` dalam Termux

`pkg` ialah pembantu pengurus pakej untuk Termux pada Android. Ia bukan sinonim kepada `apt` dan pakej/repo Termux berbeza daripada Ubuntu.

```bash
pkg update
pkg upgrade
pkg install git
pkg install nodejs
pkg install python
```

Gunakan arahan Termux untuk aplikasi Termux yang sah. Elakkan `sudo apt` pada Termux biasa; Termux bukan sistem Ubuntu berakar dan kebanyakan pemasangan tidak memerlukan `sudo`.

### Sistem lain

- Fedora/RHEL: lazimnya `dnf install ...` (hak pentadbir mungkin diperlukan).
- macOS: Homebrew sering digunakan, contohnya `brew install git`.
- Windows: gunakan winget, Microsoft Store atau pemasang rasmi; jangan jalankan `apt` dalam PowerShell biasa.
- WSL: jika distro WSL ialah Ubuntu/Debian, arahan `apt` boleh digunakan di dalam shell WSL tersebut.

Nama pakej dan arahan berubah mengikut OS. Semak dokumentasi rasmi distro, bukan menyalin arahan daripada sistem yang berbeza.

## Cloudflare Wrangler

Wrangler ialah CLI Cloudflare untuk membangunkan dan menerbitkan Workers. Dalam projek ini Worker berada di `cloudflare-code/worker` dan mempunyai skrip pnpm `dev` serta `deploy`.

### Jalankan Worker tempatan

Dari direktori root projek:

```bash
cd cloudflare-code/worker
pnpm install
pnpm dev
```

Atau gunakan pnpm yang dipasang di root jika workspace/lockfile projek membenarkannya. Wrangler membaca konfigurasi `wrangler.toml` pada direktori tersebut. Semak konfigurasi dan binding sebelum menjalankan.

### Log masuk dan deployment

```bash
pnpm exec wrangler --version
pnpm exec wrangler login
pnpm exec wrangler whoami
pnpm exec wrangler deploy
```

`wrangler login` membuka proses kebenaran akaun Cloudflare; `whoami` memeriksa akaun yang aktif; `deploy` menerbitkan Worker. Projek ini juga mempunyai skrip `pnpm deploy` dalam direktori Worker.

**Jangan terus deploy konfigurasi contoh.** `cloudflare-code/worker/wrangler.toml` mengandungi nilai contoh seperti `code.example.com`, `REPLACE_WITH_D1_DATABASE_ID` dan `REPLACE_WITH_KV_NAMESPACE_ID`. Sebelum deploy:

1. Cipta/ pilih akaun Cloudflare dan Worker yang betul.
2. Gantikan nilai contoh dengan domain, ID D1 dan namespace KV sebenar.
3. Tetapkan secrets melalui Wrangler atau dashboard Cloudflare; jangan masukkan rahsia ke dalam fail yang dikomit.
4. Pastikan binding, domain dan origin yang dibenarkan adalah tepat.
5. Semak `wrangler.toml` dan diff Git sebelum menjalankan `deploy`.

Arahan pengurusan sumber seperti mencipta D1/KV bergantung pada konfigurasi dan keperluan projek. Baca dokumentasi Cloudflare semasa dan semak akaun sasaran sebelum mencipta, mengubah atau memadam sumber.

## Arahan projek ZH Code Studio

Arahan berikut berdasarkan fail konfigurasi repositori ini dan dijalankan dari direktori root kecuali dinyatakan sebaliknya.

### Prasyarat dan pemasangan

- Node.js 20 atau lebih baru.
- pnpm 9 atau lebih baru (versi projek ditetapkan sebagai `pnpm@9.15.0`).
- Untuk servis penuh: PostgreSQL 16 atau Docker untuk PostgreSQL, Docker Engine untuk workspace runner, dan konfigurasi e-mel yang sesuai.
- Arahan repositori lengkap dan nilai persekitaran: rujuk `README.md` serta `.env.example`.

```bash
pnpm install
```

Ini memasang dependency workspace daripada lockfile pnpm. Jangan guna `npm install` di root kerana projek ini menggunakan pnpm.

### Skrip root yang tersedia

```bash
pnpm dev
pnpm build
pnpm db:generate
pnpm db:migrate
pnpm start
```

| Arahan | Kegunaan |
| --- | --- |
| `pnpm dev` | Jalankan skrip pembangunan semua pakej workspace secara selari. |
| `pnpm build` | Bina pakej workspace. |
| `pnpm db:generate` | Jana artifak/schema DB melalui skrip backend. |
| `pnpm db:migrate` | Jalankan migrasi pangkalan data backend. Pastikan DB dan konfigurasi tersedia dahulu. |
| `pnpm start` | Jalankan backend menggunakan skrip `start` pakej backend. |

`pnpm dev` tidak menggantikan prasyarat servis. Untuk menjalankan aliran penuh, ikut urutan dan arahan terkini dalam README: sediakan `.env`, PostgreSQL/Docker dan imej workspace, kemudian jalankan migrasi dan servis.

### Menjalankan Cloudflare Worker projek

```bash
cd cloudflare-code/worker
pnpm install
pnpm dev
```

Deployment bukan sebahagian daripada `pnpm dev`. Selepas tetapan Cloudflare sebenar disediakan dan disemak, gunakan `pnpm deploy` dari direktori Worker.

### Semak perubahan sebelum dihantar

```bash
git status
git diff
pnpm build
```

Rujuk README dan `package.json` bagi arahan ujian khusus; jangan anggap skrip `test` wujud jika tiada dalam pakej.

## Masalah lazim

| Mesej/masalah | Perkara untuk diperiksa |
| --- | --- |
| `command not found` / `is not recognized` | Alat belum dipasang atau `PATH` tidak dikemas kini. Pastikan shell/persekitaran betul. |
| `ENOENT ... package.json` | Anda berada di folder yang salah. Gunakan `pwd`/`Get-Location`, kemudian `cd` ke projek. |
| `pnpm: command not found` | Aktifkan/pasang pnpm mengikut arahan rasmi dan versi projek. |
| Gagal memuat turun pakej | Periksa sambungan rangkaian, registry, proxy dan ejaan nama pakej. |
| `EACCES` atau permission denied | Semak pemilik/kebenaran folder. Jangan terus jalankan semua arahan dengan `sudo`. |
| `git push` ditolak | Mungkin tiada akses, remote salah atau branch remote lebih baharu. Jalankan `git status` dan `git remote -v`; jangan force-push tanpa memahami akibatnya. |
| Merge conflict | Buka fail bertanda konflik, pilih kandungan yang betul, uji, kemudian `git add` dan selesaikan merge/commit. |
| `apt` atau `sudo` tidak ditemui | Anda mungkin bukan dalam Debian/Ubuntu atau persekitaran tidak memberi hak pentadbir. |
| Worker gagal deploy | Semak log masuk Cloudflare, konfigurasi Wrangler, binding, ID sumber dan secrets. Elakkan mendedahkan output yang mengandungi rahsia. |

## Keselamatan terminal

- Jangan jalankan arahan yang anda tidak faham, terutamanya arahan daripada pautan rawak atau mesej tidak dipercayai.
- Semak arahan sebelum menjalankannya dengan `sudo`, `curl` yang memuat turun skrip, atau CLI yang meminta akses akaun.
- Jangan kongsi token, kata laluan, private key, fail `.env` atau pautan log masuk sementara.
- Jangan masukkan rahsia ke dalam repositori; gunakan secret manager atau tetapan persekitaran yang sesuai.
- Semak `git status` dan `git diff` sebelum commit atau push, khususnya sebelum menerbitkan repositori awam.
- Berhati-hati dengan arahan memadam fail atau memaksa Git; semak sasaran dan kesannya dahulu.
- Untuk akaun cloud/produksi, pastikan akaun, projek, domain dan sumber yang dipilih betul sebelum mengubah atau deploy.

---

Panduan ini merangkumi arahan umum dan arahan yang tersedia untuk repositori ini. Arahan tepat boleh berbeza mengikut OS, shell, versi alat dan konfigurasi host; apabila ragu-ragu, ikut dokumentasi rasmi alat serta README projek.
