import type { EditorTab } from './editor';

export function recoverTab(tab: EditorTab, serverContent: string): EditorTab {
  if (tab.content === tab.savedContent || tab.content === serverContent) {
    return { path: tab.path, content: serverContent, savedContent: serverContent };
  }
  return { ...tab, conflict: serverContent !== tab.savedContent };
}
