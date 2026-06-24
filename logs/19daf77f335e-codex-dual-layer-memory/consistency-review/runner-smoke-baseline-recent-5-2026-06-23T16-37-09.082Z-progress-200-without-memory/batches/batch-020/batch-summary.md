# Batch 020 Consistency Review

## Scope

- Run directory: `/Users/wanghaha/code/oreturn-owlet-hybrid-dual-layer-memory/tmp/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200`
- Visible timeline: `/Users/wanghaha/code/oreturn-owlet-hybrid-dual-layer-memory/tmp/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200/consistency-review/visible-timeline.jsonl`
- Window range: 181-200
- Evaluated range: 191-200
- Reviewed player-visible fields: `visibleText`, `choices`, and `preLlmEvents`

Only issues in turns 191-200 are counted. Turns 181-190 were used as local context only. Relevant earlier visible timeline lines were searched selectively for long-range evidence about the player objective, Minte, and Karina's current action state.

## Summary

- Evaluated turns: 10
- First inconsistent turn: 191
- Inconsistent turns: 191, 198, 200
- Issue count: 4
- Uncertain turns: 0

## Issues

1. Turn 191, `mixed`, `user-input-ignored`, low: the player asks whether Karina is satisfied with the answer, but the narration changes the spoken question into whether she is confirming the answer.
2. Turn 198, `visibleText`, `space-time-break`, medium: turn 197 and the player input establish Karina as standing and waiting, but the narration treats her as already walking and maintaining a previous walking rhythm.
3. Turn 198, `visibleText`, `quality-regression`, low: “她的声音在指尖上停顿了一拍” is a visibly malformed sensory/action phrase.
4. Turn 200, `visibleText`, `quality-regression`, low: the wet-stone footstep description combines “湿润的石板”, “干燥的声音”, and “水汽还没来得及渗进鞋印” in a physically and semantically awkward way.

No `choices` or `preLlmEvents` issues were found in the evaluated range. All `preLlmEvents` entries in turns 191-200 were empty.
