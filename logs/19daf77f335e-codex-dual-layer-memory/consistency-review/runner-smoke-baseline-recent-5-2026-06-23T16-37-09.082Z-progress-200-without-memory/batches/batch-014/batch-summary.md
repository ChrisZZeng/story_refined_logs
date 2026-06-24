# Batch 014 Consistency Review

Run directory: `/Users/wanghaha/code/oreturn-owlet-hybrid-dual-layer-memory/tmp/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200`

Timeline: `/Users/wanghaha/code/oreturn-owlet-hybrid-dual-layer-memory/tmp/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200/consistency-review/visible-timeline.jsonl`

Window reviewed: turns 121-140. Issues counted only for turns 131-140.

## Method

I reviewed the player-visible timeline entries for turns 121-140, using turns 121-130 only as context and conflict evidence. For turns 131-140, I checked `visibleText`, `choices`, and `preLlmEvents`; all `preLlmEvents` in the evaluated range were empty. I also used targeted timeline search for specific recurring objects and states such as the film camera, fireplace, room light, cup, and bread, without reading the full run body.

## Summary

- Evaluated turns: 10
- Issue count: 6
- Inconsistent turns: 5
- First inconsistent turn: 131
- Uncertain turns: 0

## Issues

1. Turn 131, `visibleText`, `fact-conflict`, low: the stone road is first established as dry and without moisture, but the same turn later says the player's footprints remain on morning-dew-wet stone.
2. Turn 132, `visibleText`, `repeated-scene`, medium: the turn substantially repeats the previous pacing-to-the-alley-and-back action and again motivates it as if the player had only been sitting indoors.
3. Turn 134, `choices`, `fact-conflict`, low: a choice offers to check the just-shot frame's effect even though the camera is consistently established as a film camera.
4. Turn 136, `visibleText`, `fact-conflict`, low: the camera drifts from hanging at the chest to being at the waist/side, then returns to the chest in the same turn.
5. Turn 139, `visibleText`, `event-negated`, medium: the fireplace had been cold ash, but the turn restores warm, cracking embers.
6. Turn 139, `visibleText`, `space-time-break`, medium: the room's lighting regresses from fully sunlit after the curtains were opened and the sun had risen to only a slit of light from the door and a small patch from the window.
