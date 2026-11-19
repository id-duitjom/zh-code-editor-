# Panduan Lengkap Terminal VS Code dan GitHub Codespaces

Panduan ini ditulis untuk pemula. Jalankan arahan yang bermula `#` hanya sebagai contoh - tidak perlu menaip tanda `#`.
Arahan Linux digunakan di terminal VS Code dan Codespaces. Dalam terminal projek ini, semakan
senggaraan sistem perlu dibuat pada kontena/host yang mempunyai kebenaran `sudo` atau `apt`.

## 1. Membuka terminal

| Cara | Arah/shortcut |
| --- | --- |
| Terminal VS Code | `Terminal` → `New Terminal`, atau tekan `Ctrl + Shift + `` |
| Terminal baru | `Ctrl + Shift + 5` untuk membelah skrin; dalam terminal, taip `exit` untuk tutup |
| Codex/terminal dalam editor | Cari panel terminal pada bahagian bawah |
| GitHub Codespaces | Buka repo di GitHub → butang `Code` → tab `Codespaces` → `Create codespace on main` |
| Command Palette | `Ctrl + Shift + P`, kemudian cari `Terminal: Create New Terminal` |

```bash
pwd                 # Paparkan lokasi/folder semasa
ls                  # Senarai fail dan folder
ls -la              # Senarai lengkap termasuk fail tersembunyi
cd nama-folder      # Masuk folder
cd ..               # Naik satu folder
cd ~                # Pergi ke folder utama pengguna
cd /                # Pergi ke root Linux
clear               # Bersihkan paparan terminal
history             # Senarai arahan sebelumnya
```

Untuk menaip arahan yang mengandungi ruang, gunakan tanda petik:

```bash
cd "Folder Saya"
mkdir "Folder Saya"
```

## 2. Arahan fail dan folder

```bash
touch fail.txt              # Cipta fail kosong
mkdir folder-saya           # Cipta satu folder
mkdir -p app/src/components # Cipta beberapa level folder sekaligus
cp fail.txt fail-salin.txt  # Salin fail
cp -r folder-a folder-b     # Salin folder beserta isinya
mv lama.txt baru.txt        # Tukar nama atau pindahkan fail
mv folder-a/ folder-b/       # Pindahkan folder
rm fail.txt                 # Padam fail
rm -f fail.txt              # Padam tanpa pengesahan
rmdir folder-saya           # Padam folder kosong
rm -rf folder-saya          # Padam folder beserta isi
find . -name "*.js"         # Cari fail JS dari folder semasa
grep -R "teks" .            # Cari teks dalam semua fail
nano fail.txt               # Edit dengan editor nano
code fail.txt               # Buka fail dalam VS Code
code .                      # Buka folder semasa dalam VS Code
```

Berhati-hati: `rm -rf folder-saya` tidak boleh dibatalkan dengan mudah. Elakkan `rm -rf /`,
`sudo rm -rf /` dan arahan tanpa sasaran yang jelas. Sebelum padam, jalankan `ls` atau `pwd`.

## 3. Node.js dan npm

Semak pemasangan:

```bash
node --version
npm --version
npx --version
corepack --version
```

`npm` menyertakan Node.js. Ia memuat turun package ke folder `node_modules` dan menyimpan versi
ke `package-lock.json`.

```bash
npm install                 # Pasang semua dependency dari package.json/package-lock.json
npm install nama-package    # Tambah dependency runtime
npm install -D nama-package # Tambah package pembangunan
npm uninstall nama-package  # Buang package
npm update                  # Kemas kini package mengikut had package.json
npm ci                      # Pemasangan tepat daripada lock file untuk CI/Codespaces
npm run dev                 # Jalankan skrip dev daripada package.json
npm run build               # Bina versi produksi
npm run test                # Jalankan ujian
npm start                   # Jalankan skrip start
npx nama-package             # Jalankan package sekali tanpa memasangnya kekal
npm init -y                  # Cipta package.json asas
npm list                    # Senarai dependency terus
npm outdated                # Senarai versi yang boleh dikemas kini
npm cache verify            # Semak cache npm
npm cache clean --force     # Bersihkan cache npm jika perlu
```

Gunakan `npm install` kali pertama atau selepas `package.json`/`package-lock.json` berubah.
Gunakan `npm ci` untuk pemasangan bersih yang sepatutnya mengikut lock file.
Jangan commit folder `node_modules`.

Untuk aplikasi root repo ini:

```bash
cp .env.example .env
pnpm install
pnpm dev
pnpm build
pnpm test
```

Senarai skrip repo semasa ada dalam `package.json`: `dev`, `build`, `db:generate`, `db:migrate`,
`start`. Repo menggunakan pnpm sebagai package manager.

## 4. pnpm dan Yarn

```bash
npm install -g pnpm@9.15.0  # Pasang pnpm versi repo
corepack enable
pnpm --version
pnpm install
pnpm add nama-package
pnpm add -D nama-package
pnpm remove nama-package
pnpm dev
pnpm build
pnpm test

npm install -g yarn         # Pilihan lain, bukan perlu jika guna pnpm
yarn install
yarn add nama-package
yarn dev
```

Jangan campurkan lock file. Jika projek ada `pnpm-lock.yaml`, gunakan pnpm. Jika ada
`package-lock.json`, gunakan npm. Jika ada `yarn.lock`, gunakan Yarn.

## 5. Next.js

Next.js berjalan di atas Node.js:

```bash
npx create-next-app@latest nama-projek
cd nama-projek
npm install
npm run dev
```

Untuk Next.js dengan TypeScript, Tailwind dan src folder:

```bash
npx create-next-app@latest nama-projek --typescript --tailwind --eslint --src-dir --app
cd nama-projek
npm run dev
```

Buka `http://localhost:3000`. Next.js biasa mengguna `app/`, `pages/`, `public/` dan `.env.local`.
Contoh environment:

