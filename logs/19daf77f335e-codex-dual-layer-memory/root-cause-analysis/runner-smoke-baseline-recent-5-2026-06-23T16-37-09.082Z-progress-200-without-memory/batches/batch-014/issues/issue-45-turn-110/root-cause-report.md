# issue-45-turn-110 Root Cause Report

## Problem
turn 110 把银色铃铛写成卡尔“已经给过你”的东西；turn 111/112 又写进玩家外套内袋。但此前玩家可见 timeline 中，铃铛在卡尔/卡琳娜处，没有可见交接。

## Validity
- issueValidity: valid
- 玩家可见证据：turn 87 卡琳娜说“它已经在我手里了”并把银铃收进口袋；turn 91 银铃在卡琳娜指间；之后到 turn 109 无 handoff。
- turn 110 的“她已经给过你的东西”和 turn 111 的“外套内袋——银色铃铛还在那里”直接与可见 timeline 冲突。
- caveat: “卡尔提醒带上铃铛”本身可以合理；错误是默认它已在玩家身上。

## Context Assessment
- actualStateBeforeIssue: 银铃应由卡琳娜/卡尔一方持有；若需要玩家携带，必须先写出可见交接。
- relevantFacts:
  - `absent`: `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-110/03-story-state.json` 没有记录 silver bell owner；最近五轮也不含 turn 86-91 的可见持有细节。
  - `over-constraining`: 卡尔角色卡含“你留着。她不需要知道。（给主角银色铃铛时）”，见 `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-110/06a-director-prompt.md` 与 `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-110/06b-narrator-prompt.md`。
  - `present-clear`: `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-110/06-llm-calls.json` Director 只写“卡尔提醒带上银铃铛”，没有写“已经给玩家”。
  - `absent`: `carriedItems` 没有铃铛，缺少 item ownership persistence。
- competingPressures: 港口计划需要准备物；角色卡参考台词暗示未来/可能交给玩家；currentStoryline 只概括“提醒她带上银铃铛”，未保留 owner。

## Causal Chain
- firstDivergenceArtifact: `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-110/06-llm-calls.json[1].text`
- triggeringPressure: Director 要体现“卡尔提醒带上银铃铛”，而 prompt 内隐藏角色参考含“给主角银色铃铛时”。
- missingGuard: 没有 item owner/location state，也没有说明角色卡示例不是已发生事件。
- directCause: Narrator 自行补全为“提醒你一件她已经给过你的东西”。
- propagation: turn 111/112 把铃铛固定在玩家外套内袋。
- nonCauses: 不是玩家请求获得铃铛；不是 Director 明确说已给；不是评测误判。

## Root Cause
- label: memory-persistence
- family: detail-memory
- secondaryFamilies: agent-system
- description: 具体命名物品 silver bell 的当前 owner/location 没有被持久化；当最近上下文缺失时，Narrator 在“带上铃铛”要求和隐藏参考台词压力下生成了未发生的交接。
- fixSurface:
  - Item/inventory state model 持久化 named portable object 的 owner/location。
  - Director handoff 对物品引用加入 `currentOwner`、`transferRequired`、`visibleHandoffRequired`。
  - Prompt boundary 标注角色卡示例台词为 non-event。

## Evidence
- playerVisible: `logs/19daf77f335e-codex-dual-layer-memory/consistency-review/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/visible-timeline.jsonl` turn 86-91, turn 110-112。
- internalTrace: `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-110/03-story-state.json`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-110/06a-director-prompt.md`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-110/06b-narrator-prompt.md`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-110/06-llm-calls.json`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-111/06-llm-calls.json`。

## Recommended Fix Area
为 named items 建立 inventory/ownership memory，并在 handoff 中强制区分“提醒带上”“交给玩家”“玩家已持有”。

## Confidence
high
