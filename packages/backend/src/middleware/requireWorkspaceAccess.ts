import { db } from '../db/index.js';
import { workspaces } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';

export async function requireWorkspaceAccess(req: any, res: any, next: any) {
  const { workspaceId } = req.params;
  const [ws] = await db.select().from(workspaces)
    .where(and(eq(workspaces.id, workspaceId), eq(workspaces.userId, req.session.userId)))
    .limit(1);
  if (!ws) return res.status(404).json({ error: 'Workspace tidak dijumpai atau akses ditolak' });
  req.workspace = ws;
  next();
}