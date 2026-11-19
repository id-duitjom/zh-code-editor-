// packages/backend/src/workspace/fileRoutes.ts
import { Router } from 'express';
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireWorkspaceAccess } from '../middleware/requireWorkspaceAccess.js';
import { safeWorkspacePath } from './files.js';
import { searchWorkspace } from './search.js';
import { z } from 'zod';
import { and, eq, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { workspaces } from '../db/schema.js';

const router = Router({ mergeParams: true });
router.use(requireAuth, requireWorkspaceAccess);

/** Senarai kandungan satu direktori (recursive ringan, 1 level) */
router.get<{ workspaceId: string }>('/files', async (req, res) => {
  const rel = String(req.query.path ?? '');
  try {
    const dir = await safeWorkspacePath(req.session.userId!, req.params.workspaceId, rel);
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const items = await Promise.all(
      entries
        .filter((e) => e.name !== 'node_modules' && e.name !== '.git')
        .map(async (e) => {
          const full = path.join(dir, e.name);
          const st = await fs.stat(full).catch(() => null);
          return {
            name: e.name,
            path: path.posix.join(rel, e.name),
            type: e.isDirectory() ? 'directory' : 'file',
            size: st?.size ?? 0,
            mtime: st?.mtime?.toISOString() ?? null,
          };
        })
    );
    items.sort((a, b) =>
      a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'directory' ? -1 : 1
    );
    res.json({ items });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.get<{ workspaceId: string }>('/search', async (req, res, next) => {
  const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  if (query.length < 2 || query.length > 200) {
    return res.status(400).json({ error: 'Carian mesti mempunyai 2 hingga 200 aksara' });
  }
  try {
    const folder = String(req.query.folder ?? '');
    const root = await safeWorkspacePath(req.session.userId!, req.params.workspaceId, folder);
    const results = await searchWorkspace(root, query);
    if (folder) {
      for (const match of results.matches) match.path = path.posix.join(folder, match.path);
    }
    return res.json(results);
  } catch (error) {
    return next(error);
  }
});

/** Baca kandungan satu fail */
router.get<{ workspaceId: string }>('/file', async (req, res) => {
  const rel = String(req.query.path ?? '');
  try {
    const file = await safeWorkspacePath(req.session.userId!, req.params.workspaceId, rel);
    const content = await fs.readFile(file, 'utf8');
    const stat = await fs.stat(file);
    res.json({ path: rel, content, mtime: stat.mtime.toISOString(), size: stat.size });
  } catch (e: any) {
    if (e.code === 'ENOENT') return res.status(404).json({ error: 'Fail tidak dijumpai' });
    res.status(400).json({ error: e.message });
  }
});

const pendingWrites = new Map<string, Promise<unknown>>();

/** Simpan kandungan fail (create jika belum wujud) */
router.put<{ workspaceId: string }>('/file', async (req, res) => {
  const rel = String(req.body?.path ?? '');
  const content = String(req.body?.content ?? '');
  if (!rel) return res.status(400).json({ error: 'path diperlukan' });
  try {
    const file = await safeWorkspacePath(req.session.userId!, req.params.workspaceId, rel);
    const { expectedContent, expectedHash } = req.body;
    const existing = pendingWrites.get(file) ?? Promise.resolve();
    const write = existing.catch(() => undefined).then(async () => {
      if (typeof expectedContent === 'string' || typeof expectedHash === 'string') {
        const current = await fs.readFile(file, 'utf8').catch(error => {
          if (error.code === 'ENOENT') return null;
          throw error;
        });
        const actual = current !== null && typeof expectedHash === 'string'
          ? createHash('sha256').update(current).digest('hex') : current;
        if (actual !== (expectedHash ?? expectedContent)) return null;
      }
      await fs.mkdir(path.dirname(file), { recursive: true });
      await fs.writeFile(file, content, 'utf8');
      return fs.stat(file);
    });
    pendingWrites.set(file, write);
    const stat = await write.finally(() => {
      if (pendingWrites.get(file) === write) pendingWrites.delete(file);
    });
    if (!stat) return res.status(409).json({ error: 'Fail di pelayan telah berubah' });
    res.json({ ok: true, path: rel, mtime: stat.mtime.toISOString() });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

/** Cipta fail atau folder baharu */
router.post<{ workspaceId: string }>('/file', async (req, res) => {
  const rel = String(req.body?.path ?? '');
  const type = req.body?.type === 'directory' ? 'directory' : 'file';
  if (!rel) return res.status(400).json({ error: 'path diperlukan' });
  try {
    const target = await safeWorkspacePath(req.session.userId!, req.params.workspaceId, rel);
    if (type === 'directory') {
      await fs.mkdir(target, { recursive: true });
    } else {
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, '', { flag: 'wx' }); // wx = gagal jika sudah wujud
    }
    res.status(201).json({ ok: true, path: rel, type });
  } catch (e: any) {
    if (e.code === 'EEXIST') return res.status(409).json({ error: 'Sudah wujud' });
    res.status(400).json({ error: e.message });
  }
});

/** Padam fail atau folder (recursive) */
router.delete<{ workspaceId: string }>('/file', async (req, res) => {
  const rel = String(req.query.path ?? '');
  if (!rel) return res.status(400).json({ error: 'path diperlukan' });
  try {
    const target = await safeWorkspacePath(req.session.userId!, req.params.workspaceId, rel);
    await fs.rm(target, { recursive: true, force: true });
    res.json({ ok: true });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

/** Rename / pindah */
router.post<{ workspaceId: string }>('/rename', async (req, res) => {
  const from = String(req.body?.from ?? '');
  const to = String(req.body?.to ?? '');
  if (!from || !to) return res.status(400).json({ error: 'from dan to diperlukan' });
  try {
    const src = await safeWorkspacePath(req.session.userId!, req.params.workspaceId, from);
    const dst = await safeWorkspacePath(req.session.userId!, req.params.workspaceId, to);
    try {
      await fs.lstat(dst);
      return res.status(409).json({ error: 'Nama destinasi sudah wujud' });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
    await fs.mkdir(path.dirname(dst), { recursive: true });
    await fs.rename(src, dst);
    res.json({ ok: true, from, to });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.post<{ workspaceId: string }>('/copy', async (req, res) => {
  const { from, to } = req.body ?? {};
  if (typeof from !== 'string' || typeof to !== 'string' || !from || !to) {
    return res.status(400).json({ error: 'Laluan sumber dan destinasi diperlukan' });
  }
  try {
    const src = await safeWorkspacePath(req.session.userId!, req.params.workspaceId, from);
    const dest = await safeWorkspacePath(req.session.userId!, req.params.workspaceId, to);
    if (src === dest || dest.startsWith(src + path.sep)) return res.sendStatus(409);
    const source = await fs.lstat(src);
    await fs.cp(src, dest, {
      recursive: source.isDirectory(), force: false, errorOnExist: true,
      filter: async entry => {
        const stat = await fs.lstat(entry);
        if (!stat.isDirectory() && !stat.isFile()) throw new Error('Jenis fail tidak disokong');
        return true;
      },
    });
    return res.status(201).json({ ok: true });
  } catch (error) {
    const failure = error as NodeJS.ErrnoException;
    return res.status(failure.code === 'EEXIST' ? 409 : 400).json({ error: failure.message });
  }
});

const settingsSchema = z.object({
  theme: z.enum(['dark', 'light']),
  density: z.enum(['comfortable', 'compact']),
  autoSave: z.boolean(),
  shell: z.enum(['bash', 'sh', 'zsh', 'fish', 'pwsh']),
  snippets: z.string().max(256 * 1024),
});

router.get<{ workspaceId: string }>('/settings', async (req, res, next) => {
  try {
    const [workspace] = await db.select({ layout: workspaces.layout }).from(workspaces)
      .where(and(eq(workspaces.id, req.params.workspaceId), eq(workspaces.userId, req.session.userId!)));
    const layout = workspace?.layout as { preferences?: unknown } | undefined;
    return res.json({ preferences: layout?.preferences ?? null });
  } catch (error) { return next(error); }
});

router.put<{ workspaceId: string }>('/settings', async (req, res, next) => {
  const input = settingsSchema.safeParse(req.body);
  if (!input.success) return res.status(400).json({ error: 'Tetapan workspace tidak sah' });
  try {
    await db.update(workspaces).set({
      layout: sql`jsonb_set(${workspaces.layout}, '{preferences}', ${JSON.stringify(input.data)}::jsonb, true)`,
    }).where(and(eq(workspaces.id, req.params.workspaceId), eq(workspaces.userId, req.session.userId!)));
    return res.sendStatus(204);
  } catch (error) { return next(error); }
});

export default router;