```text
DATABASE_URL=...
NEXT_PUBLIC_API_URL=https://api.example.com
```

Pembolehubah bermula `NEXT_PUBLIC_` dihantar ke browser. Jangan letakkan rahsia atau API secret
sebenar dalam pembolehubah `NEXT_PUBLIC_`.

Arahan Next.js:

```bash
npm run dev
npm run build
npm start
npm run lint
npx next telemetry disable
```

## 6. JavaScript

Jalankan fail JavaScript Node.js:

```bash
node fail.js
node --watch fail.js       # Jalankan semula apabila fail berubah
node -e "console.log('Hello')"
node -p "2 + 3"
node --inspect fail.js     # Mode debugger
npm init -y
```

Untuk projek browser moden:

```bash
npx vite nama-projek
cd nama-projek
npm install
npm run dev
npm run build
npm run preview
```

## 7. Python

Semak dan pasang:

```bash
python --version
python3 --version
python -m pip --version
python3 -m pip --version
sudo apt update
sudo apt install python3 python3-pip python3-venv
```

Buat project dan environment maya:

```bash
mkdir python-project
cd python-project
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install requests flask fastapi uvicorn
pip freeze > requirements.txt
python app.py
```

Aktifkan environment setiap sesi terminal baharu:

```bash
source .venv/bin/activate
deactivate
```

Pasang daripada fail requirements:

```bash
python -m pip install -r requirements.txt
```

Jalankan skrip dan modul:

```bash
python nama.py
python3 -m http.server 8000
python -m flask --app app run --debug
python -m pytest
python -m pip list
python -m pip freeze
python -m pip uninstall nama-package
```

Jangan commit `.venv/`. Tambah `.venv/` pada `.gitignore`.

## 8. Git dan GitHub

Semak Git:

```bash
git --version
git status
git status --short
git branch
git branch --all
git log --oneline --decorate --graph --all
git log -n 10
git remote -v
git config --global --list
```

Konfigurasi identiti sekali:

```bash
git config --global user.name "Nama Anda"
git config --global user.email "email-github-anda@example.com"
git config --global init.defaultBranch main
git config --global core.editor "code --wait"
git config --global pull.rebase false
git config --list
git config --global --unset user.name
```

Sambungan HTTPS atau SSH:

```bash
# HTTPS
git clone https://github.com/owner/nama-repo.git

# SSH
ssh-keygen -t ed25519 -C "email-github-anda@example.com"
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
cat ~/.ssh/id_ed25519.pub
ssh -T git@github.com
git clone git@github.com:owner/nama-repo.git
```

Masukkan kandungan `.pub` ke GitHub:
**Settings** → **SSH and GPG keys** → **New SSH key**.
Jangan kongsi atau commit `~/.ssh/id_ed25519`, iaitu kunci peribadi.

Clone, fork dan masuk folder:

```bash
git clone https://github.com/owner/nama-repo.git
cd nama-repo
git remote -v
git remote rename origin upstream
git remote add origin https://github.com/owner/nama-repo.git
git remote set-url origin https://github.com/owner/nama-repo.git
git remote remove origin
git remote prune origin
```

Aliran commit dan push normal:

```bash
git status
git add fail.txt
git add src/nama.js
git add .
git restore --staged fail.txt
git diff
git diff --staged
git commit -m "Tambah laman log masuk"
git push
git push origin main
git push -u origin main
```

Arahan `git add .` menambah semua perubahan dalam folder semasa. Untuk commit pertama:

```bash
git init
git add .
git commit -m "Commit pertama"
git branch -M main
git remote add origin https://github.com/owner/nama-repo.git
git push -u origin main
```

Tarik pembaharuan:

```bash
git pull
git pull --rebase
git fetch
git fetch --all --prune
git merge nama-branch
git rebase nama-branch
```

Cipta dan tukar branch:

```bash
git branch nama-ciri
git switch nama-ciri
git switch -c nama-ciri
git checkout nama-ciri
git checkout -b nama-ciri
git switch main
git merge nama-ciri
git branch -d nama-ciri
git push origin --delete nama-ciri
git push -u origin nama-ciri
```

Simpan perubahan sementara:

```bash
git stash
git stash push -m "Kerja separuh siap"
git stash list
git stash show -p stash@{0}
git stash pop
git stash apply stash@{0}
git stash drop stash@{0}
git stash clear
```

Pembatalan dengan selamat:

```bash
git restore fail.txt          # Buang perubahan belum staged
git restore --staged fail.txt # Keluarkan daripada stage
git reset nama-fail.txt       # Bentuk lama untuk keluarkan daripada stage
git revert SHA_COMMIT         # Buat commit pembatalan baharu
git reset --soft HEAD~1       # Kekalkan fail dan stage
git reset --mixed HEAD~1      # Kekalkan fail, keluarkan stage
git reset --hard HEAD~1       # Buang perubahan dan reset kerja
git reflog                    # Cari commit lama selepas reset
git clean -n                  # Pratonton fail yang belum dijejak
git clean -fd                 # Padam fail/folder belum dijejak
git clean -fdx                # Juga padam fail yang diabaikan
```

Hanya gunakan `reset --hard` dan `clean -fdx` selepas sandaran/semakan, kerana perubahan boleh hilang.

Tag dan release:

```bash
git tag
git tag v1.0.0
git tag -a v1.0.0 -m "Versi 1.0.0"
git push origin v1.0.0
git push origin --tags
git tag -d v1.0.0
git push origin --delete v1.0.0
```

GitHub CLI:

```bash
gh --version
gh auth login
gh auth status
gh repo clone owner/nama-repo
gh repo create nama-baru --public --source=. --remote=origin --push
gh repo view
gh issue list
gh pr list
gh pr create --title "Tajuk" --body "Penerangan"
gh pr checkout 123
gh pr view 123
gh pr merge 123
gh release create v1.0.0 --title "Release" --notes "Nota"
```

