import test from 'node:test';
import assert from 'node:assert/strict';

import { parseNarrativeSegments } from '../../scripts/prompt-replay-workbench/static/speaker-to.js';

test('parseNarrativeSegments extracts explicit speaker and listener from v3 html paragraphs', () => {
  const segments = parseNarrativeSegments([
    '<p>旁白。</p>',
    '<p data-speaker="卡琳娜" data-to="黑帮">“明白吗？”</p>',
    '<p>巷子安静下来。</p>',
  ].join('\n'));

  assert.deepEqual(segments, [
    { type: 'text', text: '旁白。' },
    { type: 'speaker', speaker: '卡琳娜', to: '黑帮', text: '“明白吗？”' },
    { type: 'text', text: '巷子安静下来。' },
  ]);
});

test('parseNarrativeSegments keeps text plain when speaker metadata is incomplete', () => {
  const segments = parseNarrativeSegments('<p>“没有标记的对白。”</p><p data-speaker="卡琳娜">“缺少听者。”</p>');

  assert.deepEqual(segments, [
    { type: 'text', text: '“没有标记的对白。”' },
    { type: 'text', text: '“缺少听者。”' },
  ]);
});

test('parseNarrativeSegments returns original fallback-style text when there is no paragraph markup', () => {
  assert.deepEqual(parseNarrativeSegments('“谁说话并不知道。”'), [
    { type: 'text', text: '“谁说话并不知道。”' },
  ]);
});

test('parseNarrativeSegments decodes html entities in speaker routes and text', () => {
  const segments = parseNarrativeSegments('<p data-speaker="A&amp;B" data-to="C">“&lt;ok&gt;”</p>');

  assert.deepEqual(segments, [
    { type: 'speaker', speaker: 'A&B', to: 'C', text: '“<ok>”' },
  ]);
});
