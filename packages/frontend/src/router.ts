import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from './stores/auth';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/signin', component: () => import('./views/SignIn.vue') },
    { path: '/register', component: () => import('./views/Register.vue') },
    { path: '/forgot-password', component: () => import('./views/ForgotPassword.vue') },
    { path: '/reset-password', component: () => import('./views/ResetPassword.vue') },
    { path: '/', component: () => import('./views/Dashboard.vue'), meta: { requiresAuth: true } },
    { path: '/workspace/:id', component: () => import('./views/Workspace.vue'), meta: { requiresAuth: true } },
  ],
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();
  if (auth.user === undefined) await auth.fetchMe();
  if (to.meta.requiresAuth && !auth.user) {
    return { path: '/signin', query: { redirect: to.fullPath } };
  }
});

export default router;