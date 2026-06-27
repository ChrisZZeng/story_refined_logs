import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildJudgeInput,
  buildRegressionJudgeInput,
  parseJudgeResult,
  parseRegressionJudgeResult,
  runJudge,
  runRegressionJudge,
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

test('buildRegressionJudgeInput uses visible timeline history and replay output text', () => {
  const input = buildRegressionJudgeInput({
    context: {
      turn: 4,
      turnInput: { trigger: { kind: 'player-input', playerInput: '打开密门' } },
      visibleContext: [
        { turn: 2, playerInput: '查看墙面', visibleText: '墙上没有钥匙。' },
        { turn: 3, playerInput: '询问同伴', output: '同伴说钥匙已丢失。' },
      ],
    },
    newOutput: { normalizedContent: { visibleText: '你用刚出现的钥匙打开密门。' } },
  });

  assert.deepEqual(input.history_turn, [
    { turn: 2, playerInput: '查看墙面', output: '墙上没有钥匙。' },
    { turn: 3, playerInput: '询问同伴', output: '同伴说钥匙已丢失。' },
  ]);
  assert.equal(input.playerInput, '打开密门');
  assert.equal(input.output, '你用刚出现的钥匙打开密门。');
  assert.equal(input.target, 'fullTurn');
});

test('parseRegressionJudgeResult normalizes valid snake_case model output', () => {
  const parsed = parseRegressionJudgeResult({
    is_violation: 1,
    confidence: 'medium',
    violations: [
      {
        type: 'factual_contradiction',
        evidence_history: '钥匙已丢失。',
        evidence_current: '刚出现的钥匙。',
        explanation: '当前输出让已经丢失的钥匙无解释出现。',
      },
    ],
    reasoning: '存在新增事实冲突。',
  });

  assert.equal(parsed.isViolation, true);
  assert.equal(parsed.violations[0].type, 'factual_contradiction');
});

test('parseRegressionJudgeResult rejects invalid violation flag', () => {
  assert.throws(
    () => parseRegressionJudgeResult({ is_violation: 2, confidence: 'high', violations: [], reasoning: 'x' }),
    /is_violation/,
  );
});

test('runRegressionJudge fake mode returns no violation', async () => {
  const result = await runRegressionJudge({
    mode: 'fake',
    input: { history_turn: [], playerInput: 'x', output: 'y', target: 'fullTurn' },
  });

  assert.equal(result.isViolation, false);
  assert.equal(result.confidence, 'low');
});
