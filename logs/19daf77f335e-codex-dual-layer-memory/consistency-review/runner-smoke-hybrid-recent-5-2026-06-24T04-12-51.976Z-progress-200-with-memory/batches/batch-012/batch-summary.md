# Batch 012 Consistency Review

## Scope

- Run directory: `/Users/wqy/Code/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory`
- Timeline: `/Users/wqy/Code/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/consistency-review/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/visible-timeline.jsonl`
- Window range: 101-120
- Evaluated range: 111-120
- Evaluated turns: 10

Only issues whose visible occurrence is in turns 111-120 are counted. Turns 101-110 and earlier timeline lookups were used only as context or conflict evidence. All `preLlmEvents` in turns 101-120 are empty.

## Summary

- Issue count: 2
- Inconsistent turns: 113, 120
- First inconsistent turn: 113
- Uncertain turns: none

## Issues

1. Turn 113, mixed scope, medium severity: the scene says Karina places her hand on the bench with palm up, but the generated choice asks the player to cover the back of her hand, and turn 114 continues that impossible posture.

2. Turn 120, visibleText scope, high severity: the route to Karina's "true home" is replayed as a first discovery even though turns 38-40 already showed the player going there, entering it, and later leaving for the park in turns 89-90.

## Notes

The black cat continuity was checked against earlier visible turns. Its appearance in this window is supported by prior visible appearances and was not counted as an issue. The "真正的家" phrase also has prior visible grounding in turn 38; the issue is not the phrase itself, but the later repeated first-arrival staging in turn 120.
