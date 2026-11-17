<!-- packages/frontend/src/views/Workspace.vue -->
<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { api } from '../api/client';
import MonacoEditor from '../components/editor/MonacoEditor.vue';

// Import kedua-dua terminal
import TerminalMock from '../components/terminal/MockTerminal.vue';
import TerminalAsli from '../components/terminal/Terminal.vue';

const route = useRoute();
const workspaceId = computed(() => String(route.params.id));

// State untuk tukar terminal (true = Mock, false = Asli)
const gunaMock = ref(true);

// State untuk fail dan editor
const files = ref<Array<{ name: string; path: string; type: 'file' | 'directory' }>>([]);
const activePath = ref<string | null>(null);
const content = ref('');
const originalContent = ref('');
const language = ref('plaintext');
const saving = ref(false);
const saveError = ref('');
const loading = ref(false);

// Status perubahan
const isDirty = computed(() => content.value !== originalContent.value);

// Peta bahasa Monaco mengikut sambungan fail
function detectLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  const map: Record<string, string> = {
    js: 'javascript', jsx: 'javascript',
    ts: 'typescript', tsx: 'typescript',
    vue: 'html', html: 'html', htm: 'html',
    css: 'css', scss: 'scss', less: 'less',
    json: 'json', jsonc: 'json',
    md: 'markdown', markdown: 'markdown',
    py: 'python', yml: 'yaml', yaml: 'yaml',
    toml: 'ini', sh: 'shell', bash: 'shell',
    sql: 'sql', xml: 'xml',
    txt: 'plaintext', env: 'plaintext', gitignore: 'plaintext',
  };
  return map[ext] ?? 'plaintext';
}

// Muatkan senarai fail dari backend
async function loadFiles(rel = '') {
  try {
    const { data } = await api.get(`/workspaces/${workspaceId.value}/files`, { params: { path: rel } });
    files.value = data.items;
  } catch (error) {
    console.error("Gagal memuatkan fail:", error);
  }
}

// Buka fail dan baca kandungan
async function openFile(filePath: string) {
  if (isDirty.value && !confirm('Ada perubahan belum disimpan. Teruskan?')) return;
  
  loading.value = true;
  saveError.value = '';
  try {
    const { data } = await api.get(`/workspaces/${workspaceId.value}/file`, { params: { path: filePath } });
    content.value = data.content;
    originalContent.value = data.content;
    activePath.value = filePath;
    language.value = detectLanguage(filePath);
  } catch (e: any) {
    saveError.value = e.response?.data?.error ?? 'Gagal membuka fail';
  } finally {
    loading.value = false;
  }
}

// Simpan fail ke backend
async function saveFile() {
  if (!activePath.value) return;
  
  saving.value = true;
  saveError.value = '';
  try {
    await api.put(`/workspaces/${workspaceId.value}/file`, {
      path: activePath.value,
      content: content.value,
    });
    originalContent.value = content.value;
  } catch (e: any) {
    saveError.value = e.response?.data?.error ?? 'Gagal menyimpan';
  } finally {
    saving.value = false;
  }
}

onMounted(() => loadFiles());
</script>

