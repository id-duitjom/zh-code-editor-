<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useFileSystem } from '../composables/useFileSystem';
import { api } from '../api/client';
import { useAuthStore } from '../stores/auth';
import WorkspaceIcon from '../components/layout/WorkspaceIcon.vue';
import FileTree from '../components/editor/FileTree.vue';
import MonacoEditor from '../components/editor/MonacoEditor.vue';
import Tabs from '../components/editor/Tabs.vue';
import Sidebar from '../components/layout/Sidebar.vue';
import SettingsMenuHost from '../components/settings/SettingsMenuHost.vue';
import WorkspaceContextMenu from '../components/layout/WorkspaceContextMenu.vue';
import { recoverTab } from '../stores/editorRecovery';
import StatusBar from '../components/layout/StatusBar.vue';
import Terminal from '../components/terminal/Terminal.vue';
import { detectLanguage } from '../composables/useMonaco';
import { useEditorStore, type EditorTab } from '../stores/editor';
import { useFileSystemStore, type FileNode } from '../stores/fileSystem';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const id = computed(() => String(route.params.id));
const fileSystem = useFileSystemStore();
const files = useFileSystem(() => id.value);
const editor = useEditorStore();
const documents = computed(() => editor.workspaces[id.value]);
const directories = computed(() => fileSystem.directories[id.value] ?? {});
const active = computed(() => documents.value?.tabs.find(tab => tab.path === documents.value.activePath));
const expanded = ref(new Set<string>());
const selected = ref<FileNode>();
const error = ref('');
const saving = ref(false);
const restoring = ref(false);
const autoSave = ref(false);
const splitPath = ref('');
const split = computed(() => documents.value?.tabs.find(tab => tab.path === splitPath.value));
const busy = ref(false);
const terminalVisible = ref(true);
const terminalMaximized = ref(false);
type TerminalSession = { id: string; cwd: string; shell?: string };
const terminalSessions = ref<TerminalSession[]>([]);
const activeTerminal = ref('');
const terminalSplit = ref<string>();
const terminalRefs = new Map<string, InstanceType<typeof Terminal>>();
const keyFor = (area: string, workspace = id.value) => `zh:${auth.user?.id}:${workspace}:${area}`;

function readLocal<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback; }
  catch { return fallback; }
}
function writeLocal(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch { error.value = 'Storan pelayar penuh atau tidak tersedia.'; }
}

const preferenceKey = (area: string) => keyFor(area, 'preferences');
const theme = ref(readLocal(preferenceKey('theme'), 'dark'));
const density = ref(readLocal(preferenceKey('density'), 'comfortable'));
const settingsView = ref('settings');
const imagePreview = ref('');
const snippets = ref(readLocal(preferenceKey('snippets'), ''));
const searchFolder = ref('');
const foldersForChat = ref<string[]>([]);
const shellProfile = ref(readLocal(preferenceKey('shell'), 'bash'));
watch(theme, value => writeLocal(preferenceKey('theme'), value));
watch(density, value => writeLocal(preferenceKey('density'), value));
watch(snippets, value => writeLocal(preferenceKey('snippets'), value));
watch(shellProfile, value => writeLocal(preferenceKey('shell'), value));

function settingsAction(action: string) {
  if (action === 'palette') { query.value = ''; searchFolder.value = ''; showSection('search'); return; }
  if (action === 'extensions') { showSection('extensions'); return; }
  if (action === 'dark' || action === 'light') { theme.value = action; return; }
  if (action === 'compact' || action === 'comfortable') { density.value = action; return; }
  settingsView.value = action;
  showSection('settings');
  if (action === 'tasks') void loadTasks();
}


function focusTerminal() {
  void nextTick(() => terminalRefs.get(activeTerminal.value)?.focus());
}

function terminalId() {
  if (crypto.randomUUID) return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  return [hex.slice(0, 8), hex.slice(8, 12), hex.slice(12, 16), hex.slice(16, 20), hex.slice(20)].join('-');
}

function addTerminal(cwd = '') {
  if (terminalSessions.value.length >= 6) { error.value = 'Had enam terminal telah dicapai.'; return; }
  const session = { id: terminalId(), cwd, shell: shellProfile.value };
  terminalSessions.value.push(session);
  activeTerminal.value = session.id;
  terminalVisible.value = true;
  focusTerminal();
}

function splitTerminal() {
  if (terminalSplit.value !== undefined) {
    terminalSplit.value = undefined;
    return;
  }
  terminalSplit.value = activeTerminal.value;
  addTerminal();
}

function switchTerminal(session: string) {
  if (session === terminalSplit.value && session !== activeTerminal.value) terminalSplit.value = activeTerminal.value;
  activeTerminal.value = session;
  focusTerminal();
}

function closeTerminal() {
  const session = activeTerminal.value;
  terminalRefs.get(session)?.close();
  terminalSessions.value = terminalSessions.value.filter(item => item.id !== session);
  activeTerminal.value = terminalSessions.value.at(-1)?.id ?? '';
  if (terminalSplit.value === session || terminalSplit.value === activeTerminal.value || !activeTerminal.value) terminalSplit.value = undefined;
  if (!activeTerminal.value) terminalMaximized.value = false;
  else focusTerminal();
}

function toggleTerminal() {
  terminalVisible.value = !terminalVisible.value;
  if (terminalVisible.value) focusTerminal();
  else terminalMaximized.value = false;
}

