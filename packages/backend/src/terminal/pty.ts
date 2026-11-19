import * as pty from 'node-pty';
import { config } from '../config.js';
import { docker } from '../workspace/docker.js';

export const workspaceShells = {
  bash: '/bin/bash',
  sh: '/bin/sh',
  zsh: '/usr/bin/zsh',
  fish: '/usr/bin/fish',
  pwsh: '/usr/bin/pwsh',
} as const;

export type WorkspaceShell = keyof typeof workspaceShells;

/** Spawn PTY dalam container melalui docker exec -it. */
export function spawnWorkspacePty(workspaceId: string, cols: number, rows: number, shell: WorkspaceShell, cwd = '/workspace') {
  const container = docker.getContainer(`zh-ws-${workspaceId}`);
  return pty.spawn('docker', [
    '--host', `unix://${config.DOCKER_SOCKET}`, 'exec', '-it', '-e', 'TERM=xterm-256color', '-w', cwd, container.id, workspaceShells[shell],
  ], { name: 'xterm-256color', cols, rows, env: process.env as any });
}
