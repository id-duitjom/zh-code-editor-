import { defineStore } from 'pinia';
import { api } from '../api/client';

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
}

export const useFileSystemStore = defineStore('fileSystem', {
  state: () => ({ directories: {} as Record<string, Record<string, FileNode[]>> }),
  actions: {
    async load(workspaceId: string, path = '') {
      const { data } = await api.get<{ items: FileNode[] }>(
        `/workspaces/${workspaceId}/files`, { params: { path } },
      );
      (this.directories[workspaceId] ??= {})[path] = data.items;
    },
  },
});
