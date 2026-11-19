<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue';
import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { SettingsMenu } from './SettingsMenu';

const emit = defineEmits<{ action: [id: string] }>();
const host = ref<HTMLElement>();
let root: Root | undefined;
onMounted(() => {
  root = createRoot(host.value!);
  root.render(createElement(SettingsMenu, { onAction: id => emit('action', id) }));
});
onBeforeUnmount(() => root?.unmount());
</script>

<template><div ref="host" /></template>