## 9. Kemas kini Ubuntu/Debian/Codespaces

`apt` digunakan pada Ubuntu/Debian:

```bash
sudo apt update
sudo apt upgrade
sudo apt update && sudo apt upgrade -y
sudo apt full-upgrade -y
sudo apt autoremove -y
sudo apt clean
sudo apt install nama-pakej
sudo apt remove nama-pakej
sudo apt purge nama-pakej
apt search nama-pakej
apt show nama-pakej
apt list --installed
```

`apt update` hanya mengemas kini indeks/senarai pakej; ia tidak menaik taraf pakej.
`apt upgrade` menaik taraf pakej sedia ada.
`sudo apt update && sudo apt upgrade -y` melakukan kedua-duanya dan menjawab `yes` secara automatik.
Gunakan `sudo` kerana arahan sistem memerlukan kebenaran pentadbir.

Selepas memulakan Codespaces baharu, Node, Python, Docker atau pakej sistem bergantung pada
`.devcontainer/devcontainer.json` dan imej. Sesetengah terminal projek mempunyai pengguna tanpa
`sudo`; pada masa itu, ubah Dockerfile atau environment host.

## 10. Provider lain: Git, cloud dan package registry

### GitHub

```bash
git remote set-url origin https://github.com/owner/nama-repo.git
git remote set-url origin git@github.com:owner/nama-repo.git
```

### GitLab

```bash
git remote add gitlab https://gitlab.com/owner/nama-repo.git
git remote set-url gitlab git@gitlab.com:owner/nama-repo.git
git push -u gitlab main
```

### Bitbucket

```bash
git remote add bitbucket git@bitbucket.org:owner/nama-repo.git
git push -u bitbucket main
```

Satu repo boleh ada beberapa remote:

```bash
git remote -v
git push origin main
git push gitlab main
git push --all origin
git fetch --all
```

### Package registries

```bash
npm login
npm publish
npm whoami
npm view nama-package
npx npm-check-updates -u

pnpm login
pnpm publish
pnpm view nama-package
```

### Hosting Next.js dan Node

- GitHub Pages sesuai untuk laman statik, bukan terminal aplikasi Node.
- Vercel sesuai untuk Next.js.
- Netlify sesuai untuk laman/Vite/SSR tertentu.
- Railway dan Render sesuai untuk web service/database.
- Cloudflare Pages sesuai untuk frontend dan worker/edge.
- Docker/VPS memberi kawalan penuh tetapi memerlukan penyelenggaraan sistem.

Jangan upload `.env`, private key, token atau credentials ke GitHub. Gunakan environment variable
platform hosting dan `GitHub Secrets` untuk CI/CD.

## 11. Docker

Semak Docker:

```bash
docker --version
docker compose version
docker ps
docker ps -a
docker images
docker info
```

Repo ini menggunakan Docker Compose:

```bash
docker compose up -d
docker compose up -d postgres
docker compose ps
docker compose logs
docker compose logs -f postgres
docker compose exec postgres bash
docker compose restart
docker compose down
docker compose down -v
docker compose build
docker compose build --no-cache
docker compose pull
```

Docker asas:

```bash
docker pull node:20
docker run --rm node:20 node --version
docker run -d --name myapp -p 3000:3000 nama-image
docker stop myapp
docker start myapp
docker restart myapp
docker rm myapp
docker rm -f myapp
docker rmi nama-image
docker system df
docker system prune
docker system prune -a --volumes
```

Elakkan `docker compose down -v` jika volume pangkalan data perlu dikekalkan.

## 12. MCP

MCP (Model Context Protocol) membolehkan Copilot/CLI atau model berhubung dengan alat luaran.
Contoh MCP yang ada dalam repo ini ialah Codex dan Firecrawl, seperti dalam README.

```bash
codex --version
codex mcp list
codex mcp add firecrawl --url https://mcp.firecrawl.dev/v2/mcp-oauth
codex mcp login firecrawl --no-browser
codex mcp remove firecrawl
codex mcp get firecrawl
```

Konfigurasi biasa:

```bash
# Cipta fail konfigurasi user jika aplikasi menyokong
mkdir -p ~/.config/codex
code ~/.config/codex/config.toml
```

Contoh struktur MCP HTTP:

```toml
# ~/.config/codex/config.toml
[mcp_servers.nama-server]
url = "https://example.com/mcp"
```

Untuk MCP stdio:

```json
{
  "mcpServers": {
    "contoh": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-everything"]
    }
  }
}
```

Nama dan format konfigurasi berbeza mengikut VS Code/Copilot/Codex/Claude. Gunakan arahan
CLI rasmi jika tersedia. Jangan letakkan API secret terus dalam fail yang akan di-commit.
Gunakan environment variable atau secret manager.

## 13. Environment variable dan rahsia

```bash
export NAMA_RAHASIA="nilai"
echo "$NAMA_RAHASIA"
unset NAMA_RAHASIA
env
printenv NAMA_RAHASIA
```

Fail shell:

```bash
cp .env.example .env
code .env
set -a
. ./.env
set +a
```

Pastikan `.env`, `.env.local`, private key dan fail credential disenaraikan dalam `.gitignore`.
Untuk CI GitHub, guna **Settings** → **Secrets and variables** → **Actions**.

## 14. Proses dan rangkaian

```bash
ps
ps aux
top
htop
kill PID
kill -9 PID
pkill nama-proses
jobs
fg
bg
nohup npm run dev &
curl http://localhost:3000
curl -I https://example.com
wget https://example.com/fail.zip
tar -xzf fail.tar.gz
tar -czf fail.tar.gz folder/
zip -r fail.zip folder/
unzip fail.zip
unzip -l fail.zip
```

