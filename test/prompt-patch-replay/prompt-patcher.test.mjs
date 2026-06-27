import test from 'node:test';
import assert from 'node:assert/strict';

import {
  applyAvailablePatchesToCall,
  applyPatchBundleToCall,
  assertAllPatchesApplied,
} from '../../scripts/prompt-patch-replay/prompt-patcher.mjs';

const bundle = {
  id: 'b',
  patches: [
    {
      id: 'p',
      originalText: 'old paragraph',
      replacementText: 'new paragraph',
    },
  ],
};

test('applies a patch to a message content and records field path', () => {
  const result = applyPatchBundleToCall({
    patchBundle: bundle,
    stage: 'narrator',
    callKind: 'streamText',
    params: { messages: [{ role: 'user', content: 'before old paragraph after' }] },
  });

  assert.equal(result.params.messages[0].content, 'before new paragraph after');
  assert.equal(result.applications[0].fieldPath, 'messages[0].content');
  assert.equal(result.applications[0].stage, 'narrator');
  assert.match(result.applications[0].originalHash, /^sha256:/);
});

test('applies a patch to system text', () => {
  const result = applyPatchBundleToCall({
    patchBundle: bundle,
    stage: 'director',
    callKind: 'generateObject',
    params: { system: 'old paragraph', prompt: 'prompt stays' },
  });

  assert.equal(result.params.system, 'new paragraph');
  assert.equal(result.params.prompt, 'prompt stays');
  assert.equal(result.applications[0].fieldPath, 'system');
});

test('fails when patch is not found', () => {
  assert.throws(
    () =>
      applyPatchBundleToCall({
        patchBundle: bundle,
        stage: 'director',
        callKind: 'generateObject',
        params: { prompt: 'no match' },
      }),
    /not found/,
  );
});

test('fails when patch is found more than once', () => {
  assert.throws(
    () =>
      applyPatchBundleToCall({
        patchBundle: bundle,
        stage: 'choice',
        callKind: 'generateObject',
        params: { prompt: 'old paragraph old paragraph' },
      }),
    /multiple matches/,
  );
});

test('skips patches that are not present in the current call', () => {
  const result = applyAvailablePatchesToCall({
    patchBundle: bundle,
    appliedPatchIds: new Set(),
    stage: 'director',
    callKind: 'generateObject',
    params: { prompt: 'no match in this call' },
  });

  assert.equal(result.params.prompt, 'no match in this call');
  assert.deepEqual(result.applications, []);
});

test('applies an available patch once across a call chain and validates bundle coverage', () => {
  const appliedPatchIds = new Set();
  const first = applyAvailablePatchesToCall({
    patchBundle: bundle,
    appliedPatchIds,
    stage: 'director',
    callKind: 'generateObject',
    params: { prompt: 'no match in director' },
  });
  first.applications.forEach((application) => appliedPatchIds.add(application.patchId));

  const second = applyAvailablePatchesToCall({
    patchBundle: bundle,
    appliedPatchIds,
    stage: 'narrator',
    callKind: 'streamText',
    params: { prompt: 'before old paragraph after' },
  });
  second.applications.forEach((application) => appliedPatchIds.add(application.patchId));

  assert.equal(second.params.prompt, 'before new paragraph after');
  assert.doesNotThrow(() => assertAllPatchesApplied({ patchBundle: bundle, applications: second.applications }));
});

test('fails bundle coverage when a patch is never applied in the call chain', () => {
  assert.throws(
    () => assertAllPatchesApplied({ patchBundle: bundle, applications: [] }),
    /not applied/,
  );
});

test('propagates an already-applied patch into downstream inherited prompt text', () => {
  const result = applyAvailablePatchesToCall({
    patchBundle: bundle,
    appliedPatchIds: new Set(['p']),
    stage: 'narrator',
    callKind: 'streamText',
    params: { messages: [{ role: 'user', content: 'old paragraph appears again' }] },
  });

  assert.equal(result.params.messages[0].content, 'new paragraph appears again');
  assert.equal(result.applications[0].patchId, 'p');
  assert.equal(result.applications[0].propagated, true);
  assert.equal(result.applications[0].fieldPath, 'messages[0].content');
});

