// packages/backend/src/workspace/fileRoutes.ts
import { Router } from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireWorkspaceAccess } from '../middleware/requireWorkspaceAccess.js';
import { safeWorkspacePath } from './files.js';

const router = Router({ mergeParams: true });
router.use(requireAuth, requireWorkspaceAccess);

/** Senarai kandungan satu direktori (recursive ringan, 1 level) */
router.get('/files', async (req, res) => {
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

/** Baca kandungan satu fail */
router.get('/file', async (req, res) => {
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

/** Simpan kandungan fail (create jika belum wujud) */
router.put('/file', async (req, res) => {
  const rel = String(req.body?.path ?? '');
  const content = String(req.body?.content ?? '');
  if (!rel) return res.status(400).json({ error: 'path diperlukan' });
  try {
    const file = await safeWorkspacePath(req.session.userId!, req.params.workspaceId, rel);
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, content, 'utf8');
    const stat = await fs.stat(file);
    res.json({ ok: true, path: rel, mtime: stat.mtime.toISOString() });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

/** Cipta fail atau folder baharu */
router.post('/file', async (req, res) => {
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
router.delete('/file', async (req, res) => {
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
router.post('/rename', async (req, res) => {
  const from = String(req.body?.from ?? '');
  const to = String(req.body?.to ?? '');
  if (!from || !to) return res.status(400).json({ error: 'from dan to diperlukan' });
  try {
    const src = await safeWorkspacePath(req.session.userId!, req.params.workspaceId, from);
    const dst = await safeWorkspacePath(req.session.userId!, req.params.workspaceId, to);
    await fs.mkdir(path.dirname(dst), { recursive: true });
    await fs.rename(src, dst);
    res.json({ ok: true, from, to });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

export default router;