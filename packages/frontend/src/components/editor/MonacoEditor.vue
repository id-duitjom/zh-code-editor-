<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
import * as monaco from 'monaco-editor';
import EditorWorker from 'monaco-editor/editor/editor.worker?worker';
import TsWorker from 'monaco-editor/language/typescript/ts.worker?worker';
import JsonWorker from 'monaco-editor/language/json/json.worker?worker';
import CssWorker from 'monaco-editor/language/css/css.worker?worker';
import HtmlWorker from 'monaco-editor/language/html/html.worker?worker';

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'typescript' || label === 'javascript') return new TsWorker();
    if (label === 'json') return new JsonWorker();
    if (label === 'css' || label === 'scss' || label === 'less') return new CssWorker();
    if (label === 'html') return new HtmlWorker();
    return new EditorWorker();
  },
};

const props = defineProps<{ modelValue: string; language: string; path: string }>();
const emit = defineEmits<{ 'update:modelValue': [string] }>();
const el = ref<HTMLElement>();
let editor: monaco.editor.IStandaloneCodeEditor | null = null;

onMounted(() => {
  editor = monaco.editor.create(el.value!, {
    value: props.modelValue,
    language: props.language,
    theme: 'vs-dark',
    automaticLayout: true,
    minimap: { enabled: true },
    fontSize: 14,
    tabSize: 2,
    wordWrap: 'off',
  });
  editor.onDidChangeModelContent(() => emit('update:modelValue', editor!.getValue()));
});

watch(() => props.language, (lang) => {
  const model = editor?.getModel();
  if (model) monaco.editor.setModelLanguage(model, lang);
});

onBeforeUnmount(() => editor?.dispose());
</script>
<template><div ref="el" class="monaco-host" /></template>
<style scoped>.monaco-host { width: 100%; height: 100%; }</style>