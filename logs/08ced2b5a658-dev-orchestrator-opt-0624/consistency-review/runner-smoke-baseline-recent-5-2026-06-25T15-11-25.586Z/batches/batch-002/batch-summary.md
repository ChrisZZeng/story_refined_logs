# Batch 002 Consistency Review

## Scope

- Run directory: `/Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/08ced2b5a658-dev-orchestrator-opt-0624/run_logs/runner-smoke-baseline-recent-5-2026-06-25T15-11-25.586Z`
- Visible timeline: `/Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/08ced2b5a658-dev-orchestrator-opt-0624/consistency-review/runner-smoke-baseline-recent-5-2026-06-25T15-11-25.586Z/visible-timeline.jsonl`
- Window range: 1-20
- Evaluated range: 11-20
- Evaluated turns: 10

Only issues whose player-visible occurrence is in turns 11-20 were counted. Turns 1-10 were used only as context and conflict evidence. All evaluated turns had empty `preLlmEvents`, so the findings are limited to `visibleText` and `choices`.

## Findings

Found 5 issues across 5 evaluated turns. The first inconsistent turn is 12.

| Turn | Scope | Type | Severity | Summary |
|---:|---|---|---|---|
| 12 | visibleText | protocol-break | low | Speaker labels and pronouns drift around the letter comparison, including `[卡琳娜]` before narration and `她说` after a `[帕兹]` line. |
| 15 | visibleText | protocol-break | low | `[帕兹]` is attached to second-person narration rather than dialogue. |
| 16 | visibleText | quality-regression | low | The turn contains another narration-label artifact and a visible typo-like fragment, `桌面上一——一封`. |
| 18 | visibleText | fact-conflict | low |帕兹 says he spent five years at the front, conflicting with turn 10's six years. |
| 20 | choices | unsupported-jump | medium | A choice suddenly references tonight's banquet before that goal has been established for the player. |

## Summary Metrics

- Issue count: 5
- Inconsistent turn count: 5
- Inconsistent turns: 12, 15, 16, 18, 20
- Uncertain turn count: 0
- Uncertain turns: none
