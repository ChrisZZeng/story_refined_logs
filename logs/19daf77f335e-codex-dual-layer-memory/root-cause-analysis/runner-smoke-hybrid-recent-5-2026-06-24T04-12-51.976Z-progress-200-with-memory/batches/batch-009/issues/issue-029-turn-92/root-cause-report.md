# Issue 29 / Turn 92

## Problem
第92轮在玩家选择“安静地坐着，等她自己开口”后，让卡琳娜重新问宴会“像什么”，并给出“像一场精心排练的舞台剧”等选项。这个互动把第81轮已经提出、确认并在后续多轮发展的宴会隐喻重新当成待发现内容。

## Validity
issueValidity: `valid`

玩家可见证据足够明确：turn-81 中玩家已经说“宴会像是一个精心布置的剧场”，卡琳娜随即确认并改写为“展示橱窗”。turn-83 至 turn-89 又继续发展出“不在橱窗里看到自己”“卡琳娜不在展示架上”“离开那个房间”“推开门”“带进房间的东西”等后续隐喻。turn-92 再问“那些吊灯、那些礼服、那些——恰到好处的笑容。你觉得……像什么？”不是深化，而是重新发现。

## Context Assessment
- actualStateBeforeIssue: 玩家和卡琳娜已经从宴会观察推进到卡琳娜的自我位置与离开康纳展示结构后的状态，并转场到公园长椅静坐。
- relevant fact: 宴会像剧场/橱窗已经成立；在 `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-92/03-story-state.json` 中只是 `present-buried`。
- relevant pressure: 当前 storyline 仍有“必须围绕卡琳娜询问玩家对宴会的看法展开讨论”，属于 `over-constraining`。
- competing pressures: 最近5轮只包含门/房间与公园静坐，turn-81 的原始确认不在 recentTurns；固定 beat 的硬约束比已完成摘要更显眼。

## Causal Chain
- firstDivergenceArtifact: `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-92/04-output.json#plotPoint`
- triggeringPressure: currentStoryline.content/constraints 仍要求卡琳娜询问玩家对宴会的看法。
- missingGuard: 没有 consumed/resolved 标记，也没有“若已问过并得到回答则跳过或改写为深化”的 Director 约束。
- directCause: Director 把已完成 beat 重新规划为“卡琳娜最终主动开口，询问主角对宴会的看法”。
- propagation: Narrator 写出“你觉得……像什么？”，Choice 生成“像一场精心排练的舞台剧”等选项。

## Root Cause
rootCause.label: `fixed-beat-consumption`

family: `agent-system`  
secondaryFamilies: `recent-context`

L3 mechanism: 已消费的 storyline beat 仍以硬约束形式参与本轮决策，而已完成证据被埋在长摘要中且不在最近轮窗口，导致 Director 复用固定 beat，把已完成的宴会隐喻重新包装成待发现问题。

## Evidence
- playerVisible: `logs/19daf77f335e-codex-dual-layer-memory/consistency-review/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/visible-timeline.jsonl` turn-81、turn-83 到 turn-89、turn-92。
- internalTrace: `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-92/03-story-state.json`、`logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-92/06a-director-prompt.md`、`logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-92/04-output.json`、`logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-92/07-events.json`。

## Recommended Fix Area
给 storyline/fixed beat 增加 consumed/resolved 生命周期；Director 组装上下文时把“已完成进展”拆成高显著度字段，并在固定 beat 执行前做语义去重。

## Confidence
`high`