Jangan guna `pkill` atau `kill` untuk padam proses yang tidak dikenali. Dapatkan PID dahulu
melalui `ps` atau `top`.

## 15. SSH dan satu remote

```bash
ssh user@server.example.com
ssh -i ~/.ssh/id_ed25519 user@server.example.com
ssh-keyscan server.example.com
scp fail.txt user@server:/folder/
rsync -avz folder/ user@server:/folder/
```

Ujian port/tempatan:

```bash
ping example.com
nslookup example.com
dig example.com
netstat -tulpn
lsof -i :3000
ss -tulpn
```

Untuk VS Code Remote SSH: tekan `Ctrl + Shift + P`, pilih `Remote-SSH: Connect to Host`.

## 16. Shortcut VS Code

| Shortcut | Fungsi |
| --- | --- |
| `Ctrl + Shift + P` | Command Palette |
| `Ctrl + P` | Cari/buka fail |
| `Ctrl + Shift + F` | Cari seluruh projek |
| `Ctrl + H` | Cari dan ganti |
| `Ctrl + `` | Buka/tutup terminal |
| `Ctrl + Shift + `` | Terminal baharu |
| `Ctrl + B` | Buka/tutup sidebar |
| `Ctrl + S` | Simpan |
| `Ctrl + W` | Tutup tab |
| `Ctrl + Tab` | Tukar tab |
| `Ctrl + /` | Togol komen baris |
| `Ctrl + D` | Pilih kemunculan perkataan seterusnya |
| `Alt + ↑/↓` | Gerak baris |
| `Shift + Alt + ↓` | Gandakan baris |
| `F2` | Rename symbol |
| `F5` | Mulakan debugging |

## 17. Troubleshooting asas

```bash
node --version
npm --version
python --version
git --version
git status
git remote -v
git config --get remote.origin.url
docker compose ps
docker compose logs --tail 100
```

Jika `npm install` gagal:

```bash
rm -rf node_modules
npm cache verify
npm install
```

Jika lock file bercanggah, jangan padam lock file terus. Semak package manager yang digunakan
dan jalankan pemasangan dari bersih dalam branch baharu.

Jika port sudah digunakan:

```bash
lsof -i :3000
kill PID
npm run dev -- --port 3001
```

Jika Git ditolak kerana remote berlainan:

```bash
git status
git remote -v
git pull --rebase origin main
git push -u origin main
```

Jika Git Hub meminta password di HTTPS, gunakan Personal Access Token atau GitHub CLI.
Jangan taip password GitHub sebenar sebagai password Git CLI lama.

## 18. Laman penting

| Perkara | Laman |
| --- | --- |
| GitHub | https://github.com |
| GitHub Docs | https://docs.github.com |
| GitHub Codespaces | https://github.com/codespaces |
| GitHub CLI | https://cli.github.com |
| VS Code | https://code.visualstudio.com |
| VS Code Download | https://code.visualstudio.com/download |
| VS Code Docs | https://code.visualstudio.com/docs |
| Microsoft Learn: Visual Studio Code | https://learn.microsoft.com/training/vscode |
| Node.js | https://nodejs.org |
| npm | https://www.npmjs.com |
| pnpm | https://pnpm.io |
| Yarn | https://yarnpkg.com |
| Next.js | https://nextjs.org/docs |
| Next.js Create App | https://nextjs.org/docs/app/getting-started/installation |
| JavaScript MDN | https://developer.mozilla.org/docs/Web/JavaScript |
| Node.js Documentation | https://nodejs.org/docs |
| Python | https://www.python.org |
| Python Documentation | https://docs.python.org |
| Python Packages | https://pypi.org |
| Ubuntu Package Search | https://packages.ubuntu.com |
| Debian Package Search | https://packages.debian.org |
| Docker | https://docs.docker.com |
| Docker Hub | https://hub.docker.com |
| Git | https://git-scm.com/doc |
| GitLab | https://gitlab.com |
| Bitbucket | https://bitbucket.org |
| Vercel | https://vercel.com |
| Netlify | https://www.netlify.com |
| Railway | https://railway.app |
| Render | https://render.com |
| Cloudflare | https://www.cloudflare.com |
| Cloudflare Workers | https://developers.cloudflare.com/workers |
| Supabase | https://supabase.com |
| Neon | https://neon.com |
| PostgreSQL | https://www.postgresql.org/docs |
| Model Context Protocol | https://modelcontextprotocol.io |
| MCP Servers | https://github.com/modelcontextprotocol/servers |
| Codex MCP | https://developers.openai.com/codex/mcp |
| Firecrawl | https://www.firecrawl.dev |

## 19. Ringkasan aliran kerja harian

```bash
cd /workspaces/nama-repo
git status
git pull --rebase
npm install                    # atau pnpm install jika ada pnpm-lock.yaml
npm run dev

# Selepas edit fail
git status
git diff
git add .
git diff --staged
git commit -m "Terangkan apa yang ditukar"
git push
```

## 20. Senarai arahan Linux, Bash dan fail

Maklumat pengguna dan sistem:

```bash
whoami
hostname
uname -a
lsb_release -a
cat /etc/os-release
date
cal
uptime
df -h
df -h .
du -sh .
du -sh nama-folder
du -ah . | sort -rh | head -20
free -h
who
w
id
groups
echo "$HOME"
echo "$PATH"
which node
which python
whereis python
type node
man ls
ls --help
help cd
```

Baca, gabung dan ubah kandungan fail:

```bash
cat fail.txt
less fail.txt
head -n 20 fail.txt
tail -n 20 fail.txt
tail -f log.txt
wc -l fail.txt
wc -w fail.txt
wc -c fail.txt
sort fail.txt
sort -r fail.txt
uniq fail.txt
cut -d, -f1 data.csv
sed -n '1,20p' fail.txt
diff fail1.txt fail2.txt
cmp fail1.txt fail2.txt
echo "Teks" > fail.txt
echo "Teks baru" >> fail.txt
cat fail1.txt fail2.txt > gabung.txt
```

