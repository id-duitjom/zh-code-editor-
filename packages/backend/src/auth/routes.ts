import { Router } from 'express';
import argon2 from 'argon2';
import { z } from 'zod';
import { db } from '../db/index.js';
import { users, authTokens } from '../db/schema.js';
import { eq, and, isNull } from 'drizzle-orm';
import { sendMail } from './mailer.js';
import { newToken, hashToken } from './tokens.js';
import { authLimiter } from './rateLimit.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { config } from '../config.js';

const router = Router();
const registerSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

router.post('/register', authLimiter, async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });

  const { fullName, email, password } = parsed.data;
  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing.length) return res.status(409).json({ error: 'Email already registered' });

  const passwordHash = await argon2.hash(password);
  const [user] = await db.insert(users).values({ fullName, email, passwordHash }).returning();

  const { raw, hashed } = newToken();
  await db.insert(authTokens).values({
    userId: user.id, tokenHash: hashed, kind: 'verify_email',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });
  await sendMail({
    to: email, subject: 'Sahkan e-mel ZH Code Studio',
    html: `<p>Klik <a href="${config.APP_BASE_URL}/verify-email?token=${raw}">di sini</a> untuk mengesahkan e-mel.</p>`,
  });
  return res.status(201).json({ ok: true });
});

router.post('/verify-email', authLimiter, async (req, res) => {
  const token = String(req.body?.token ?? '');
  const hashed = hashToken(token);
  const [row] = await db.select().from(authTokens)
    .where(and(eq(authTokens.tokenHash, hashed), eq(authTokens.kind, 'verify_email'), isNull(authTokens.usedAt)))
    .limit(1);
  if (!row || row.expiresAt < new Date()) return res.status(400).json({ error: 'Token tidak sah atau telah luput' });

  await db.update(users).set({ emailVerified: true }).where(eq(users.id, row.userId));
  await db.update(authTokens).set({ usedAt: new Date() }).where(eq(authTokens.id, row.id));
  return res.json({ ok: true });
});

router.post('/signin', authLimiter, async (req, res) => {
  const { email, password } = req.body ?? {};
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user || !user.emailVerified) return res.status(401).json({ error: 'E-mel atau kata laluan salah, atau e-mel belum disahkan' });
  if (!(await argon2.verify(user.passwordHash, password))) return res.status(401).json({ error: 'E-mel atau kata laluan salah' });

  req.session.userId = user.id;
  return res.json({ user: { id: user.id, fullName: user.fullName, email: user.email } });
});

router.post('/signout', requireAuth, (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

router.get('/me', requireAuth, async (req, res) => {
  const [user] = await db.select().from(users).where(eq(users.id, req.session.userId!)).limit(1);
  return res.json({ user: { id: user.id, fullName: user.fullName, email: user.email } });
});

export default router;