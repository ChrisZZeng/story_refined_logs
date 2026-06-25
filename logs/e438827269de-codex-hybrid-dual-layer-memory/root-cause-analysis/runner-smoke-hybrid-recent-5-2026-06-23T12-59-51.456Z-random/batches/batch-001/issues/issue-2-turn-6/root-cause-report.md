# Root Cause Report - issue-2-turn-6
## Problem
- issueIndex: 2
- turn: 6
- issueValidity: valid
- problemSummary: turn 6 开头逐段重复了 turn 5 结尾已经展示过的停顿、嗤笑、“战友的遗产？”和“你等着他的反应。”，然后才推进攻击动作。
- tracePacket: `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/root-cause-analysis/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/batches/batch-001/issues/issue-2-turn-6/trace.md`

## Validity
- verdictReason: 只凭玩家可见时间线即可确认：turn 5 已以同一场面块收束，turn 6 又从该场面块完整重放，重复长度超过正常承接提示。
- playerVisibleSupport: turn 5 末尾从“巷子里安静了两秒。”到“你等着他的反应。”已经完整出现；turn 6 开头再次出现同一组句子后，才写“领头的人歪了歪头……去，把相机拿来。”
- caveats: 短句回钩可用于承接动作场面，但这里重复的是完整尾段和情绪铺垫，属于低严重度 repeated-scene。

## Context Assessment
- actualStateBeforeIssue: turn 5 结束时，主角已经半蹲示弱，相机和背包在脚边，并说出“战友的遗产”拖延；领头者正在品味真假，主角等待其反应。turn 6 玩家选择突然发难，下一步应从对方示意取相机或主角爆发开始。
- relevantFacts:
  - `present-clear` 上轮已展示完整停顿与“战友的遗产？”反应。 artifacts: `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/consistency-review/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/visible-timeline.jsonl`, `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-06/03-story-state.json`, `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-06/06b-narrator-prompt.md` notes: turn 6 prompt/recentTurns 中包含 turn 5 尾段，最后可见状态明确是“你等着他的反应”。
  - `present-clear` Director 对 turn 6 的剧情安排是推进到领头者示意同伴取相机、主角暴起攻击。 artifacts: `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-06/06-llm-calls.json`, `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-06/07-events.json` notes: Director beats 未要求重放 turn 5 尾段；requiredContent 从“示意同伴上前拿相机”开始。
  - `stale` 当前 storyline/剧本素材仍保留已消费的前置动作。 artifacts: `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-06/03-story-state.json`, `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-06/06a-director-prompt.md`, `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-06/06b-narrator-prompt.md` notes: storyState 已写明主角放下相机并观察站位，但剧本素材仍列出“描写主角小心翼翼地把相机和背包放到地上”等已完成内容。
  - `present-buried` 有“不要重复已完成进展”的一般原则，但 Narrator 没有收到硬性的 `startAfter` / `lastVisibleSentence` 续写锚点。 artifacts: `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-06/06a-director-prompt.md`, `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-06/06b-narrator-prompt.md` notes: “不要重复”存在于较长规则和 storyline 说明中；Narrator 的直接任务仍是把导演安排落成正文，没有结构化禁止复述上一轮尾句。
- competingPressures: turn 5 尾段戏剧张力很强，容易被模型当作新一轮起笔材料；Director 第一 beat 写“继续保持示弱姿态，等待对方给出信号”，贴近上一轮收束状态；固定分支素材仍含已完成前置动作；动作场面需要蓄势，Narrator 倾向先重建张力再推进

## Causal Chain
- firstDivergenceArtifact: story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-06/06-llm-calls.json call[1].text / story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/turn-06/04-output.json narrative
- triggeringPressure: Narrator 同时看到上轮完整尾段、Director 的“继续保持示弱姿态”起步 beat，以及 storyline 中未被过滤的已完成前置素材；这些内容把起笔拉回已经展示过的停顿。
- missingGuard: 缺少强制 current-scene anchor，例如“从上一轮最后一句 `你等着他的反应。` 之后开始，不得复述之前任何句子”；也缺少提交前 duplicate-span 检测。
- mechanismStatement: 最近上下文把上一轮尾段作为长 prose 放入 prompt，而系统没有把最后可见状态结构化成硬起点；Narrator 为重建动作张力复用了该 prose 块，导致新回合先回放已消费场面再推进。
- directCause: Narrator 输出开头直接重复 turn 5 尾段。
- propagation: 重复块被写入 `turnContent` 并出现在玩家可见 timeline；后续 choices 基于已制服领头者的状态生成，没有继续固化为事实矛盾。
- nonCauses: 不是玩家输入要求回忆或复述；玩家输入是突然发难。；不是长程 memory 缺失；问题依赖上一轮即时上下文。；Director 的剧情方向基本正确，主要偏离发生在 Narrator 落文阶段。

## Root Cause
- label: `current-scene-anchor`
- family: `recent-context`
- secondaryFamilies: `agent-system`
- description: 当前场景的最后可见边界没有以强约束传给 Narrator。上轮尾段、已消费固定分支前置素材和“继续保持示弱”的导演措辞共同触发了复述压力；缺少 `startAfter` anchor 与重复检测，使 Narrator 将已消费 prose 当成可再次铺垫的开场。
- fixSurface: Narrator prompt/context assembly：加入 `lastVisibleSentence` / `startAfter` 硬字段；storyline lifecycle：标记并过滤 interactionFollowup 中已消费的前置 beat；post-generation duplicate-span check：检测与上一轮尾段高度重合的开头并局部重写

## Evidence
- playerVisible: turn 5 末尾与 turn 6 开头共享同一组句子：`巷子里安静了两秒。`、`战友的遗产？`、`你等着他的反应。`。
- internalTrace: `turn-06/06-llm-calls.json` 的 Director object 正确安排“示意取相机/主角暴起”；`turn-06/06b-narrator-prompt.md` 包含上轮尾段和已完成素材；Narrator text 从重复块开始，并被 `turn-06/04-output.json` commit。

## Recommended Fix Area
优先在 Narrator handoff 中添加结构化承接锚点和重复检测，同时让 storyline/fixed beat 消费状态参与 prompt 过滤。

## Confidence
`high`
