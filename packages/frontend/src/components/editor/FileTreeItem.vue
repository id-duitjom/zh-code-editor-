<script setup lang="ts">
import FileIcon from './FileIcon.vue';
import type { FileNode } from '../../stores/fileSystem';

defineProps<{
  node: FileNode;
  directories: Record<string, FileNode[]>;
  expanded: Set<string>;
  selected: string;
  selectedPaths: Set<string>;
}>();
const emit = defineEmits<{ select: [FileNode] }>();
</script>

<template>
  <li>
    <button type="button" class="row" :class="{ selected: node.path === selected || selectedPaths.has(node.path) }"
      :aria-pressed="node.path === selected || selectedPaths.has(node.path)"
      :aria-expanded="node.type === 'directory' ? expanded.has(node.path) : undefined"
      :data-file-path="node.path" @click="emit('select', node)">
      <span class="chevron">{{ node.type === 'directory' ? (expanded.has(node.path) ? '▾' : '▸') : '' }}</span>
      <FileIcon :filename="node.name" :is-folder="node.type === 'directory'" />
      {{ node.name }}
    </button>
    <ul v-if="node.type === 'directory' && expanded.has(node.path)">
      <FileTreeItem v-for="child in directories[node.path]" :key="child.path" :node="child"
        :directories="directories" :expanded="expanded" :selected="selected" :selected-paths="selectedPaths"
        @select="emit('select', $event)" />
    </ul>
  </li>
</template>

<style scoped>
li { list-style: none; }
ul { margin: 0; padding-left: 14px; }
.row { display: flex; align-items: center; width: 100%; text-align: left; padding: 4px; border: 0; background: transparent; color: inherit; cursor: pointer; }
.row:hover, .row.selected { background: #263c49; }
.chevron { flex: 0 0 16px; }
</style>
