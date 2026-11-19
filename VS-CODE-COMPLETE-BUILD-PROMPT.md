# Prompt: Bina IDE Terminal Setara VS Code

Gunakan prompt ini sebagai arahan pembangunan untuk satu jurutera atau satu proses AI coding. Jangan hanya menyediakan cadangan atau prototaip. Bina ciri secara berperingkat, lengkap, boleh diuji, selamat, dan konsisten dengan reka bentuk aplikasi sedia ada. Jangan ubah atau padam fungsi lama yang masih diperlukan. Tambah dokumentasi ringkas dan ujian untuk setiap ciri baharu.

## Objektif

Bina aplikasi terminal dan editor kod seperti Visual Studio Code (VS Code) dengan:

- editor kod berasaskan Monaco atau setara
- terminal sebenar berasaskan PTY dan xterm.js
- sistem fail workspace sebenar
- explorer, tab, split editor, search, Git dan terminal
- language support, debugging, tasks, testing, extensions dan remote development
- UI desktop-style yang responsive dalam pelayar
- pengalaman pengguna setara VS Code sebanyak mungkin

Projek sasaran ialah aplikasi Vue 3, TypeScript, Vite, Pinia, Express, PostgreSQL, Docker, Monaco Editor dan xterm.js. Gunakan stack sedia ada melainkan sebab teknikal memerlukan perubahan.

## Arahan kerja

1. Audit kod sedia ada dahulu.
2. Jangan ubah API atau UI lama tanpa keperluan.
3. Gunakan helper, service, komponen dan pola yang telah wujud.
4. Bina satu milestone pada satu masa.
5. Jalankan ujian sempit sebelum meneruskan milestone seterusnya.
6. Jangan gunakan mock untuk terminal, filesystem atau Git apabila implementasi sebenar diperlukan.
7. Jangan hanya menambah butang; setiap butang mesti mempunyai tindakan sebenar.
8. Semua pintasan papan kekunci mesti berfungsi dan boleh didokumentasikan.
9. Pastikan penamatan terminal, reconnection, workspace isolation dan permission enforcement ditangani.
10. Tambah dokumentasi status untuk ciri siap, separa dan belum tersedia.
11. Jangan letakkan secret, credential atau token dalam source code.
12. Pastikan aplikasi selamat untuk workspace berbilang pengguna.

---

## 1. Editor utama

Bina atau sempurnakan:

- [ ] Tab berbilang fail
- [ ] Split editor menegak dan mendatar
- [ ] Drag-and-drop tab
- [ ] Breadcrumb
- [ ] Minimap
- [ ] Line numbers
- [ ] Indent guide dan whitespace guide
- [ ] Folding code
- [ ] Sticky scroll
- [ ] Word wrap
- [ ] Bracket pair colorization
- [ ] Diff editor
- [ ] Multi-cursor dan column selection
- [ ] Find dan replace dalam satu fail
- [ ] Search dan replace dalam workspace
- [ ] Go to line
- [ ] Go to symbol
- [ ] Go to definition
- [ ] Peek definition
- [ ] Find all references
- [ ] Go to implementation
- [ ] Outline/symbol tree
- [ ] Inlay hints
- [ ] Hover information
- [ ] Code action dan quick fix
- [ ] Rename symbol
- [ ] Format document dan format selection
- [ ] Auto-complete/IntelliSense
- [ ] Parameter hint
- [ ] Signature help
- [ ] Snippet
- [ ] Auto closing bracket, quote dan tag
- [ ] Auto indentation
- [ ] Auto save
- [ ] Save dan Save All
- [ ] Encoding dan line ending selector
- [ ] Language mode selector
- [ ] Read-only file support
- [ ] Revert dan conflict handling
- [ ] State restore selepas refresh
- [ ] Unsaved-change protection

---

## 2. Terminal sebenar

Bina terminal integrated dengan PTY backend sebenar:

