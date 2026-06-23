# Batch 001 Consistency Summary

Run directory:

`/Users/wanghaha/code/oreturn-owlet-hybrid-dual-layer-memory/tmp/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random`

Timeline:

`/Users/wanghaha/code/oreturn-owlet-hybrid-dual-layer-memory/tmp/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/consistency-review/visible-timeline.jsonl`

Window range: turns 1-10.

Evaluated range: turns 1-10.

Evaluated turns: 10.

Issue count: 3.

Inconsistent turns: 3, 6, 9.

First inconsistent turn: 3.

Uncertain turns: none.

## Main Findings

Turn 3 contains a player-facing choice text corruption: `直接去暗街，往日总是如影随形`. The first half is a valid action, but the trailing clause reads like an unrelated fragment and weakens choice clarity.

Turn 6 repeats a substantial block from the end of turn 5 before advancing. The pause, the “战友的遗产？” line, and the same internal beat are replayed nearly verbatim, so the scene feels re-rendered instead of continuing cleanly.

Turn 9 introduces the clearest continuity break in NPC identity. The Central District stallkeeper was consistently presented as female-coded in turns 1-3, but Karina suddenly calls that person `那个老头`, with no visible explanation for the shift.

## Uncertainty

I did not mark any turn as uncertain. `preLlmEvents` are empty throughout turns 1-10, and the visible issues that rose above threshold are confined to one malformed choice, one repeated scene beat, and one identity-label drift.
