type IconName =
  | 'folder'
  | 'file'
  | 'html'
  | 'vue'
  | 'javascript'
  | 'typescript'
  | 'react'
  | 'readme'
  | 'css'
  | 'sass'
  | 'json'
  | 'markdown'
  | 'python'
  | 'php'
  | 'terminal'
  | 'environment'
  | 'git'
  | 'npm'
  | 'config'
  | 'image'
  | 'database'
  | 'lock';

interface FileInfo {
  icon: IconName;
  color: string;
}

const exactNames: Record<string, FileInfo> = {
  '.gitignore': { icon: 'git', color: '#F05032' },
  '.gitattributes': { icon: 'git', color: '#F05032' },
  '.gitmodules': { icon: 'git', color: '#F05032' },

  'readme.md': { icon: 'readme', color: '#70BFFF' },
  'package.json': { icon: 'npm', color: '#CB3837' },
  'package-lock.json': { icon: 'lock', color: '#CB3837' },
  'yarn.lock': { icon: 'lock', color: '#2C8EBB' },
  'pnpm-lock.yaml': { icon: 'lock', color: '#F9AD00' },
  'bun.lock': { icon: 'lock', color: '#E9D5BD' },
  'bun.lockb': { icon: 'lock', color: '#E9D5BD' },

  'dockerfile': { icon: 'config', color: '#2496ED' },
  'makefile': { icon: 'terminal', color: '#89E051' },
};

const extensionIcons: Record<string, FileInfo> = {
  html: { icon: 'html', color: '#E34F26' },
  htm: { icon: 'html', color: '#E34F26' },

  vue: { icon: 'vue', color: '#42B883' },

  js: { icon: 'javascript', color: '#F7DF1E' },
  mjs: { icon: 'javascript', color: '#F7DF1E' },
  cjs: { icon: 'javascript', color: '#F7DF1E' },

  ts: { icon: 'typescript', color: '#3178C6' },
  mts: { icon: 'typescript', color: '#3178C6' },
  cts: { icon: 'typescript', color: '#3178C6' },

  jsx: { icon: 'react', color: '#61DAFB' },
  tsx: { icon: 'typescript', color: '#3178C6' },

  css: { icon: 'css', color: '#663399' },
  scss: { icon: 'sass', color: '#CD6799' },
  sass: { icon: 'sass', color: '#CD6799' },

  json: { icon: 'json', color: '#E5C07B' },
  jsonc: { icon: 'json', color: '#E5C07B' },

  md: { icon: 'markdown', color: '#519ABA' },
  mdx: { icon: 'markdown', color: '#519ABA' },

  py: { icon: 'python', color: '#3776AB' },
  pyw: { icon: 'python', color: '#3776AB' },

  sh: { icon: 'terminal', color: '#89E051' },
  bash: { icon: 'terminal', color: '#89E051' },
  zsh: { icon: 'terminal', color: '#89E051' },
  ps1: { icon: 'terminal', color: '#5391FE' },
  bat: { icon: 'terminal', color: '#89E051' },
  cmd: { icon: 'terminal', color: '#89E051' },

  env: { icon: 'environment', color: '#ECD53F' },

  yaml: { icon: 'config', color: '#CB171E' },
  yml: { icon: 'config', color: '#CB171E' },
  toml: { icon: 'config', color: '#9C7B65' },
  ini: { icon: 'config', color: '#AAB2BF' },

  svg: { icon: 'image', color: '#FFB13B' },
  png: { icon: 'image', color: '#A074C4' },
  jpg: { icon: 'image', color: '#A074C4' },
  jpeg: { icon: 'image', color: '#A074C4' },
  webp: { icon: 'image', color: '#A074C4' },
  gif: { icon: 'image', color: '#A074C4' },
  ico: { icon: 'image', color: '#A074C4' },

  php: { icon: 'php', color: '#8892BF' },
  zh: { icon: 'terminal', color: '#A78BFA' },
  sql: { icon: 'database', color: '#E5C07B' },
  sqlite: { icon: 'database', color: '#54AEFF' },
  db: { icon: 'database', color: '#54AEFF' },

  lock: { icon: 'lock', color: '#AAB2BF' },
};

export function getFileIcon(filename: string, isFolder: boolean): FileInfo {
  if (isFolder) {
    return { icon: 'folder', color: '#DCB67A' };
  }

  const name =
    filename.replace(/\\/g, '/').split('/').pop()?.toLowerCase() ?? '';

  const exactMatch = Object.hasOwn(exactNames, name) ? exactNames[name] : undefined;

  if (exactMatch) {
    return exactMatch;
  }

  if (name === '.env' || name.startsWith('.env.')) {
    return { icon: 'environment', color: '#ECD53F' };
  }

  if (/(?:^|\.)config(?:\.|$)/.test(name)) return { icon: 'config', color: '#A78BFA' };

  const extension = name.includes('.') ? name.split('.').pop() ?? '' : '';

  return Object.hasOwn(extensionIcons, extension) ? extensionIcons[extension] : {
    icon: 'file',
    color: '#AAB2BF',
  };
}
