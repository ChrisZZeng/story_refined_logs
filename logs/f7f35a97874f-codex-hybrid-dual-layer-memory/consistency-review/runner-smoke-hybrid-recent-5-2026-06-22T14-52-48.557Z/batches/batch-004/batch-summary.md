# Batch 004 Consistency Review

- Run directory: `/Users/wanghaha/code/oreturn-owlet-hybrid-dual-layer-memory/tmp/hybrid-progress-50-recent5/runner-smoke-hybrid-recent-5-2026-06-22T14-52-48.557Z`
- Timeline: `/Users/wanghaha/code/oreturn-owlet-hybrid-dual-layer-memory/tmp/hybrid-progress-50-recent5/runner-smoke-hybrid-recent-5-2026-06-22T14-52-48.557Z/consistency-review/visible-timeline.jsonl`
- Window range: 21-40
- Evaluated range: 31-40
- Evaluated turns: 10
- `preLlmEvents`: all empty in the reviewed window

## Result

Found 3 issues in the evaluated range.

- First inconsistent turn: 33
- Inconsistent turns: 33, 37, 40
- Uncertain turns: none

## Issues

1. Turn 33, `mixed`, `quality-regression`, medium
   The text ends by saying Minte opened her mouth, but no speech is shown; the choices and the next turn still treat her speech as something the player is waiting for.

2. Turn 37, `mixed`, `space-time-break`, medium
   The player is allowed to press her "hand back" and the output realizes that touch, despite the preceding visible pose describing the hand as palm-up and previously curled or moved to the box edge.

3. Turn 40, `visibleText`, `quality-regression`, medium
   The turn mostly repeats the same waiting/silence/hand/mouth/breath beats from turns 38-39 without new information, and it also says the hand is not lifted before later lifting it in the same turn.

## Notes

Turns 31-32 continue the question about how Minte survived and do not introduce a clear visible contradiction. Turns 34-36 advance the disclosure from survival guilt to "you should have lived" and are mostly coherent. Turns 38-39 continue the physical comfort beat coherently after the hand-contact issue has already been counted at turn 37.
