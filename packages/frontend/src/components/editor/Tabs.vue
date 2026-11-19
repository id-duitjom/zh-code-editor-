<script setup lang="ts">
import FileIcon from './FileIcon.vue';
import type { EditorTab } from '../../stores/editor';

defineProps<{ tabs: EditorTab[]; activePath: string }>();
const emit = defineEmits<{ select: [string]; close: [EditorTab] }>();
</script>

<template>
  <div class="tabs" aria-label="Open files">
    <div v-for="tab in tabs" :key="tab.path" class="tab" :class="{ active: tab.path === activePath }">
      <button type="button" :title="tab.path" :aria-pressed="tab.path === activePath" @click="emit('select', tab.path)">
        <FileIcon :filename="tab.path" :is-folder="false" />
        {{ tab.path.split('/').pop() }}{{ tab.content !== tab.savedContent ? ' *' : '' }}
      </button>
      <button type="button" :aria-label="`Close ${tab.path}`" @click="emit('close', tab)">×</button>
    </div>
  </div>
</template>

<style scoped>
.tabs { display: flex; overflow: auto; min-width: 0; }
.tab { display: flex; flex-shrink: 0; border-top: 2px solid transparent; }
.tab.active { border-top-color: #3794ff; background: #1e1e1e; }
button { padding: 7px; border: 0; background: transparent; color: inherit; cursor: pointer; }
</style>
