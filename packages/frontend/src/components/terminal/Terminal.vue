<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

const props = defineProps<{ workspaceId: string }>();
const host = ref<HTMLElement>();
let term: Terminal, fit: FitAddon, ws: WebSocket;

onMounted(() => {
  term = new Terminal({ cursorBlink: true, fontSize: 13 });
  fit = new FitAddon();
  term.loadAddon(fit);
  term.open(host.value!);
  fit.fit();

  ws = new WebSocket(`ws://${location.host}/ws/terminal/${props.workspaceId}`);
  ws.onmessage = (e) => term.write(e.data);
  term.onData((data) => ws.readyState === 1 && ws.send(data));

  const ro = new ResizeObserver(() => {
    fit.fit();
    ws.readyState === 1 && ws.send(`\x01resize:${term.cols}:${term.rows}`);
  });
  ro.observe(host.value!);
  onBeforeUnmount(() => { ro.disconnect(); ws.close(); term.dispose(); });
});
</script>
<template><div ref="host" class="term-host" /></template>
<style scoped>.term-host { height: 100%; background: #1e1e1e; padding: 4px; }</style>