const sections = [
  { id: 'explorer', label: 'File Explorer' },
  { id: 'search', label: 'Carian projek' },
  { id: 'git', label: 'Git' },
  { id: 'debug', label: 'Debug' },
  { id: 'extensions', label: 'Extensions' },
  { id: 'github', label: 'GitHub' },
  { id: 'box', label: 'Workspaces' },
] as const;
type Section = (typeof sections)[number]['id'] | 'user' | 'settings';
const section = ref<Section>('explorer');
const sidebarVisible = ref(true);
const explorerPanels = ref({ editors: true, folders: true, outline: true, timeline: false });
const query = ref('');
const searchInput = ref<HTMLInputElement>();
const searchBusy = ref(false);
const searchMessage = ref('');
const searchResults = ref<{ path: string; line: number; preview: string }[]>([]);
const gitStatus = ref('');
const gitChanges = ref<{ worktree: string[]; staged: string[]; untracked: string[] }>({ worktree: [], staged: [], untracked: [] });
const gitDiff = ref('');
async function changeGit(path: string, action: string) {
  const workspace = id.value;
  try {
    const { data } = await api.post(`/workspaces/${workspace}/git/change`, { path, action });
    if (workspace !== id.value) return;
    if (action.includes('diff')) gitDiff.value = data.output || 'Tiada diff.';
    else await runGit();
  } catch (cause) {
    if (workspace === id.value) {
      const failure = cause as { response?: { data?: { output?: string } } };
      gitFeedback.value = failure.response?.data?.output || 'Operasi Git gagal.';
    }
  }
}
const gitMessage = ref('');
const gitFeedback = ref('');
const gitBusy = ref(false);
let gitRequest = 0;
const editorRef = ref<InstanceType<typeof MonacoEditor>>();
const timeline = ref<{ path: string; time: string }[]>([]);

function showSection(next: Section) {
  if (next === 'box') { void router.push('/'); return; }
  section.value = next;
  sidebarVisible.value = true;
  if (next === 'search') void nextTick(() => searchInput.value?.focus());
}

async function searchWorkspace() {
  const text = query.value.trim();
  if (text.length < 2 || searchBusy.value) return;
  const workspace = id.value;
  searchBusy.value = true;
  searchResults.value = [];
  searchMessage.value = '';
  try {
    const { data } = await api.get(`/workspaces/${workspace}/search`, { params: { q: text, folder: searchFolder.value } });
    if (id.value !== workspace) return;
    searchResults.value = data.matches;
    searchMessage.value = data.limited ? 'Had carian dicapai.' : data.matches.length ? '' : 'Tiada padanan.';
  } catch {
    if (id.value === workspace) searchMessage.value = 'Carian gagal.';
  } finally {
    searchBusy.value = false;
  }
}

async function runGit(commitMessage?: string, stageAll = true) {
  if (gitBusy.value) return;
  const request = ++gitRequest;
  const endpoint = `/workspaces/${id.value}/git`;
  gitBusy.value = true;
  gitFeedback.value = '';
  try {
    if (commitMessage !== undefined) {
      const { data } = await api.post(`${endpoint}/commit`, { message: commitMessage, stageAll });
      if (request !== gitRequest) return;
      gitFeedback.value = data.output.trim() || (data.exitCode === 0 ? 'Commit berjaya.' : 'Commit gagal.');
      if (data.exitCode === 0) gitMessage.value = '';
    }
    const { data } = await api.post(`${endpoint}/status`);
    if (request !== gitRequest) return;
    gitStatus.value = data.output || (data.exitCode === 0 ? 'Tiada perubahan.' : 'Git status gagal.');
    if (data.exitCode === 0) {
      const changes = await api.post(`${endpoint}/changes`);
      if (request === gitRequest) gitChanges.value = changes.data;
    }
  } catch (cause) {
    if (request !== gitRequest) return;
    const failure = cause as { response?: { data?: { output?: string; error?: string } } };
    const details = failure.response?.data;
    gitFeedback.value = [gitFeedback.value, details?.output || details?.error || 'Operasi Git gagal.']
      .filter(Boolean).join('\n');
  } finally {
    if (request === gitRequest) gitBusy.value = false;
  }
}

const actions = [
  { label: 'Carian projek · Ctrl+Shift+F', run: () => showSection('search') },
  { label: 'Terminal · Ctrl+`', run: toggleTerminal },
  { label: 'Terminal baharu · Ctrl+Shift+`', run: () => addTerminal() },
  { label: 'Pisah terminal', run: splitTerminal },
  { label: 'Simpan fail · Ctrl+S', run: () => void save() },
  { label: 'Sembunyikan atau paparkan sidebar · Ctrl+B', run: () => { sidebarVisible.value = !sidebarVisible.value; } },
  { label: 'File Explorer', run: () => showSection('explorer') },
  { label: 'Git status', run: () => { showSection('git'); void runGit(); } },
];
const matchingActions = computed(() => actions.filter(action => action.label.toLowerCase().includes(query.value.toLowerCase())));

let shortcutPrefix = 0;
function handleTerminalShortcut(event: KeyboardEvent) {
  if (!(event.ctrlKey || event.metaKey) || event.altKey) return;
  if (event.code === 'KeyK' && !event.shiftKey) {
    shortcutPrefix = Date.now();
    event.preventDefault();
    return;
  }
  const action = event.code === 'KeyS' && Date.now() - shortcutPrefix < 1500 ? () => settingsAction('shortcuts')
    : event.shiftKey && event.code === 'KeyP' ? () => settingsAction('palette')
    : event.shiftKey && event.code === 'KeyX' ? () => settingsAction('extensions')
    : event.code === 'Comma' ? () => settingsAction('settings')
    : event.code === 'Backquote' ? (event.shiftKey ? () => addTerminal() : toggleTerminal)
    : event.shiftKey && event.code === 'KeyF' ? () => showSection('search')
    : !event.shiftKey && event.code === 'KeyP' ? () => showSection('search')
    : !event.shiftKey && event.code === 'KeyB' ? () => { sidebarVisible.value = !sidebarVisible.value; }
    : undefined;
  shortcutPrefix = 0;
  if (!action) return;
  event.preventDefault();
  event.stopPropagation();
  if (!event.repeat) action();
}

onMounted(() => window.addEventListener('keydown', handleTerminalShortcut, true));
onBeforeUnmount(() => window.removeEventListener('keydown', handleTerminalShortcut, true));

async function run(action: () => Promise<void>) {
  if (busy.value) return;
  busy.value = true;
  error.value = '';
  try { await action(); }
  catch (cause: unknown) {
    const failure = cause as { response?: { data?: { error?: string } }; message?: string };
    error.value = failure.response?.data?.error ?? failure.message ?? 'Operasi gagal';
  } finally { busy.value = false; }
}


