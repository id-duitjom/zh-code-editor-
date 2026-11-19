<script setup lang="ts">
defineProps<{ path?: string; error: string }>();
</script>
<template>
  <footer v-if="path || error">
    <span v-if="path">{{ path.split('/').join(' › ') }}</span>
    <span v-if="error" role="alert">{{ error }}</span>
  </footer>
</template>
<style scoped>
footer { display: flex; flex-wrap: wrap; gap: 6px 16px; padding: 8px 12px; background: #252b35; }
[role="alert"] { color: #ffb6ad; }
</style>
