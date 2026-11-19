import { defineStore } from 'pinia';

export interface EditorTab {
  path: string;
  content: string;
  savedContent: string;
  conflict?: boolean;
}

export const useEditorStore = defineStore('editor', {
  state: () => ({
    workspaces: {} as Record<string, { tabs: EditorTab[]; activePath: string }>,
  }),
});
