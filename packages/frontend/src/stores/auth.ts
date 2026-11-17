import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '../api/client';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<null | { id: string; fullName: string; email: string }>(undefined as any);

  async function fetchMe() {
    try { user.value = (await api.get('/auth/me')).data.user; }
    catch { user.value = null; }
  }
  async function signin(email: string, password: string) {
    await api.post('/auth/signin', { email, password });
    await fetchMe();
  }
  async function signout() {
    await api.post('/auth/signout');
    user.value = null;
  }
  return { user, fetchMe, signin, signout };
});