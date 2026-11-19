import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireWorkspaceAccess } from '../middleware/requireWorkspaceAccess.js';
import { ensureWorkspaceContainer, execInWorkspace } from '../workspace/docker.js';

const router = Router({ mergeParams: true });
router.use(requireAuth, requireWorkspaceAccess);
router.use(async (req, _res, next) => {
  try {
    await ensureWorkspaceContainer(req.params.workspaceId, req.session.userId!);
    next();
  } catch (error) { next(error); }
});

router.post<{ workspaceId: string }>('/changes', async (req, res, next) => {
  try {
    const commands = [
      ['git', 'diff', '--name-only', '-z', '--no-renames'],
      ['git', 'diff', '--cached', '--name-only', '-z', '--no-renames'],
      ['git', 'ls-files', '--others', '--exclude-standard', '-z'],
    ];
    const [worktree, staged, untracked] = await Promise.all(
      commands.map(command => execInWorkspace(req.params.workspaceId, command, { tty: false })),
    );
    const failure = [worktree, staged, untracked].find(result => result.exitCode !== 0);
    if (failure) return res.status(400).json(failure);
    const paths = (output: string) => output.split('\0').filter(Boolean);
    return res.json({ worktree: paths(worktree.output), staged: paths(staged.output), untracked: paths(untracked.output) });
  } catch (error) { return next(error); }
});

router.post<{ workspaceId: string }>('/change', async (req, res, next) => {
  const { path, action } = req.body ?? {};
  if (typeof path !== 'string' || !path || path.includes('\0') || !['stage', 'unstage', 'diff', 'staged-diff', 'untracked-diff'].includes(action)) {
    return res.status(400).json({ error: 'Tindakan Git atau laluan tidak sah' });
  }
  const args = action === 'stage' ? ['add', '-A']
    : action === 'unstage' ? ['rm', '--cached', '-r', '--ignore-unmatch']
    : action === 'untracked-diff' ? ['diff', '--no-index', '--no-ext-diff', '--no-textconv', '--', '/dev/null', './' + path]
    : ['diff', '--no-ext-diff', '--no-textconv', ...(action === 'staged-diff' ? ['--cached'] : [])];
  try {
    const workspace = req.params.workspaceId;
    if (action === 'unstage') {
      const head = await execInWorkspace(workspace, ['git', 'rev-parse', '--verify', 'HEAD']);
      if (head.exitCode === 0) args.splice(0, args.length, 'reset', '-q', 'HEAD');
    }
    const command = ['git', '--literal-pathspecs', ...args];
    if (action !== 'untracked-diff') command.push('--', path);
    const result = await execInWorkspace(workspace, command, { tty: false });
    return res.status(result.exitCode === 0 || (action === 'untracked-diff' && result.exitCode === 1) ? 200 : 400).json(result);
  } catch (error) { return next(error); }
});

router.post<{ workspaceId: string }>('/status', async (req, res, next) => {
  try {
    const result = await execInWorkspace(req.params.workspaceId, ['git', 'status', '--porcelain=v1', '-b']);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post<{ workspaceId: string }>('/commit', async (req, res, next) => {
  const message = String(req.body?.message ?? '').trim();
  if (!message) return res.status(400).json({ error: 'Mesej commit diperlukan' });
  try {
    if (req.body?.stageAll !== false) {
      const stage = await execInWorkspace(req.params.workspaceId, ['git', 'add', '-A']);
      if (stage.exitCode !== 0) return res.status(500).json(stage);
    }
    const commit = await execInWorkspace(req.params.workspaceId, ['git', 'commit', '-m', message]);
    res.json(commit);
  } catch (error) {
    next(error);
  }
});

router.post<{ workspaceId: string }>('/push', async (req, res) => {
  const r = await execInWorkspace(req.params.workspaceId, ['git', 'push']);
  res.status(r.exitCode === 0 ? 200 : 400).json(r);
});

export default router;