- [ ] Xterm.js sebagai terminal renderer
- [ ] WebSocket sebagai saluran PTY
- [ ] Sokongan shell Bash
- [ ] Sokongan Sh, Zsh, Fish dan PowerShell 7 jika runtime menyokong
- [ ] Multiple terminal sessions
- [ ] Terminal tab
- [ ] Rename terminal
- [ ] New terminal
- [ ] Kill terminal
- [ ] Split terminal menegak/mendatar
- [ ] Change shell/profile
- [ ] Terminal search
- [ ] Scrollback
- [ ] Copy/paste
- [ ] Select all
- [ ] Clear terminal
- [ ] Scroll to top/bottom
- [ ] Shell history
- [ ] ANSI, 256 dan true-color
- [ ] Unicode dan ligature
- [ ] OSC hyperlinks
- [ ] Shell integration
- [ ] Current working directory detection
- [ ] Previous/next command navigation
- [ ] Exit-code indicator
- [ ] Terminal bell
- [ ] Reconnect selepas network disruption
- [ ] Restore terminal state yang selamat
- [ ] Maximum scrollback configuration
- [ ] Font family, size, weight dan line height
- [ ] Terminal themes
- [ ] Copy-on-select pilihan
- [ ] Right-click context menu
- [ ] Open terminal from current folder
- [ ] Run selected text
- [ ] Run active file
- [ ] Environment variable configuration
- [ ] Terminal profiles
- [ ] Port forwarding detection
- [ ] Process information
- [ ] Log export dan replay jika dilaksanakan

---

## 3. File Explorer

Bina:

- [ ] Workspace/folder tree
- [ ] Expand/collapse folder
- [ ] Open folder/workspace
- [ ] Multi-root workspace
- [ ] Create/rename/delete file
- [ ] Create/rename/delete folder
- [ ] Cut, copy, paste dan duplicate
- [ ] Drag-and-drop
- [ ] Open to side
- [ ] Reveal in Explorer
- [ ] Reveal in terminal
- [ ] Sort and filter
- [ ] File/folder icons
- [ ] SVG dan custom icon theme
- [ ] Search exclusion
- [ ] File watcher
- [ ] Refresh
- [ ] Confirm delete
- [ ] Trash/recycle-bin atau action yang selamat
- [ ] Upload/download
- [ ] File operation progress
- [ ] Conflict handling
- [ ] Large-folder protection
- [ ] Hidden-file option

---

## 4. Search

Bina:

- [ ] Search fail dalam Explorer
- [ ] Search text dalam workspace
- [ ] Replace dalam workspace
- [ ] Case-sensitive search
- [ ] Whole word
- [ ] Regular expression
- [ ] Include/exclude glob
- [ ] Search open editors
- [ ] Search result preview
- [ ] Replace preview
- [ ] Search history
- [ ] Symbol search
- [ ] Quick file search dengan `Ctrl+P`
- [ ] Command search dengan `Ctrl+Shift+P`
- [ ] Search cancellation
- [ ] Worker untuk search besar
- [ ] Match counts

---

## 5. Git dan Source Control

Bina:

- [ ] Git status
- [ ] Changed files
- [ ] Stage/unstage file
- [ ] Stage selected hunk
- [ ] Commit
- [ ] Amend commit
- [ ] Push/pull/fetch/sync
- [ ] Clone repository
- [ ] Checkout/create/delete branch
- [ ] Merge/rebase
- [ ] Revert dan cherry-pick
- [ ] Reset
- [ ] Stash, pop dan apply stash
- [ ] Remotes dan tags
- [ ] Diff view
- [ ] Inline diff
- [ ] Side-by-side diff
- [ ] Merge editor/conflict resolution
- [ ] Blame dan timeline
- [ ] Commit graph
- [ ] Incoming/outgoing changes
- [ ] Branch indicator
- [ ] Commit signing pilihan
- [ ] Credential/SSH handling
- [ ] GitHub authentication
- [ ] Pull request list/create/open
- [ ] Pull request review threads
- [ ] Status checks
- [ ] Submodules

---

## 6. Layout dan UI

Bina workbench dengan:

