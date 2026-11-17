<!-- packages/frontend/src/views/Workspace.vue -->
<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { api } from '../api/client';
import MonacoEditor from '../components/editor/MonacoEditor.vue';
import Terminal from '../components/terminal/Terminal.vue';

const route = useRoute();
const workspaceId = computed(() => String(route.params.id));

const files = ref<Array<{ name: string; path: string; type: 'file' | 'directory' }>>([]);
const activePath = ref<string | null>(null);
const content = ref('');
const originalContent = ref('');
const language = ref('plaintext');
const saving = ref(false);
const saveError = ref('');
const loading = ref(false);

const isDirty = computed(() => content.value !== originalContent.value);

/** Peta sambungan fail → language ID Monaco */
function detectLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  const map: Record<string, string> = {
    js: 'javascript', jsx: 'javascript',
    ts: 'typescript', tsx: 'typescript',
    vue: 'html',            // Monaco tiada Vue built-in; guna html sebagai fallback
    html: 'html', htm: 'html',
    css: 'css', scss: 'scss', less: 'less',
    json: 'json', jsonc: 'json',
    md: 'markdown', markdown: 'markdown',
    py: 'python',
    yml: 'yaml', yaml: 'yaml',
    toml: 'ini',            // Monaco tiada TOML built-in; ini paling hampir
    sh: 'shell', bash: 'shell',
    sql: 'sql',
    xml: 'xml',
    txt: 'plaintext', env: 'plaintext', gitignore: 'plaintext',
  };
  return map[ext] ?? 'plaintext';
}

async function loadFiles(rel = '') {
  const { data } = await api.get(`/workspaces/${workspaceId.value}/files`, { params: { path: rel } });
  files.value = data.items;
}

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
  <div class="workspace">
    <aside class="explorer">
      <h3>Explorer</h3>
      <ul>
        <li v-for="f in files" :key="f.path"
            :class="{ active: f.path === activePath, dir: f.type === 'directory' }"
            @click="f.type === 'file' ? openFile(f.path) : loadFiles(f.path)">
          {{ f.type === 'directory' ? '📁' : '📄' }} {{ f.name }}
        </li>
      </ul>
    </aside>

    <main class="editor-area">
      <div v-if="!activePath" class="empty">Pilih fail dari Explorer</div>
      <template v-else>
        <div class="toolbar">
          <span>{{ activePath }} <em v-if="isDirty">●</em></span>
          <button @click="saveFile" :disabled="saving || !isDirty">
            {{ saving ? 'Menyimpan...' : 'Save (Ctrl+S)' }}
          </button>
        </div>
        <p v-if="saveError" class="err">{{ saveError }}</p>
        <div class="editor-host">
          <MonacoEditor v-model="content" :language="language" :path="activePath" />
        </div>
      </template>
    </main>

    <section class="bottom">
      <Terminal :workspace-id="workspaceId" />
    </section>
  </div>
</template>

<style scoped>
.workspace { display: grid; grid-template-columns: 240px 1fr; grid-template-rows: 1fr 200px; height: 100vh; }
.explorer { grid-row: 1 / 3; border-right: 1px solid #333; overflow: auto; padding: 8px; }
.explorer li { cursor: pointer; padding: 4px 6px; border-radius: 4px; font-size: 13px; }
.explorer li:hover { background: #2a2d2e; }
.explorer li.active { background: #094771; }
.editor-area { display: flex; flex-direction: column; overflow: hidden; }
.editor-host { flex: 1; min-height: 0; }
.toolbar { display: flex; justify-content: space-between; padding: 6px 12px; border-bottom: 1px solid #333; font-size: 13px; }
.empty { padding: 24px; opacity: 0.6; }
.bottom { border-top: 1px solid #333; overflow: hidden; }
.err { color: #f48771; padding: 4px 12px; font-size: 12px; }
</style>