Pipe, operator dan pencarian:

```bash
ls | grep ".js"
cat fail.txt | grep "error"
ps aux | grep node
history | grep "git"
find . -type f
find . -type d
find . -maxdepth 2 -type f
find . -type f -mtime -1
find . -size +10M
grep -n "API_KEY" .env.example
grep -Rni "TODO" src
rg "function" -t ts src
rg "TODO|FIXME" .
command1 && command2
command1 || command2
command1 ; command2
command1 | command2
command > output.txt
command 2> error.txt
command > output.txt 2>&1
command1 | tee output.txt
```

Kebenaran dan pemilikan:

```bash
ls -l
chmod +x script.sh
chmod 755 script.sh
chmod 600 rahsia.pem
chmod -R 755 folder
chown nama-pengguna:kumpulan fail.txt
sudo chown -R "$USER":"$USER" .
stat fail.txt
ln -s tujuan-pautan nama-pautan
readlink nama-pautan
umask
```

Mampatan dan arkib:

```bash
gzip fail.txt
gunzip fail.txt.gz
tar -tf fail.tar
tar -xf fail.tar
tar -czvf fail.tar.gz folder
tar -xzvf fail.tar.gz
tar -cjvf fail.tar.bz2 folder
tar -xjvf fail.tar.bz2
zip -r projek.zip folder
unzip projek.zip -d folder-tujuan
unzip -l projek.zip
7z a projek.7z folder
7z x projek.7z
```

## 21. Alias dan skrip Bash

Tambah alias sementara atau kekal dalam `~/.bashrc`:

```bash
alias ll='ls -la'
alias gs='git status'
alias gp='git push'
alias gc='git commit'
unalias ll
nano ~/.bashrc
source ~/.bashrc
```

Pembolehubah dan loop:

```bash
NAMA="ZH"
echo "Nama: $NAMA"
for file in *.js; do echo "$file"; done
for number in 1 2 3 4 5; do echo "$number"; done
count=1; while [ "$count" -le 5 ]; do echo "$count"; count=$((count + 1)); done
if [ -d folder ]; then echo "Folder ada"; fi
if [ -f fail.txt ]; then echo "Fail ada"; fi
test -f fail.txt && echo "Fail wujud"
test -d folder && echo "Folder wujud"
```

Buat skrip Bash:

```bash
nano script.sh
chmod +x script.sh
./script.sh
bash script.sh
bash -n script.sh
shellcheck script.sh
```

Contoh skrip minimum:

```bash
#!/usr/bin/env bash
set -euo pipefail

echo "Folder semasa: $(pwd)"
git status --short
```

## 22. Node.js dan npm lanjutan

```bash
npm doctor
npm config get registry
npm config set registry https://registry.npmjs.org/
npm config list
npm audit
npm audit fix
npm audit fix --force
npm fund
npm explain nama-package
npm why nama-package
npm pkg get scripts
npm pkg set scripts.start="node server.js"
npm view nama-package version
npm view nama-package dist-tags
npm search nama-package
npm login
npm logout
npm publish --access public
npm pack
npm link
npm unlink
npm exec -- nama-package
node --check fail.js
node --test
node --watch server.js
node -e "require('node:fs').writeFileSync('hello.txt','hello')"
```

Versi Node menggunakan nvm:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.nvm/nvm.sh
nvm install 20
nvm install 22
nvm use 20
nvm use 22
nvm alias default 22
nvm ls
nvm ls-remote
nvm which 22
echo "20" > .nvmrc
nvm use
```

Pakej pembangunan biasa:

```bash
npm install express
npm install cors dotenv
npm install -D nodemon typescript tsx
npx tsc --init
npx tsx server.ts
npx prettier --write .
npx eslint .
npx vitest
npx playwright install
npx playwright install --with-deps
```

## 23. TypeScript

```bash
npm install -g typescript
tsc --version
tsc fail.ts
tsc --watch
tsc --noEmit
tsc --project tsconfig.json
npx tsx fail.ts
npx ts-node fail.ts
npx tsc --init
npx prettier --write .
npx eslint .
```

Contoh `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "outDir": "dist"
  },
  "include": ["src/**/*"]
}
```

## 24. Next.js lanjutan

```bash
npx create-next-app@latest
npx create-next-app@latest frontend --typescript --tailwind --eslint --app
npx create-next-app@latest frontend --js --tailwind --app
cd frontend
npm run dev
npm run dev -- --hostname 0.0.0.0 --port 3000
npm run build
npm start
npm run lint
npx next info
npx next telemetry disable
npx next telemetry enable
npx serve out
```

Struktur App Router lazim:

```text
app/layout.tsx
app/page.tsx
app/loading.tsx
app/error.tsx
app/not-found.tsx
app/api/hello/route.ts
app/dashboard/page.tsx
public/
next.config.mjs
.env.local
```

Contoh `.env.local`:

```text
DATABASE_URL=postgresql://user:password@host:5432/database
NEXTAUTH_SECRET=nilai-panjang-rahsia
NEXT_PUBLIC_APP_NAME=ZH App
```

Pastikan `.env.local`, `.next/` dan `node_modules/` tidak di-commit:

```text
.env
.env.local
.env*.local
.next/
out/
node_modules/
```

## 25. Python lanjutan

```bash
python -m venv .venv
python3 -m venv .venv
source .venv/bin/activate
.venv/bin/python -m pip install --upgrade pip
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python app.py
python -m pip install --upgrade nama-package
python -m pip uninstall nama-package
python -m pip show nama-package
python -m pip check
python -m pip freeze > requirements.txt
python -m pip install -e .
python -m compileall .
python -m unittest
python -m unittest discover
python -m pytest -v
python -m pytest --cov
python -m pytest -k "nama_test"
python -m black .
python -m ruff check .
python -m ruff format .
python -m mypy .
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
python -m flask --app app run --host 0.0.0.0 --port 5000
python manage.py runserver
python manage.py migrate
python manage.py makemigrations
python manage.py createsuperuser
python manage.py test
python -m streamlit run app.py
python -m jupyter notebook
python -m jupyter lab
```

uv:

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
uv python install 3.12
uv python list
uv venv
source .venv/bin/activate
uv pip install requests
uv pip freeze > requirements.txt
```