- [ ] Activity Bar
- [ ] Primary Side Bar
- [ ] Secondary Side Bar
- [ ] Bottom Panel
- [ ] Status Bar
- [ ] Title Bar
- [ ] Menu Bar
- [ ] Tab Bar
- [ ] Explorer view
- [ ] Search view
- [ ] Source Control view
- [ ] Debug view
- [ ] Testing view
- [ ] Extensions view
- [ ] Problems view
- [ ] Output view
- [ ] Debug Console
- [ ] Terminal panel
- [ ] Outline view
- [ ] Timeline view
- [ ] Notification center
- [ ] Resize panel
- [ ] Toggle/sidebar/panel visibility
- [ ] Move panel kiri/kanan/bawah
- [ ] Maximize panel/editor
- [ ] Float panel jika disokong
- [ ] Zen mode
- [ ] Distraction-free mode
- [ ] Centered editor layout
- [ ] Fullscreen
- [ ] Zoom in/out/reset
- [ ] Device responsive behavior

---

## 7. Theme dan appearance

- [ ] Dark theme
- [ ] Light theme
- [ ] High contrast theme
- [ ] Theme marketplace/plugin
- [ ] Custom theme JSON/CSS
- [ ] Icon theme
- [ ] Product icon theme
- [ ] Font family dan font size
- [ ] Font ligatures
- [ ] Line height dan letter spacing
- [ ] Cursor style/blink
- [ ] Color customization
- [ ] Reduced motion
- [ ] Screen reader support
- [ ] Keyboard accessibility
- [ ] Contrast/accessibility validation

---

## 8. Language support

Menyokong sekurang-kurangnya:

- [ ] JavaScript dan JSX
- [ ] TypeScript dan TSX
- [ ] HTML
- [ ] CSS dan SCSS
- [ ] JSON dan JSON Schema
- [ ] Markdown
- [ ] YAML
- [ ] Vue
- [ ] Python
- [ ] PHP
- [ ] SQL
- [ ] Bash dan shell
- [ ] PowerShell
- [ ] ZH Script dengan highlight tersendiri

Sediakan:

- [ ] Syntax highlighting
- [ ] Semantic highlighting
- [ ] Language Server Protocol client
- [ ] Document formatter
- [ ] Formatter registry
- [ ] Diagnostics
- [ ] Code lens
- [ ] Color provider
- [ ] Document link
- [ ] Folding provider
- [ ] Comment/indentation rules
- [ ] Embedded language support
- [ ] Markdown preview

---

## 9. Debugging

Bina:

- [ ] Debug Adapter Protocol client
- [ ] `launch.json`
- [ ] `attach.json`
- [ ] Run with debugging
- [ ] Run without debugging
- [ ] Continue/pause
- [ ] Stop/restart
- [ ] Step over/into/out
- [ ] Breakpoints
- [ ] Conditional breakpoints
- [ ] Hit-count breakpoints
- [ ] Logpoints
- [ ] Function breakpoints
- [ ] Exception breakpoints
- [ ] Variables
- [ ] Watch
- [ ] Call stack
- [ ] Breakpoints list
- [ ] Debug Console/REPL
- [ ] Inline values
- [ ] Debug toolbar
- [ ] Debug terminal
- [ ] Source maps
- [ ] Node debugging
- [ ] Python debugging
- [ ] Browser debugging jika dilaksanakan
- [ ] Test debugging

---

## 10. Testing

Bina:

- [ ] Test Explorer
- [ ] Test discovery
- [ ] Run test
- [ ] Debug test
- [ ] Test suites/cases
- [ ] Test tags
- [ ] Test profiles
- [ ] Test output
- [ ] Inline Run/Debug
- [ ] Refresh tests
- [ ] Cancel tests
- [ ] Retry failed tests
- [ ] Test coverage
- [ ] Failure decorations
- [ ] Jump to source
- [ ] Watch mode
- [ ] JUnit/XML parser atau adapter
- [ ] Test result history

---

## 11. Tasks

Bina:

