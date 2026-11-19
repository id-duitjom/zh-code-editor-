<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
import * as monaco from 'monaco-editor';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import TsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import CssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import HtmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'typescript' || label === 'javascript') return new TsWorker();
    if (label === 'json') return new JsonWorker();
    if (label === 'css' || label === 'scss' || label === 'less') return new CssWorker();
    if (label === 'html') return new HtmlWorker();
    return new EditorWorker();
  },
};

const props = defineProps<{ modelValue: string; language: string; path: string; theme?: string }>();
const emit = defineEmits<{ 'update:modelValue': [string]; save: [] }>();
const el = ref<HTMLElement>();
let editor: monaco.editor.IStandaloneCodeEditor | null = null;

onMounted(() => {
  editor = monaco.editor.create(el.value!, {
    value: props.modelValue,
    language: props.language,
    theme: props.theme === 'light' ? 'vs' : 'vs-dark',
    automaticLayout: true,
    minimap: { enabled: true },
    fontSize: 14,
    tabSize: 2,
    wordWrap: 'off',
  });
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => emit('save'));
  editor.onDidChangeModelContent(() => emit('update:modelValue', editor!.getValue()));
});

watch(() => props.modelValue, value => {
  if (editor && editor.getValue() !== value) editor.setValue(value);
});
watch(() => props.theme, theme => monaco.editor.setTheme(theme === 'light' ? 'vs' : 'vs-dark'));

watch(() => props.language, (lang) => {
  const model = editor?.getModel();
  if (model) monaco.editor.setModelLanguage(model, lang);
});

defineExpose({
  outline: () => {
    editor?.focus();
    editor?.trigger('workspace', 'editor.action.quickOutline', undefined);
  },
  goToLine: (line: number) => {
    editor?.revealLineInCenter(line);
    editor?.setPosition({ lineNumber: line, column: 1 });
    editor?.focus();
  },
});

onBeforeUnmount(() => {
  const model = editor?.getModel();
  editor?.dispose();
  model?.dispose();
});
</script>
<template><div ref="el" class="monaco-host" /></template>
<style scoped>.monaco-host { width: 100%; height: 100%; }</style>