function select(node: FileNode, line = 0) {
  selectedPaths.value.clear();
  imagePreview.value = '';
  void run(async () => {
    const workspaceId = id.value;
    const state = documents.value;
    selected.value = node;
    if (node.type === 'directory') {
      if (expanded.value.delete(node.path)) return;
      await fileSystem.load(workspaceId, node.path);
      if (workspaceId === id.value) expanded.value.add(node.path);
      return;
    }
    if (!state.tabs.some(tab => tab.path === node.path)) {
      const content = await files.read(node.path);
      state.tabs.push({ path: node.path, content, savedContent: content });
    }
    if (workspaceId !== id.value) return;
    state.activePath = node.path;
    if (line) {
      terminalMaximized.value = false;
      await nextTick();
      editorRef.value?.goToLine(line);
    }
  });
}

function closeTab(tab: EditorTab) {
  if (saving.value || (tab.content !== tab.savedContent && !confirm('Tutup fail dengan perubahan belum disimpan?'))) return;
  const state = documents.value;
  state.tabs = state.tabs.filter(item => item !== tab);
  if (state.activePath === tab.path) state.activePath = state.tabs.at(-1)?.path ?? '';
}

async function save(tab = active.value, overwrite = false) {
  if (!tab || saving.value || busy.value || restoring.value || tab.content === tab.savedContent) return;
  if (tab.conflict && !overwrite) return;
  const snapshot = tab.content;
  const workspace = id.value;
  const path = tab.path;
  saving.value = true;
  try {
    error.value = '';
    await files.write(tab.path, snapshot, overwrite ? undefined : tab.savedContent);
    tab.savedContent = snapshot;
    tab.conflict = false;
    if (id.value === workspace) {
      timeline.value = [{ path, time: new Date().toLocaleTimeString() }, ...timeline.value].slice(0, 30);
    }
  } catch (cause) {
    const failure = cause as { response?: { status?: number } };
    if (failure.response?.status === 409) tab.conflict = true;
    error.value = tab.conflict ? 'Fail di pelayan telah berubah. Draf masih disimpan.' : 'Gagal menyimpan fail';
  }
  finally { saving.value = false; }
}

watch(() => [restoring.value, autoSave.value, documents.value?.tabs.map(tab => [tab.path, tab.content, tab.savedContent])], (_, __, onCleanup) => {
  if (!autoSave.value || restoring.value) return;
  const timer = window.setTimeout(async () => {
    const workspaceId = id.value;
    for (const tab of documents.value?.tabs ?? []) {
      if (id.value !== workspaceId) break;
      await save(tab);
    }
  }, 750);
  onCleanup(() => window.clearTimeout(timer));
});

function overwriteActive() {
  if (confirm('Timpa fail di pelayan dengan draf ini?')) void save(active.value, true);
}

function reloadActive() {
  const tab = active.value;
  if (!tab || (tab.content !== tab.savedContent && !confirm('Buang draf dan ambil versi pelayan?'))) return;
  void run(async () => {
    const content = await files.read(tab.path);
    Object.assign(tab, { content, savedContent: content, conflict: false });
  });
}

function refresh() {
  const workspaceId = id.value;
  void run(async () => {
    await Promise.all(['', ...expanded.value].map(path => fileSystem.load(workspaceId, path)));
  });
}

function parent(path: string) {
  return path.split('/').slice(0, -1).join('/');
}

function create(type: FileNode['type']) {
  const name = prompt(type === 'file' ? 'Nama fail baharu' : 'Nama folder baharu')?.trim();
  if (!name || /[\\/]/.test(name) || name === '.' || name === '..') return;
  const node = selected.value;
  const directory = node?.type === 'directory' ? node.path : parent(node?.path ?? '');
  void run(async () => {
    const workspaceId = id.value;
    const path = directory ? `${directory}/${name}` : name;
    await files.create(path, type);
    await fileSystem.load(workspaceId, directory);
    if (directory && workspaceId === id.value) expanded.value.add(directory);
  });
}

function changeSelected(rename: boolean) {
  const node = selected.value;
  if (!node || saving.value || busy.value) return;
  const name = rename ? prompt('Nama baharu', node.name)?.trim() : '';
  if (rename ? !name || name === node.name || /[\\/]/.test(name) || name === '.' || name === '..'
    : !confirm(`Padam ${node.path}?`)) return;
  const state = documents.value;
  const affected = (path: string) => path === node.path || path.startsWith(node.path + '/');
  if (!rename && state.tabs.some(tab => affected(tab.path) && tab.content !== tab.savedContent)
    && !confirm('Fail terlibat mengandungi perubahan belum disimpan. Teruskan?')) return;
  void run(async () => {
    const workspaceId = id.value;
    const directory = parent(node.path);
    if (rename) {
      const to = directory ? `${directory}/${name}` : name!;
      await files.rename(node.path, to);
      if (affected(state.activePath)) state.activePath = to + state.activePath.slice(node.path.length);
      for (const tab of state.tabs) {
        if (affected(tab.path)) tab.path = to + tab.path.slice(node.path.length);
      }
    } else {
      await files.remove(node.path);
      state.tabs = state.tabs.filter(tab => !affected(tab.path));
      if (affected(state.activePath)) state.activePath = state.tabs.at(-1)?.path ?? '';
    }
    if (workspaceId === id.value) {
      selected.value = undefined;
      for (const path of expanded.value) {
        if (affected(path)) expanded.value.delete(path);
      }
    }
    await fileSystem.load(workspaceId, directory);
  });
}
const explorer = ref<HTMLElement>();
const contextPoint = ref<{ x: number; y: number }>();
const contextNode = ref<FileNode>();
const fileClipboard = ref<{ node: FileNode; workspace: string; cut: boolean }>();
const fileUpload = ref<HTMLInputElement>();
const zipImport = ref<HTMLInputElement>();
const settingsImport = ref<HTMLInputElement>();
const selectedPaths = ref(new Set<string>());
const taskNames = ref<string[]>([]);
let uploadFolder = '';
let holdTimer: ReturnType<typeof setTimeout>;
let holdOrigin: { x: number; y: number } | undefined;
let suppressClick = false;

