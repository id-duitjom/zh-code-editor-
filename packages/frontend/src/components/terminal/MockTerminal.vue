<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue';

const input = ref('');
const terminalRef = ref<HTMLElement | null>(null);
const history = ref<string[]>([
  'Welcome to ZH Code Studio Terminal (Simulation Mode)',
  'Type "help" to see available hardcoded commands.',
  ''
]);
const commandHistory = ref<string[]>([]);
const historyIndex = ref(-1);
const currentPath = ref('/workspace');

const prompt = 'developer@zhcode:/workspace$ ';

// Fungsi untuk mengendalikan arahan yang di-hardcode
const handleCommand = (cmd: string) => {
  const trimmed = cmd.trim();
  if (!trimmed) return;

  // Simpan dalam sejarah arahan (untuk panah atas/bawah)
  commandHistory.value.push(trimmed);
  historyIndex.value = commandHistory.value.length;

  // Paparkan arahan yang ditaip
  history.value.push(`${prompt}${trimmed}`);
  const args = trimmed.split(' ');
  const baseCmd = args[0];

  switch (baseCmd) {
    case 'clear':
      history.value = [];
      return;

    case 'help':
      history.value.push(
        'Available simulated commands:',
        '  ls, pwd, clear',
        '  npm install, npm run dev',
        '  git status, git commit -m "msg", git remote -v, git clone <url>',
        '  sudo apt update, sudo apt install <pkg>',
        '  python3 --version, node --version',
        ''
      );
      break;

    case 'ls':
      history.value.push('src/  package.json  README.md  node_modules/  .gitignore', '');
      break;

    case 'pwd':
      history.value.push('/workspace', '');
      break;

    case 'node':
      if (args[1] === '--version' || args[1] === '-v') history.value.push('v20.11.0', '');
      else history.value.push('node: missing script', '');
      break;

    case 'python3':
      if (args[1] === '--version' || args[1] === '-v') history.value.push('Python 3.11.2', '');
      break;

    case 'npm':
      if (args[1] === 'install' || args[1] === 'i') {
        history.value.push(
          'npm warn deprecated inflight@1.0.6: This module is not supported.',
          'added 124 packages, and audited 125 packages in 2s',
          'found 0 vulnerabilities',
          ''
        );
      } else if (args[1] === 'run' && args[2] === 'dev') {
        history.value.push(
          '',
          '  VITE v5.0.0  ready in 345 ms',
          '',
          '  ➜  Local:   http://localhost:5173/',
          '  ➜  Network: use --host to expose',
          ''
        );
      } else {
        history.value.push(`npm: unknown command "${args[1]}"`, '');
      }
      break;

    case 'git':
      if (args[1] === 'status') {
        history.value.push(
          'On branch main',
          'Your branch is up to date with \'origin/main\'.',
          '',
          'Changes not staged for commit:',
          '  (use "git add <file>..." to update what will be committed)',
          '        modified:   src/App.vue',
          '',
          'no changes added to commit (use "git add" and/or "git commit -a")',
          ''
        );
      } else if (args[1] === 'commit') {
        const msgMatch = trimmed.match(/-m\s+["'](.+?)["']/);
        const msg = msgMatch ? msgMatch[1] : 'update';
        history.value.push(`[main 1a2b3c4] ${msg}`, ' 1 file changed, 2 insertions(+), 1 deletion(-)', '');
      } else if (args[1] === 'remote') {
        if (args[2] === '-v') {
          history.value.push(
            'origin  https://github.com/zhcode/example-repo.git (fetch)',
            'origin  https://github.com/zhcode/example-repo.git (push)',
            ''
          );
        } else {
          history.value.push('usage: git remote [-v | --verbose]', '');
        }
      } else if (args[1] === 'clone') {
        const repo = args[2] || 'repo';
        history.value.push(`Cloning into '${repo.split('/').pop()?.replace('.git', '')}'...`, 'remote: Enumerating objects: 105, done.', 'Receiving objects: 100% (105/105), done.', '');
      } else {
        history.value.push(`git: '${args[1]}' is not a git command. See 'git --help'.`, '');
      }
      break;

    case 'sudo':
      if (args[1] === 'apt') {
        if (args[2] === 'update') {
          history.value.push(
            'Hit:1 http://deb.debian.org/debian bookworm InRelease',
            'Get:2 http://security.debian.org/debian-security bookworm-security InRelease [48.0 kB]',
            'Fetched 48.0 kB in 1s (48.0 kB/s)',
            'Reading package lists... Done',
            'Building dependency tree... Done',
            'All packages are up to date.',
            ''
          );
        } else if (args[2] === 'install') {
          const pkg = args[3] || 'package';
          history.value.push(
            `Reading package lists... Done`,
            `Building dependency tree... Done`,
            `The following NEW packages will be installed:`,
            `  ${pkg}`,
            `0 upgraded, 1 newly installed, 0 to remove and 0 not upgraded.`,
            `Setting up ${pkg} ...`,
            ''
          );
        }
      } else if (args[1] === 'su') {
        history.value.push('sudo: must be setuid root', '');
      } else {
        history.value.push('usage: sudo <command>', '');
      }
      break;

    default:
      history.value.push(`bash: ${baseCmd}: command not found`, '');
      break;
  }
};

// Handle Keypress
const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    handleCommand(input.value);
    input.value = '';
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (historyIndex.value > 0) {
      historyIndex.value--;
      input.value = commandHistory.value[historyIndex.value];
    }
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (historyIndex.value < commandHistory.value.length - 1) {
      historyIndex.value++;
      input.value = commandHistory.value[historyIndex.value];
    } else {
      historyIndex.value = commandHistory.value.length;
      input.value = '';
    }
  } else if (e.key === 'l' && e.ctrlKey) {
    e.preventDefault();
    history.value = [];
  }
};

