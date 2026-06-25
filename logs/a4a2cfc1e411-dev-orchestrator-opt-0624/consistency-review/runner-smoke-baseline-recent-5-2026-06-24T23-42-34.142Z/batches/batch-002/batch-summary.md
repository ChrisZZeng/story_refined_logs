# Batch 002 Consistency Review

## Scope

- Run directory: `/Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/a4a2cfc1e411-dev-orchestrator-opt-0624/run_logs/runner-smoke-baseline-recent-5-2026-06-24T23-42-34.142Z`
- Timeline: `/Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/a4a2cfc1e411-dev-orchestrator-opt-0624/consistency-review/runner-smoke-baseline-recent-5-2026-06-24T23-42-34.142Z/visible-timeline.jsonl`
- Window range: 1-20
- Evaluated range: 11-20

I read the player-visible timeline for turns 1-20. Turns 1-10 were used only as context and conflict evidence. Only issues appearing in turns 11-20 are counted. I reviewed `visibleText`, `choices`, and `preLlmEvents`; all `preLlmEvents` in this window were empty.

## Summary

- Evaluated turns: 10
- Issues found: 6
- First inconsistent turn: 12
- Inconsistent turns: 12, 13, 14, 15, 16, 17, 20
- Uncertain turns: none
- Issues by scope: `visibleText` 6, `choices` 0, `preLlmEvents` 0, `mixed` 0

## Issues

1. Turn 12, affecting turns 12-16, `visibleText`, medium: dialogue labels leak internal ids such as `shortface`, `unknown`, `warehouse_boss`, and `shortface_group`, breaking the previously natural Chinese speaker-label format.
2. Turn 12, `visibleText`, low: the phrase “另一个人的脚步，比我更沉重” briefly shifts the narration into first person where the second-person viewpoint should remain stable.
3. Turn 16, `visibleText`, low: the first meeting with Karina is renamed as happening at “中央公园”, while earlier visible context established a central district street festival rather than a park.
4. Turn 16, `visibleText`, low: Karina says “午安” inside an already established night scene with streetlights and night air.
5. Turn 17, `visibleText`, medium: Karina says the warehouse group only remembered Paz's outline and camera, but turns 13-15 showed them observing him face-to-face under warehouse lighting.
6. Turn 20, `visibleText`, medium: Karina shifts the recent exposure from the dark street warehouse to the port district, even though turns 11-19 consistently place the investigation and confrontation in the dark street.

No counted issues were found in the choices or `preLlmEvents`.
