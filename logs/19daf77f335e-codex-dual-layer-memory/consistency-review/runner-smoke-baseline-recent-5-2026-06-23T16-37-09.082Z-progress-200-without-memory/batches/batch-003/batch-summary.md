# Batch 003 Consistency Summary

Run directory: `/Users/wanghaha/code/oreturn-owlet-hybrid-dual-layer-memory/tmp/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200`

Timeline: `/Users/wanghaha/code/oreturn-owlet-hybrid-dual-layer-memory/tmp/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200/consistency-review/visible-timeline.jsonl`

Window range: 11-30  
Evaluated range: 21-30

## Method

Reviewed the player-visible timeline for turns 11-30, covering `visibleText`, `choices`, and `preLlmEvents`. Only turns 21-30 were counted. Turns 3-10 were selectively checked to confirm the route into Karina's apartment, and keyword lookup was used for `信封`, `宴会`, `晚宴`, `康纳`, and `卡尔`; the full run body was not read. `preLlmEvents` were empty throughout the reviewed window.

## Metrics

- Evaluated turns: 10
- Issue count: 9
- Inconsistent turns: 7
- First inconsistent turn: 21
- Uncertain turns: 0

Inconsistent turns: 21, 22, 23, 24, 26, 27, 28

## Issues

- Turn 21, `visibleText`, `fact-conflict`, medium: the envelope is still in the player's hand / on the table after turn 19 showed Desolo leaving with it.
- Turn 22, `visibleText`, `space-time-break`, low: Karina is still bent with hands on knees after turn 21 already had her straighten up.
- Turn 23, `visibleText`, `space-time-break`, low: Karina snaps back to the bookshelf without a visible transition.
- Turn 24, `visibleText`, `space-time-break`, low: the bent, hands-on-knees posture returns even though turn 23 had her standing with hands in pockets.
- Turn 24, `choices`, `fact-conflict`, low: a choice offers taking up the envelope again, though it should have left with Desolo.
- Turn 26, `visibleText`, `space-time-break`, high: the scene jumps from Karina's apartment to a banquet hall / wine party without transition.
- Turn 27, `visibleText`, `unsupported-jump`, medium: Connor is introduced as host of “this dinner,” continuing an unsupported event setting.
- Turn 28, `visibleText`, `space-time-break`, high: the player exits a banquet hall with a maid and heads to Carl's hut, neither of which is supported by the established apartment scene.
- Turn 28, `visibleText`, `space-time-break`, low: Karina is described as never taking her hands out of her pockets after turn 27 had her do exactly that.

No `preLlmEvents` issues were found in the evaluated range.
