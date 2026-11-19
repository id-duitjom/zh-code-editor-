import unzipper from 'unzipper';
import path from 'node:path';
import fs from 'node:fs';
import { Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';

export const maxArchiveBytes = 32 * 1024 * 1024;
const maxExtractedBytes = 256 * 1024 * 1024;

export async function safeExtractZip(zip: string | Buffer, destDir: string) {
  const archive = await (typeof zip === 'string' ? unzipper.Open.file(zip) : unzipper.Open.buffer(zip));
  if (archive.files.length > 10000) throw new Error('ZIP mempunyai terlalu banyak fail');
  const root = path.resolve(destDir);
  let bytes = 0;
  for (const entry of archive.files) {
    const segments = entry.path.split('/').filter(Boolean);
    if (!segments.length || segments.length > 64 || entry.path.startsWith('/') ||
        /[\\\x00]/.test(entry.path) || segments.some(segment => segment === '.' || segment === '..')) {
      throw new Error('Laluan ZIP tidak sah');
    }
    const target = path.join(root, ...segments);
    if (entry.type === 'Directory') {
      await fs.promises.mkdir(target, { recursive: true });
    } else {
      await fs.promises.mkdir(path.dirname(target), { recursive: true });
      const limit = new Transform({
        transform(chunk: Buffer, _, done) {
          bytes += chunk.length;
          if (bytes > maxExtractedBytes) done(new Error('Kandungan ZIP melebihi had'));
          else done(null, chunk);
        },
      });
      await pipeline(entry.stream(), limit, fs.createWriteStream(target, { flags: 'wx' }));
    }
  }
}
