# Status editor dan terminal

## Stack dan editor

| Keperluan | Status |
|---|---|
| Vue 3, TypeScript, Vite, Pinia, Vue Router | Digunakan oleh aplikasi. React, Vuex, CodeMirror 6, Ace dan pustaka tree ialah pilihan alternatif. |
| Monaco | Highlight, autocomplete mengikut bahasa yang disokong Monaco, multi-cursor, minimap, Find & Replace. Fail Vue menggunakan mod HTML dengan blok skrip dan gaya. Tiada Vue language server. |
| Bahasa | HTML, CSS/SCSS, JS/JSX, TS/TSX, JSON, Markdown, PHP, SQL, Python, Vue, skrip shell, PowerShell, Batch dan ZH Script. Fail `.zh` mempunyai highlight tersendiri. Interpreter ZH Script belum tersedia. |
| Explorer | Folder bersarang dengan expand/collapse, SVG, buka fail, buat/rename/padam fail atau folder, muat semula. |
| Tab editor | Berbilang fail, perubahan belum simpan, Ctrl/Cmd+S, auto-simpan pilihan, editor sebelah-menyebelah, breadcrumb, pemulihan tab dan draf dalam pelayar. |
| Ikon fail | SVG tersuai untuk folder kuning, Vue, TS/TSX, PHP, SQL, Python, Markdown, JSON, JS/JSX, HTML, Git, env dan CSS/SCSS. |
| Sistem fail sebenar | API Express membaca direktori workspace. Kontena terminal melekapkan direktori yang sama pada `/workspace`. |
| IndexedDB, File System Access API, WebContainer, Electron, Tauri | Belum diintegrasi. |
| Toolchain | Vite, TypeScript, tsx, npm, npx, pnpm dan Yarn. ESLint, Prettier dan concurrently belum dikonfigurasi. |
| uuid, lodash-es/radash, Fuse.js, JSZip, localforage, hotkeys-js | Belum diintegrasi. ID workspace dijana oleh PostgreSQL. |
| Ciri lanjutan editor | Carian nama dan kandungan fail melalui Ctrl+P atau Ctrl+Shift+F. Panel Git memaparkan status dan diff, menyokong stage atau unstage per fail serta commit berperingkat atau semua perubahan. Tema terang dan gelap, import ZIP untuk workspace kosong dan eksport ZIP tersedia. Drag-and-drop dan UI push belum tersedia. |

## Profil shell, aplikasi terminal dan sistem operasi

- Runtime sebenar yang disediakan ialah Debian 12 dalam Docker. Workspace membuka satu panel terminal bersepadu dengan sesi Bash. Profil terminal baharu boleh memilih Bash, Sh, Zsh, Fish atau PowerShell 7 melalui Settings.
- CMD dan WSL memerlukan runner Windows. Nushell dan shell tersuai belum disediakan.
- Windows Terminal, GNOME Terminal dan VS Code Terminal ialah aplikasi terminal berasingan. Terminal projek ini berjalan dalam pelayar menggunakan xterm.js. Integrasi pelancar aplikasi asli belum tersedia.
- Runtime OS tambahan belum disediakan untuk Windows, macOS, Ubuntu, Linux Mint, RHEL, CentOS, Rocky Linux, openSUSE, Kali Linux dan Alpine Linux.
- Profil UNIX dan mudah alih belum disediakan untuk FreeBSD, HP-UX, Solaris, NetBSD, OpenBSD, AIX, Android dan iOS.
- Imej pelayan/cloud tambahan belum disediakan untuk Ubuntu Server, Debian Server khusus, Rocky Linux, AlmaLinux, RHEL dan SUSE Linux Enterprise.
- Imej khusus keselamatan atau IoT belum disediakan untuk Kali Linux, Parrot OS, BlackArch, BlackBox, Raspberry Pi OS, DietPi dan Ubuntu Core.

## Terminal Features Master List

