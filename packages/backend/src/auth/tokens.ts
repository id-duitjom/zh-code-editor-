import { randomBytes, createHash } from 'node:crypto';

export function newToken() {
  const raw = randomBytes(32).toString('base64url');
  return { raw, hashed: hashToken(raw) };
}

export function hashToken(raw: string) {
  return createHash('sha256').update(raw).digest('hex');
}