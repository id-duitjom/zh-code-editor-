import path from 'node:path';
import fs from 'node:fs/promises';
import { config } from '../config.js';

/** Sahkan path kekal dalam workspace, tolak traversal & symlink. */
export async function safeWorkspacePath(userId: string, workspaceId: string, relative: string) {
  const root = path.resolve(config.WORKSPACE_STORAGE_ROOT, userId, workspaceId);
  const target = path.resolve(root, relative);
  if (!target.startsWith(root + path.sep) && target !== root) {
    throw new Error('PATH_TRAVERSAL');
  }
  let current = target;
  while (true) {
    try {
      if ((await fs.lstat(current)).isSymbolicLink()) throw new Error('SYMLINK_NOT_ALLOWED');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
    if (current === root) break;
    current = path.dirname(current);
  }
  if (relative && target === root) throw new Error('WORKSPACE_ROOT_REQUIRED');
  return target;
}
