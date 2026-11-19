import { defineStore } from 'pinia';

export const shells = ['bash', 'sh', 'zsh', 'fish', 'pwsh'] as const;
export type Shell = typeof shells[number];

export const useTerminalStore = defineStore('terminal', {
  state: () => ({ shell: 'bash' as Shell }),
});
