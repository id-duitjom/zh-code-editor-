<!-- packages/frontend/src/components/terminal/MockTerminal.vue -->
<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue';

const input = ref('');
const commandInput = ref<HTMLInputElement>();
function focusInput() {
  commandInput.value?.focus();
}
const terminalRef = ref<HTMLElement | null>(null);
const history = ref<string[]>([
  'Welcome to ZH Code Studio Terminal (Simulation Mode)',
  'Type "help" to see available commands.',
  ''
]);
const commandHistory = ref<string[]>([]);
const historyIndex = ref(-1);
const prompt = 'developer@zhcode:/workspace$ ';

// Pilihan bentuk kursor
const cursorShape = ref<'block' | 'bar' | 'underline' | 'dot'>('block');
const cursorChar = { block: '█', bar: '|', underline: '_', dot: '●' };

const handleCommand = (cmd: string) => {
  const trimmed = cmd.trim();
  if (!trimmed) return;

  commandHistory.value.push(trimmed);
  historyIndex.value = commandHistory.value.length;
  history.value.push(`${prompt}${trimmed}`);

  const args = trimmed.split(' ');
  const baseCmd = args[0];

  switch (baseCmd) {
    case 'clear':
      history.value = [];
      return;
    case 'help':
      history.value.push('Available commands:', '  ls, pwd, clear, node -v, npm install, npm run dev, git status, git commit -m "msg"', '');
      break;
    case 'ls':
      history.value.push('src/  package.json  README.md  node_modules/', '');
      break;
    case 'npm':
      if (args[1] === 'install') history.value.push('added 124 packages in 2s', '');
      else if (args[1] === 'run') history.value.push('VITE ready in 345 ms', '➜ Local: http://localhost:5173/', '');
      break;
    case 'git':
      if (args[1] === 'status') history.value.push('On branch main', 'Changes not staged for commit:', '  modified:   src/App.vue', '');
      else if (args[1] === 'commit') history.value.push('[main 1a2b3c4] commit success', '');
      break;
    default:
      history.value.push(`bash: ${baseCmd}: command not found`, '');
      break;
  }
};

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    handleCommand(input.value);
    input.value = '';
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (historyIndex.value > 0) { historyIndex.value--; input.value = commandHistory.value[historyIndex.value]; }
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (historyIndex.value < commandHistory.value.length - 1) { historyIndex.value++; input.value = commandHistory.value[historyIndex.value]; }
    else { historyIndex.value = commandHistory.value.length; input.value = ''; }
  } else if (e.key === 'Tab') {
    e.preventDefault(); // Autocomplete ringkas
    const cmds = ['npm install', 'npm run dev', 'git status', 'git commit -m ""', 'clear', 'ls', 'pwd', 'help'];
    const match = cmds.find(c => c.startsWith(input.value));
    if (match) input.value = match;
  }
};

watch(history, () => {
  nextTick(() => { if (terminalRef.value) terminalRef.value.scrollTop = terminalRef.value.scrollHeight; });
}, { deep: true });

onMounted(focusInput);
</script>

<template>
  <div class="terminal-container" @click="focusInput">
    <!-- Toolbar Pilihan Kursor -->
    <div class="term-toolbar">
      <span class="term-label">bash</span>
      <div class="cursor-options">
        <label>Kursor:</label>
        <button @click="cursorShape = 'block'" :class="{ active: cursorShape === 'block' }">█ Block</button>
        <button @click="cursorShape = 'bar'" :class="{ active: cursorShape === 'bar' }">| Bar</button>
        <button @click="cursorShape = 'underline'" :class="{ active: cursorShape === 'underline' }">_ Underline</button>
        <button @click="cursorShape = 'dot'" :class="{ active: cursorShape === 'dot' }">● Dot</button>
      </div>
    </div>

    <div class="terminal-output" ref="terminalRef">
      <div v-for="(line, i) in history" :key="i" class="term-line">{{ line || '&nbsp;' }}</div>
      
      <div class="term-line input-line">
        <span class="prompt">{{ prompt }}</span>
        <span class="input-text">{{ input }}</span>
        <!-- Kursor Dinamik -->
        <span class="cursor" :class="`cursor-${cursorShape}`">{{ cursorChar[cursorShape] }}</span>
      </div>
    </div>
    
    <input ref="commandInput" v-model="input" @keydown="onKeydown" autocomplete="off" spellcheck="false" class="hidden-input" />
  </div>
</template>

<style scoped>
.terminal-container {
  height: 100%; background-color: #1e1e1e; color: #cccccc;
  font-family: 'Cascadia Code', 'Fira Code', Menlo, Monaco, monospace;
  font-size: 13px; padding: 0; overflow-y: auto; cursor: text;
  display: flex; flex-direction: column;
}
.term-toolbar {
  display: flex; justify-content: space-between; align-items: center;
  padding: 4px 12px; background: #252526; border-bottom: 1px solid #333;
  font-size: 12px; position: sticky; top: 0;
}
.term-label { color: #cccccc; }
.cursor-options { display: flex; gap: 4px; align-items: center; }
.cursor-options label { color: #888; margin-right: 4px; }
.cursor-options button {
  background: transparent; border: 1px solid transparent; color: #888;
  cursor: pointer; padding: 2px 6px; border-radius: 3px;
}
.cursor-options button:hover { background: #333; color: #fff; }
.cursor-options button.active { border-color: #007acc; color: #fff; }

.terminal-output { flex: 1; padding: 8px 12px; line-height: 1.4; overflow-y: auto; }
.term-line { white-space: pre-wrap; word-break: break-all; }
.prompt { color: #0dbc79; font-weight: bold; }
.input-line { display: flex; align-items: center; }
.input-text { color: #cccccc; white-space: pre; }

/* Animasi Kursor */
.cursor { display: inline-block; margin-left: 2px; font-weight: bold; }
.cursor-block { animation: blink 1s step-end infinite; }
.cursor-bar { animation: blink 1s step-end infinite; }
.cursor-underline { animation: blink 1s step-end infinite; }
.cursor-dot { animation: blink 1s step-end infinite; font-size: 10px; }

@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
.hidden-input { position: absolute; opacity: 0; pointer-events: none; width: 0; height: 0; }
</style>