import { WebSocket, WebSocketServer } from 'ws';
import { ServerResponse, type Server } from 'node:http';
import type { Request, RequestHandler, Response } from 'express';
import { spawnWorkspacePty, workspaceShells, type WorkspaceShell } from './pty.js';
import { ensureWorkspaceContainer } from '../workspace/docker.js';
import { config } from '../config.js';
import { db } from '../db/index.js';
import { workspaces } from '../db/schema.js';
import { safeWorkspacePath } from '../workspace/files.js';
import path from 'node:path';
import fs from 'node:fs/promises';
import { eq, and } from 'drizzle-orm';

export function attachTerminalWs(server: Server, sessionMiddleware: RequestHandler) {
  const wss = new WebSocketServer({ noServer: true, maxPayload: 64 * 1024 });

  type TerminalSession = {
    term: ReturnType<typeof spawnWorkspacePty>;
    client?: WebSocket;
    replay: string;
    timer?: ReturnType<typeof setTimeout>;
    stop: () => void;
  };
  const sessions = new Map<string, TerminalSession>();
  const perWorkspaceLimit = 6;

  server.on('upgrade', async (req, socket, head) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    const match = /^\/ws\/terminal\/([0-9a-f-]{36})$/i.exec(url.pathname);
    if (!match) return;
    const [, workspaceId] = match;
    const sessionId = url.searchParams.get('session');
    if (sessionId && !/^[0-9a-f-]{36}$/i.test(sessionId)) { socket.destroy(); return; }
    const shell = url.searchParams.get('shell') ?? 'bash';
    if (req.headers.origin !== new URL(config.FRONTEND_ORIGIN).origin || !Object.hasOwn(workspaceShells, shell)) {
      socket.destroy();
      return;
    }

    const request = req as Request;
    try {
      await new Promise<void>((resolve, reject) => {
        sessionMiddleware(request, new ServerResponse(req) as Response, (error) => {
          if (error) reject(error);
          else resolve();
        });
      });
      const userId = request.session?.userId;
      if (!userId || socket.destroyed) { socket.destroy(); return; }

      const [workspace] = await db.select({ id: workspaces.id }).from(workspaces)
        .where(and(eq(workspaces.id, workspaceId), eq(workspaces.userId, userId)))
        .limit(1);
      if (!workspace) { socket.destroy(); return; }

      const folder = url.searchParams.get('cwd') ?? '';
      const root = await safeWorkspacePath(userId, workspaceId, '');
      const target = await safeWorkspacePath(userId, workspaceId, folder);
      if (!(await fs.stat(target)).isDirectory()) { socket.destroy(); return; }
      const cwd = path.posix.join('/workspace', path.relative(root, target));
      await ensureWorkspaceContainer(workspaceId, userId);
      if (socket.destroyed) return;
      wss.handleUpgrade(req, socket, head, (client) => {
        try {
          const prefix = `${userId}/${workspaceId}/`;
          const key = prefix + (sessionId ?? request.sessionID);
          let current = sessions.get(key);
          if (!current) {
            if ([...sessions.keys()].filter(id => id.startsWith(prefix)).length >= perWorkspaceLimit) {
              client.close(1008, 'Had sesi terminal dicapai');
              return;
            }
            const term = spawnWorkspacePty(workspaceId, 80, 24, shell as WorkspaceShell, cwd);
            const entry: TerminalSession = { term, replay: '', stop: () => cleanup(true) };
            const cleanup = (kill: boolean) => {
              if (sessions.get(key) !== entry) return;
              sessions.delete(key);
              clearTimeout(entry.timer);
              output.dispose();
              exit.dispose();
              entry.client?.close(1000, 'Sesi ditutup');
              if (kill) term.kill();
            };
            const output = term.onData(data => {
              entry.replay = (entry.replay + data).slice(-131072);
              if (entry.client?.readyState !== WebSocket.OPEN) return;
              if (entry.client.bufferedAmount > 1024 * 1024) entry.client.terminate();
              else entry.client.send(data);
            });
            const exit = term.onExit(() => cleanup(false));
            sessions.set(key, entry);
            current = entry;
          }
          const entry = current;
          const { term } = entry;
          clearTimeout(entry.timer);
          const previous = entry.client;
          entry.client = client;
          previous?.close(1000, 'Sambungan diganti');
          if (entry.replay) client.send(entry.replay);
          client.on('error', () => client.terminate());
          client.on('close', () => {
            if (entry.client !== client || sessions.get(key) !== entry) return;
            entry.client = undefined;
            entry.timer = setTimeout(entry.stop, config.WORKSPACE_IDLE_TIMEOUT_MS);
            entry.timer.unref();
          });
          client.on('message', (raw) => {
            if (entry.client !== client) return;
            const message = raw.toString();
            if (message === '\x01close') { entry.stop(); return; }
            if (!message.startsWith('\x01resize:')) {
              term.write(message);
              return;
            }
            const [, columns, lines] = message.split(':');
            const cols = Number(columns);
            const rows = Number(lines);
            if (Number.isInteger(cols) && cols > 0 && cols <= 500 &&
                Number.isInteger(rows) && rows > 0 && rows <= 300) {
              term.resize(cols, rows);
            }
          });
        } catch {
          client.close(1011, 'Terminal unavailable');
        }
      });
    } catch {
      socket.destroy();
    }
  });
}
