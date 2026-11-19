import { Router } from 'express';
import fs from 'node:fs/promises';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db/index.js';
import { workspaces } from '../db/schema.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { safeWorkspacePath } from './files.js';

const router = Router();
const templates = {
  empty: {},
  'html-css-js': {
    'index.html': '<!doctype html>\n<html lang="en"><title>Workspace</title><link rel="stylesheet" href="style.css"><h1>Workspace</h1><script src="index.js"></script></html>\n',
    'style.css': 'body { font-family: system-ui; }\n',
    'index.js': 'console.log("Hello, workspace");\n',
  },
  'vue-vite': {
    'index.html': '<!doctype html>\n<html lang="en"><title>Vue Workspace</title><div id="app"></div><script type="module" src="/main.ts"></script></html>\n',
    'main.ts': 'import { createApp } from "vue";\nimport App from "./App.vue";\n\ncreateApp(App).mount("#app");\n',
    'App.vue': '<template><h1>Hello, workspace</h1></template>\n',
    'vite.config.ts': 'import { defineConfig } from "vite";\nimport vue from "@vitejs/plugin-vue";\n\nexport default defineConfig({ plugins: [vue()] });\n',
    'package.json': JSON.stringify({
      private: true, type: 'module',
      scripts: { dev: 'vite --host 0.0.0.0', build: 'vite build', preview: 'vite preview --host 0.0.0.0', start: 'vite preview --host 0.0.0.0' },
      dependencies: { vue: '^3.5.0' },
      devDependencies: { vite: '^6.0.0', '@vitejs/plugin-vue': '^5.2.0', typescript: '^5.6.0' },
    }, null, 2) + '\n',
  },
  node: {
    'index.js': 'console.log("Hello, workspace");\n',
    'package.json': '{ "private": true, "scripts": { "start": "node index.js", "dev": "node --watch index.js" } }\n',
  },
  python: { 'main.py': 'print("Hello, workspace")\n' },
};

const createSchema = z.object({
  name: z.string().trim().min(1).max(100),
  template: z.enum(['empty', 'html-css-js', 'vue-vite', 'node', 'python']),
});

router.use(requireAuth);
router.get('/', async (req, res, next) => {
  try {
    const items = await db.select().from(workspaces).where(eq(workspaces.userId, req.session.userId!));
    res.json({ workspaces: items });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  const input = createSchema.safeParse(req.body);
  if (!input.success) {
    res.status(400).json({ error: 'Nama atau templat workspace tidak sah' });
    return;
  }
  const userId = req.session.userId!;
  try {
    const workspace = await db.transaction(async (tx) => {
      const [created] = await tx.insert(workspaces).values({ userId, ...input.data }).returning();
      const root = await safeWorkspacePath(userId, created.id, '');
      await fs.mkdir(root, { recursive: true });
      if (process.getuid?.() === 0) await fs.chown(root, 1000, 1000);
      for (const [name, content] of Object.entries(templates[input.data.template])) {
        const file = await safeWorkspacePath(userId, created.id, name);
        await fs.writeFile(file, content, { flag: 'wx' });
        if (process.getuid?.() === 0) await fs.chown(file, 1000, 1000);
      }
      return created;
    });
    res.status(201).json({ workspace });
  } catch (error) {
    next(error);
  }
});

export default router;
