import { createProxyMiddleware } from 'http-proxy-middleware';
import { config } from '../config.js';

/**
 * Preview proxy pada origin berasingan.
 * Format: <workspaceId>.<PREVIEW_DOMAIN> → container port 5173/3000.
 * Tidak berkongsi cookie sesi utama kerana host berbeza.
 */
export function createPreviewProxy() {
  return createProxyMiddleware({
    target: 'http://placeholder',
    router: (req) => {
      const host = req.headers.host ?? '';
      if (!host.endsWith(config.PREVIEW_DOMAIN)) return undefined;
      const workspaceId = host.split('.')[0];
      return `http://zh-ws-${workspaceId}:5173`;
    },
    changeOrigin: true,
    ws: true,
    on: {
      proxyReq: (proxyReq, req) => {
        // Strip cookie sesi utama
        proxyReq.removeHeader('cookie');
      },
    },
  });
}