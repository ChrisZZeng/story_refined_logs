import test from 'node:test';
import assert from 'node:assert/strict';

import {
  groupPromptSourcesByAccess,
  isEditablePromptSource,
} from '../../scripts/prompt-replay-workbench/static/prompt-source-access.js';

test('only system fields and player_input prompts are editable', () => {
  assert.equal(isEditablePromptSource({ fieldPath: 'system', originalText: 'system text' }), true);
  assert.equal(isEditablePromptSource({ label: 'Choice / System', originalText: 'system text' }), true);
  assert.equal(isEditablePromptSource({ label: 'Director / player_input', originalText: '<player_input />' }), true);
  assert.equal(isEditablePromptSource({ fieldPath: 'messages[0].content', originalText: '<player_input>\nhello\n</player_input>' }), true);
  assert.equal(isEditablePromptSource({ fieldPath: 'messages[0].content', originalText: '<world_setting>\nworld\n</world_setting>' }), false);
  assert.equal(isEditablePromptSource({ fieldPath: 'messages[1].content', originalText: '<context>\ncontext\n</context>' }), false);
  assert.equal(isEditablePromptSource({ fieldPath: 'prompt', originalText: 'plain prompt' }), false);
});

test('prompt sources are grouped with editable prompts first', () => {
  const sources = [
    { id: 'director-world', label: 'Director / world_setting', originalText: '<world_setting>x</world_setting>' },
    { id: 'director-system', label: 'Director / System', fieldPath: 'system', originalText: 'system' },
    { id: 'narrator-context', label: 'Narrator / context', originalText: '<context>x</context>' },
    { id: 'narrator-player', label: 'Narrator / player_input', fieldPath: 'messages[0].content', originalText: '<player_input>x</player_input>' },
  ];

  const groups = groupPromptSourcesByAccess(sources);

  assert.deepEqual(groups.map((group) => group.id), ['editable', 'view-only']);
  assert.deepEqual(groups[0].sources.map((source) => source.id), ['director-system', 'narrator-player']);
  assert.deepEqual(groups[1].sources.map((source) => source.id), ['director-world', 'narrator-context']);
});