Poetry:

```bash
pip install poetry
poetry new nama-projek
cd nama-projek
poetry install
poetry add requests
poetry add --group dev pytest
poetry run python app.py
poetry shell
```

Jangan campurkan kaedah environment dengan tidak perlu. Pilih satu kaedah utama.

## 26. JavaScript, React dan Vite

```bash
npm create vite@latest
npm create vite@latest frontend -- --template react
npm create vite@latest frontend -- --template vue
npm create vite@latest frontend -- --template svelte
npm create vite@latest frontend -- --template vanilla
cd frontend
npm install
npm run dev
npm run build
npm run preview
npm run test
npx vite --host 0.0.0.0 --port 5173
npx vite preview --host 0.0.0.0 --port 4173
```

## 27. Git lanjutan

Semakan:

```bash
git show
git show HEAD
git show SHA_COMMIT
git diff HEAD
git diff main...nama-ciri
git diff --stat
git diff --name-only
git blame nama-fail
git shortlog -sne
git grep "teks"
git rev-parse --show-toplevel
git rev-parse --abbrev-ref HEAD
git describe --tags --always
```

Remote dan upstream:

```bash
git remote
git remote get-url origin
git remote set-url origin git@github.com:owner/nama-repo.git
git remote add upstream https://github.com/original/nama-repo.git
git fetch upstream
git merge upstream/main
git rebase upstream/main
git push -u origin nama-cabang
git remote remove upstream
```

Squash dan cari commit:

```bash
git log --all --oneline --decorate
git log -- nama-fail
git log -S "fungsiYangDicari"
git log --grep "pesan commit"
git rebase -i HEAD~3
git rebase -i main
git push --force-with-lease
git bisect start
git bisect bad
git bisect good SHA_COMMIT_OK
git bisect reset
```

Gunakan `--force-with-lease`, bukan `--force`, pada branch kongsi. Jangan rewrite sejarah
branch `main` melainkan pemilik repository membenarkan.

Batalkan operasi:

```bash
git cherry-pick SHA_COMMIT
git cherry-pick --abort
git cherry-pick --continue
git revert --no-edit SHA_COMMIT
git revert --abort
git merge --abort
git rebase --abort
git rebase --continue
git rebase --skip
```

Submodule dan worktree:

```bash
git submodule add https://github.com/owner/repo.git folder
git submodule init
git submodule update --init --recursive
git submodule update --remote
git worktree add ../nama-cabang nama-cabang
git worktree add -b nama-baru ../folder-baru main
git worktree list
git worktree remove ../nama-cabang
git worktree prune
```

Patch dan LFS:

```bash
git format-patch -1 HEAD
git format-patch main..nama-cabang
git apply fail.patch
git apply --check fail.patch
git am fail.patch
git am --abort
git am --continue
git lfs install
git lfs track "*.psd"
git lfs track "*.zip"
git lfs ls-files
git add .gitattributes
git commit -m "Sambungkan Git LFS"
```

## 28. Authentication GitHub

GitHub CLI:

```bash
gh auth login
gh auth login --hostname github.com --git-protocol https
gh auth login --hostname github.com --git-protocol ssh
gh auth status
gh auth refresh
gh auth logout
gh auth setup-git
gh api user
```

SSH:

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_ed25519
chmod 644 ~/.ssh/id_ed25519.pub
ssh-keygen -t ed25519 -C "email@example.com"
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
cat ~/.ssh/id_ed25519.pub
ssh -T git@github.com
ssh -vT git@github.com
ssh-add -l
```

Untuk HTTPS, GitHub meminta username dan Personal Access Token. Bina fine-grained PAT
di https://github.com/settings/personal-access-tokens dengan kebenaran minimum.

## 29. GitHub CLI lanjutan

```bash
gh repo view
gh repo view owner/nama-repo --web
gh repo list
gh repo fork owner/nama-repo --clone
gh repo edit --description "Penerangan"
gh repo set-default owner/nama-repo
gh repo sync

gh issue create --title "Bug" --body "Butiran"
gh issue view 10
gh issue edit 10 --add-label bug
gh issue close 10
gh issue reopen 10

gh pr create --base main --head nama-cabang --title "Ciri baru" --body "Butiran"
gh pr create --fill
gh pr view
gh pr diff
gh pr checks
gh pr ready
gh pr merge --squash --delete-branch
gh pr merge --rebase
gh pr merge --merge
gh pr review --approve
gh pr review --comment -b "Nampak baik"
gh pr review --request-changes -b "Perlu pembetulan"

gh workflow list
gh workflow view
gh workflow run deploy.yml
gh run list
gh run view
gh run watch
gh run rerun
gh secret set NAMA_SECRET
gh secret list
gh variable set NAMA_VARIABLE --body "nilai"
```

## 30. GitHub Actions

Contoh `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm test
      - run: npm run build
