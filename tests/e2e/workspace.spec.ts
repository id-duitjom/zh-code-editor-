import { expect, test, type Page } from '@playwright/test';

async function signIn(page: Page, user: string) {
  await page.goto('/signin');
  await page.getByLabel('Email').fill(`${user}@example.test`);
  await page.locator('input[autocomplete=current-password]').fill('Workspace-e2e-password');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByRole('heading', { name: 'Workspace Saya' })).toBeVisible();
}

test('edits, recovers drafts, resumes terminal and denies access to another account', async ({ page, browser }) => {
  await signIn(page, 'owner');
  const workspaceName = 'Editor E2E ' + Date.now();
  await page.getByPlaceholder('Nama workspace').fill(workspaceName);
  await page.locator('select').selectOption('node');
  await page.getByRole('button', { name: 'Cipta' }).click();
  await page.getByRole('link', { name: workspaceName }).click();
  await expect(page).toHaveURL(/\/workspace\/[a-f0-9-]{36}$/, { timeout: 15000 });
  const workspace = new URL(page.url()).pathname.split('/').at(-1)!;
  expect((await page.request.get('/api/workspaces/invalid/file?path=index.js')).status()).toBe(404);
  await page.locator('[data-file-path="index.js"]').click();
  const editor = page.locator('.monaco-editor textarea').first();
  await editor.focus();
  await page.keyboard.press('ControlOrMeta+a');
  await page.keyboard.insertText('console.log("saved");');
  await page.getByRole('button', { name: 'Simpan', exact: true }).click();
  await expect.poll(async () => {
    const result = await page.request.get(`/api/workspaces/${workspace}/file?path=index.js`);
    return (await result.json()).content;
  }).toBe('console.log("saved");');

  await editor.focus();
  await page.keyboard.press('ControlOrMeta+a');
  await page.keyboard.insertText('console.log("draft");');
  const terminal = page.locator('.xterm-helper-textarea').first();
  await expect(page.locator('.xterm-rows').first()).toContainText(/[$#]/, { timeout: 15000 });
  await terminal.focus();
  await page.keyboard.type("export ZH_SESSION_E2E=resumed");
  await page.keyboard.press('Enter');
  await expect(page.locator('.xterm-rows').first()).toContainText('ZH_SESSION_E2E=resumed');
  await page.reload();
  await expect(page.locator('.monaco-editor .view-lines').first()).toContainText('draft');
  await expect(page.locator('.xterm-rows').first()).toContainText('ZH_SESSION_E2E=resumed');
  await terminal.focus();
  await page.keyboard.type('echo "$ZH_SESSION_E2E"');
  await page.keyboard.press('Enter');
  await expect(page.locator('.xterm-rows > div').filter({ hasText: /^resumed\s*$/ })).toHaveCount(1);

  await page.getByRole('button', { name: 'Tetapan', exact: true }).click();
  await expect(page.getByRole('menuitem', { name: /Command Palette/ })).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('menuitem', { name: 'Profiles' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('menu')).toHaveCount(0);
  await page.locator('[data-file-path="index.js"]').click({ button: 'right' });
  await expect(page.getByRole('menuitem', { name: 'Copy Relative Path' })).toBeVisible();
  await page.keyboard.press('Escape');
  const fileRow = page.locator('[data-file-path="index.js"]');
  await fileRow.hover();
  await page.mouse.down();
  await expect(page.getByRole('menuitem', { name: 'Copy Path', exact: true })).toBeVisible();
  await page.mouse.up();
  await page.keyboard.press('Escape');

  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.evaluate(() => navigator.clipboard.writeText('echo terminal-clipboard-check'));
  await page.locator('.term-host').first().click({ button: 'right', position: { x: 5, y: 5 } });
  await page.getByRole('menuitem', { name: 'Paste', exact: true }).click();
  await terminal.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.xterm-rows > div').filter({ hasText: /^terminal-clipboard-check\s*$/ })).toHaveCount(1);

  await page.keyboard.press('ControlOrMeta+Shift+f');
  await page.getByRole('searchbox', { name: 'Cari fail, teks atau tindakan' }).fill('saved');
  await page.getByRole('button', { name: 'Cari', exact: true }).click();
  await expect(page.getByRole('button', { name: /index\.js:1/ })).toBeVisible();

  const update = await page.request.put(`/api/workspaces/${workspace}/file`, {
    data: { path: 'index.js', content: 'console.log("external");' },
  });
  expect(update.ok()).toBeTruthy();
  await page.reload();
  await expect(page.getByRole('alert').filter({ hasText: 'Draf anda masih ada' })).toBeVisible();
  await expect(page.locator('.monaco-editor .view-lines').first()).toContainText('draft');
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Ambil versi pelayan' }).click();
  await expect(page.locator('.monaco-editor .view-lines').first()).toContainText('external');

  const other = await browser.newPage({ baseURL: 'http://127.0.0.1:5173' });
  try {
    await signIn(other, 'other');
    const response = await other.request.get(`/api/workspaces/${workspace}/file?path=index.js`);
    expect(response.status()).toBe(404);
    expect((await other.request.get(`/api/workspaces/${workspace}/archive`)).status()).toBe(404);
  } finally { await other.close(); }
});

test('exports and reimports a workspace ZIP', async ({ page }) => {
  await signIn(page, 'owner');
  const create = async () => {
    const result = await page.request.post('/api/workspaces', { data: { name: 'ZIP E2E', template: 'empty' } });
    expect(result.status()).toBe(201);
    return '/api/workspaces/' + (await result.json()).workspace.id;
  };
  const source = await create();
  const target = await create();
  const saved = await page.request.put(source + '/file', { data: { path: 'src/index.txt', content: 'zip restore' } });
  expect(saved.ok()).toBeTruthy();
  const archive = await page.request.get(source + '/archive');
  expect(archive.ok()).toBeTruthy();
  const restored = await page.request.post(target + '/archive', {
    data: await archive.body(), headers: { 'Content-Type': 'application/octet-stream' },
  });
  expect(restored.ok()).toBeTruthy();
  const file = await page.request.get(target + '/file?path=src/index.txt');
  expect((await file.json()).content).toBe('zip restore');
});


test('shows a Git diff and stages only the selected file', async ({ page }) => {
  await signIn(page, 'owner');
  await page.getByPlaceholder('Nama workspace').fill('Git E2E ' + Date.now());
  await page.locator('select').selectOption('node');
  await page.getByRole('button', { name: 'Cipta' }).click();
  await page.getByRole('link', { name: /Git E2E/ }).first().click();
  await expect(page).toHaveURL(/\/workspace\/[a-f0-9-]{36}$/, { timeout: 15000 });
  const terminal = page.locator('.xterm-helper-textarea').first();
  await expect(page.locator('.xterm-rows').first()).toContainText(/[$#]/, { timeout: 15000 });
  await terminal.focus();
  await page.keyboard.type('git config --global --add safe.directory /workspace && git init');
  await page.keyboard.press('Enter');
  await expect(page.locator('.xterm-rows').first()).toContainText('Initialized empty Git repository');
  await page.getByRole('button', { name: 'Git', exact: true }).click();
  await page.getByRole('button', { name: 'Semak status Git' }).click();
  const file = page.locator('.git-row').filter({ hasText: 'index.js' });
  await file.getByRole('button', { name: 'index.js' }).click();
  await expect(page.locator('details pre')).toContainText('Hello, workspace');
  await file.getByRole('button', { name: 'Stage', exact: true }).click();
  await expect(file.getByRole('button', { name: 'Unstage', exact: true })).toBeVisible();
  await expect(page.locator('.git-row').filter({ hasText: 'package.json' }).getByRole('button', { name: 'Stage', exact: true })).toBeVisible();
});
