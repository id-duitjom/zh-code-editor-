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
  // Tolak symlink yang keluar dari root
  try {
    const real = await fs.realpath(target);
    if (!real.startsWith(root + path.sep) && real !== root) throw new Error('SYMLINK_ESCAPE');
  } catch (e: any) {
    if (e.code !== 'ENOENT') throw e;
  }
  return target;
}