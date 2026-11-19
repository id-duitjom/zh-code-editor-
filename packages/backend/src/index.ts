import express from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import helmet from 'helmet';
import cors from 'cors';
import { createServer } from 'node:http';
import { config } from './config.js';
import { pool } from './db/index.js';
import authRoutes from './auth/routes.js';
import workspaceRoutes from './workspace/routes.js';
import transferRoutes from './workspace/transferRoutes.js';
import gitRoutes from './git/routes.js';
import { attachTerminalWs } from './terminal/ws.js';
import { createPreviewProxy } from './workspace/previewProxy.js';
import { errorHandler } from './middleware/errorHandler.js';

const PgStore = connectPgSimple(session);
const app = express();

app.use(helmet());
app.use(cors({ origin: config.FRONTEND_ORIGIN, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());
const sessionMiddleware = session({
    store: new PgStore({ pool, tableName: 'user_sessions' }),
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: config.COOKIE_SECURE,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
});
app.use(sessionMiddleware);

app.get('/api/health', (_req, res) => res.sendStatus(204));
app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);
import fileRoutes from './workspace/fileRoutes.js';
app.use('/api/workspaces/:workspaceId', fileRoutes);
app.use('/api/workspaces/:workspaceId', transferRoutes);
app.use('/api/workspaces/:workspaceId/git', gitRoutes);

// Preview proxy mesti didaftarkan SEBELUM fallback
app.use(createPreviewProxy());

app.use(errorHandler);

const server = createServer(app);
attachTerminalWs(server, sessionMiddleware);

server.listen(config.PORT, () => {
  console.log(`ZH Code Studio backend listening on :${config.PORT}`);
});