function explorerContext(event: MouseEvent) {
  event.preventDefault();
  const row = (event.target as HTMLElement)?.closest<HTMLElement>('[data-file-path]');
  contextNode.value = Object.values(directories.value).flat().find(node => node.path === row?.dataset.filePath);
  selected.value = contextNode.value;
  contextPoint.value = { x: event.clientX, y: event.clientY };
}
function startExplorerHold(event: PointerEvent) {
  if (event.button !== 0) return;
  suppressClick = false;
  holdOrigin = { x: event.clientX, y: event.clientY };
  holdTimer = setTimeout(() => {
    suppressClick = true;
    explorerContext(event);
  }, 550);
}
function cancelExplorerHold() {
  clearTimeout(holdTimer);
  holdOrigin = undefined;
}
function moveExplorerHold(event: PointerEvent) {
  if (holdOrigin && Math.hypot(event.clientX - holdOrigin.x, event.clientY - holdOrigin.y) > 8) cancelExplorerHold();
}
function filterExplorerClick(event: MouseEvent) {
  if (!suppressClick) return;
  suppressClick = false;
  event.stopPropagation();
  event.preventDefault();
}
onBeforeUnmount(cancelExplorerHold);

function folderOf(node = contextNode.value) {
  return node?.type === 'directory' ? node.path : parent(node?.path ?? '');
}
function transferUrl(action: string, relative?: string) {
  return `/api/workspaces/${encodeURIComponent(id.value)}/${action}` +
    (relative === undefined ? '' : '?' + new URLSearchParams({ path: relative }));
}
function copyText(value: string) {
  void run(() => navigator.clipboard.writeText(value));
}
function pasteFiles() {
  const clipboard = fileClipboard.value;
  if (!clipboard || clipboard.workspace !== id.value) return;
  const folder = folderOf();
  const original = clipboard.node;
  const originalDestination = folder ? `${folder}/${original.name}` : original.name;
  if (clipboard.cut && originalDestination === original.path) { fileClipboard.value = undefined; return; }
  void run(async () => {
    const workspace = id.value;
    const state = documents.value;
    let destination = originalDestination;
    if (!clipboard.cut && destination === original.path) {
      await fileSystem.load(workspace, folder);
      const occupied = new Set(fileSystem.directories[workspace]?.[folder]?.map(node => node.path));
      const dot = original.type === 'file' ? original.name.lastIndexOf('.') : -1;
      const stem = dot > 0 ? original.name.slice(0, dot) : original.name;
      const extension = dot > 0 ? original.name.slice(dot) : '';
      for (let count = 1; occupied.has(destination); count++) {
        const copy = `${stem} copy${count > 1 ? ' ' + count : ''}${extension}`;
        destination = folder ? `${folder}/${copy}` : copy;
      }
    }
    await api.post(`/workspaces/${workspace}/${clipboard.cut ? 'rename' : 'copy'}`, { from: original.path, to: destination });
    if (clipboard.cut) {
      const movedPath = (path: string) => path === original.path || path.startsWith(original.path + '/')
        ? destination + path.slice(original.path.length) : path;
      for (const tab of state.tabs) tab.path = movedPath(tab.path);
      state.activePath = movedPath(state.activePath);
      fileClipboard.value = undefined;
      await fileSystem.load(workspace, parent(original.path));
    }
    await fileSystem.load(workspace, folder);
    if (workspace === id.value && folder) expanded.value.add(folder);
  });
}
function uploadSelected(event: Event, archive = false) {
  const input = event.target as HTMLInputElement;
  const batch = Array.from(input.files ?? []);
  input.value = '';
  if (!batch.length) return;
  const folder = archive ? '' : uploadFolder;
  const workspace = id.value;
  void run(async () => {
    try {
      for (const file of batch) {
        await api.post(`/workspaces/${workspace}/${archive ? 'archive' : 'upload'}`, file, {
          headers: { 'Content-Type': 'application/octet-stream' },
          params: archive ? undefined : { path: folder ? `${folder}/${file.name}` : file.name },
        });
      }
    } finally {
      await fileSystem.load(workspace, folder);
      if (workspace === id.value && folder) expanded.value.add(folder);
    }
  });
}
function showImage(node: FileNode) {
  terminalMaximized.value = false;
  imagePreview.value = transferUrl('image', node.path);
}
function shareNode(node?: FileNode) {
  const url = new URL(location.href);
  url.searchParams.delete('file');
  url.searchParams.delete('folder');
  if (node) url.searchParams.set(node.type === 'file' ? 'file' : 'folder', node.path);
  void run(async () => {
    if (navigator.share) await navigator.share({ title: node?.name ?? 'Workspace', url: url.href });
    else await navigator.clipboard.writeText(url.href);
  });
}
function showTimeline() {
  explorerPanels.value.timeline = true;
  void nextTick(() => document.getElementById('workspace-timeline')?.scrollIntoView({ block: 'nearest' }));
}
function updateChatFolders(folder: string) {
  if (!foldersForChat.value.includes(folder)) foldersForChat.value.push(folder);
  writeLocal(keyFor('chat-folders'), foldersForChat.value);
  settingsAction('chat-folders');
}
const explorerMenu = computed(() => {
  const node = contextNode.value;
  return [
    { label: 'New File…', run: () => create('file') },
    { label: 'New Folder…', run: () => create('directory') },
    { label: 'Open in Images Preview', disabled: !node || node.type !== 'file' || !/\.(png|jpe?g|gif|webp|avif)$/i.test(node.name), run: () => node && showImage(node) },
    { label: 'Open in Integrated Terminal', run: () => addTerminal(folderOf(node)) },
    { label: 'Share', run: () => shareNode(node) },
    { label: 'Find in Folder', run: () => { searchFolder.value = folderOf(node); searchResults.value = []; showSection('search'); } },
    { label: 'Open Timeline', run: showTimeline },
    { label: 'Add Folder to Chat', run: () => updateChatFolders(folderOf(node)) },
    { label: 'Cut', disabled: !node, run: () => { if (node) fileClipboard.value = { node, workspace: id.value, cut: true }; } },
    { label: 'Copy', disabled: !node, run: () => {
      if (node) {
        fileClipboard.value = { node, workspace: id.value, cut: false };
        copyText('/workspace/' + node.path);
      }
    } },
    { label: 'Paste', disabled: fileClipboard.value?.workspace !== id.value, run: pasteFiles },
    { label: 'Upload…', run: () => { uploadFolder = folderOf(node); fileUpload.value?.click(); } },
    { label: 'Copy Path', disabled: !node, run: () => node && copyText('/workspace/' + node.path) },
    { label: 'Copy Relative Path', disabled: !node, run: () => node && copyText(node.path) },
    { label: 'Rename', disabled: !node, run: () => changeSelected(true) },
    { label: 'Delete Permanently', disabled: !node, run: () => changeSelected(false) },
    { label: 'Select All', run: () => {
      selectedPaths.value = new Set(Array.from(explorer.value?.querySelectorAll<HTMLElement>('[data-file-path]') ?? [])
        .map(row => row.dataset.filePath!));
    } },
  ];
});
function currentPreferences() {
  return { theme: theme.value, density: density.value, autoSave: autoSave.value, shell: shellProfile.value, snippets: snippets.value };
}
const settingsNotice = ref('');
function updatePreferences(data: ReturnType<typeof currentPreferences>) {
  if (['dark', 'light'].includes(data.theme)) theme.value = data.theme;
  if (['comfortable', 'compact'].includes(data.density)) density.value = data.density;
  if (typeof data.autoSave === 'boolean') autoSave.value = data.autoSave;
  if (typeof data.snippets === 'string') snippets.value = data.snippets;
  if (['bash', 'sh', 'zsh', 'fish', 'pwsh'].includes(data.shell)) shellProfile.value = data.shell;
}
function syncSettings(download: boolean) {
  settingsNotice.value = '';
  const workspace = id.value;
  void run(async () => {
    const endpoint = `/workspaces/${workspace}/settings`;
    if (download) {
      const { data } = await api.get(endpoint);
      if (workspace !== id.value) return;
      if (data.preferences) updatePreferences(data.preferences);
      settingsNotice.value = data.preferences ? 'Tetapan dipulihkan.' : 'Tiada tetapan workspace disimpan.';
    } else {
      await api.put(endpoint, currentPreferences());
      if (id.value === workspace) settingsNotice.value = 'Tetapan disimpan ke workspace.';
    }
  });
}
function exportSettings() {
  const json = JSON.stringify(currentPreferences(), null, 2);
  const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'zh-settings.json';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
async function restoreSettings(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';
  if (!file) return;
  await run(async () => {
    if (file.size > 1024 * 1024) throw new Error('Fail tetapan terlalu besar.');
    updatePreferences(JSON.parse(await file.text()));
  });
}
async function loadTasks() {
  taskNames.value = [];
  await run(async () => {
    const workspace = id.value;
    const data = JSON.parse(await files.read('package.json'));
    if (workspace === id.value) taskNames.value = Object.keys(data.scripts ?? {});
  });
}
function queueTask(task: string) {
  if (!/^[\w.:-]+$/.test(task)) return;
  terminalVisible.value = true;
  focusTerminal();
  terminalRefs.get(activeTerminal.value)?.paste(`npm run ${task}`);
}

watch(id, async (workspaceId) => {
  restoring.value = true;
  const state = editor.workspaces[workspaceId] ??= readLocal(keyFor('editor', workspaceId), { tabs: [], activePath: '' });
  autoSave.value = readLocal(keyFor('autosave', workspaceId), false);
  selected.value = undefined;
  splitPath.value = '';
  const terminalState = readLocal<{ sessions: TerminalSession[]; active: string }>(
    keyFor('terminals', workspaceId), { sessions: [{ id: terminalId(), cwd: '' }], active: '' },
  );
  terminalSessions.value = terminalState.sessions;
  activeTerminal.value = terminalState.active || terminalSessions.value[0]?.id || '';
  imagePreview.value = '';
  searchFolder.value = '';
  selectedPaths.value = new Set();
  settingsNotice.value = '';
  foldersForChat.value = readLocal(keyFor('chat-folders', workspaceId), []);
  gitChanges.value = { worktree: [], staged: [], untracked: [] };
  gitDiff.value = '';
  terminalSplit.value = undefined;
  terminalMaximized.value = false;
  timeline.value = readLocal(keyFor('timeline', workspaceId), []);
  gitStatus.value = '';
  gitMessage.value = '';
  gitFeedback.value = '';
  gitBusy.value = false;
  gitRequest++;
  searchResults.value = [];
  searchMessage.value = '';
  expanded.value.clear();
  try {
    await Promise.all([
      fileSystem.load(workspaceId),
      ...state.tabs.map(async tab => {
        try {
          const { data } = await api.get(`/workspaces/${workspaceId}/file`, { params: { path: tab.path } });
          if (id.value === workspaceId) Object.assign(tab, { conflict: false }, recoverTab(tab, data.content));
        } catch {
          if (id.value === workspaceId) tab.conflict = true;
        }
      }),
    ]);
  } catch { if (id.value === workspaceId) error.value = 'Gagal memuatkan fail workspace'; }
  finally {
    if (id.value === workspaceId) {
      restoring.value = false;
      const sharedFile = route.query.file;
      const sharedFolder = route.query.folder;
      if (typeof sharedFile === 'string' && sharedFile) {
        select({ name: sharedFile.split('/').at(-1)!, path: sharedFile, type: 'file' });
      } else if (typeof sharedFolder === 'string' && sharedFolder) {
        void run(async () => {
          let folder = '';
          for (const part of sharedFolder.split('/').filter(Boolean)) {
            folder = folder ? `${folder}/${part}` : part;
            await fileSystem.load(workspaceId, folder);
            if (id.value !== workspaceId) return;
            expanded.value.add(folder);
          }
        });
      }
    }
  }
}, { immediate: true });

watch(documents, state => {
  if (state && !restoring.value) writeLocal(keyFor('editor'), state);
}, { deep: true, flush: 'sync' });
watch(restoring, value => {
  if (!value && documents.value) writeLocal(keyFor('editor'), documents.value);
});
watch(autoSave, value => writeLocal(keyFor('autosave'), value));
watch([terminalSessions, activeTerminal], ([sessions, active]) => writeLocal(keyFor('terminals'), { sessions, active }), {
  deep: true, immediate: true,
});

watch(timeline, value => writeLocal(keyFor('timeline'), value));
</script>

<template>
  <div class="workspace" :class="{ 'light-workspace': theme === 'light', 'compact-workspace': density === 'compact' }">
    <input ref="fileUpload" type="file" multiple hidden @change="uploadSelected($event)" />
    <input ref="zipImport" type="file" accept=".zip,application/zip" hidden @change="uploadSelected($event, true)" />
    <input ref="settingsImport" type="file" accept=".json,application/json" hidden @change="restoreSettings" />
    <nav class="activity" aria-label="Navigasi workspace">
      <button title="Menu" aria-label="Tukar paparan sidebar" @click="sidebarVisible = !sidebarVisible">
        <WorkspaceIcon name="menu" />
      </button>
      <button v-for="item in sections" :key="item.id" :title="item.label" :aria-label="item.label"
        :aria-pressed="sidebarVisible && section === item.id" @click="showSection(item.id)">
        <WorkspaceIcon :name="item.id" />
      </button>
      <div class="activity-bottom">
        <button title="Akaun" aria-label="Akaun" @click="showSection('user')"><WorkspaceIcon name="user" /></button>
        <SettingsMenuHost @action="settingsAction" />
      </div>
    </nav>

    <Sidebar v-show="sidebarVisible" :title="sections.find(item => item.id === section)?.label ?? (section === 'user' ? 'Akaun' : 'Tetapan')">
      <template v-if="section === 'explorer'">
        <div class="toolbar explorer-actions">
          <button @click="create('file')">Fail +</button>
          <button @click="create('directory')">Folder +</button>
          <details class="explorer-menu">
            <summary title="Paparan Explorer" aria-label="Paparan Explorer"><WorkspaceIcon name="dots" /></summary>
            <label><input v-model="explorerPanels.editors" type="checkbox"> Open Editors</label>
            <label><input v-model="explorerPanels.folders" type="checkbox"> Folder</label>
            <label><input v-model="explorerPanels.outline" type="checkbox"> Outline</label>
            <label><input v-model="explorerPanels.timeline" type="checkbox"> Timeline</label>
          </details>
        </div>
        <div class="sidebar-scroll">
          <details v-if="explorerPanels.editors" open>
            <summary>Open Editors</summary>
            <button v-for="tab in documents?.tabs" :key="tab.path" class="sidebar-item"
              @click="documents.activePath = tab.path">{{ tab.path }}</button>
          </details>
          <details v-if="explorerPanels.folders" open>
            <summary>Folder</summary>
            <div class="toolbar">
              <button @click="refresh">Muat semula</button>
              <template v-if="selected">
                <button @click="changeSelected(true)">Namakan semula</button>
                <button @click="changeSelected(false)">Padam</button>
              </template>
            </div>
            <div ref="explorer" class="file-explorer-surface" @contextmenu="explorerContext"
              @pointerdown="startExplorerHold" @pointerup="cancelExplorerHold" @pointercancel="cancelExplorerHold"
              @pointerleave="cancelExplorerHold" @pointermove="moveExplorerHold" @click.capture="filterExplorerClick">
              <FileTree :directories="directories" :expanded="expanded" :selected="selected?.path ?? ''"
                :selected-paths="selectedPaths" @select="select" />
            </div>
            <WorkspaceContextMenu v-if="contextPoint" :point="contextPoint" :items="explorerMenu" @close="contextPoint = undefined" />
          </details>
          <details v-if="explorerPanels.outline">
            <summary>Outline</summary>
            <button class="sidebar-item" :disabled="!active || terminalMaximized" @click="editorRef?.outline()">Lihat simbol fail aktif</button>
          </details>
          <details v-if="explorerPanels.timeline" id="workspace-timeline" open>
            <summary>Timeline</summary>
            <p v-if="!timeline.length" class="sidebar-copy">Tiada sejarah simpanan di pelayar ini.</p>
            <div v-for="(entry, index) in timeline" :key="index" class="sidebar-copy">{{ entry.time }} · {{ entry.path }}</div>
          </details>
        </div>
      </template>

      <div v-else-if="section === 'search'" class="sidebar-scroll sidebar-copy">
        <form class="workspace-search" @submit.prevent="searchWorkspace">
          <input ref="searchInput" v-model="query" type="search" placeholder="Cari fail, teks atau tindakan"
            aria-label="Cari fail, teks atau tindakan" maxlength="200" @keydown.enter.stop>
          <button :disabled="searchBusy || query.trim().length < 2">Cari</button>
        </form>
        <p v-if="searchFolder">Folder {{ searchFolder }} <button @click="searchFolder = ''; searchResults = []">Kosongkan penapis</button></p>
        <button v-for="action in matchingActions" :key="action.label" class="sidebar-item" @click="action.run()">{{ action.label }}</button>
        <p v-if="searchMessage" role="status">{{ searchMessage }}</p>
        <button v-for="result in searchResults" :key="result.path + ':' + result.line" class="sidebar-item search-result"
          @click="select({ name: result.path.split('/').pop()!, path: result.path, type: 'file' }, result.line)">
          <strong>{{ result.path }}{{ result.line ? ':' + result.line : '' }}</strong>
          <span v-if="result.preview">{{ result.preview }}</span>
        </button>
      </div>
      <div v-else-if="section === 'git'" class="sidebar-scroll sidebar-copy">
        <button :disabled="gitBusy" @click="runGit()">Semak status Git</button>
        <pre>{{ gitStatus }}</pre>
        <div v-for="group in (['staged', 'worktree', 'untracked'] as const)" :key="group">
          <h4 v-if="gitChanges[group].length">{{ { staged: 'Staged', worktree: 'Perubahan', untracked: 'Fail baharu' }[group] }}</h4>
          <div v-for="path in gitChanges[group]" :key="path" class="git-row">
            <button class="sidebar-item" :title="path"
              @click="changeGit(path, group === 'staged' ? 'staged-diff' : group === 'untracked' ? 'untracked-diff' : 'diff')">{{ path }}</button>
            <button @click="changeGit(path, group === 'staged' ? 'unstage' : 'stage')">{{ group === 'staged' ? 'Unstage' : 'Stage' }}</button>
          </div>
        </div>
        <details v-if="gitDiff" open><summary>Diff</summary><pre>{{ gitDiff }}</pre></details>
        <form class="git-commit" @submit.prevent="gitMessage.trim() && runGit(gitMessage.trim(), false)">
          <label for="git-message">Mesej commit</label>
          <textarea id="git-message" v-model="gitMessage" :disabled="gitBusy" rows="3" required />
          <button :disabled="gitBusy || !gitMessage.trim() || !gitChanges.staged.length">Commit fail staged</button>
          <button type="button" :disabled="gitBusy || !gitMessage.trim()" @click="runGit(gitMessage.trim())">Commit semua perubahan</button>
        </form>
        <pre v-if="gitFeedback || gitBusy" role="status">{{ gitFeedback || 'Menjalankan Git…' }}</pre>
      </div>
      <div v-else-if="section === 'settings'" class="sidebar-scroll sidebar-copy settings-panel">
        <template v-if="settingsView === 'settings'">
          <label><input v-model="autoSave" type="checkbox"> Auto-simpan</label>
          <a :href="transferUrl('archive')" download>Muat turun ZIP workspace</a>
          <button @click="zipImport?.click()">Import ZIP ke workspace kosong…</button>
        </template>
        <template v-else-if="settingsView === 'profiles'">
          <label for="workspace-shell">Shell untuk terminal baharu</label>
          <select id="workspace-shell" v-model="shellProfile">
            <option value="bash">Bash</option><option value="sh">Sh</option><option value="zsh">Zsh</option>
            <option value="fish">Fish</option><option value="pwsh">PowerShell</option>
          </select>
        </template>
        <template v-else-if="settingsView === 'shortcuts'">
          <h3>Keyboard Shortcuts</h3>
          <p>Command Palette · Ctrl+Shift+P</p><p>Tetapan · Ctrl+,</p><p>Extensions · Ctrl+Shift+X</p>
          <p>Carian projek · Ctrl+Shift+F</p><p>Simpan · Ctrl+S</p><p>Terminal · Ctrl+`</p>
        </template>
        <template v-else-if="settingsView === 'snippets'">
          <label for="workspace-snippet">Snippet disimpan dalam pelayar</label>
          <textarea id="workspace-snippet" v-model="snippets" rows="7" />
          <button :disabled="!active || !snippets" @click="active && (active.content += snippets)">Tambah pada hujung fail aktif</button>
        </template>
        <template v-else-if="settingsView === 'tasks'">
          <p>Skrip package.json</p>
          <button v-for="task in taskNames" :key="task" @click="queueTask(task)">Tampal npm run {{ task }}</button>
          <p v-if="!taskNames.length">Tiada skrip ditemui.</p>
        </template>
        <template v-else-if="settingsView === 'backup'">
          <button @click="exportSettings">Eksport tetapan…</button>
          <button @click="settingsImport?.click()">Import tetapan…</button>
          <button :disabled="busy" @click="syncSettings(false)">Simpan tetapan ke workspace</button>
          <button :disabled="busy" @click="syncSettings(true)">Pulihkan tetapan workspace</button>
          <p v-if="settingsNotice" role="status">{{ settingsNotice }}</p>
          <a :href="transferUrl('archive')" download>Muat turun ZIP workspace</a>
        </template>
        <template v-else-if="settingsView === 'chat-folders'">
          <p>Folder disimpan untuk Chat</p>
          <div v-for="folder in foldersForChat" :key="folder">{{ folder || '/' }}</div>
          <p>Perkhidmatan Chat belum disambungkan.</p>
        </template>
        <p v-else>Versi Insiders belum tersedia untuk projek ini.</p>
      </div>
      <div v-else-if="section === 'user'" class="sidebar-copy">
        <p>{{ auth.user?.email }}</p>
        <button @click="auth.signout().then(() => router.push('/signin'))">Log keluar</button>
      </div>
      <div v-else class="sidebar-copy">
        <p v-if="section === 'github'">Gunakan terminal untuk clone, pull dan push repo GitHub.</p>
        <p v-else-if="section === 'debug'">Debugger belum disambungkan.</p>
        <p v-else>Pengurus extension belum tersedia.</p>
      </div>
    </Sidebar>

    <main>
      <div v-show="!terminalMaximized" class="toolbar editor-toolbar">
        <Tabs v-if="documents" :tabs="documents.tabs" :active-path="documents.activePath"
          @select="documents.activePath = $event" @close="closeTab" />

        <select v-if="documents?.tabs.length" v-model="splitPath" aria-label="Fail untuk editor sebelah">
          <option value="">Satu editor</option>
          <option v-for="tab in documents.tabs" :key="tab.path" :value="tab.path">{{ tab.path }}</option>
        </select>
        <button v-if="active" :disabled="saving || restoring || active.conflict || active.content === active.savedContent" @click="save()">Simpan</button>
      </div>
      <div v-if="imagePreview" v-show="!terminalMaximized" class="editor-host image-preview">
        <button @click="imagePreview = ''">Tutup pratonton</button>
        <img :src="imagePreview" alt="Pratonton imej workspace" />
      </div>
      <div v-else-if="active" v-show="!terminalMaximized" class="editor-host editor-panes">
        <div>
          <MonacoEditor ref="editorRef" :key="id + '/' + active.path" v-model="active.content" :path="active.path"
            :theme="theme" :language="detectLanguage(active.path)" @save="save(active)" />
        </div>
        <div v-if="split && split !== active">
          <MonacoEditor :key="id + '/' + split.path" v-model="split.content" :path="split.path"
            :theme="theme" :language="detectLanguage(split.path)" @save="save(split)" />
        </div>
      </div>
      <p v-else v-show="!terminalMaximized" class="editor-host empty">Pilih fail untuk mula mengedit.</p>
      <div v-if="active?.conflict" class="toolbar" role="alert">
        Fail di pelayan berubah atau tidak dapat dibaca. Draf anda masih ada.
        <button v-if="active.content !== active.savedContent" @click="overwriteActive">Timpa dengan draf</button>
        <button @click="reloadActive">Ambil versi pelayan</button>
      </div>
      <StatusBar :path="active?.path" :error="error" />
      <section class="terminal-panel" :class="{ collapsed: !terminalVisible, maximized: terminalMaximized }" aria-label="Terminal">
        <div class="toolbar terminal-toolbar">
          <span>Terminal</span>
          <div class="panel-actions">
            <select v-if="terminalSessions.length" :value="activeTerminal" aria-label="Sesi terminal"
              @change="switchTerminal(($event.target as HTMLSelectElement).value)">
              <option v-for="(session, index) in terminalSessions" :key="session.id" :value="session.id">{{ session.shell ?? 'bash' }} {{ index + 1 }}</option>
            </select>
            <button title="Terminal baharu" aria-label="Terminal baharu" @click="addTerminal()"><WorkspaceIcon name="plus" /></button>
            <button :disabled="!activeTerminal" title="Pisah terminal" aria-label="Pisah terminal"
              :aria-pressed="terminalSplit !== undefined" @click="splitTerminal"><WorkspaceIcon name="split" /></button>
            <button :title="terminalMaximized ? 'Pulihkan saiz terminal' : 'Maksimumkan terminal'"
              :aria-label="terminalMaximized ? 'Pulihkan saiz terminal' : 'Maksimumkan terminal'"
              @click="terminalVisible = true; terminalMaximized = !terminalMaximized">
              <WorkspaceIcon :name="terminalMaximized ? 'minimize' : 'expand'" />
            </button>
            <button :title="terminalVisible ? 'Sembunyikan terminal' : 'Paparkan terminal'"
              :aria-label="terminalVisible ? 'Sembunyikan terminal' : 'Paparkan terminal'"
              :aria-expanded="terminalVisible" aria-controls="workspace-terminal" @click="toggleTerminal">
              <WorkspaceIcon :name="terminalVisible ? 'minimize' : 'chevron'" />
            </button>
            <button :disabled="!activeTerminal" title="Tutup sesi aktif" aria-label="Tutup sesi aktif"
              @click="closeTerminal"><WorkspaceIcon name="close" /></button>
          </div>
        </div>
        <div v-show="terminalVisible" id="workspace-terminal" class="terminal-content">
          <div v-for="session in terminalSessions" v-show="session.id === activeTerminal || session.id === terminalSplit"
            :key="id + '/' + session.id" class="terminal-pane">
            <Terminal :ref="component => component ? terminalRefs.set(session.id, component as InstanceType<typeof Terminal>) : terminalRefs.delete(session.id)"
              :workspace-id="id" :session-id="session.id" :cwd="session.cwd" :shell="session.shell" :theme="theme" />
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.workspace { display: flex; height: 100dvh; background: #1e222a; color: #dbe3ef; font: 14px system-ui, sans-serif; }
main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.toolbar { display: flex; align-items: center; gap: 6px; padding: 5px; overflow: auto; background: #252b35; }
.editor-toolbar { justify-content: space-between; }
button, select { font: inherit; color: inherit; background: #343e4e; border: 1px solid #4c5b70; border-radius: 4px; padding: 4px 7px; white-space: nowrap; }
button { cursor: pointer; }
button:disabled { opacity: .5; }
button[aria-pressed=true] { background: #26507c; }
.editor-host { flex: 1; min-height: 0; }
.empty { margin: 0; padding: 1rem; }
.editor-panes { display: flex; }
.editor-panes > div { flex: 1; min-width: 0; }
.editor-panes > div + div { border-left: 1px solid #394352; }
.terminal-panel { display: flex; flex-direction: column; height: 32%; min-height: 120px; border-top: 1px solid #394352; }
.terminal-panel.collapsed { height: auto; min-height: 0; }
.terminal-toolbar { justify-content: space-between; padding-inline: 10px; }
.terminal-panel.maximized { flex: 1; height: auto; }
.terminal-content { flex: 1; min-height: 0; display: flex; }
.terminal-pane { flex: 1; min-width: 0; overflow: hidden; border-inline-end: 1px solid #394352; }
.activity { display: flex; flex-direction: column; gap: 4px; padding: 6px; background: #1b2230; }
.activity button, .panel-actions button { display: grid; place-items: center; }
.activity-bottom { display: grid; gap: 4px; margin-top: auto; }
.panel-actions { display: flex; align-items: center; gap: 4px; }
.sidebar-scroll { min-height: 0; overflow: auto; }
.sidebar-scroll summary { padding: 7px 9px; border-bottom: 1px solid #394352; cursor: pointer; }
.sidebar-item { display: block; width: 100%; border: 0; border-radius: 0; text-align: left; white-space: normal; overflow-wrap: anywhere; background: transparent; }
.sidebar-item:hover { background: #35465c; }
.sidebar-copy { padding: 8px; overflow-wrap: anywhere; }
.sidebar-copy pre { white-space: pre-wrap; }
.explorer-actions { flex-wrap: wrap; flex-shrink: 0; }
.explorer-menu label { display: block; padding: 2px 4px; }
.explorer-menu summary { cursor: pointer; }
.workspace-search { display: flex; gap: 4px; }
.workspace-search input { width: 100%; min-width: 0; }
.git-commit { display: grid; gap: 6px; }
.git-commit textarea { background: #252b35; color: inherit; border: 1px solid #4c5b70; font: inherit; resize: vertical; }
.file-explorer-surface { min-height: 7rem; }
.git-row { display: flex; align-items: center; gap: 4px; }
.settings-panel { display: grid; gap: 8px; }
.settings-panel a { color: #8dc6fb; }
.image-preview { overflow: auto; display: grid; justify-items: start; align-content: start; gap: 8px; padding: 8px; }
.image-preview img { max-width: 100%; object-fit: contain; }
.light-workspace { background: #f0f3f8; color: #1d2837; }
.light-workspace :deep(.sidebar), .light-workspace .toolbar, .light-workspace .activity { background: #e0e7f0; }
.light-workspace button, .light-workspace select { background: #edf2f8; border-color: #9daec2; }
.compact-workspace :deep(.row), .compact-workspace .toolbar { padding-block: 2px; }
.activity-bottom > :deep(div > div > button) { display: grid; place-items: center; width: 100%; color: #dbe3ef; background: #343e4e; border: 1px solid #4c5b70; border-radius: 4px; min-height: 28px; }
.search-result span { display: block; color: #adc0d6; }

</style>
