<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const email = ref(''); const password = ref(''); const show = ref(false);
const loading = ref(false); const error = ref('');
const auth = useAuthStore(); const router = useRouter(); const route = useRoute();

async function submit() {
  loading.value = true; error.value = '';
  try {
    await auth.signin(email.value, password.value);
    router.replace(String(route.query.redirect ?? '/'));
  } catch (e: any) {
    error.value = e.response?.data?.error ?? 'Gagal sign in';
  } finally { loading.value = false; }
}
</script>
<template>
  <form class="auth-card" @submit.prevent="submit">
    <h1>ZH Code Studio</h1>
    <p v-if="error" class="err">{{ error }}</p>
    <label>Email<input v-model="email" type="email" required autocomplete="email" /></label>
    <label>Password
      <span class="pw"><input v-model="password" :type="show ? 'text' : 'password'" required autocomplete="current-password" />
      <button type="button" @click="show = !show">{{ show ? 'Hide' : 'Show' }}</button></span>
    </label>
    <button class="primary" :disabled="loading">{{ loading ? 'Menghantar...' : 'Sign In' }}</button>
    <router-link to="/register">Create Account</router-link>
  </form>
</template>