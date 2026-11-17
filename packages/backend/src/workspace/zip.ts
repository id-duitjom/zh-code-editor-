import unzipper from 'unzipper';
import path from 'node:path';
import fs from 'node:fs';

/** Ekstrak ZIP dengan semakan Zip Slip. */
export async function safeExtractZip(zipPath: string, destDir: string) {
  const archive = await unzipper.Open.file(zipPath);
  const root = path.resolve(destDir);
  for (const entry of archive.files) {
    const target = path.resolve(root, entry.path);
    if (!target.startsWith(root + path.sep)) throw new Error('ZIP_SLIP_DETECTED');
    if (entry.type === 'Directory') {
      await fs.promises.mkdir(target, { recursive: true });
    } else {
      await fs.promises.mkdir(path.dirname(target), { recursive: true });
      await new Promise<void>((resolve, reject) => {
        entry.stream()
          .pipe(fs.createWriteStream(target))
          .on('finish', resolve)
          .on('error', reject);
      });
    }
  }
}