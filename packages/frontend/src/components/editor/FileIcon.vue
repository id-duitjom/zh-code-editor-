<!-- packages/frontend/src/components/editor/FileIcon.vue -->
<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ filename: string; isFolder: boolean }>();

const fileInfo = computed(() => {
  if (props.isFolder) return { icon: '📁', color: '#dcb67a' }; // Warna folder VS Code

  const name = props.filename.toLowerCase();
  const ext = name.split('.').pop() || '';

  if (name === '.gitignore') return { icon: '👾', color: '#f14e32' };
  if (name === 'package.json') return { icon: '📦', color: '#cb3837' };
  
  const map: Record<string, { icon: string; color: string }> = {
    html: { icon: '🌐', color: '#e34c26' },
    vue: { icon: '💚', color: '#42b883' },
    js: { icon: '🟨', color: '#f1e05a' },
    ts: { icon: '🟦', color: '#3178c6' },
    css: { icon: '🎨', color: '#563d7c' },
    scss: { icon: '🎨', color: '#c6538c' },
    json: { icon: '🟨', color: '#cbcb41' },
    md: { icon: '📝', color: '#519aba' },
    py: { icon: '🐍', color: '#3572A5' },
    sh: { icon: '💻', color: '#89e051' },
    env: { icon: '🔑', color: '#e5e510' },
  };

  return map[ext] || { icon: '📄', color: '#cccccc' }; // Default fail biasa
});
</script>

<template>
  <span class="file-icon" :style="{ color: fileInfo.color }">
    {{ fileInfo.icon }}
  </span>
</template>

<style scoped>
.file-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  font-size: 14px;
  margin-right: 6px;
  filter: grayscale(20%) drop-shadow(0px 0px 1px rgba(0,0,0,0.5));
}
</style>