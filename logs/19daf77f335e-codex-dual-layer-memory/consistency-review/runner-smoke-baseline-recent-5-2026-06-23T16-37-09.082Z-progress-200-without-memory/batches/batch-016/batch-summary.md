# Batch 016 Consistency Review

## Scope

- Run directory: `/Users/wanghaha/code/oreturn-owlet-hybrid-dual-layer-memory/tmp/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200`
- Timeline: `/Users/wanghaha/code/oreturn-owlet-hybrid-dual-layer-memory/tmp/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200/consistency-review/visible-timeline.jsonl`
- Window range: turns 141-160
- Evaluated range: turns 151-160
- Evaluated player-visible fields: `visibleText`, `choices`, `preLlmEvents`

`preLlmEvents` was empty for all evaluated turns. Issues below are counted only inside turns 151-160; turns 141-150 and targeted earlier timeline lookups were used only as context or conflict evidence.

## Method

I reviewed turns 141-160 in order, then checked the focused turns 151-160 for visible text, choices, and generated-before-output events. I used targeted visible-timeline lookups for recurring objects and equipment state, especially the camera bag, spare film, and silver bell. No hidden script state, private runtime state, or full run body was used as evidence.

## Findings

- Evaluated turns: 10
- Issue count: 6
- Inconsistent turns: 157, 158, 159, 160
- First inconsistent turn: 157
- Uncertain turns: none

Main issue categories:

- `fact-conflict`: 4
- `user-input-ignored`: 1
- `unsupported-jump`: 1

The strongest issue is in turn 160, where the silver bell becomes silent under the same gentle shaking that made it ring clearly in turn 151. The rest of the findings are equipment continuity problems: the camera bag becomes available outside without support, then reappears indoors with a changed zipper/table state, and the spare film count changes from five rolls to three without a visible cause.
