import { test } from 'node:test';
import assert from 'node:assert/strict';
import { recoverTab } from '../src/stores/editorRecovery.ts';

const draft = { path: 'index.ts', content: 'draft', savedContent: 'base' };
test('preserves a draft and detects external changes', () => {
  assert.deepEqual(recoverTab(draft, 'external'), { ...draft, conflict: true });
});
test('updates a clean tab and recognizes an already saved draft', () => {
  assert.deepEqual(recoverTab({ ...draft, content: 'base' }, 'external'), {
    path: 'index.ts', content: 'external', savedContent: 'external',
  });
  assert.equal(recoverTab(draft, 'draft').savedContent, 'draft');
});
