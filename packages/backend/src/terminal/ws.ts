import { WebSocketServer } from 'ws';
import type { Server } from 'node:http';
import { spawnWorkspacePty } from './pty.js';
import { db } from '../db/index.js';
import { workspaces } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';

export function attachTerminalWs(server: Server) {
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', async (req, socket, head) => {
    const url = new URL(req.url!, 'http://localhost');
    if (!url.pathname.startsWith('/ws/terminal/')) return;

    const workspaceId = url.pathname.split('/').pop()!;
    const session = await getSessionFromCookie(req.headers.cookie);
    if (!session?.userId) { socket.destroy(); return; }

    const [ws] = await db.select().from(workspaces)
      .where(and(eq(workspaces.id, workspaceId), eq(workspaces.userId, session.userId)))
      .limit(1);
    if (!ws) { socket.destroy(); return; }

    wss.handleUpgrade(req, socket, head, (client) => {
      const term = spawnWorkspacePty(workspaceId, 80, 24);
      term.onData((data) => client.readyState === 1 && client.send(data));
      client.on('message', (raw) => {
        const msg = raw.toString();
        if (msg.startsWith('\x01resize:')) {
          const [, c, r] = msg.split(':');
          term.resize(Number(c), Number(r));
        } else {
          term.write(msg);
        }
      });
      client.on('close', () => term.kill());
    });
  });
}

async function getSessionFromCookie(cookieHeader?: string) {
  // Implementasi ringkas: gunakan express-session store untuk lookup
  // Dalam produksi, gunakan library `cookie` + `cookie-signature` + session store.
  return null as { userId?: string } | null;
}