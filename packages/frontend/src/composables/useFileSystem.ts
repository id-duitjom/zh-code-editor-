import { api } from '../api/client';
import type { FileNode } from '../stores/fileSystem';

export function useFileSystem(workspaceId: () => string) {
  const base = () => `/workspaces/${workspaceId()}`;

  return {
    async read(path: string) {
      const { data } = await api.get<{ content: string }>(`${base()}/file`, { params: { path } });
      return data.content;
    },
    async write(path: string, content: string, expectedContent?: string) {
      const endpoint = `${base()}/file`;
      if (expectedContent !== undefined && crypto.subtle) {
        const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(expectedContent));
        const expectedHash = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
        await api.put(endpoint, { path, content, expectedHash });
      } else {
        await api.put(endpoint, { path, content, expectedContent });
      }
    },
    async create(path: string, type: FileNode['type']) {
      await api.post(`${base()}/file`, { path, type });
    },
    async rename(from: string, to: string) {
      await api.post(`${base()}/rename`, { from, to });
    },
    async remove(path: string) {
      await api.delete(`${base()}/file`, { params: { path } });
    },
  };
}