```

## 31. PostgreSQL

```bash
psql --version
psql "postgresql://user:password@localhost:5432/database"
psql -h localhost -p 5432 -U user -d database
pg_dump -h localhost -U user -d database > backup.sql
pg_dump -Fc database > backup.dump
pg_restore -d database backup.dump
createdb database
dropdb database
```

Dalam Docker Compose:

```bash
docker compose up -d postgres
docker compose exec postgres psql -U postgres -d app
docker compose exec postgres pg_dump -U postgres app > backup.sql
docker compose exec -T postgres psql -U postgres app < backup.sql
```

SQL asas:

```sql
\l
\c database
\dt
\d nama_table
\q
SELECT * FROM users;
SELECT * FROM users LIMIT 10;
CREATE DATABASE app;
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL
);
DROP TABLE users;
```

## 32. API dengan curl dan jq

```bash
curl https://api.example.com
curl -i https://api.example.com
curl -I https://api.example.com
curl -X GET https://api.example.com/users
curl -X POST https://api.example.com/users
curl -H "Accept: application/json" https://api.example.com/users
curl -H "Authorization: Bearer TOKEN" https://api.example.com/private
curl -H "Content-Type: application/json" \
  -d '{"name":"ZH","email":"zh@example.com"}' \
  https://api.example.com/users
curl -X PUT -H "Content-Type: application/json" \
  -d '{"name":"Baru"}' https://api.example.com/users/1
