# issue-44-turn-108 Root Cause Report

## Problem
turn 107 已写卡琳娜“手指从书脊上抬起来...收回身侧”，turn 108 开头却写“卡琳娜的手指停在旧书的书脊上没有动”。

## Validity
- issueValidity: valid
- 这是玩家可见的相邻 turn 姿势冲突。
- 严重度低：它没有改变剧情路线，只造成短暂空间/身体连续性 glitch。

## Context Assessment
- actualStateBeforeIssue: 卡琳娜刚把手从书脊移开并收回身侧；玩家说“我也去”。
- relevantFacts:
  - `present-clear`: 最新姿势在 `logs/19daf77f335e-codex-dual-layer-memory/consistency-review/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/visible-timeline.jsonl` turn 107 和 `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-108/06a-director-prompt.md` 最近几轮中出现。
  - `stale`: 旧书/书脊/手指停留 motif 在 turn 105-107 多次出现。
  - `present-clear`: `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-108/06-llm-calls.json` Director actionHint 是“轻敲桌沿或看向卡尔”，并未要求手在书脊上。
- competingPressures: 场景慢铺、手指与旧书作为反复视觉锚点、缺少结构化 current pose。

## Causal Chain
- firstDivergenceArtifact: `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-108/06-llm-calls.json[1].text`
- triggeringPressure: 最近上下文高频“手指停在旧书/书脊”，且本轮 pacing 要求感官细节优先。
- missingGuard: 没有 `Karina.handPosition=at_side` 这类 current-pose guard；最新姿势只埋在长篇 prose 尾部。
- directCause: Narrator 开场复用 stale 姿势，写成“手指停在旧书的书脊上没有动”。
- propagation: 同一 turn 后文又写“手指从旧书书脊上抬起来”，形成小范围重复抬手。
- nonCauses: 不是玩家动作、不是 fixed storyline、不是长期记忆问题。

## Root Cause
- label: context-priority
- family: recent-context
- secondaryFamilies: agent-system
- description: 最新相邻 turn 姿势没有被提升为当前场景状态，Narrator 在旧书/手指 motif 压力下优先复用了较早姿势。
- fixSurface:
  - Recent-turn context assembly 抽取上一轮结尾 pose/location deltas。
  - Narrator 增加相邻 turn 姿势连续性检查。
  - active scene 可选增加轻量 `characterPose`。

## Evidence
- playerVisible: `logs/19daf77f335e-codex-dual-layer-memory/consistency-review/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/visible-timeline.jsonl` turn 107-108。
- internalTrace: `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-108/06a-director-prompt.md`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-108/06b-narrator-prompt.md`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-108/06-llm-calls.json`。

## Recommended Fix Area
把上一轮末尾的身体姿势/手部位置作为 current-scene anchor 传递给 Director/Narrator；若要改变姿势，必须先生成过渡动作。

## Confidence
high
