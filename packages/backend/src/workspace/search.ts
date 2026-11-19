import { constants } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';

const excluded = new Set(['.git', 'node_modules', '.venv', 'dist', '.next']);
const maxEntries = 12_000;
const maxFileBytes = 256 * 1024;
const maxMatches = 200;
const maxSearchBytes = 32 * 1024 * 1024;

export async function searchWorkspace(root: string, query: string) {
  const matches: { path: string; line: number; preview: string }[] = [];
  const needle = query.toLowerCase();
  let scanned = 0;
  let bytesScanned = 0;

  async function scan(directoryPath: string, folder: string, depth: number) {
    if (depth > 64) return;
    const directory = await fs.open(directoryPath, constants.O_DIRECTORY | constants.O_NOFOLLOW).catch(() => undefined);
    if (!directory) return;
    try {
      const descriptor = `/proc/self/fd/${directory.fd}`;
      const entries = await fs.opendir(descriptor);
      for await (const entry of entries) {
        if (++scanned > maxEntries || bytesScanned >= maxSearchBytes || matches.length >= maxMatches) break;
        const relative = path.join(folder, entry.name);
        const entryPath = path.join(descriptor, entry.name);
        if (entry.isDirectory() && !excluded.has(entry.name)) {
          await scan(entryPath, relative, depth + 1);
        }
        if (!entry.isFile()) continue;
        if (relative.toLowerCase().includes(needle)) matches.push({ path: relative, line: 0, preview: '' });
        const file = await fs.open(entryPath, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK)
          .catch(() => undefined);
        if (!file) continue;
        try {
          const stat = await file.stat();
          if (!stat.isFile() || stat.size > maxFileBytes) continue;
          if (bytesScanned + stat.size > maxSearchBytes) {
            bytesScanned = maxSearchBytes;
            break;
          }
          const buffer = Buffer.alloc(stat.size);
          const { bytesRead } = await file.read(buffer);
          bytesScanned += bytesRead;
          const data = buffer.subarray(0, bytesRead);
          if (data.includes(0)) continue;
          const lines = data.toString('utf8').split(/\r?\n/);
          for (const [index, line] of lines.entries()) {
            if (matches.length >= maxMatches) break;
            const start = line.toLowerCase().indexOf(needle);
            if (start >= 0) matches.push({
              path: relative,
              line: index + 1,
              preview: line.slice(Math.max(0, start - 40), start + Math.max(100, needle.length)).trim(),
            });
          }
        } finally {
          await file.close();
        }
      }
    } finally {
      await directory.close();
    }
  }
  await scan(root, '', 0);
  return { matches, limited: scanned >= maxEntries || bytesScanned >= maxSearchBytes || matches.length >= maxMatches };
}
