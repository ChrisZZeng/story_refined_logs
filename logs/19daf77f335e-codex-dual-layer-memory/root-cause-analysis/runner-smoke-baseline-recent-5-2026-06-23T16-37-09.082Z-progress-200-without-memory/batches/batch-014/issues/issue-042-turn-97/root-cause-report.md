# issue-42-turn-97 Root Cause Report

## Problem
玩家刚看到卡琳娜在 turn 95 把旧书合上并推到桌中央，turn 96 也延续为封面/合上的书；turn 97 却直接写成“长桌上那本翻开的旧书”，并继续描写同一组可见符号。

## Validity
- issueValidity: valid
- 玩家可见证据足够：turn 95 “她合上了书”“把合上的书往桌中央推了推”；turn 96 只出现旧书封面；turn 97 没有重新打开动作，却出现“翻开的旧书”和清晰符号。
- 合理部分：玩家追问旧书的“感觉”是连续话题；问题只在物理状态被 negated。

## Context Assessment
- actualStateBeforeIssue: 旧书应为 closed，在桌中央；玩家只是询问“感觉是什么意思”，没有选择或叙述任何 reopen action。
- relevantFacts:
  - `present-clear`: 旧书已合上并被推到桌中央，见 `logs/19daf77f335e-codex-dual-layer-memory/consistency-review/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/visible-timeline.jsonl` 与 `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-97/06a-director-prompt.md` 最近几轮。
  - `present-clear`: 玩家输入为询问，不是重新翻书，见 `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-97/06a-director-prompt.md`。
  - `stale`: 早先 “翻开的旧书”“三条弧线和两个短点”仍在 prompt 中高频出现。
  - `absent`: `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-97/03-story-state.json` 没有结构化 `book.open=false` 或当前位置字段。
- competingPressures: 旧书/符号是连续场景核心；“感觉”话题自然牵引回书页；一致性规则只是泛化提示，不是硬约束。

## Causal Chain
- firstDivergenceArtifact: `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-97/06-llm-calls.json[0].object`
- triggeringPressure: Director beat 写成“主角走向长桌，指向翻开的旧书”，requiredContent 要求“手指、书页和壁炉火光”的视觉关联。
- missingGuard: 缺少 current-scene object-state anchor，未明确“书已合上，除非本轮先重开，否则不能描写书页/符号”。
- directCause: Narrator 按错误 Director 骨架输出“翻开的旧书”和可见符号。
- propagation: turn 98 继续围绕“面前的书页”和翻页时的气味/触感推进。
- nonCauses: 不是玩家输入要求翻书；不是 Choice worker 首发；不是 hidden lore 要求书打开。

## Root Cause
- label: context-priority
- family: agent-system
- secondaryFamilies: recent-context
- description: stale 的 opened-page/symbol 语境比最新 closed 状态更显著，而系统没有把最新物体状态结构化为 Director/Narrator 的硬优先级，导致旧状态覆盖新状态。
- fixSurface:
  - Director prompt/context assembly 增加 current-scene object-state anchor。
  - Narrator handoff schema 加入 `objectState` delta，例如 `book.open=false`。
  - State writeback 持久化可见 close/open 与 item position。

## Evidence
- playerVisible: `logs/19daf77f335e-codex-dual-layer-memory/consistency-review/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/visible-timeline.jsonl` turn 95-97。
- internalTrace: `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-97/06-llm-calls.json`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-97/06a-director-prompt.md`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-97/06b-narrator-prompt.md`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-97/04-output.json`。

## Recommended Fix Area
在 context assembly 和 handoff 中加入“最新可见物理状态”层，且让 Narrator 在引用旧物件细节前验证状态是否仍成立。

## Confidence
high
