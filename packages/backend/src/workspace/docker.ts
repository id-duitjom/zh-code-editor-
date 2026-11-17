import Docker from 'dockerode';
import { config } from '../config.js';
import path from 'node:path';
import fs from 'node:fs/promises';

const docker = new Docker({ socketPath: config.DOCKER_SOCKET });

export async function ensureWorkspaceContainer(workspaceId: string, userId: string) {
  const name = `zh-ws-${workspaceId}`;
  const volumeDir = path.join(config.WORKSPACE_STORAGE_ROOT, userId, workspaceId);
  await fs.mkdir(volumeDir, { recursive: true });

  const existing = docker.getContainer(name);
  try {
    const info = await existing.inspect();
    if (info.State.Running) return existing;
    await existing.start();
    return existing;
  } catch {
    // create new
  }

  const container = await docker.createContainer({
    name,
    Image: config.WORKSPACE_IMAGE,
    Tty: true,
    OpenStdin: true,
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

export async function execInWorkspace(workspaceId: string, cmd: string[], opts?: { cwd?: string }) {
  const container = docker.getContainer(`zh-ws-${workspaceId}`);
  const exec = await container.exec({
    Cmd: cmd,
    AttachStdout: true,
    AttachStderr: true,
    WorkingDir: opts?.cwd ?? '/workspace',
  });
  const stream = await exec.start({ hijack: true, stdin: false });
  return new Promise<{ exitCode: number; output: string }>((resolve) => {
    let output = '';
    stream.on('data', (chunk: Buffer) => { output += chunk.toString(); });
    stream.on('end', async () => {
      const info = await exec.inspect();
      resolve({ exitCode: info.ExitCode ?? -1, output });
    });
  });
}

export { docker };