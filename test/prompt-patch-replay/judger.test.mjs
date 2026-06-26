import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildJudgeInput,
  parseJudgeResult,
  runJudge,
} from '../../scripts/prompt-patch-replay/judger.mjs';

test('buildJudgeInput includes issue, old output, new output, and visible context', () => {
  const input = buildJudgeInput({
    issue: { turn: 4, type: 'repeated-scene', currentEvidence: 'old repeated' },
    context: {
      turn: 4,
      originalOutput: { normalizedContent: { visibleText: 'old text' } },
      visibleContext: [{ turn: 3, visibleText: 'previous text' }],
    },
    newOutput: { normalizedContent: { visibleText: 'new text' } },
  });

  assert.equal(input.issue.type, 'repeated-scene');
  assert.equal(input.originalOutput.normalizedContent.visibleText, 'old text');
  assert.equal(input.newOutput.normalizedContent.visibleText, 'new text');
  assert.equal(input.visibleContext[0].turn, 3);
});

test('parseJudgeResult accepts valid verdicts', () => {
  const parsed = parseJudgeResult({
    verdict: 'fixed',
    confidence: 'high',
    reason: '问题已解决。',
    remainingProblems: [],
    newRegressions: [],
  });

  assert.equal(parsed.verdict, 'fixed');
});

test('parseJudgeResult rejects unknown verdicts', () => {
  assert.throws(
    () => parseJudgeResult({ verdict: 'better', confidence: 'high', reason: 'x' }),
    /verdict/,
  );
});

test('runJudge fake mode returns uncertain result', async () => {
  const result = await runJudge({
    mode: 'fake',
    input: { issue: { turn: 1 }, newOutput: {}, originalOutput: {}, visibleContext: [] },
  });

  assert.equal(result.verdict, 'uncertain');
});
