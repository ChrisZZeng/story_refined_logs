# Batch 004 Consistency Review

## Scope

- Run directory: `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/2124ade90932-dev-orchestrator-membackend/run_logs/runner-smoke-baseline-recent-5-2026-06-22T10-02-09.686Z`
- Visible timeline: `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/2124ade90932-dev-orchestrator-membackend/run_logs/consistency-review/runner-smoke-baseline-recent-5-2026-06-22T10-02-09.686Z/visible-timeline.jsonl`
- Window range: 21-40
- Evaluated range: 31-40
- Reviewed player-visible fields: `visibleText`, `choices`, `preLlmEvents`

## Result

- Evaluated turns: 10
- Issue count: 1
- Inconsistent turns: 1
- First inconsistent turn: 38
- Uncertain turns: 0

## Issues

| Turn | Scope | Type | Severity | Summary |
| --- | --- | --- | --- | --- |
| 38 | `visibleText` | `space-time-break` | `low` | The same morning light patch was previously on the floor / near the tea table leg, but turn 38 describes it as being on the windowsill while also about to cross the table leg. |

## Notes

The window context from turns 21-30 was used only as context and possible conflict evidence. The only counted issue is within the evaluated range 31-40.

`preLlmEvents` was empty for every evaluated turn, so no `preLlmEvents` issues were found.
