<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { api } from '../api/client';

const route = useRoute();
const status = ref('');
const pending = ref(false);

async function verify() {
  pending.value = true;
  try {
    await api.post('/auth/verify-email', { token: route.query.token });
    status.value = 'E-mel disahkan. Anda boleh log masuk.';
  } catch {
    status.value = 'Pengesahan gagal. Pautan mungkin telah luput.';
  } finally {
    pending.value = false;
  }
}
</script>

<template>
  <main>
    <h1>Sahkan e-mel</h1>
    <button :disabled="pending || typeof route.query.token !== 'string'" @click="verify">Sahkan</button>
    <p role="status">{{ status }}</p>
    <RouterLink to="/signin">Log masuk</RouterLink>
  </main>
</template>
