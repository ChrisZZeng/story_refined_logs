import test from 'node:test';
import assert from 'node:assert/strict';

import {
  caseTurnSelection,
  promptTurnLoadState,
} from '../../scripts/prompt-replay-workbench/static/turn-selection.js';

test('caseTurnSelection changes review turn without requiring prompt reload', () => {
  const next = caseTurnSelection({
    selectedCaseTurn: 4,
    selectedPromptTurn: 4,
    nextTurn: 5,
    hasDirtyPromptEdits: true,
  });

  assert.deepEqual(next, {
    selectedCaseTurn: 5,
    selectedPromptTurn: 4,
    selectedRunIndex: 1,
    shouldLoadPromptSources: false,
    shouldConfirmDirtyPromptEdits: false,
  });
});

test('promptTurnLoadState asks for confirmation only when loading prompts would replace dirty drafts', () => {
  assert.deepEqual(promptTurnLoadState({
    selectedCaseTurn: 5,
    selectedPromptTurn: 4,
    hasDirtyPromptEdits: true,
  }), {
    canLoad: true,
    needsConfirmation: true,
    reason: 'dirty-drafts',
  });

  assert.deepEqual(promptTurnLoadState({
    selectedCaseTurn: 5,
    selectedPromptTurn: 4,
    hasDirtyPromptEdits: false,
  }), {
    canLoad: true,
    needsConfirmation: false,
    reason: 'different-turn',
  });

  assert.deepEqual(promptTurnLoadState({
    selectedCaseTurn: 5,
    selectedPromptTurn: 5,
    hasDirtyPromptEdits: false,
  }), {
    canLoad: false,
    needsConfirmation: false,
    reason: 'same-turn',
  });
});
