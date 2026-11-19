<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
import { Terminal } from '@xterm/xterm';
import { SearchAddon } from '@xterm/addon-search';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import '@xterm/xterm/css/xterm.css';
import WorkspaceContextMenu from '../layout/WorkspaceContextMenu.vue';

const props = defineProps<{ workspaceId: string; sessionId: string; cwd?: string; shell?: string; theme?: string }>();
const host = ref<HTMLElement>();
const context = ref<{ x: number; y: number }>();
const terminalMessage = ref('');
let retry: ReturnType<typeof setTimeout>;
let attempts = 0;
let closing = false;
let hold: ReturnType<typeof setTimeout>;
let start: { x: number; y: number } | undefined;

function openContext(event: MouseEvent | PointerEvent) {
  event.preventDefault();
  context.value = { x: event.clientX, y: event.clientY };
}
function beginHold(event: PointerEvent) {
  if (event.button !== 0) return;
  start = { x: event.clientX, y: event.clientY };
  hold = setTimeout(() => openContext(event), 550);
}
function cancelHold() { clearTimeout(hold); start = undefined; }
function moveHold(event: PointerEvent) {
  if (start && Math.hypot(start.x - event.clientX, start.y - event.clientY) > 8) cancelHold();
}
async function clipboard(action: string) {
  try {
    if (action === 'copy') await navigator.clipboard.writeText(term?.getSelection() ?? '');
    if (action === 'paste') {
      term?.paste(await navigator.clipboard.readText());
      term?.focus();
    }
    if (action === 'select') term?.selectAll();
  } catch { terminalMessage.value = 'Akses papan klip ditolak. Cuba Ctrl+V untuk tampal.'; }
}

const query = ref('');
const matchFound = ref(true);
const caseSensitive = ref(false);
const regex = ref(false);
const search = new SearchAddon();

function find(previous = false) {
  const options = { caseSensitive: caseSensitive.value, regex: regex.value };
  if (!query.value) {
    search.clearDecorations();
    matchFound.value = true;
    return;
  }
  try {
    matchFound.value = previous
      ? search.findPrevious(query.value, options)
      : search.findNext(query.value, options);
  } catch {
    matchFound.value = false;
  }
}
let term: Terminal | undefined;
let socket: WebSocket | undefined;
let observer: ResizeObserver | undefined;
const lightTheme = { background: '#f0f3f8', foreground: '#1d2837', cursor: '#1d2837' };
const darkTheme = { background: '#1e1e1e', foreground: '#ebedf0' };
watch(() => props.theme, value => {
  if (term) term.options.theme = value === 'light' ? lightTheme : darkTheme;
});

defineExpose({
  focus: () => term?.focus(),
  paste: (value: string) => term?.paste(value),
  close: () => {
    closing = true;
    clearTimeout(retry);
    if (socket?.readyState === WebSocket.OPEN) socket.send('\x01close');
  },
});

onMounted(() => {
  const element = host.value!;
  const terminal = new Terminal({ cursorBlink: true, fontSize: 13, scrollback: 5000, theme: props.theme === 'light' ? lightTheme : darkTheme });
  term = terminal;
  const fit = new FitAddon();
  terminal.loadAddon(fit);
  terminal.loadAddon(search);
  terminal.loadAddon(new WebLinksAddon());
  terminal.open(element);

  const url = new URL(`/ws/terminal/${encodeURIComponent(props.workspaceId)}`, location.href);
  url.protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
  url.searchParams.set('session', props.sessionId);
  if (props.shell) url.searchParams.set('shell', props.shell);
  if (props.cwd) url.searchParams.set('cwd', props.cwd);
  const resize = () => {
    if (!element.clientWidth || !element.clientHeight) return;
    fit.fit();
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(`\x01resize:${terminal.cols}:${terminal.rows}`);
    }
  };
  function connect() {
    const connection = new WebSocket(url);
    socket = connection;
    connection.onopen = () => {
      terminal.reset();
      terminalMessage.value = '';
      resize();
    };
    connection.onmessage = ({ data }) => {
      attempts = 0;
      terminal.write(data);
    };
    connection.onclose = event => {
      if (closing) return;
      terminalMessage.value = event.reason || 'Sambungan terminal terputus.';
      if (event.code === 1000 || event.code === 1008 || ++attempts > 8) return;
      retry = setTimeout(connect, Math.min(1000 * 2 ** (attempts - 1), 10000));
    };
  }
  connect();
  terminal.onData(data => {
    if (socket?.readyState === WebSocket.OPEN) {
      for (let offset = 0; offset < data.length; offset += 8000) socket.send(data.slice(offset, offset + 8000));
    }
  });
  observer = new ResizeObserver(resize);
  observer.observe(element);
});

onBeforeUnmount(() => {
  observer?.disconnect();
  clearTimeout(retry);
  cancelHold();
  if (socket) {
    socket.onopen = socket.onmessage = socket.onclose = null;
    socket.close();
  }
  term?.dispose();
});
</script>

<template>
  <div class="terminal" :class="{ light: theme === 'light' }">
    <form class="search" @submit.prevent="find()">
      <input v-model="query" type="search" aria-label="Cari dalam terminal" placeholder="Cari dalam terminal"
        @input="find()" @keydown.shift.enter.prevent="find(true)">
      <button type="button" @click="find(true)">Sebelum</button>
      <button type="submit">Seterusnya</button>
      <label><input v-model="caseSensitive" type="checkbox" @change="find()"> Aa</label>
      <label><input v-model="regex" type="checkbox" @change="find()"> Regex</label>
      <span v-if="!matchFound" role="status">Tiada padanan</span>
    </form>
    <p v-if="terminalMessage" role="status">{{ terminalMessage }}</p>
    <div ref="host" class="term-host" @contextmenu="openContext" @pointerdown="beginHold"
      @pointerup="cancelHold" @pointercancel="cancelHold" @pointerleave="cancelHold" @pointermove="moveHold" />
    <WorkspaceContextMenu v-if="context" :point="context" :items="[
      { label: 'Copy', run: () => clipboard('copy') },
      { label: 'Paste', run: () => clipboard('paste') },
      { label: 'Select All', run: () => clipboard('select') },
    ]" @close="context = undefined" />
  </div>
</template>

<style scoped>
.terminal { height: 100%; display: flex; flex-direction: column; background: #1e1e1e; }
.terminal.light { background: #f0f3f8; color: #1d2837; }
.search { display: flex; align-items: center; gap: 5px; padding: 4px; overflow: auto; }
label { white-space: nowrap; }
.term-host { flex: 1; min-height: 0; padding: 4px; }
</style>
