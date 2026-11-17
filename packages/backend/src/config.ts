import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  FRONTEND_ORIGIN: z.string().url(),
  PREVIEW_DOMAIN: z.string(),
  SESSION_SECRET: z.string().min(32),
  COOKIE_SECURE: z.coerce.boolean().default(false),
  DATABASE_URL: z.string(),
  EMAIL_PROVIDER: z.enum(['resend', 'smtp']).default('resend'),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string(),
  APP_BASE_URL: z.string().url(),
  GITHUB_APP_ID: z.string().optional(),
  GITHUB_APP_PRIVATE_KEY_PATH: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  DOCKER_SOCKET: z.string().default('/var/run/docker.sock'),
  WORKSPACE_IMAGE: z.string().default('zhcode/workspace:latest'),
  WORKSPACE_IDLE_TIMEOUT_MS: z.coerce.number().default(1_800_000),
  WORKSPACE_MEMORY_BYTES: z.coerce.number().default(1_073_741_824),
  WORKSPACE_NANO_CPUS: z.coerce.number().default(1_000_000_000),
  WORKSPACE_STORAGE_ROOT: z.string().default('/data/workspaces'),
});

export const config = schema.parse(process.env);