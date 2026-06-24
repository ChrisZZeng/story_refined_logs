# Batch 012 Summary

Reviewed window `101-120`; counted issues only in evaluation range `111-120`.

- Evaluated turns: 10
- Issue count: 5
- Inconsistent turns: 5 (`115`, `117`, `118`, `119`, `120`)
- First inconsistent turn: `115`
- Uncertain turns: 0
- `preLlmEvents`: all empty in this window; no `preLlmEvents` issues found.

## Findings

1. Turn 115 has a low-severity object-position conflict: the camera was hanging from the player's neck at the end of turn 114, but turn 115 places it back on the windowsill without transition.
2. Turn 117 has a low-severity mixed posture/location issue: the player is already standing at the window, but the text says "stand up" and a choice offers walking to the window.
3. Turn 118 has a medium-severity progression issue: the established plan was "4:30, meet at the door", but the scene reaches dawn while reframing the task as waiting indoors for Karina's message or arrival.
4. Turn 119 has a low-severity continuity issue around the fireplace stool: Carl had been visible on that stool, and no visible movement accounts for the player sitting there.
5. Turn 120 has a low-severity object-position conflict: the waterproof bag was slung over the player's shoulder and beside them in turn 119, but appears on the windowsill in the camera view.

Overall, the batch remains readable, but the waiting sequence drifts into an item-check loop and loses track of the agreed rendezvous, plus a few local object and posture anchors.
