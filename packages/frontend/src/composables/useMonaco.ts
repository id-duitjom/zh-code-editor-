import * as monaco from 'monaco-editor';

monaco.languages.register({ id: 'zh-script', extensions: ['.zh'], aliases: ['ZH Script'] });
monaco.languages.setMonarchTokensProvider('zh-script', {
  tokenizer: {
    root: [
      [/#.*$/, 'comment'],
      [/\b(?:let|print|task|run|if|else|end)\b/, 'keyword'],
      [/\b(?:true|false)\b/, 'constant'],
      [/\b\d+(?:\.\d+)?\b/, 'number'],
      [/"(?:[^"\\]|\\.)*"/, 'string'],
      [/[=+*-]/, 'operator'],
    ],
  },
});

export function detectLanguage(filename: string) {
  const languages: Record<string, string> = {
    js: 'javascript', jsx: 'javascript', mjs: 'javascript', cjs: 'javascript',
    ts: 'typescript', tsx: 'typescript', vue: 'html', html: 'html', htm: 'html',
    css: 'css', scss: 'scss', json: 'json', jsonc: 'json', md: 'markdown',
    py: 'python', php: 'php', sql: 'sql', yml: 'yaml', yaml: 'yaml', toml: 'ini',
    sh: 'shell', bash: 'shell', zsh: 'shell', ps1: 'powershell', bat: 'bat',
    cmd: 'bat', xml: 'xml', zh: 'zh-script',
  };
  const extension = filename.split('.').pop()?.toLowerCase() ?? '';
  return Object.hasOwn(languages, extension) ? languages[extension] : 'plaintext';
}
