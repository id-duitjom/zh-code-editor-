<script setup lang="ts">
defineProps<{ title: string }>();
</script>

<template>
  <aside class="sidebar">
    <header>{{ title }}</header>
    <slot />
  </aside>
</template>
<style scoped>
.sidebar { width: min(280px, 36vw); display: flex; flex-direction: column; background: #252b35; border-right: 1px solid #394352; }
header { padding: 8px 12px; }
</style>
