<!-- packages/frontend/src/components/editor/FileIcon.vue -->
<script setup lang="ts">
import { computed } from 'vue';

import { getFileIcon } from '../../utils/fileIcons';

const props = defineProps<{
  filename: string;
  isFolder: boolean;
}>();

const fileInfo = computed(() => getFileIcon(props.filename, props.isFolder));
</script>

<template>
  <svg
    class="file-icon"
    :style="{ color: fileInfo.color }"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.7"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <!-- Folder -->
    <g v-if="fileInfo.icon === 'folder'">
      <path d="M2 7a2 2 0 0 1 2-2h5l2 2h9a2 2 0 0 1 2 2v10H2Z" fill="currentColor" fill-opacity=".22" />
      <path d="M2 10h20" />
    </g>
    <!-- HTML -->
    <g v-else-if="fileInfo.icon === 'html'">
      <path d="m4 3 1.5 16L12 21l6.5-2L20 3Z" fill="currentColor" stroke="none" />
      <path d="M16 7H8l.5 4h7l-.5 5-3 1-3-1-.2-2" stroke="#FFF" />
    </g>
    <!-- Vue -->
    <g v-else-if="fileInfo.icon === 'vue'" stroke="none">
      <path d="M1 4h5l6 10 6-10h5L12 23Z" fill="currentColor" />
      <path d="M6 4h4l2 3.5L14 4h4l-6 10Z" fill="#35495E" />
    </g>
    <!-- JS / TS -->
    <g v-else-if="fileInfo.icon === 'javascript' || fileInfo.icon === 'typescript'" stroke="none">
      <rect x="2" y="2" width="20" height="20" rx="2" fill="currentColor" />
      <text x="12" y="17.5" text-anchor="middle" font-family="Arial, sans-serif" font-size="11.5" font-weight="700" :fill="fileInfo.icon === 'javascript' ? '#202020' : '#FFF'">
        {{ fileInfo.icon === 'javascript' ? 'JS' : 'TS' }}
      </text>
    </g>
    <!-- React -->
    <g v-else-if="fileInfo.icon === 'react'" stroke-width="1.4">
      <circle cx="12" cy="12" r="1.8" fill="currentColor" stroke="none" />
      <ellipse cx="12" cy="12" rx="10.5" ry="4" />
      <ellipse cx="12" cy="12" rx="10.5" ry="4" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="10.5" ry="4" transform="rotate(120 12 12)" />
    </g>
    <!-- CSS -->
    <g v-else-if="fileInfo.icon === 'css'">
      <rect x="2" y="2" width="20" height="20" rx="4" fill="currentColor" stroke="none" />
      <text x="12" y="16" fill="#FFF" stroke="none" text-anchor="middle" font-family="Arial, sans-serif" font-size="8.5" font-weight="700">CSS</text>
    </g>
    <!-- Sass -->
    <g v-else-if="fileInfo.icon === 'sass'">
      <path d="M19 6C16 2 5 4 5 8c0 3 11 2 11 6 0 3-7 7-10 4-2-2 1-5 4-4 3 1 3 6 7 5" stroke-width="2.2" />
    </g>
    <!-- JSON -->
    <g v-else-if="fileInfo.icon === 'json'">
      <path d="M9 3H7v6l-3 3 3 3v6h2" />
      <path d="M15 3h2v6l3 3-3 3v6h-2" />
      <circle cx="12" cy="9" r=".9" fill="currentColor" stroke="none" />
      <circle cx="12" cy="15" r=".9" fill="currentColor" stroke="none" />
    </g>
    <g v-else-if="fileInfo.icon === 'readme'">
      <path d="M12 19c-3-2-5-2-10-2V5c5 0 7 0 10 2 3-2 5-2 10-2v12c-5 0-7 0-10 2Zm0 0V7" />
    </g>
    <!-- Markdown -->
    <g v-else-if="fileInfo.icon === 'markdown'">
      <rect x="1.5" y="5" width="21" height="14" rx="2" />
      <path d="M5 15V9l3 3 3-3v6M17 9v6m-2-2 2 2 2-2" />
    </g>
    <!-- Python -->
    <g v-else-if="fileInfo.icon === 'python'" stroke="none">
      <path d="M12 2C6 2 7 5 7 5v3h6v1H5s-3 0-3 5 3 5 3 5h2v-3s0-3 3-3h5s3 0 3-3V5s0-3-6-3Z" fill="#3776AB" />
      <path d="M12 22c6 0 5-3 5-3v-3h-6v-1h8s3 0 3-5-3-5-3-5h-2v3s0 3-3 3H9s-3 0-3 3v5s0 3 6 3Z" fill="#FFD343" />
      <circle cx="10" cy="5.5" r="1" fill="#FFF" />
      <circle cx="14" cy="18.5" r="1" fill="#FFF" />
    </g>
    <g v-else-if="fileInfo.icon === 'php'" stroke="none">
      <path fill="currentColor" d="M7 6a5 5 0 0 0-5 5v3l-1 2 1 1 2-2v4h3l.4-4H11l.5 4H15v-5h2v1.5a3.5 3.5 0 0 0 7 0V14h-2v1.5a1.5 1.5 0 0 1-3 0V11a5 5 0 0 0-5-5Z" />
      <circle cx="16.5" cy="9.5" r="1" fill="#161522" />
      <path d="M12 8c-2 0-3.5 1.4-3.5 3s1.5 3 3.5 3" stroke="#161522" stroke-width="1.2" />
    </g>
    <!-- Terminal -->
    <g v-else-if="fileInfo.icon === 'terminal'">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m6 9 3 3-3 3m6 0h5" />
    </g>
    <!-- Environment -->
    <g v-else-if="fileInfo.icon === 'environment'">
      <circle cx="8" cy="9" r="4" />
      <path d="m11 12 9 9m-4-4 3-3m-6 0 3-3" />
    </g>
    <!-- Git -->
    <g v-else-if="fileInfo.icon === 'git'">
      <rect x="4.5" y="4.5" width="15" height="15" rx="1.5" transform="rotate(45 12 12)" fill="currentColor" stroke="none" />
      <path d="M9 5v11m0-8 6 6" stroke="#FFF" />
      <g fill="#FFF" stroke="none">
        <circle cx="9" cy="8" r="1.5" />
        <circle cx="9" cy="16" r="1.5" />
        <circle cx="15" cy="14" r="1.5" />
      </g>
    </g>
    <!-- NPM -->
    <g v-else-if="fileInfo.icon === 'npm'">
      <rect x="2" y="2" width="20" height="20" rx="1" fill="currentColor" stroke="none" />
      <path d="M7 17V7h10v10h-3V10h-4v7Z" fill="#FFF" stroke="none" />
    </g>
    <!-- Config -->
    <g v-else-if="fileInfo.icon === 'config'">
      <path d="M5 3v18M12 3v18M19 3v18" />
      <g fill="currentColor" stroke="none">
        <rect x="2" y="6" width="6" height="4" rx="1" />
        <rect x="9" y="14" width="6" height="4" rx="1" />
        <rect x="16" y="8" width="6" height="4" rx="1" />
      </g>
    </g>
    <!-- Image -->
    <g v-else-if="fileInfo.icon === 'image'">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8" cy="8" r="1.5" />
      <path d="m3 17 5-5 4 4 4-6 5 7" />
    </g>
    <!-- Database -->
    <g v-else-if="fileInfo.icon === 'database'">
      <ellipse cx="12" cy="5" rx="8" ry="3" />
      <path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" />
    </g>
    <!-- Lock -->
    <g v-else-if="fileInfo.icon === 'lock'">
      <rect x="5" y="10" width="14" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      <path d="M12 15v2" />
    </g>
    <!-- Default File -->
    <g v-else>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6M8 13h8M8 17h6" />
    </g>
  </svg>
</template>

<style scoped>
.file-icon {
  display: inline-block;
  flex: 0 0 16px;
  width: 16px;
  height: 16px;
  margin-right: 6px;
  vertical-align: middle;
  overflow: hidden;
  pointer-events: none;
  user-select: none;
}
</style>