# issue-66-turn-150

## Problem
第 150 轮把银色铃铛写成在相机包内层侧袋里；此前玩家长期看到它在外套内袋/口袋中。第 149 轮选项已经先把错误来源暴露给玩家，第 150 轮正文又将其固化为事实。

## Validity
- issueValidity: valid
- 玩家可见支持：第 111、116、123、129、133 轮均支持“外套内袋/口袋”；第 149 轮选项写“从相机包里拿出那枚银色铃铛”；第 150 轮正文写“探向包内层的侧袋——那个你放铃铛的位置”。
- caveat: 第 150 轮玩家输入来自系统选项，因此不是玩家主动改写物件位置；这反而说明问题从选项生成开始。

## Context Assessment
问题发生前，玩家刚从门口回到屋内。相机包确实在椅子扶手上，且第 147-148 轮高频出现；但银色铃铛稳定位置仍是外套内袋/口袋。

- relevantFacts:
  - 银色铃铛在外套内袋/口袋：availability=present-buried。可见证据在 `logs/19daf77f335e-codex-dual-layer-memory/consistency-review/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/visible-timeline.jsonl:turn-111`、`:turn-116`、`:turn-123`、`:turn-129`、`:turn-133`；内部长 currentStoryline 摘要也有“外套内袋/放回内袋”，但位置低显著。
  - 相机包近期被整理、放在椅子扶手上：availability=present-clear。第 147-148 轮在第 149/150 轮 prompt 近端出现。
  - 关键物件位置结构化状态：availability=absent。`logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-150/03-story-state.json` 中主角 `carriedItems` 为空。
- competingPressures: 最近两轮相机包描写高显著；Choice 需要生成可点击动作；缺少 inventory 校验；第 150 轮 Director/Narrator 对玩家输入中的“相机包”没有再验证。

## Causal Chain
- firstDivergenceArtifact: `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-149/07-events.json` 的 choiceGenerator worker-done / `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-149/04-output.json` choices
- 第 149 轮 Choice 首次输出“从相机包里拿出那枚银色铃铛，看看它”。
- 第 150 轮玩家选择该选项后，Director 输出“帕兹从相机包中取出银色铃铛”，actionHint 写“从包中取出铃铛”。
- Narrator 进一步写成“包内层的侧袋——那个你放铃铛的位置”，把错误来源固化为事实。
- 第 150 轮 Choice 又输出“重新把铃铛放回侧袋”，第 152 轮也沿用相机包侧袋。

## Root Cause
- label: choice-action-binding
- family: agent-system
- secondaryFamilies: detail-memory
- L3 root mechanism: Choice 阶段缺少基于 inventory/object-location 的动作绑定校验，在近期“相机包”高显著且铃铛位置事实低显著的情况下，把银色铃铛错误绑定到相机包；后续 Director/Narrator 没有把选项来源视为需校验的假设，而是直接固化为事实。
- fixSurface:
  - choice generation：取物选项必须查 object-location state。
  - state model：关键随身物记录 owner/location/container，并放入 current inventory。
  - handoff contract：Director/Narrator 承接 selected choice 时区分玩家核心意图与可能错误的来源文本。

## Evidence
- playerVisible: 多轮“外套内袋/口袋”与第 149-150 轮“相机包/侧袋”冲突。
- internalTrace: 第 149 轮 choiceGenerator 是首个偏离点；第 150 轮 Director、Narrator 和 Choice 继续传播。

## Recommended Fix Area
优先修复 Choice 的取物动作绑定和关键物件 inventory 状态；同时让 Director/Narrator 对 selected choice 的物件来源进行一致性校验。

## Confidence
high
