<script setup lang="ts">
import { ref } from 'vue';
import { api } from '../api/client';

const fullName = ref('');
const email = ref('');
const password = ref('');
const pending = ref(false);
const status = ref('');

async function register() {
  pending.value = true;
  try {
    await api.post('/auth/register', { fullName: fullName.value, email: email.value, password: password.value });
    status.value = 'Semak e-mel anda untuk mengesahkan akaun.';
  } catch {
    status.value = 'Pendaftaran gagal. Semak butiran anda dan cuba lagi.';
  } finally {
    pending.value = false;
  }
}
</script>

<template>
  <form @submit.prevent="register">
    <h1>Cipta akaun</h1>
    <label>Nama <input v-model="fullName" minlength="2" required autocomplete="name"></label>
    <label>E-mel <input v-model="email" type="email" required autocomplete="email"></label>
    <label>Kata laluan <input v-model="password" type="password" minlength="8" required autocomplete="new-password"></label>
    <button :disabled="pending">Daftar</button>
    <p role="status">{{ status }}</p>
    <RouterLink to="/signin">Log masuk</RouterLink>
  </form>
</template>