// Auto-scroll ke bawah
watch(history, () => {
  nextTick(() => {
    if (terminalRef.value) {
      terminalRef.value.scrollTop = terminalRef.value.scrollHeight;
    }
  });
}, { deep: true });

onMounted(() => {
  const inputEl = document.getElementById('hidden-input');
  if (inputEl) inputEl.focus();
});
</script>

<template>
  <div class="terminal-container" @click="() => (document.getElementById('hidden-input') as HTMLInputElement)?.focus()">
    <div class="terminal-output" ref="terminalRef">
      <div v-for="(line, i) in history" :key="i" class="term-line">{{ line || '&nbsp;' }}</div>
      
      <!-- Baris input aktif -->
      <div class="term-line input-line">
        <span class="prompt">{{ prompt }}</span>
        <span class="input-text">{{ input }}</span>
        <span class="cursor">█</span>
      </div>
    </div>
    
    <!-- Input tersembunyi untuk tangkap taipan keyboard -->
    <input
      id="hidden-input"
      v-model="input"
      @keydown="onKeydown"
      autocomplete="off"
      spellcheck="false"
      class="hidden-input"
    />
  </div>
</template>

<style scoped>
.terminal-container {
  height: 100%;
  background-color: #1e1e1e;
  color: #cccccc;
  font-family: 'Cascadia Code', 'Fira Code', Menlo, Monaco, 'Courier New', monospace;
  font-size: 13px;
  padding: 8px 12px;
  overflow-y: auto;
  cursor: text;
  line-height: 1.4;
}

.terminal-output {
  display: flex;
  flex-direction: column;
}

.term-line {
  white-space: pre-wrap;
  word-break: break-all;
}

.prompt {
  color: #0dbc79; /* Warna hijau terminal VS Code */
  font-weight: bold;
}

.input-line {
  display: flex;
  align-items: center;
}

.input-text {
  color: #cccccc;
}

.cursor {
  display: inline-block;
  width: 8px;
  height: 15px;
  background-color: #cccccc;
  animation: blink 1s step-end infinite;
  vertical-align: bottom;
  margin-left: 2px;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.hidden-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
  width: 0;
  height: 0;
}
</style>