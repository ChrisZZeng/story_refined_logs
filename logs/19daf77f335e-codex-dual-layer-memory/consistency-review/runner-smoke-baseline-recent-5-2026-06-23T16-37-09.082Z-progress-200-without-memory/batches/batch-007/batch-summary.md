# Batch 007 Summary

- Run directory: `/Users/wanghaha/code/oreturn-owlet-hybrid-dual-layer-memory/tmp/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200`
- Timeline: `/Users/wanghaha/code/oreturn-owlet-hybrid-dual-layer-memory/tmp/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200/consistency-review/visible-timeline.jsonl`
- Window range: 51-70
- Evaluated range: 61-70
- Evaluated turns: 10
- Issues counted: 3
- Inconsistent turns: 63, 68, 70
- First inconsistent turn: 63
- Uncertain turns: none

## Review Notes

The review covered full player-visible turns for 61-70, including `visibleText`, `choices`, and `preLlmEvents`. All evaluated turns had empty `preLlmEvents`; no pre-generation event issue was counted. Turns 51-60 were used only as context and conflict evidence. Earlier targeted lookups were limited to player-visible timeline evidence around 卡尔, 卡琳娜, 卡尔小屋, and the streetlight/park setting.

## Issues

| Turn | Scope | Type | Severity | Summary |
| --- | --- | --- | --- | --- |
| 63 | visibleText | identity-drift | low | 卡琳娜 refers to the player's just-spoken advice as “她说得没错,” briefly assigning it to a third-person female speaker instead of the player. |
| 68 | visibleText | fact-conflict | low | 卡尔 is described as being on the cushion “和你离开时几乎一样,” but when the player left she was in 卡琳娜's arms; she only returned to the cushion by turn 67. |
| 70 | visibleText | user-input-ignored | medium | The player asks what “那句话” means after 卡尔's cryptic reminder, but 卡琳娜 answers as if asked about her earlier confession instead. |

## Scope Counts

- `visibleText`: 3
- `choices`: 0
- `preLlmEvents`: 0
- `mixed`: 0

## Source Counts

- `model-output`: 3
- `player-input`: 0
- `mixed`: 0
- `uncertain`: 0
