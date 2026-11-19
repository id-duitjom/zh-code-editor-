<script setup lang="ts">
import FileTreeItem from './FileTreeItem.vue';
import type { FileNode } from '../../stores/fileSystem';

defineProps<{
  directories: Record<string, FileNode[]>;
  expanded: Set<string>;
  selected: string;
  selectedPaths: Set<string>;
}>();
const emit = defineEmits<{ select: [FileNode] }>();
</script>

<template>
  <ul class="tree" aria-label="Workspace files">
    <FileTreeItem v-for="node in directories['']" :key="node.path" :node="node"
      :directories="directories" :expanded="expanded" :selected="selected" :selected-paths="selectedPaths"
      @select="emit('select', $event)" />
  </ul>
</template>

<style scoped>
.tree { margin: 0; padding: 0 4px; overflow: auto; flex: 1; }
</style>
