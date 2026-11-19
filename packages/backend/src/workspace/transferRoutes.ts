import express, { Router } from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import archiver from 'archiver';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireWorkspaceAccess } from '../middleware/requireWorkspaceAccess.js';
import { safeWorkspacePath } from './files.js';
import { maxArchiveBytes, safeExtractZip } from './zip.js';

const router = Router({ mergeParams: true });
router.use(requireAuth, requireWorkspaceAccess);
const upload = express.raw({ type: 'application/octet-stream', limit: maxArchiveBytes });

router.get<{ workspaceId: string }>('/archive', async (req, res, next) => {
  try {
    const root = await safeWorkspacePath(req.session.userId!, req.params.workspaceId, '');
    await fs.access(root);
    res.attachment('workspace.zip');
    const archive = archiver('zip');
    archive.directory(root, false);
    const stream = pipeline(archive, res);
    await Promise.all([stream, archive.finalize()]);
  } catch (error) {
    if (res.headersSent) res.destroy();
    else next(error);
  }
});

async function assignWorkspaceOwner(directory: string) {
  if (process.getuid?.() !== 0) return;
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) await assignWorkspaceOwner(target);
    else await fs.chown(target, 1000, 1000);
  }
  await fs.chown(directory, 1000, 1000);
}

router.post<{ workspaceId: string }>('/archive', upload, async (req, res) => {
  if (!Buffer.isBuffer(req.body) || !req.body.length) return res.status(400).json({ error: 'Fail ZIP diperlukan' });
  let staging: string | undefined;
  try {
    const root = await safeWorkspacePath(req.session.userId!, req.params.workspaceId, '');
    if ((await fs.readdir(root)).length) return res.status(409).json({ error: 'Import ZIP memerlukan workspace kosong' });
    staging = await fs.mkdtemp(path.join(path.dirname(root), '.import-'));
    await safeExtractZip(req.body, staging);
    await assignWorkspaceOwner(staging);
    await fs.chmod(staging, 0o755);
    // Keep the workspace root inode so an existing container bind mount remains valid.
    for (const entry of await fs.readdir(staging)) {
      await fs.cp(path.join(staging, entry), path.join(root, entry), {
        recursive: true, force: false, errorOnExist: true,
      });
    }
    await assignWorkspaceOwner(root);
    return res.json({ ok: true });
  } catch (error) {
    return res.status(400).json({ error: (error as Error).message });
  } finally {
    if (staging) await fs.rm(staging, { recursive: true, force: true }).catch(() => undefined);
  }
});

router.post<{ workspaceId: string }>('/upload', upload, async (req, res) => {
  const relative = String(req.query.path ?? '');
  if (!relative || !Buffer.isBuffer(req.body)) return res.status(400).json({ error: 'Fail dan laluan diperlukan' });
  try {
    const target = await safeWorkspacePath(req.session.userId!, req.params.workspaceId, relative);
    const file = await fs.open(target, 'wx');
    try {
      await file.writeFile(req.body);
      if (process.getuid?.() === 0) await file.chown(1000, 1000);
    } finally { await file.close(); }
    return res.status(201).json({ ok: true });
  } catch (error) {
    const failure = error as NodeJS.ErrnoException;
    return res.status(failure.code === 'EEXIST' ? 409 : 400).json({ error: failure.message });
  }
});

const imageTypes = new Map([
  ['.png', 'image/png'], ['.jpg', 'image/jpeg'], ['.jpeg', 'image/jpeg'],
  ['.gif', 'image/gif'], ['.webp', 'image/webp'], ['.avif', 'image/avif'],
]);

router.get<{ workspaceId: string }>('/image', async (req, res, next) => {
  const relative = String(req.query.path ?? '');
  const type = imageTypes.get(path.extname(relative).toLowerCase());
  if (!type) return res.sendStatus(415);
  try {
    const target = await safeWorkspacePath(req.session.userId!, req.params.workspaceId, relative);
    const file = await fs.open(target);
    try {
      const stat = await file.stat();
      if (!stat.isFile() || stat.size > maxArchiveBytes) return res.sendStatus(413);
      return res.type(type).set('Cache-Control', 'private, no-store').send(await file.readFile());
    } finally { await file.close(); }
  } catch (error) { return next(error); }
});

export default router;
