# Batch 009 Summary

- Run directory: `/Users/wanghaha/code/oreturn-owlet-hybrid-dual-layer-memory/tmp/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200`
- Timeline: `/Users/wanghaha/code/oreturn-owlet-hybrid-dual-layer-memory/tmp/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200/consistency-review/visible-timeline.jsonl`
- Window range: 71-90
- Evaluated range: 81-90
- Evaluated turns: 10
- Issue count: 4
- Inconsistent turns: 84, 86, 87, 90
- Uncertain turns: none

## Notes

Turns 81-83 continue the park-bench conversation about Dark Street, Kar, Mint, and Karina without a new counted issue in this batch. The earlier unscored context contains a scene jump at turn 76 from the fireplace to a park bench; this was treated as context only because it originated outside the evaluated range.

No `preLlmEvents` issues were found because turns 81-90 have empty `preLlmEvents`. I also reviewed the choices in the evaluated turns and found no standalone choices issue.

## Issues

1. Turn 84, `visibleText`, low, `space-time-break`: after the player stands from the bench, the narration still describes light falling on the player's hand resting on their knee.
2. Turn 86, `visibleText`, medium, `user-input-ignored`: the player asks where Karina will stay tonight, but the output changes it into the player asking where they will stay.
3. Turn 87, `visibleText`, medium, `fact-conflict`: the silver bell shifts from Kar's mouth to Karina's hand without a shown transfer, and remains visually lit after Karina pockets it.
4. Turn 90, `visibleText`, low, `space-time-break`: Kar is walking beside the group, then is described as standing up again without an intervening seated/stopped state.
