import { Writable } from 'node:stream';
import Docker from 'dockerode';
import { config } from '../config.js';
import path from 'node:path';
import fs from 'node:fs/promises';

const docker = new Docker({ socketPath: config.DOCKER_SOCKET });

const pendingContainers = new Map<string, ReturnType<typeof startWorkspaceContainer>>();

export function ensureWorkspaceContainer(workspaceId: string, userId: string) {
  const pending = pendingContainers.get(workspaceId);
  if (pending) return pending;
  const startup = startWorkspaceContainer(workspaceId, userId).finally(() => {
    pendingContainers.delete(workspaceId);
  });
  pendingContainers.set(workspaceId, startup);
  return startup;
}

async function startWorkspaceContainer(workspaceId: string, userId: string) {
  const name = `zh-ws-${workspaceId}`;
  const volumeDir = path.join(config.WORKSPACE_STORAGE_ROOT, userId, workspaceId);
  await fs.mkdir(volumeDir, { recursive: true });

  const existing = docker.getContainer(name);
  try {
    const info = await existing.inspect();
    if (info.State.Running) return existing;
    await existing.start();
    return existing;
  } catch (error) {
    if ((error as { statusCode?: number }).statusCode !== 404) throw error;
  }

  const container = await docker.createContainer({
    name,
    Image: config.WORKSPACE_IMAGE,
    Tty: true,
    OpenStdin: true,
    Cmd: ['sleep', 'infinity'],
    WorkingDir: '/workspace',
    User: '1000:1000', // bukan root
    HostConfig: {
      Binds: [`${volumeDir}:/workspace`],
      Memory: config.WORKSPACE_MEMORY_BYTES,
      NanoCpus: config.WORKSPACE_NANO_CPUS,
      PidsLimit: 256,
      CapDrop: ['ALL'],
      SecurityOpt: ['no-new-privileges'],
      AutoRemove: false,
    },
  });
  await container.start();
  return container;
}

export async function stopWorkspaceContainer(workspaceId: string) {
  try {
    await docker.getContainer(`zh-ws-${workspaceId}`).stop({ t: 5 });
  } catch { /* ignore */ }
}

export async function execInWorkspace(workspaceId: string, cmd: string[], opts?: { cwd?: string; tty?: boolean }) {
  const container = docker.getContainer(`zh-ws-${workspaceId}`);
  const tty = opts?.tty ?? true;
  const exec = await container.exec({
    Cmd: cmd,
    Tty: tty,
    AttachStdout: true,
    AttachStderr: true,
    WorkingDir: opts?.cwd ?? '/workspace',
  });
  const stream = await exec.start({ hijack: true, stdin: false, Tty: tty });
  return new Promise<{ exitCode: number; output: string }>((resolve, reject) => {
    let output = '';
    const chunks: Buffer[] = [];
    let size = 0;
    const collect = (chunk: Buffer) => {
      const remaining = 2 * 1024 * 1024 - size;
      if (remaining <= 0) return;
      chunks.push(chunk.subarray(0, remaining));
      size += Math.min(remaining, chunk.length);
    };
    if (tty) stream.on('data', collect);
    else {
      const sink = new Writable({ write(chunk, _encoding, done) { collect(chunk); done(); } });
      container.modem.demuxStream(stream, sink, sink);
    }
    stream.on('error', reject);
    stream.on('end', async () => {
      try {
        const info = await exec.inspect();
        output = Buffer.concat(chunks).toString();
        resolve({ exitCode: info.ExitCode ?? -1, output });
      } catch (error) { reject(error); }
    });
  });
}

export { docker };