test('fails bundle coverage when only propagated applications exist', () => {
  assert.throws(
    () =>
      assertAllPatchesApplied({
        patchBundle: bundle,
        applications: [{ patchId: 'p', propagated: true }],
      }),
    /not applied/,
  );
});

test('does not apply a patch match created by an earlier replacement', () => {
  const patchBundle = {
    id: 'b',
    patches: [
      { id: 'p1', originalText: 'alpha', replacementText: 'beta' },
      { id: 'p2', originalText: 'beta', replacementText: 'gamma' },
    ],
  };
  const result = applyAvailablePatchesToCall({
    patchBundle,
    appliedPatchIds: new Set(),
    stage: 'director',
    callKind: 'generateObject',
    params: { prompt: 'alpha only' },
  });

  assert.equal(result.params.prompt, 'beta only');
  assert.deepEqual(
    result.applications.map((application) => application.patchId),
    ['p1'],
  );
  assert.throws(
    () => assertAllPatchesApplied({ patchBundle, applications: result.applications }),
    /p2/,
  );
});

test('fails when an earlier replacement removes another original match', () => {
  const patchBundle = {
    id: 'b',
    patches: [
      { id: 'p1', originalText: 'alpha beta', replacementText: 'alpha' },
      { id: 'p2', originalText: 'beta', replacementText: 'gamma' },
    ],
  };

  assert.throws(
    () =>
      applyAvailablePatchesToCall({
        patchBundle,
        appliedPatchIds: new Set(),
        stage: 'director',
        callKind: 'generateObject',
        params: { prompt: 'alpha beta' },
      }),
    /overlap|removed/,
  );
});

test('applies an observed field patch to the corresponding call in every replay turn', () => {
  const patchBundle = {
    id: 'b',
    patches: [
      {
        id: 'turn-4-narrator-brief',
        matchMode: 'field',
        sourceTurn: 4,
        stage: 'narrator',
        callKind: 'streamText',
        fieldPath: 'messages[2].content',
        originalText: 'old observed brief',
        replacementText: 'edited observed brief',
      },
    ],
  };

  const skipped = applyAvailablePatchesToCall({
    patchBundle,
    appliedPatchIds: new Set(),
    turn: 5,
    stage: 'director',
    callKind: 'generateObject',
    params: { messages: [{ content: 'a' }, { content: 'b' }, { content: 'fresh replay brief' }] },
  });
  assert.equal(skipped.params.messages[2].content, 'fresh replay brief');
  assert.deepEqual(skipped.applications, []);

  const applied = applyAvailablePatchesToCall({
    patchBundle,
    appliedPatchIds: new Set(),
    turn: 5,
    stage: 'narrator',
    callKind: 'streamText',
    params: { messages: [{ content: 'a' }, { content: 'b' }, { content: 'fresh replay brief' }] },
  });

  assert.equal(applied.params.messages[2].content, 'edited observed brief');
  assert.equal(applied.applications[0].patchId, 'turn-4-narrator-brief');
  assert.equal(applied.applications[0].fieldPath, 'messages[2].content');
  assert.equal(applied.applications[0].matchMode, 'field');
  assert.equal(applied.applications[0].turn, 5);
});

test('preserves current turn tag content when applying a slot-aware field patch', () => {
  const patchBundle = {
    id: 'b',
    patches: [
      {
        id: 'player-input-rules',
        matchMode: 'field',
        sourceTurn: 4,
        stage: 'director',
        callKind: 'generateObject',
        fieldPath: 'messages[4].content',
        preserveTags: ['player_input'],
        originalText: '<player_input>turn 4 action</player_input>\nold requirements',
        replacementText: '<player_input>turn 4 action</player_input>\nnew requirements',
      },
    ],
  };

  const applied = applyAvailablePatchesToCall({
    patchBundle,
    appliedPatchIds: new Set(),
    turn: 5,
    stage: 'director',
    callKind: 'generateObject',
    params: {
      messages: [
        { content: 'a' },
        { content: 'b' },
        { content: 'c' },
        { content: 'd' },
        { content: '<player_input>turn 5 action</player_input>\nold requirements' },
      ],
    },
  });

  assert.equal(
    applied.params.messages[4].content,
    '<player_input>turn 5 action</player_input>\nnew requirements',
  );
  assert.deepEqual(applied.applications[0].preserveTags, ['player_input']);
});
