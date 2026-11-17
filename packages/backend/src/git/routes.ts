import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireWorkspaceAccess } from '../middleware/requireWorkspaceAccess.js';
import { execInWorkspace } from '../workspace/docker.js';

const router = Router({ mergeParams: true });
router.use(requireAuth, requireWorkspaceAccess);

router.post('/status', async (req, res) => {
  const r = await execInWorkspace(req.params.workspaceId, ['git', 'status', '--porcelain=v1', '-b']);
  res.json(r);
});

router.post('/commit', async (req, res) => {
  const message = String(req.body?.message ?? '').trim();
  if (!message) return res.status(400).json({ error: 'Mesej commit diperlukan' });
  const stage = await execInWorkspace(req.params.workspaceId, ['git', 'add', '-A']);
  if (stage.exitCode !== 0) return res.status(500).json(stage);
  const commit = await execInWorkspace(req.params.workspaceId, ['git', 'commit', '-m', message]);
  res.json(commit);
});

router.post('/push', async (req, res) => {
  const r = await execInWorkspace(req.params.workspaceId, ['git', 'push']);
  res.status(r.exitCode === 0 ? 200 : 400).json(r);
});

export default router;