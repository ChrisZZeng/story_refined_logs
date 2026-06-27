import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildPatchBundleFromPromptSources,
  createPromptSourceDiff,
} from '../../scripts/prompt-replay-workbench/patch-builder.mjs';

test('buildPatchBundleFromPromptSources only creates patches for dirty sources', () => {
  const bundle = buildPatchBundleFromPromptSources({
    bundleId: 'workbench-run-1',
    description: 'Workbench edits',
    sources: [
      {
        id: 'shared.system',
        originalText: 'system prompt',
        draftText: 'system prompt',
        dirty: false,
      },
      {
        id: 'narrator.v3-html tail',
        originalText: 'old narrator',
        draftText: 'new narrator',
        dirty: true,
      },
    ],
  });

  assert.deepEqual(bundle, {
    id: 'workbench-run-1',
    description: 'Workbench edits',
    patches: [
      {
        id: 'prompt-source-narrator-v3-html-tail',
        originalText: 'old narrator',
        replacementText: 'new narrator',
      },
    ],
  });
});

test('buildPatchBundleFromPromptSources treats changed text as dirty without dirty flag', () => {
  const bundle = buildPatchBundleFromPromptSources({
    bundleId: 'workbench-run-2',
    sources: [
      {
        id: 'choice.user',
        originalText: 'old choice',
        draftText: 'new choice',
      },
    ],
  });

  assert.deepEqual(bundle, {
    id: 'workbench-run-2',
    patches: [
      {
        id: 'prompt-source-choice-user',
        originalText: 'old choice',
        replacementText: 'new choice',
      },
    ],
  });
});

test('buildPatchBundleFromPromptSources preserves observed call field metadata without scoping the patch to source turn', () => {
  const bundle = buildPatchBundleFromPromptSources({
    bundleId: 'b',
    sources: [
      {
        id: 'turn-004.narrator.messages-2-content',
        patchMode: 'field',
        turn: 4,
        stage: 'narrator',
        callKind: 'streamText',
        fieldPath: 'messages[2].content',
        originalText: 'old observed prompt',
        draftText: 'edited observed prompt',
      },
    ],
  });

  assert.deepEqual(bundle.patches[0], {
    id: 'prompt-source-turn-004-narrator-messages-2-content',
    matchMode: 'field',
    sourceTurn: 4,
    stage: 'narrator',
    callKind: 'streamText',
    fieldPath: 'messages[2].content',
    originalText: 'old observed prompt',
    replacementText: 'edited observed prompt',
  });
});

test('buildPatchBundleFromPromptSources scopes turn-only observed fields to their source turn', () => {
  const bundle = buildPatchBundleFromPromptSources({
    bundleId: 'b',
    sources: [
      {
        id: 'turn-004.director.context',
        patchMode: 'field',
        patchScope: 'turn',
        turn: 4,
        stage: 'director',
        callKind: 'generateObject',
        fieldPath: 'messages[3].content',
        originalText: '<context>old</context>',
        draftText: '<context>new</context>',
      },
    ],
  });

  assert.equal(bundle.patches[0].sourceTurn, 4);
  assert.equal(bundle.patches[0].turn, 4);
});

test('buildPatchBundleFromPromptSources preserves slot-aware tag metadata', () => {
  const bundle = buildPatchBundleFromPromptSources({
    bundleId: 'b',
    sources: [
      {
        id: 'turn-004.director.player-input',
        patchMode: 'field',
        patchScope: 'all',
        preserveTags: ['player_input'],
        turn: 4,
        stage: 'director',
        callKind: 'generateObject',
        fieldPath: 'messages[4].content',
        originalText: '<player_input>go</player_input>\nold rules',
        draftText: '<player_input>go</player_input>\nnew rules',
      },
    ],
  });

  assert.equal(bundle.patches[0].sourceTurn, 4);
  assert.equal(bundle.patches[0].turn, undefined);
  assert.deepEqual(bundle.patches[0].preserveTags, ['player_input']);
});

test('buildPatchBundleFromPromptSources throws PATCH_BUNDLE_EMPTY when nothing changed', () => {
  assert.throws(
    () =>
      buildPatchBundleFromPromptSources({
        bundleId: 'empty-run',
        sources: [
          {
            id: 'shared.system',
            originalText: 'same',
            draftText: 'same',
          },
        ],
      }),
    (error) => {
      assert.equal(error.code, 'PATCH_BUNDLE_EMPTY');
      assert.match(error.message, /没有修改/);
      return true;
    },
  );
});

test('buildPatchBundleFromPromptSources throws PATCH_SOURCE_INVALID with source identity', () => {
  assert.throws(
    () =>
      buildPatchBundleFromPromptSources({
        bundleId: 'invalid-run',
        sources: [
          {
            id: 'director.system',
            originalText: 'old',
          },
        ],
      }),
    (error) => {
      assert.equal(error.code, 'PATCH_SOURCE_INVALID');
      assert.equal(error.sourceId, 'director.system');
      assert.equal(error.index, 0);
      assert.match(error.message, /draftText/);
      return true;
    },
  );
});

test('buildPatchBundleFromPromptSources rejects unavailable prompt sources', () => {
  assert.throws(
    () =>
      buildPatchBundleFromPromptSources({
        bundleId: 'invalid-run',
        sources: [
          {
            id: 'choice.system',
            originalText: '',
            draftText: 'new prompt',
            unavailable: true,
          },
        ],
      }),
    (error) => {
      assert.equal(error.code, 'PATCH_SOURCE_UNAVAILABLE');
      assert.equal(error.sourceId, 'choice.system');
      assert.equal(error.index, 0);
      assert.match(error.message, /unavailable/);
      return true;
    },
  );
});

test('createPromptSourceDiff returns line-level equal insert and delete segments', () => {
  const diff = createPromptSourceDiff({
    originalText: ['keep', 'remove', 'tail', ''].join('\n'),
    draftText: ['keep', 'insert', 'tail', ''].join('\n'),
  });

  assert.deepEqual(diff, [
    { type: 'equal', text: 'keep\n' },
    { type: 'delete', text: 'remove\n' },
    { type: 'insert', text: 'insert\n' },
    { type: 'equal', text: 'tail\n' },
  ]);
});
