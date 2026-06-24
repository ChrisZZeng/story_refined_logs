# Batch 011 Summary

Reviewed window 91-110 and evaluated turns 101-110 only. All evaluated turns had empty `preLlmEvents`; `visibleText` and `choices` were still checked for every evaluated turn. I used targeted player-visible timeline lookups for long-range references rather than reading the full run body.

## Result

- Evaluated turns: 10
- Issue count: 3
- Inconsistent turns: 106, 108, 110
- First inconsistent turn: 106
- Uncertain turns: none

## Issues

1. Turn 106, `visibleText`, medium: the narration invents a concrete prior memory of sitting in the chair opposite Connor and feeling its left armrest. Earlier visible turns establish that the player had not met Connor and chose to leave before that could happen.
2. Turn 108, `visibleText`, low: Karina's hand is described as still resting on the old book immediately after turn 107 moved it away and back to her side.
3. Turn 110, `visibleText`, medium: the silver bell is described as something already given to the player, but earlier visible evidence keeps it with Karina/Karl and shows no handoff before this turn.

No issues were counted from turns 91-100; those turns were used only as context and conflict evidence.
