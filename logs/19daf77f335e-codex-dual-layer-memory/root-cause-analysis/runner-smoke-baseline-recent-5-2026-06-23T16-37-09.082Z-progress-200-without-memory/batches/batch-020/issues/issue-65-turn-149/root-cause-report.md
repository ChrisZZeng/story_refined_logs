# issue-65-turn-149

## Problem
第 149 轮在卡尔小屋门口写出“一小片昨夜的积水”和“石板路面上的水渍正在蒸发”，但玩家此前已经多次看到同一门口石板/石阶是干燥的、旧雨痕“不是积水”。

## Validity
- issueValidity: valid
- 玩家可见支持：第 131 轮写“干燥的石面和鞋底之间没有水汽”以及“不是积水”；第 132 轮再次写“干燥的石板路”“不是积水”“干燥的，结实的”；第 133 轮玩家坐在石阶上，看到“干燥的、灰白色的石面”。
- 第 149 轮没有新降雨或洒水承接，却把门口石阶改成“一小片昨夜的积水”。“水渍”可弱读成旧雨痕，但“积水”与先前直接冲突。

## Context Assessment
问题发生前，玩家在屋内等待卡琳娜，最近几轮主要是摸相机、清点钱包、整理相机包和观察窗外；门口地面干燥这个事实来自更早的第 131-133 轮，已经滑出第 149 轮的 recentTurns。

- relevantFacts:
  - 门口石板/石阶已干燥且不是积水：availability=absent 于第 149 轮 Director/Narrator prompt；玩家可见证据在 `logs/19daf77f335e-codex-dual-layer-memory/consistency-review/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/visible-timeline.jsonl:turn-131`、`:turn-132`、`:turn-133`。
  - 本轮动作只是去门口看巷口：availability=present-clear 于 `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-149/07-events.json` 的 director 输出。
  - 感官慢铺、晨光、空气、寂静：availability=over-constraining；它们靠近第 149 轮 Narrator 生成指令，但没有“保持干燥”的场景锚点。
- competingPressures: Director 的 pacing 要求“慢铺，感官细节优先”；近期有窗雾、雨后晨光、屋檐影子等意象；一致性要求只是一般原则，没有可执行的地面 wet/dry 约束。

## Causal Chain
- firstDivergenceArtifact: `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-149/07-events.json` 的 narrator worker-done / `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-149/04-output.json`
- Director 只安排“主角起身走到门口，观察巷口是否有卡琳娜的动静”，并没有要求积水。
- Narrator prompt 未带入第 131-133 轮“不是积水”的细节；story state 也没有卡尔小屋门口地面状态。
- Narrator 在雨后晨光与感官描写压力下，把旧雨痕扩写成“昨夜积水”和“正在蒸发的水渍”。
- 错误直接成为玩家可见正文；没有 runtime-after 或 events 证据显示有新水源。

## Root Cause
- label: memory-persistence
- family: detail-memory
- secondaryFamilies: recent-context
- L3 root mechanism: 门口地面“干燥、不是积水”的局部环境事实没有被持久化为场景状态；当该事实滑出 recentTurns 后，Narrator 在感官慢铺和雨后晨光意象压力下缺少硬性防线，重新生成了昨夜积水。
- fixSurface:
  - scene-state/writeback：记录当前地点的物理状态，如地面 wet/dry、是否有 puddle。
  - prompt assembly：把当前场景物理锚点放入 Director/Narrator prompt 的高优先级区域。
  - Narrator guard：写雨后水汽/雨痕前检查同地点是否已明确“不是积水”。

## Evidence
- playerVisible: 第 131-133 轮的干燥/非积水描写，与第 149 轮“一小片昨夜的积水”冲突。
- internalTrace: 第 149 轮 prompt 只含第 144-148 轮最近经历，缺少第 131-133 轮；Director 没有要求积水；Narrator 输出首次引入积水。

## Recommended Fix Area
优先补 scene-state/writeback 与 prompt assembly 的当前场景物理状态锚点，避免局部环境细节滑出 recentTurns 后被感官描写重写。

## Confidence
high
