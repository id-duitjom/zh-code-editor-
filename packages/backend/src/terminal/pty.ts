import * as pty from 'node-pty';
import { docker } from '../workspace/docker.js';

/** Spawn PTY dalam container melalui docker exec -it. */
export function spawnWorkspacePty(workspaceId: string, cols: number, rows: number) {
  const container = docker.getContainer(`zh-ws-${workspaceId}`);
  // node-pty menjalankan `docker exec -it ... /bin/bash`
  return pty.spawn('docker', [
    'exec', '-it', '-w', '/workspace', container.id, '/bin/bash',
  ], { name: 'xterm-256color', cols, rows, env: process.env as any });
}