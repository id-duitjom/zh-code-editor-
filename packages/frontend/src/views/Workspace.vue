<!-- packages/frontend/src/views/Workspace.vue -->
<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { api } from '../api/client';
import MonacoEditor from '../components/editor/MonacoEditor.vue';
import FileIcon from '../components/editor/FileIcon.vue';
import TerminalMock from '../components/terminal/MockTerminal.vue';
import TerminalAsli from '../components/terminal/Terminal.vue';

const route = useRoute();
const workspaceId = computed(() => String(route.params.id));
const gunaMock = ref(true);

const files = ref<Array<{ name: string; path: string; type: 'file' | 'directory' }>>([]);
const activePath = ref<string | null>(null);
const content = ref('');
const originalContent = ref('');
const language = ref('plaintext');
const saving = ref(false);
const saveError = ref('');

// State untuk cipta fail/folder baharu
const isCreating = ref(false);
const createType = ref<'file' | 'directory'>('file');
const newName = ref('');
const currentDir = ref(''); // Simpan path folder semasa

const isDirty = computed(() => content.value !== originalContent.value);

function detectLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  const map: Record<string, string> = {
    js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript',
    vue: 'html', html: 'html', css: 'css', scss: 'scss', json: 'json',
    md: 'markdown', py: 'python', yml: 'yaml', yaml: 'yaml', toml: 'ini',
    sh: 'shell', bash: 'shell', sql: 'sql', xml: 'xml'
  };
  return map[ext] ?? 'plaintext';
}

async function loadFiles(rel = '') {
  currentDir.value = rel;
  try {
    const { data } = await api.get(`/workspaces/${workspaceId.value}/files`, { params: { path: rel } });
    files.value = data.items;
  } catch (error) { console.error(error); }
}

async function openFile(filePath: string) {
  if (isDirty.value && !confirm('Ada perubahan belum disimpan. Teruskan?')) return;
  try {
    const { data } = await api.get(`/workspaces/${workspaceId.value}/file`, { params: { path: filePath } });
    content.value = data.content;
    originalContent.value = data.content;
    activePath.value = filePath;
    language.value = detectLanguage(filePath);
  } catch (e: any) { saveError.value = e.response?.data?.error ?? 'Gagal membuka fail'; }
}

async function saveFile() {
  if (!activePath.value) return;
  saving.value = true;
  try {
    await api.put(`/workspaces/${workspaceId.value}/file`, { path: activePath.value, content: content.value });
    originalContent.value = content.value;
  } catch (e: any) { saveError.value = 'Gagal menyimpan'; } 
  finally { saving.value = false; }
}

// Fungsi cipta fail/folder baharu (Sokong folder bersarang)
async function submitCreate() {
  if (!newName.value.trim()) return;
  const fullPath = currentDir.value ? `${currentDir.value}/${newName.value}` : newName.value;
  
  try {
    await api.post(`/workspaces/${workspaceId.value}/file`, {
      path: fullPath,
      type: createType.value
    });
    isCreating.value = false;
    newName.value = '';
    await loadFiles(currentDir.value);
  } catch (e: any) {
    alert(e.response?.data?.error ?? 'Gagal mencipta');
  }
}

onMounted(() => loadFiles());
</script>

