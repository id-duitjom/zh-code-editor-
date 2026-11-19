import argon2 from 'argon2';
import { config } from '../config.js';
import { db, pool } from './index.js';
import { users } from './schema.js';

if (config.NODE_ENV !== 'test') throw new Error('E2E seed requires NODE_ENV=test');

try {
  const passwordHash = await argon2.hash('Workspace-e2e-password');
  await db.insert(users).values(['owner', 'other'].map(name => ({
    email: `${name}@example.test`, fullName: name, passwordHash, emailVerified: true,
  }))).onConflictDoNothing();
} finally { await pool.end(); }