| # | Kategori | Status dan baki |
|---|---|---|
| 1 | Window management | Aplikasi pelayar. Minimize, maximize, restore, move, fullscreen, always-on-top dan kawalan tetingkap native belum diintegrasi. |
| 2 | Terminal display | Input, output, prompt shell, kursor berkelip dan scrollback. Paparan title bar, status sesi dan notification bar penuh belum tersedia. |
| 3 | Tab management | Satu panel bersepadu dengan tambah, pilih dan tutup sesi Bash. Menyembunyikan panel mengekalkan sesi. |
| 4 | Split panes | Pemisahan terminal ke dua sesi sebelah-menyebelah. Editor turut menyokong dua panel bersama Explorer. |
| 5 | Command input | Pelaksanaan interaktif melalui PTY. Input berbilang baris, completion dan sejarah bergantung pada shell. Parameter hints, validation dan prediction peringkat aplikasi belum tersedia. |
| 6 | Command history | Sejarah interaktif bergantung pada profil shell. Import, export, clear, filter dan pengurusan sejarah melalui UI belum tersedia. |
| 7 | Search | xterm SearchAddon dengan sebelumnya/seterusnya, padanan huruf besar-kecil dan regex. Sejarah carian dan hiasan highlight semua padanan belum tersedia. |
| 8 | Clipboard | Pemilihan teks dan fungsi clipboard pelayar/OS. Cut, salinan HTML dan pengurus beberapa catatan clipboard belum tersedia. |
| 9 | File operations | CRUD fail dan folder di editor. Menu Explorer menyediakan muat naik, pratonton imej, potong, salin dan tampal fail dan buka terminal dalam direktori pilihan. Import dan eksport ZIP tersedia melalui Settings. Drag-and-drop belum tersedia. |
| 10 | Appearance | Tema terang dan gelap tersedia. Konfigurasi warna tersuai, imej latar, opacity dan blur belum tersedia. |
| 11 | Font settings | Saiz fon terminal lalai. Tetapan pengguna untuk family, size, weight, line height, spacing dan ligatures belum tersedia. |
| 12 | Shell support | Bash, Sh, Zsh, Fish dan PowerShell 7. CMD, WSL, Nushell dan shell tersuai belum tersedia. |
| 13 | Session management | Sesi boleh disambung selepas refresh atau terputus selagi backend yang sama masih hidup dan tamat masa belum dicapai. Workspace menerima sehingga enam sesi. |
| 14 | SSH | Klien `ssh` tersedia dalam imej. UI pengurusan profil, kunci, tunnel dan multiplexing belum tersedia. |
| 15 | Network | Klien `sftp` dan `scp` disertakan bersama OpenSSH. Telnet, FTP, pengurus port forwarding dan konfigurasi proxy melalui UI belum tersedia. |
| 16 | Development tools | Node.js, Git dan Python dalam imej. Docker, kubectl, Java, Go dan Rust belum disediakan dalam imej lalai. |
| 17 | Profiles | Workspace menggunakan Bash. CRUD, import/export dan templat profil pengguna belum tersedia. |
| 18 | Settings | Bash bermula dalam direktori workspace. Tetapan startup shell, direktori, env, tetikus, shortcut dan prestasi belum tersedia. |
| 19 | Keyboard shortcuts | Ctrl+backtick menyembunyikan atau memaparkan terminal. Ctrl+Shift+backtick membuka sesi baharu. Ctrl+P dan Ctrl+Shift+F membuka carian projek, Ctrl+B menukar paparan sidebar. Input kawalan seperti Ctrl+C dan Ctrl+L dihantar kepada shell. Pemetaan tersuai, pintasan tab aplikasi, carian dan clipboard belum diintegrasi. |
| 20 | Mouse support | Pemilihan, klik dan skrol disediakan oleh xterm/pelayar. Menu klik kanan tersuai belum tersedia. |
| 21 | Command palette | Ctrl+Shift+P membuka carian tindakan workspace. |
| 22 | Logging | Belum ada log arahan/sesi boleh import atau eksport. |
| 23 | Notifications | Ralat operasi fail dan mesej sesi terputus. Notifikasi build, SSH, muat turun dan tugasan belum tersedia. |
| 24 | AI | Explain, generate, fix, rewrite, suggestions dan chat belum tersedia. |
| 25 | Security | Terminal menyemak origin, sesi, ID workspace dan pemilik sebelum melancarkan shell. Imej berjalan sebagai pengguna bukan root. Vault, stor kunci, sekatan arahan halus dan RBAC belum tersedia. |
| 26 | Plugins | Marketplace, install/remove/update dan API plugin belum tersedia. |
| 27 | Performance | Resize xterm dan scrollback terhad. WebGL dan pemantauan CPU/memori belum diintegrasi. |
| 28 | Recording | Rakam, replay, export dan kawalan playback belum tersedia. |
| 29 | Automation | Skrip boleh dijalankan melalui shell. Macro, jadual, startup command dan event trigger dalam aplikasi belum tersedia. |
| 30 | Advanced | Workspace berasingan dan API backend. Multi-window, remote provider, cloud sync, broadcast dan perkongsian/kolaborasi sesi belum tersedia. |
| 31 | Essential commands | Imej menyediakan utiliti Linux `ls`, `pwd`, `cd`, `mkdir`, `rmdir`, `rm`, `cp`, `mv`, `cat`, `echo`, `touch`, `clear`, `find`, `grep`, `chmod`, `chown`, `ps`, `top`, `kill`, `ping`, `ssh`, `scp`, `curl`, `wget`, `git`, `node`, `npm`, `python`. Akses root tidak diberikan. Docker dan kubectl belum disertakan. |

## Arahan pembangunan

- npm/npx/Yarn/pnpm ialah program sebenar dalam kontena. `install`, `add`, `remove`, `update`, `list` dan `init` tertakluk pada CLI masing-masing. Operasi yang memuat turun pakej memerlukan akses registry.
- Skrip `dev`, `build`, `preview` dan `start` bergantung pada `package.json` workspace. Templat Vue + Vite menyediakan keempat-empat skrip.
- Scaffold React/Vite, Create React App dan Next.js menggunakan CLI upstream. Projek tidak menyediakan salinan scaffold berkenaan. Versi Node, prompt dan status pakej bergantung pada versi CLI yang dijalankan.
- `git init`, `status`, `add`, `commit`, `remote add`, `push`, `pull` dan `clone` dijalankan oleh Git. Operasi remote memerlukan URL, sambungan rangkaian dan kelayakan yang sesuai.
