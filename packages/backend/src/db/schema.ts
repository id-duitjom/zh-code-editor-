import {
  pgTable, uuid, text, timestamp, boolean, jsonb, index,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  fullName: text('full_name').notNull(),
  passwordHash: text('password_hash').notNull(),
  emailVerified: boolean('email_verified').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable('user_sessions', {
  sid: text('sid').primaryKey(),
  sess: jsonb('sess').notNull(),
  expire: timestamp('expire', { withTimezone: true }).notNull(),
}, (t) => ({ expireIdx: index('IDX_session_expire').on(t.expire) }));

export const authTokens = pgTable('auth_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull().unique(),
  kind: text('kind').notNull(), // 'verify_email' | 'reset_password'
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  usedAt: timestamp('used_at', { withTimezone: true }),
}, (t) => ({ userIdx: index('auth_tokens_user_idx').on(t.userId) }));

export const workspaces = pgTable('workspaces', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  template: text('template').notNull(),
  containerId: text('container_id'),
  status: text('status').notNull().default('stopped'),
  lastActiveAt: timestamp('last_active_at', { withTimezone: true }).notNull().defaultNow(),
  layout: jsonb('layout').notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({ userIdx: index('workspaces_user_idx').on(t.userId) }));

export const githubConnections = pgTable('github_connections', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  installationId: text('installation_id').notNull(),
  encryptedToken: text('encrypted_token').notNull(),
  tokenExpiresAt: timestamp('token_expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});