<template>
  <div class="vs-layout">
    <!-- 1. Activity Bar (Bar Icon Kiri) -->
    <div class="activity-bar">
      <div class="icon active" title="Explorer">📁</div>
      <div class="icon" title="Search">🔍</div>
      <div class="icon" title="Source Control">🌿</div>
      <div class="icon" title="Run and Debug">🐞</div>
      <div class="icon" title="Extensions">🧩</div>
      <div class="spacer"></div>
      <div class="icon" title="Accounts">👤</div>
      <div class="icon" title="Settings">⚙️</div>
    </div>

    <!-- 2. Sidebar (Explorer Fail) -->
    <aside class="sidebar">
      <div class="sidebar-header">EXPLORER</div>
      <ul class="file-tree">
        <li v-for="f in files" :key="f.path"
            :class="{ active: f.path === activePath, dir: f.type === 'directory' }"
            @click="f.type === 'file' ? openFile(f.path) : loadFiles(f.path)">
          <span class="icon-file">{{ f.type === 'directory' ? '📁' : '📄' }}</span> {{ f.name }}
        </li>
      </ul>
    </aside>

    <!-- 3. Ruang Utama (Editor + Terminal Bawah) -->
    <main class="main-area">
      <!-- Editor Section -->
      <div class="editor-section">
        <div v-if="!activePath" class="empty">Pilih fail dari Explorer untuk mula menulis kod</div>
        
        <template v-else>
          <!-- Tab Editor -->
          <div class="editor-tabs">
            <div class="tab active">
              {{ activePath.split('/').pop() }} 
              <span v-if="isDirty" class="dirty-dot">●</span>
            </div>
            <div class="tab-actions">
              <button @click="saveFile" :disabled="saving || !isDirty">
                💾 {{ saving ? 'Menyimpan...' : 'Save' }}
              </button>
            </div>
          </div>

          <!-- Ralat Simpan -->
          <p v-if="saveError" class="err">{{ saveError }}</p>

          <!-- Monaco Editor -->
          <div class="editor-host">
            <MonacoEditor v-model="content" :language="language" :path="activePath" />
          </div>
        </template>
      </div>

      <!-- Panel Bawah (Tukar Terminal) -->
      <div class="bottom-panel">
        <!-- Butang untuk tukar terminal -->
        <div class="term-toolbar">
          <button class="toggle-btn" @click="gunaMock = !gunaMock">
            Tukar ke {{ gunaMock ? 'Terminal Sebenar' : 'Terminal Simulasi' }}
          </button>
        </div>

        <!-- Paparkan terminal berdasarkan pilihan -->
        <TerminalMock v-if="gunaMock" :workspace-id="workspaceId" />
        <TerminalAsli v-else :workspace-id="workspaceId" />
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Layout Utama */
.vs-layout {
  display: flex;
  height: 100vh;
  background: #1e1e1e;
  color: #cccccc;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  overflow: hidden;
}

/* Activity Bar */
.activity-bar {
  width: 48px;
  background: #333333;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 0;
  flex-shrink: 0;
}
.activity-bar .icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s;
}
.activity-bar .icon:hover, .activity-bar .icon.active {
  opacity: 1;
  border-left: 2px solid #007acc;
}
.spacer { flex: 1; }

/* Sidebar */
.sidebar {
  width: 240px;
  background: #252526;
  border-right: 1px solid #333;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}
.sidebar-header {
  padding: 10px 12px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #bbbbbb;
}
.file-tree {
  list-style: none;
  padding: 0;
  margin: 0;
  overflow-y: auto;
  flex: 1;
}
.file-tree li {
  padding: 4px 12px;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}
.file-tree li:hover { background: #2a2d2e; }
.file-tree li.active { background: #094771; color: #fff; }
.file-tree li.dir { font-weight: bold; }

/* Main Area */
.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* Editor Section */
.editor-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.editor-tabs {
  display: flex;
  background: #2d2d2d;
  align-items: center;
  justify-content: space-between;
  padding-right: 12px;
}
.tab {
  padding: 8px 16px;
  font-size: 13px;
  background: #1e1e1e;
  border-right: 1px solid #252526;
  border-top: 1px solid #007acc;
  display: flex;
  align-items: center;
  gap: 8px;
}
.dirty-dot { color: #cccccc; font-size: 18px; line-height: 12px; }
.tab-actions button {
  background: #007acc;
  color: white;
  border: none;
  padding: 4px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
}
.tab-actions button:disabled { opacity: 0.5; cursor: not-allowed; }
.tab-actions button:not(:disabled):hover { background: #0062a3; }

.editor-host { flex: 1; min-height: 0; }
.empty { padding: 24px; color: #888; font-size: 14px; text-align: center; margin-top: 40px; }

/* Terminal Panel */
.bottom-panel {
  height: 280px;
  min-height: 150px;
  resize: vertical;
  overflow: hidden;
  border-top: 1px solid #333;
  background: #1e1e1e;
  display: flex;
  flex-direction: column;
}
.term-toolbar {
  padding: 6px 12px;
  background: #252526;
  border-bottom: 1px solid #333;
}
.toggle-btn {
  background: #007acc;
  color: white;
  border: none;
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}
.toggle-btn:hover {
  background: #0062a3;
}
.err { color: #f48771; padding: 4px 12px; font-size: 12px; background: #3a1d1d; margin: 0; }
</style>