# Batch 004 Consistency Review

- Run directory: `/Users/wqy/Code/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory`
- Visible timeline: `/Users/wqy/Code/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/consistency-review/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/visible-timeline.jsonl`
- Window range: 21-40
- Evaluated range: 31-40
- Evaluated turns: 10
- Issues counted in evaluated range: 2
- First inconsistent turn: 31

## Method

Reviewed the player-visible timeline for turns 21-40, using turns 21-30 only as context and conflict evidence. For turns 31-40, reviewed `visibleText`, `choices`, and `preLlmEvents`; all reviewed turns in this range had empty `preLlmEvents`.

I also checked earlier player-visible references for long-range continuity around “小贩”, 罗英/黄昏会, 康纳/凯旋门, 卡尔, 暗街, and the black cat. Future timeline hits were not used as conflict evidence for this batch.

## Issues

1. turn 31, `visibleText`, `identity-drift`, medium

   The text introduces a woman as 罗英, 黄昏会代首领, who prefers being called “小贩”. Earlier player-visible turns 1-5 had already established “小贩” as a male stall vendor and information source, consistently using “他” and situating him behind a stall. Since turn 31 gives no explanation that “小贩” is a shared title, alias collision, or disguise, the name reuse creates an identity drift.

2. turn 36, `visibleText`, `fact-conflict`, low

   Turn 35 already says 卡琳娜 put her cup back on the table. Turn 36 then writes her fingers releasing the cup and the cup bottom landing on the table again, without showing that she picked it back up. This is a small object-state/action continuity repeat.

## Notes

The black cat appears in the dark-street room in turn 28 and another black cat appears in 卡琳娜's “真正的家” in turn 40. I did not count this as an issue because the text leaves enough elapsed time and ambiguity for the cat to have moved independently, or for the later cat to be a separate but similar presence.

Choices in turns 31-40 were coherent with the visible situation, and no `preLlmEvents` issues were found.
