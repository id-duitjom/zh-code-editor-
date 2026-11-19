<script setup lang="ts">
const paths = {
  menu: 'M3 6h18M3 12h18M3 18h18',
  explorer: 'M7 3h8l4 4v12H7zM3 7v14h12M15 3v5h4',
  search: 'M16 10a6 6 0 1 1-12 0 6 6 0 0 1 12 0Zm-2 4 6 6',
  git: 'M7 8v8m3-9h3a4 4 0 0 0 4-4M7 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm0 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm10-15a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z',
  debug: 'M8 8a4 4 0 0 1 8 0v7a4 4 0 0 1-8 0V8ZM9 4 7 2m8 2 2-2M4 8l4 2m8 0 4-2M4 14h4m8 0h4M5 20l3-3m8 0 3 3M8 11h8',
  extensions: 'M3 4h7v7H3zm11-1 5 2-2 6-5-2zM3 14h7v7H3zm11 0h7v7h-7z',
  github: 'M9 20c-4 1-4-2-6-2m12 4v-4c0-1-.3-2-1-2 3-.4 5-1.5 5-5 0-1-.5-2-1-3 .3-1 .2-2 0-3-2 0-3 1-4 1a13 13 0 0 0-4 0C9 6 8 5 6 5c-.2 1-.3 2 0 3-.5 1-1 2-1 3 0 3.5 2 4.6 5 5-.7.5-1 1-1 2v4',
  box: 'm3 7 9-4 9 4v10l-9 4-9-4Zm0 0 9 4 9-4m-9 4v10',
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2m12-13a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
  settings: 'm9 3 1-1h4l1 3 3 1 2-1 2 4-2 2v2l2 2-2 4-2-1-3 1-1 3h-4l-1-3-3-1-2 1-2-4 2-2v-2L2 9l2-4 2 1 3-1Zm6 9a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  plus: 'M12 5v14M5 12h14',
  split: 'M3 5h18v14H3zM12 5v14',
  expand: 'M9 4H4v5m11-5h5v5m0 6v5h-5m-6 0H4v-5',
  minimize: 'M5 12h14',
  close: 'm6 6 12 12M6 18 18 6',
  chevron: 'm6 9 6 6 6-6',
  dots: 'M5 12h1m5 0h1m5 0h1',
} as const;

defineProps<{ name: keyof typeof paths }>();
</script>

<template>
  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor"
    stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path :d="paths[name]" />
  </svg>
</template>
