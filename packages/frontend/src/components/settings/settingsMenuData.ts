export type SettingsEntry = {
  id: string;
  label: string;
  shortcut?: string;
  divider?: boolean;
  children?: SettingsEntry[];
};

export const settingsMenuData: SettingsEntry[] = [
  { id: 'palette', label: 'Command Palette…', shortcut: 'Ctrl+Shift+P' },
  { id: 'profiles', label: 'Profiles' },
  { id: 'settings', label: 'Settings', shortcut: 'Ctrl+,' },
  { id: 'extensions', label: 'Extensions', shortcut: 'Ctrl+Shift+X' },
  { id: 'shortcuts', label: 'Keyboard Shortcuts', shortcut: 'Ctrl+K Ctrl+S' },
  { id: 'snippets', label: 'Snippets' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'themes', label: 'Themes', children: [
    { id: 'dark', label: 'Gelap' },
    { id: 'light', label: 'Terang' },
  ] },
  { id: 'density', label: 'Layout Density', children: [
    { id: 'comfortable', label: 'Selesa' },
    { id: 'compact', label: 'Padat' },
  ] },
  { id: 'backup', label: 'Backup and Sync Settings…', divider: true },
  { id: 'insiders', label: 'Switch to Insiders Version…', divider: true },
];