- [ ] `tasks.json`
- [ ] Build/test/watch task
- [ ] Task picker
- [ ] Run task
- [ ] Background task
- [ ] Problem matcher
- [ ] Task dependencies
- [ ] Task groups
- [ ] Terminal task
- [ ] npm/pnpm/Yarn scripts
- [ ] TypeScript, Python dan language task detection
- [ ] Auto detect tasks
- [ ] Stop/terminate task
- [ ] Task reuse
- [ ] Multi-root task support

---

## 12. Extensions

Bina sistem extension yang selamat:

- [ ] Extension registry/service
- [ ] Marketplace search
- [ ] Install/update/disable/enable/uninstall
- [ ] Built-in extensions
- [ ] Workspace recommendations
- [ ] Extension manifest validation
- [ ] VSIX support jika praktikal
- [ ] Extension activation events
- [ ] Extension host
- [ ] Web extension support
- [ ] Remote extension support
- [ ] Theme extension
- [ ] Language extension
- [ ] Debug adapter extension
- [ ] Command contribution
- [ ] Menu contribution
- [ ] View contribution
- [ ] Keybinding contribution
- [ ] Webview API
- [ ] Custom editor API
- [ ] Notebook API jika dilaksanakan
- [ ] Extension logs
- [ ] Extension sandbox/permissions
- [ ] Resource limits
- [ ] Signature dan integrity validation

---

## 13. Settings dan profiles

Bina:

- [ ] Settings UI dengan search
- [ ] User settings
- [ ] Workspace settings
- [ ] Folder settings
- [ ] Remote settings
- [ ] Language-specific settings
- [ ] `.vscode/settings.json`
- [ ] `.vscode/tasks.json`
- [ ] `.vscode/launch.json`
- [ ] `.vscode/extensions.json`
- [ ] Profiles
- [ ] Settings sync
- [ ] Import/export settings
- [ ] Keybindings JSON
- [ ] Keyboard shortcut editor
- [ ] When-clause context
- [ ] Secret storage
- [ ] Machine/policy settings
- [ ] Workspace trust
- [ ] Restricted mode

---

## 14. Keybindings dan Command Palette

Bina command registry yang menyokong:

- [ ] Command palette
- [ ] Custom keybindings
- [ ] Default keybindings
- [ ] Key chords
- [ ] Context menus
- [ ] Menu contributions
- [ ] Command history
- [ ] Quick pick
- [ ] Input box
- [ ] Multi-step quick pick
- [ ] Progress notification
- [ ] Conflict resolution
- [ ] Platform-specific keybinding

Pintasan minimum:

- `Ctrl+P`: Quick Open
- `Ctrl+Shift+P`: Command Palette
- `Ctrl+N`: New file
- `Ctrl+O`: Open
- `Ctrl+S`: Save
- `Ctrl+Shift+S`: Save As
- `Ctrl+K S`: Save All
- `Ctrl+W`: Close tab
- `Ctrl+Shift+T`: Reopen closed tab
- `Ctrl+Tab`: Next tab
- `Ctrl+\`: Split editor
- `Ctrl+F`: Find
- `Ctrl+H`: Replace
- `Ctrl+Shift+F`: Search workspace
- `Ctrl+Shift+H`: Replace workspace
- `Ctrl+G`: Go to line
- `F12`: Go to definition
- `Shift+F12`: Find references
- `F2`: Rename symbol
- `Ctrl+.`: Quick fix
- `Shift+Alt+F`: Format
- `Ctrl+Space`: IntelliSense
- `Ctrl+/`: Toggle comment
- `Alt+Up/Down`: Move line
- `Alt+Shift+Up/Down`: Copy line
- `Ctrl+D`: Add next selection
- `Ctrl+Shift+L`: Select all occurrences
- `Ctrl+B`: Toggle Sidebar
- `Ctrl+J`: Toggle Panel
- `Ctrl+``: Toggle Terminal
- `Ctrl+Shift+``: New Terminal
- `F5`: Start debugging
- `F9`: Toggle breakpoint
- `F10`: Step over
- `F11`: Step into
- `Shift+F11`: Step out
- `Shift+F5`: Stop debugging
- `Ctrl+Shift+B`: Build
- `Ctrl+Shift+X`: Extensions
- `Ctrl+Shift+G`: Source Control
- `Ctrl+Shift+D`: Debug
- `Ctrl+,`: Settings

---

## 15. Remote development

Bina jika projek sasaran menyokong remote:

- [ ] SSH remote
- [ ] Dev Containers
- [ ] Docker environment
- [ ] Remote server
- [ ] Remote tunnels
- [ ] Remote terminal
- [ ] Remote file system
- [ ] Remote extension host
- [ ] Port forwarding
- [ ] Port visibility
- [ ] Open in browser
- [ ] Reconnect
- [ ] Remote authentication
- [ ] Known-host validation
- [ ] Workspace isolation
- [ ] WSL atau runner Windows jika platform menyokong

---

## 16. Notebooks dan rich editors

Jika menjadi skop penuh:

- [ ] Notebook editor
- [ ] Code cells
- [ ] Markdown cells
- [ ] Run cell/all
- [ ] Restart kernel
- [ ] Change kernel
- [ ] Notebook output
- [ ] Notebook diff
- [ ] Jupyter support
- [ ] Custom editors
- [ ] Custom webviews
- [ ] Image, PDF, binary, CSV preview
- [ ] Hex editor

---

## 17. AI assistant

Bina sekiranya pilihan AI diperlukan:

- [ ] Chat panel
- [ ] Explain code
- [ ] Generate code
- [ ] Fix code
- [ ] Refactor code
- [ ] Rewrite code
- [ ] Add tests
- [ ] Inline completion
- [ ] Inline chat
- [ ] Context selection
- [ ] Workspace context dengan permission
- [ ] Terminal command explanation
- [ ] Commit message generation
- [ ] Error fixing
- [ ] Model/provider configuration
- [ ] Token usage
- [ ] Cancel generation
- [ ] Privacy controls

---

## 18. Security

- [ ] Workspace isolation
- [ ] Authentication
- [ ] Authorization/RBAC
- [ ] Origin validation
- [ ] CSRF protection
- [ ] Secure WebSocket
- [ ] Credential dan secret storage
- [ ] No secrets in Git
- [ ] Terminal command safety
- [ ] Restricted mode
- [ ] Workspace trust
- [ ] Webview CSP
- [ ] Extension permission model
- [ ] Extension sandbox
- [ ] Path traversal protection
- [ ] Symlink protection
- [ ] File permission enforcement
- [ ] Container resource limits
- [ ] SSH host verification
- [ ] Certificate validation
- [ ] Audit logging
- [ ] Session expiration
- [ ] Token rotation
- [ ] Telemetry opt-out

---

## 19. Architecture

Gunakan pemisahan:

### Frontend

- [ ] Vue 3/TypeScript
- [ ] Monaco Editor
- [ ] xterm.js
- [ ] Pinia
- [ ] Vue Router
- [ ] WebSocket client
- [ ] Virtualized trees
- [ ] Web Worker untuk search
- [ ] IndexedDB untuk cache jika diperlukan
- [ ] PWA/offline jika diperlukan

### Backend

- [ ] Express API
- [ ] PostgreSQL
- [ ] Docker workspace service
- [ ] PTY process manager
- [ ] WebSocket terminal gateway
- [ ] File system service
- [ ] Git service
- [ ] Search service
- [ ] Task service
- [ ] LSP service
- [ ] DAP service
- [ ] Extension host
- [ ] Authentication service
- [ ] Session store
- [ ] Credential vault
- [ ] Remote provider service

### Protocol

- [ ] Language Server Protocol
- [ ] Debug Adapter Protocol
- [ ] Terminal PTY protocol
- [ ] WebSocket JSON-RPC
- [ ] File system provider API
- [ ] Text document provider API
- [ ] Tree data provider API
- [ ] Webview protocol
- [ ] Task API
- [ ] Test API
- [ ] Extension API

---

## 20. Performance dan reliability

- [ ] Virtualized file tree
- [ ] Debounced save/search
- [ ] Lazy-load extension dan language support
- [ ] Web Worker untuk search
- [ ] Terminal scrollback limit
- [ ] WebGL terminal renderer pilihan
- [ ] Editor restoration limit
- [ ] File size warnings
- [ ] Crash recovery
- [ ] Auto reconnect
- [ ] State restore
- [ ] Backend health check
- [ ] Metrics
- [ ] Memory/CPU monitoring
- [ ] Process cleanup
- [ ] Graceful shutdown
- [ ] Docker cleanup
- [ ] Timeout dan retry
- [ ] Request cancellation

---

## 21. Testing

Untuk setiap milestone, sertakan:

- [ ] Unit test
- [ ] Component test
- [ ] API integration test
- [ ] Terminal integration test
- [ ] PTY test
- [ ] File system test
- [ ] Git test
- [ ] Search test
- [ ] Keybinding test
- [ ] Layout test
- [ ] Security test
- [ ] Path traversal test
- [ ] Workspace isolation test
- [ ] Reconnection test
- [ ] LSP test
- [ ] DAP test
- [ ] Extension test
- [ ] Webview CSP test
- [ ] Accessibility test
- [ ] Cross-browser test
- [ ] Mobile/tablet layout test

---

## 22. Dokumentasi

Kemaskini:

- [ ] README
- [ ] Setup/environment guide
- [ ] Architecture overview
- [ ] Feature matrix
- [ ] Terminal documentation
- [ ] API documentation
- [ ] Extension API
- [ ] Keybindings reference
- [ ] Settings reference
- [ ] Security guide
- [ ] Debugging guide
- [ ] Testing guide
- [ ] Deployment guide
- [ ] Docker workspace guide
- [ ] Troubleshooting guide

---

## 23. Milestones pembangunan

### Milestone 1: MVP editor

- Tab fail
- File Explorer
- Save/open file
- Monaco syntax highlight
- Search
- Command Palette
- Settings asas
- Split editor
- Tema gelap/terang

### Milestone 2: Terminal produktif

- Multiple terminal
- Split terminal
- Search terminal
- Copy/paste
- Profiles
- Reconnect
- Terminal status
- Run selected text

### Milestone 3: Developer workflow

- Git penuh
- Git diff
- Tasks
- Debugging
- Testing
- LSP
- Markdown preview
- Problems panel
- Workspace settings

### Milestone 4: Extensibility

- Extension host
- Marketplace
- Theme/Language/Debug extensions
- Custom webview
- Custom editor
- Keybinding contribution
- Command/menu contribution

### Milestone 5: Setara enterprise

- Remote SSH/container
- Port forwarding
- Settings sync
- Profiles
- Workspace trust
- Enterprise policy
- Secret storage
- Audit logs
- Notebook
- AI assistant
- High availability/recovery

---

## 24. Kriteria penerimaan

Tugasan hanya dianggap siap apabila:

- Semua ciri milestone telah dilaksanakan dan bukan sekadar UI.
- Terminal boleh menjalankan shell sebenar dan arahan yang berkesan.
- File boleh dibaca, diubah, disimpan dan dipadam dalam workspace yang betul.
- Git boleh clone, status, commit, branch dan remote operation.
- Debugger boleh menjalankan sekurang-kurangnya satu runtime.
- Search boleh mencari dan mengganti kandungan sebenar.
- Semua command utama boleh dipanggil melalui UI dan keyboard.
- Terminal dan workspace dapat reconnect dengan selamat.
- Sesi pengguna tidak boleh mengakses workspace pengguna lain.
- Build frontend dan backend berjaya.
- Ujian kritikal berlalu.
- Documentation dikemas kini.
- STATUS setiap ciri dinyatakan jelas.

## 25. Format jawapan akhir

Selepas melaksanakan tugasan, berikan ringkasan dengan format:

1. Ciri yang telah siap.
2. Ciri yang separa siap.
3. Ciri yang belum boleh dilaksanakan beserta sebab.
4. Fail utama yang ditambah/diubah.
5. Arahan untuk ujian.
6. Hasil ujian.
7. Isu atau risiko keselamatan yang ditemui.
