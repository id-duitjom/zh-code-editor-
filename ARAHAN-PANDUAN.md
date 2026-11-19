# Panduan memasang CLI, MCP dan API

Panduan ini menunjukkan pilihan alat tambahan dan cara menyambungkan host AI kepada MCP server
atau API. Tidak perlu memasang semua alat; pilih yang diperlukan sahaja.

## 1. Bezakan host, MCP server dan API

- **Host** ialah aplikasi AI yang anda gunakan, contohnya VS Code Copilot, Codex CLI atau Gemini
  CLI.
- **MCP server** menyediakan tools atau resources yang boleh digunakan oleh host. Ia boleh
  berjalan secara lokal (`stdio`) atau pada server jauh (`HTTP`).
- **API** ialah antara muka aplikasi yang dipanggil terus oleh program atau arahan HTTP. MCP
  server juga boleh menjadi jambatan kepada API.

Konfigurasi MCP untuk satu host biasanya tidak boleh terus disalin ke host lain. Semak dokumentasi
rasmi host dan MCP server sebelum menyambungkannya.

## 2. CLI yang boleh dipasang

Semak dahulu Node.js dan npm:

```bash
node --version
npm --version
```

Contoh CLI pilihan:

```bash
# Gemini CLI
npm install -g @google/gemini-cli
gemini

# OpenAI Codex CLI
npm install -g @openai/codex
codex
```

Untuk sambungan GitHub, GitHub CLI juga berguna. Pasang `gh` menggunakan arahan rasmi untuk
sistem operasi anda, kemudian sahkan pemasangan dan log masuk:

```bash
gh --version
gh auth login
```

Jangan pasang CLI global sebagai dependency aplikasi melainkan aplikasi itu sendiri
memerlukannya.

## 3. Sambung MCP server kepada VS Code

Untuk konfigurasi workspace, cipta `.vscode/mcp.json`. Contoh ini menggunakan MCP server lokal
untuk ujian sahaja:

```json
{
  "servers": {
    "contoh": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-everything"]
    }
  }
}
```

Untuk MCP server HTTP, gunakan format yang didokumenkan oleh server dan host. Contoh umum:

```json
{
  "servers": {
    "server-jauh": {
      "type": "http",
      "url": "https://mcp.example.com/mcp"
    }
  }
}
```

Gantikan URL contoh dengan URL rasmi. Jika server memerlukan OAuth atau API key, gunakan kaedah
authentication yang disokong host; jangan tampal token ke dalam fail konfigurasi yang akan
di-commit.

## 4. Sambung MCP server kepada Codex CLI

Untuk MCP HTTP:

```bash
codex mcp add nama-server --url https://mcp.example.com/mcp
codex mcp list
codex mcp get nama-server
```

Untuk MCP lokal menggunakan `stdio`:

```bash
codex mcp add contoh -- npx -y @modelcontextprotocol/server-everything
codex mcp list
```

Jika server memerlukan log masuk OAuth:

```bash
codex mcp login nama-server
```

Buang konfigurasi yang tidak lagi diperlukan:

```bash
codex mcp remove nama-server
```

## 5. Sambung MCP server kepada Gemini CLI

Gemini CLI menggunakan fail tetapan `~/.gemini/settings.json`. Contoh server `stdio` untuk
ujian:

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

Simpan konfigurasi, jalankan semula Gemini CLI dan semak senarai tools yang tersedia. Untuk
server HTTP, OAuth, headers atau API key, ikut format dalam dokumentasi Gemini CLI dan server
tersebut; jangan andaikan format konfigurasi host adalah sama.

## 6. Panggil API secara terus

`curl` sesuai untuk menguji API REST. Gantikan URL dan endpoint dengan nilai daripada dokumentasi
API:

```bash
curl --fail-with-body --silent --show-error \
  -H "Accept: application/json" \
  "https://api.example.com/v1/items"
```

Untuk endpoint yang memerlukan bearer token, masukkan token secara tersembunyi untuk sesi terminal
semasa sahaja:

```bash
read -rsp "API token: " API_TOKEN
printf '\n'
curl --fail-with-body --silent --show-error \
  -H "Authorization: Bearer ${API_TOKEN}" \
  -H "Accept: application/json" \
  "https://api.example.com/v1/items"
unset API_TOKEN
```

Jika API menerima JSON, tambah header `Content-Type` dan body yang betul mengikut dokumentasinya:

```bash
curl --fail-with-body --silent --show-error \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"name":"contoh"}' \
  "https://api.example.com/v1/items"
```

Jangan masukkan token sebenar dalam arahan yang disimpan, kod sumber, `.vscode/mcp.json`, atau
repo. Untuk penggunaan aplikasi atau CI, simpan rahsia dalam secret manager atau environment
variable yang dilindungi dan pastikan fail rahsia dikecualikan oleh `.gitignore`.

## 7. Semakan dan keselamatan

- Pasang MCP server daripada sumber yang dipercayai dan semak tools/permissions yang dimintanya.
- Beri akses minimum yang diperlukan; jangan sambungkan akaun atau data sensitif tanpa sebab.
- Selepas mengubah konfigurasi, mulakan semula host jika perubahan tidak dikesan.
- Untuk diagnosis MCP, semak log host dan arahan rasmi server; jangan kongsi log yang mengandungi
  token atau data sulit.
- Semak versi, pilihan konfigurasi dan kaedah authentication dalam dokumentasi rasmi kerana ia
  berbeza mengikut host dan boleh berubah.

Rujukan:

- Gemini CLI: https://github.com/google-gemini/gemini-cli
- MCP: https://modelcontextprotocol.io/
- OpenAI Codex: https://github.com/openai/codex