<template>
  <div class="vs-layout">
    <div class="activity-bar">
      <div class="icon active">📁</div>
      <div class="icon">🔍</div>
      <div class="icon">🌿</div>
    </div>

    <aside class="sidebar">
      <div class="sidebar-header">
        <span>EXPLORER</span>
        <div class="actions">
          <button @click="isCreating = true; createType = 'file'" title="New File">📄+</button>
          <button @click="isCreating = true; createType = 'directory'" title="New Folder">📁+</button>
          <button @click="loadFiles(currentDir)" title="Refresh">🔄</button>
        </div>
      </div>

      <!-- Input Cipta Fail/Folder Baharu -->
      <div v-if="isCreating" class="create-input-box">
        <input 
          v-model="newName" 
          @keyup.enter="submitCreate" 
          @keyup.esc="isCreating = false"
          placeholder="cth: src/components/app.ts"
          autofocus
        />
      </div>

      <!-- Breadcrumb (jika dalam folder) -->
      <div v-if="currentDir" class="breadcrumb">
        <button @click="loadFiles('')">workspace</button> / {{ currentDir }}
      </div>

      <ul class="file-tree">
        <!-- Butang naik ke atas jika dalam folder -->
        <li v-if="currentDir" @click="loadFiles(currentDir.split('/').slice(0, -1).join('/'))" class="dir">
          <FileIcon filename=".." :is-folder="true" /> ..
        </li>

        <!-- Senarai Fail/Folder -->
        <li v-for="f in files" :key="f.path"
            :class="{ active: f.path === activePath, dir: f.type === 'directory' }"
            @click="f.type === 'file' ? openFile(f.path) : loadFiles(f.path)">
          <FileIcon :filename="f.name" :is-folder="f.type === 'directory'" />
          {{ f.name }}
        </li>
      </ul>
    </aside>

    <main class="main-area">
      <div class="editor-section">
        <div v-if="!activePath" class="empty">Pilih fail untuk mula menulis kod</div>
        <template v-else>
          <div class="editor-tabs">
            <div class="tab active">
              <FileIcon :filename="activePath.split('/').pop() || ''" :is-folder="false" />
              {{ activePath.split('/').pop() }} 
              <span v-if="isDirty" class="dirty-dot">●</span>
            </div>
            <div class="tab-actions">
              <button @click="saveFile" :disabled="saving || !isDirty">💾 Save</button>
            </div>
          </div>
          <div class="editor-host">
            <MonacoEditor v-model="content" :language="language" :path="activePath" />
          </div>
        </template>
      </div>

      <div class="bottom-panel">
        <div class="term-toolbar-main">
          <button class="toggle-btn" @click="gunaMock = !gunaMock">
            Tukar ke {{ gunaMock ? 'Terminal Sebenar' : 'Terminal Simulasi' }}
          </button>
        </div>
        <TerminalMock v-if="gunaMock" :workspace-id="workspaceId" />
        <TerminalAsli v-else :workspace-id="workspaceId" />
      </div>
    </main>
  </div>
</template>

<style scoped>
.vs-layout { display: flex; height: 100vh; background: #1e1e1e; color: #cccccc; font-family: sans-serif; }
.activity-bar { width: 48px; background: #333; display: flex; flex-direction: column; align-items: center; padding: 8px 0; }
.activity-bar .icon { width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; font-size: 20px; opacity: 0.6; cursor: pointer; }
.activity-bar .icon.active { opacity: 1; border-left: 2px solid #007acc; }

.sidebar { width: 250px; background: #252526; border-right: 1px solid #333; display: flex; flex-direction: column; }
.sidebar-header { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; font-size: 11px; color: #bbb; }
.sidebar-header .actions button { background: none; border: none; color: #ccc; cursor: pointer; font-size: 14px; margin-left: 4px; }
.sidebar-header .actions button:hover { color: #fff; }

.create-input-box { padding: 4px 12px; }
.create-input-box input { width: 100%; background: #3c3c3c; border: 1px solid #007acc; color: #fff; padding: 2px 6px; outline: none; font-size: 13px; }
.breadcrumb { padding: 4px 12px; font-size: 11px; color: #888; border-bottom: 1px solid #333; }
.breadcrumb button { background: none; border: none; color: #3794ff; cursor: pointer; padding: 0; }

.file-tree { list-style: none; padding: 0; margin: 0; overflow-y: auto; flex: 1; }
.file-tree li { padding: 4px 12px; font-size: 13px; cursor: pointer; display: flex; align-items: center; }
.file-tree li:hover { background: #2a2d2e; }
.file-tree li.active { background: #094771; color: #fff; }
.file-tree li.dir { font-weight: 500; }

.main-area { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.editor-section { flex: 1; display: flex; flex-direction: column; min-height: 0; }
.editor-tabs { display: flex; justify-content: space-between; background: #2d2d2d; padding-right: 12px; }
.tab { padding: 8px 16px; font-size: 13px; background: #1e1e1e; border-top: 1px solid #007acc; border-right: 1px solid #252526; display: flex; align-items: center; }
.dirty-dot { margin-left: 6px; font-size: 16px; }
.tab-actions button { background: #007acc; color: white; border: none; padding: 4px 12px; border-radius: 4px; cursor: pointer; margin-top: 4px; }
.tab-actions button:disabled { opacity: 0.5; cursor: not-allowed; }

.editor-host { flex: 1; min-height: 0; }
.empty { padding: 24px; color: #888; text-align: center; margin-top: 40px; }

.bottom-panel { height: 250px; min-height: 150px; border-top: 1px solid #333; display: flex; flex-direction: column; resize: vertical; overflow: hidden; }
.term-toolbar-main { padding: 6px 12px; background: #252526; border-bottom: 1px solid #333; }
.toggle-btn { background: #007acc; color: white; border: none; padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; }
</style>