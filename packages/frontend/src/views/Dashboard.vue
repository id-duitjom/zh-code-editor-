<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { api } from '../api/client';
import { useAuthStore } from '../stores/auth';
const auth = useAuthStore();
const list = ref<any[]>([]); const name = ref(''); const template = ref('vue-vite');
const loading = ref(true); const error = ref('');

async function load() {
  loading.value = true;
  try { list.value = (await api.get('/workspaces')).data.workspaces; }
  catch (e: any) { error.value = 'Gagal memuatkan workspace'; }
  finally { loading.value = false; }
}
async function create() {
  await api.post('/workspaces', { name: name.value || 'Untitled', template: template.value });
  name.value = ''; await load();
}
onMounted(load);
</script>
<template>
  <div class="dash">
    <header>
      <h1>Workspace Saya</h1>
      <button @click="auth.signout()">Sign Out</button>
    </header>
    <section class="new">
      <h2>New Workspace</h2>
      <input v-model="name" placeholder="Nama workspace" />
      <select v-model="template">
        <option value="empty">Empty</option>
        <option value="html-css-js">HTML/CSS/JS</option>
        <option value="vue-vite">Vue + Vite</option>
        <option value="node">Node.js</option>
        <option value="python">Python</option>
      </select>
      <button @click="create">Cipta</button>
    </section>
    <p v-if="error" class="err">{{ error }}</p>
    <p v-if="loading">Memuatkan...</p>
    <ul v-else>
      <li v-for="w in list" :key="w.id">
        <router-link :to="`/workspace/${w.id}`">{{ w.name }}</router-link>
        <span class="status">{{ w.status }}</span>
      </li>
    </ul>
  </div>
</template>