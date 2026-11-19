import type { RequestHandler } from 'express';
import { db } from '../db/index.js';
import { workspaces } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';

export const requireWorkspaceAccess: RequestHandler = async (req, res, next) => {
  const { workspaceId } = req.params;
  const denied = () => res.status(404).json({ error: 'Workspace tidak dijumpai atau akses ditolak' });
  if (!/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(workspaceId ?? '')) {
    denied();
    return;
  }

  try {
    const [workspace] = await db.select({ id: workspaces.id }).from(workspaces)
      .where(and(eq(workspaces.id, workspaceId), eq(workspaces.userId, req.session.userId!)))
      .limit(1);
    if (workspace) next();
    else denied();
  } catch (error) { next(error); }
};
