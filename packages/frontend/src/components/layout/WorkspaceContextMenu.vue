<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue';

const props = defineProps<{
  point: { x: number; y: number };
  items: { label: string; run: () => unknown; disabled?: boolean }[];
}>();
const emit = defineEmits<{ close: [] }>();
const menu = ref<HTMLDivElement>();
const previous = document.activeElement as HTMLElement | null;

function buttons() {
  return Array.from(menu.value?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? []);
}

function keyboard(event: KeyboardEvent) {
  const options = buttons();
  const active = options.findIndex(button => button === document.activeElement);
  if (event.key === 'Escape') {
    emit('close');
    previous?.focus();
  } else if (event.key === 'ArrowDown') {
    options[(active + 1) % options.length]?.focus();
  } else if (event.key === 'ArrowUp') {
    options[(active - 1 + options.length) % options.length]?.focus();
  } else if (event.key === 'Tab') {
    emit('close');
    return;
  } else return;
  event.preventDefault();
  event.stopPropagation();
}

function outside(event: PointerEvent) {
  if (event.target instanceof Node && !menu.value?.contains(event.target)) emit('close');
}

onMounted(() => {
  const current = menu.value!;
  current.style.left = `${Math.max(4, Math.min(props.point.x, innerWidth - current.offsetWidth - 4))}px`;
  current.style.top = `${Math.max(4, Math.min(props.point.y, innerHeight - current.offsetHeight - 4))}px`;
  buttons()[0]?.focus();
  document.addEventListener('pointerdown', outside);
});
onBeforeUnmount(() => document.removeEventListener('pointerdown', outside));
</script>

<template>
  <Teleport to="body">
    <div ref="menu" class="workspace-context" role="menu" aria-label="Tindakan" @keydown="keyboard" @contextmenu.prevent>
      <button v-for="item in items" :key="item.label" type="button" role="menuitem" :disabled="item.disabled"
        @click="emit('close'); item.run()">{{ item.label }}</button>
    </div>
  </Teleport>
</template>

<style scoped>
.workspace-context { position: fixed; z-index: 1100; min-width: 225px; max-width: calc(100vw - 8px); max-height: calc(100dvh - 8px); overflow: auto; padding: 5px; border: 1px solid #2d2d2d; border-radius: 10px; background: #181818; color: #eceef2; box-shadow: 0 10px 30px #0009; }
button { display: block; width: 100%; border: 0; border-radius: 5px; padding: 5px 10px; color: inherit; background: transparent; text-align: left; font: 13px system-ui; cursor: pointer; }
button:hover:not(:disabled), button:focus-visible { background: #22394f; outline: none; }
button:disabled { opacity: .5; cursor: default; }
</style>
