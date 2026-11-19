import { defineConfig } from '@playwright/test';

const baseURL = 'http://127.0.0.1:5173';
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60000,
  workers: 1,
  use: { baseURL, trace: 'retain-on-failure' },
  webServer: [
    { command: 'pnpm start', url: 'http://127.0.0.1:4000/api/health' },
    { command: 'pnpm --filter @zh/frontend preview --host 127.0.0.1 --port 5173 --strictPort', url: baseURL },
  ],
});
