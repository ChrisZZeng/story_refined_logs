# Batch 006 Summary

- Run directory: `/Users/wanghaha/code/oreturn-owlet-hybrid-dual-layer-memory/tmp/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200`
- Timeline: `/Users/wanghaha/code/oreturn-owlet-hybrid-dual-layer-memory/tmp/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200/consistency-review/visible-timeline.jsonl`
- Window range: 41-60
- Evaluated range: 51-60
- Evaluated turns: 10
- Issues counted: 3
- Inconsistent turns: 54, 57, 58
- First inconsistent turn: 54
- Uncertain turns: none

## Review Notes

The review covered full player-visible turns for 51-60, including `visibleText`, `choices`, and `preLlmEvents`. All evaluated turns had empty `preLlmEvents`; no pre-generation event issue was counted. Turns 41-50 were used only as context and conflict evidence.

## Issues

| Turn | Scope | Type | Severity | Summary |
| --- | --- | --- | --- | --- |
| 54 | visibleText | identity-drift | low | The player is narrating the memory of Mint, but the text says “她说出这个名字时,” briefly assigning the speaking action to “she” instead of the player. |
| 57 | mixed | identity-drift | medium | The text and a choice use “他” for the person later confirmed as 卡尔, despite earlier and later visible text consistently using “她” for 卡尔. |
| 58 | visibleText | quality-regression | low | A line of dialogue contains a malformed quote break: “而且——”“时机这件事，不是光靠等就能等来的。” |

## Scope Counts

- `visibleText`: 2
- `choices`: 0
- `preLlmEvents`: 0
- `mixed`: 1

## Source Counts

- `model-output`: 3
- `player-input`: 0
- `mixed`: 0
- `uncertain`: 0