curl -X DELETE https://api.example.com/users/1
curl -o response.json https://api.example.com/users
curl -O https://example.com/fail.zip
curl --fail-with-body --retry 3 https://api.example.com
curl -L https://example.com
curl -v https://api.example.com
jq . response.json
jq '.users[0]' response.json
jq -r '.users[].email' response.json
curl https://api.example.com/users | jq '.'
```

## 33. Cloudflare CLI

```bash
npm install -g wrangler
wrangler --version
wrangler login
wrangler whoami
wrangler dev
wrangler deploy
wrangler pages dev
wrangler pages deploy dist
wrangler secret put API_TOKEN
wrangler secret list
wrangler tail
wrangler d1 list
wrangler d1 create nama_database
wrangler kv namespace create NAMA
```

## 34. Deployment CLI

Vercel:

```bash
npm install -g vercel
vercel login
vercel
vercel --prod
vercel dev
vercel env ls
vercel env add DATABASE_URL
vercel logs nama-project
```

Netlify:

```bash
npm install -g netlify-cli
netlify login
netlify init
netlify dev
netlify deploy
netlify deploy --prod
netlify env:list
netlify env:set NAMA_RAHASIA "nilai"
```

Pastikan build command, start command, root directory, environment variable dan port
deployment adalah betul.

## 35. DNS dan HTTPS

```bash
nslookup example.com
dig example.com
dig @1.1.1.1 example.com
dig +short example.com
ping example.com
openssl s_client -connect example.com:443 -servername example.com
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout localhost.key -out localhost.crt
```

| Jenis DNS | Gunakan |
| --- | --- |
| `A` | IPv4 domain |
| `AAAA` | IPv6 domain |
| `CNAME` | Alias domain |
| `TXT` | Verifikasi/SPF |
| `MX` | Server e-mel |
| `NS` | Nameserver |

## 36. Process, port dan service

```bash
ss -ltnp
ss -lunp
lsof -iTCP -sTCP:LISTEN
lsof -i :5173
lsof -i :3000
fuser -n tcp 3000
fuser -k -n tcp 3000
ps aux --sort=-%mem | head
ps aux --sort=-%cpu | head
watch -n 1 'ps aux | grep node'
npm run dev > app.log 2>&1 &
disown
nohup npm run dev > app.log 2>&1 &
```

PM2:

```bash
npm install -g pm2
pm2 start npm --name "zh-app" -- run start
pm2 list
pm2 logs
pm2 monit
pm2 restart zh-app
pm2 stop zh-app
pm2 delete zh-app
pm2 save
pm2 startup
```

## 37. Cron

```bash
crontab -l
crontab -e
crontab -r
systemctl --user list-timers
systemctl list-timers
```

Contoh:

```cron
0 2 * * * /usr/bin/bash /folder/backup.sh
*/15 * * * * /usr/bin/bash /folder/check.sh
```

Jangan letakkan secret terus dalam crontab.

## 38. MCP lanjutan

```bash
codex mcp add SERVER --url https://example.com/mcp
codex mcp add SERVER -- npx -y @modelcontextprotocol/server-everything
codex mcp list
codex mcp get SERVER
codex mcp login SERVER
codex mcp login SERVER --no-browser
codex mcp logout SERVER
codex mcp remove SERVER
codex --help
codex mcp --help
npx -y @modelcontextprotocol/inspector
curl -I https://example.com/mcp
env | grep -i MCP
env | grep -i API
```

Contoh `.vscode/mcp.json`:

```json
{
  "servers": {
    "example": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-everything"]
    }
  }
}
```

## 39. GitHub Codespaces CLI

```bash
gh codespace list
gh codespace create --repo owner/nama-repo --branch main
gh codespace ssh
gh codespace ssh -c NAMA_CODESPACE
gh codespace stop -c NAMA_CODESPACE
gh codespace delete -c NAMA_CODESPACE
gh codespace ports
gh codespace ports visibility 3000:public
gh codespace ports visibility 3000:private
```

Henti Codespace apabila tidak digunakan untuk menjimatkan penggunaan sumber.

## 40. Keselamatan terminal

```bash
openssl rand -hex 32
openssl rand -base64 32
gpg --version
gpg --full-generate-key
gpg --list-secret-keys --keyid-format=long
gpg --armor --export USER_ID
git secrets --scan
git grep -n -E "(AKIA|sk_live_|ghp_|github_pat_|BEGIN .*PRIVATE KEY)"
git log -p | grep -E "(AKIA|sk_live_|ghp_|github_pat_|BEGIN .*PRIVATE KEY)"
git check-ignore -v .env
git status --ignored
```

Jangan letakkan atau kongsi password database, API key, PAT GitHub, private key SSH/GPG/SSL,
cookies, `SESSION_SECRET`, token SMTP atau credential cloud dalam Git.

Jika rahsia telah di-push:

1. Revoke dan rotate rahsia segera.
2. Tukar semua environment secret yang menggunakan rahsia lama.
3. Keluarkan rahsia dari sejarah Git hanya selepas mendapat kebenaran pemilik repo.
4. Jalankan semula deployment dengan credential baharu.

## 41. Fail konfigurasi penting

| Fail | Fungsi |
| --- | --- |
| `.env` | Pembolehubah environment |
| `.env.example` | Contoh pembolehubah tanpa rahsia |
| `.gitignore` | Fail/folder yang tidak perlu di-commit |
| `~/.gitconfig` | Konfigurasi Git global |
| `~/.ssh/config` | Konfigurasi SSH |
| `~/.bashrc` | Konfigurasi Bash |
| `package.json` | Skrip dan dependency |
| `package-lock.json` | Lock npm |
| `pnpm-lock.yaml` | Lock pnpm |
| `yarn.lock` | Lock Yarn |
| `tsconfig.json` | Konfigurasi TypeScript |
| `next.config.mjs` | Konfigurasi Next.js |
| `vite.config.ts` | Konfigurasi Vite |
| `docker-compose.yml` | Servis Docker |
| `Dockerfile` | Bina imej Docker |
| `requirements.txt` | Dependency Python |
| `pyproject.toml` | Projek Python moden |
| `.nvmrc` | Versi Node |
| `.devcontainer/devcontainer.json` | Konfigurasi Codespaces |
| `.vscode/settings.json` | Tetapan VS Code |
| `.vscode/tasks.json` | Task VS Code |
| `.vscode/launch.json` | Konfigurasi debug |
| `.vscode/mcp.json` | Konfigurasi MCP |
| `.github/workflows/*.yml` | GitHub Actions |

## 42. VS Code task dan debug

Contoh `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "pnpm dev",
      "type": "shell",
      "command": "pnpm dev",
      "isBackground": true
    },
    {
      "label": "npm test",
      "type": "shell",
      "command": "npm test"
    }
  ]
}
```

Contoh Node debug:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Node: run server",
      "program": "${workspaceFolder}/server.js"
    }
  ]
}
```

Contoh Python debug:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Python: current file",
      "type": "debugpy",
      "request": "launch",
      "program": "${file}",
      "console": "integratedTerminal"
    }
  ]
}
```

Arahan Command Palette:

- `Developer: Reload Window`
- `Terminal: Create New Terminal`
- `Terminal: Split Terminal`
- `Preferences: Open Settings (UI)`
- `Preferences: Open Workspace Settings`
- `Extensions: Install Extensions`
- `Git: Clone`
- `Git: Pull`
- `Git: Push`
- `Git: Commit`
- `Git: Create Branch`
- `Debug: Start Debugging`
- `Tasks: Run Task`
- `Remote-SSH: Connect to Host`
- `Codespaces: Create New Codespace`
- `Python: Select Interpreter`
- `Python: Create Environment`

## 43. Commit dan checklist sebelum push

Jenis commit lazim:

```text
feat: tambah laman daftar masuk
fix: betulkan ralat port terminal
docs: kemas kini panduan Codespaces
style: rapikan format kod
refactor: pisahkan fungsi authentication
test: tambah ujian terminal
chore: kemas kini dependency
build: ubah konfigurasi Docker
ci: tambah workflow ujian
perf: kurangkan masa render
revert: batalkan perubahan lama
```

```bash
git commit -m "feat: tambah laman daftar masuk"
git commit -m "fix: betulkan port" -m "Port dibaca daripada environment variable"
git diff --cached
git commit --amend
git commit --amend --no-edit
git commit --allow-empty -m "Uji pipeline"
git status
git branch --show-current
git remote -v
git diff
git diff --stat
npm test
npm run build
git add .
git diff --cached
git pull --rebase origin main
git push -u origin nama-cabang
```

Jangan gunakan `git commit --amend` selepas push branch kongsi kecuali pemilik membenarkan rewrite.

## 44. .gitignore contoh

```text
.env
.env.*
!.env.example
.venv/
venv/
node_modules/
.next/
dist/
build/
coverage/
*.log
*.pem
*.key
.DS_Store
Thumbs.db
*.tmp
*.cache
__pycache__/
.pytest_cache/
```

## 45. Arahan pantas untuk repo ini

```bash
cd /workspaces/zh-code-editor-
git status
cp .env.example .env
pnpm install
docker compose up -d postgres
docker build -f packages/backend/Dockerfile.workspace -t zhcode/workspace:latest .
pnpm db:migrate
pnpm dev
```

Jika PostgreSQL sudah aktif:

```bash
docker compose ps postgres
docker compose logs -f postgres
docker compose restart postgres
```

Jika perlu bina semula workspace image:

```bash
docker compose down
docker build --no-cache -f packages/backend/Dockerfile.workspace -t zhcode/workspace:latest .
docker compose up -d
```

Untuk Firecrawl/Codex:

```bash
codex --version
codex mcp list
codex mcp add firecrawl --url https://mcp.firecrawl.dev/v2/mcp-oauth
codex mcp login firecrawl --no-browser
codex mcp list
```

## 46. Gemini CLI

Pastikan Node.js versi 20 atau lebih baharu tersedia:

```bash
node --version
npm --version
```

Pasang Gemini CLI secara global dan jalankannya:

```bash
npm install -g @google/gemini-cli
gemini --version
gemini
```

Semasa penggunaan pertama, ikut arahan untuk log masuk dengan akaun Google. Untuk mengemas
kini atau membuang Gemini CLI:

```bash
npm update -g @google/gemini-cli
npm uninstall -g @google/gemini-cli
```

Rujuk arahan rasmi di https://github.com/google-gemini/gemini-cli. Jangan simpan API key dalam
fail yang akan di-commit.
