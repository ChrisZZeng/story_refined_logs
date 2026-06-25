# issue-68-turn-158

## Problem
第 158 轮玩家选择文本为“从相机包里拿出烟点上，让呼吸更稳一些”，正文改成“你从外套内袋里摸出烟盒”。字面来源被替换，但点烟、吸烟、稳定呼吸的核心动作被保留。

## Validity
- issueValidity: questionable
- 玩家可见支持：第 157 轮选项和第 158 轮玩家输入都写“从相机包里拿出烟”；第 158 轮正文写“从外套内袋里摸出烟盒”。
- 为什么不是明确 valid：按 player-input 规则应判断核心 actionable intent，而不是只看字面词。这里核心意图是抽烟稳定呼吸，正文完整执行了。并且第 157 轮“从相机包”本身已因相机包不可达而有问题，Narrator 改成外套内袋可理解为隐性修复。
- caveat: 由于正文没有解释“为什么不用相机包”，玩家仍可能感到来源被无声替换；这是 UX/桥接问题，而不是强证据的 core intent ignored。

## Context Assessment
玩家坐在门外石阶上。上一轮相机包来源不可达；第 158 轮正文选择更可执行的随身外套内袋来源来完成抽烟动作。

- relevantFacts:
  - 选择文本指定相机包：availability=present-clear 于 `logs/19daf77f335e-codex-dual-layer-memory/consistency-review/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/visible-timeline.jsonl:turn-157` 与 `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-158/06b-narrator-prompt.md`。
  - 玩家当前在室外石阶，相机包不可达：availability=present-clear，来自第 155-157 轮可见上下文。
  - 核心动作“点烟稳定呼吸”：availability=present-clear；`logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-158/04-output.json` 完整执行。
  - 烟盒在外套内袋：availability=absent 作为此前稳定铺垫，但它使动作在当前场景中可执行。
- competingPressures: 保留玩家抽烟核心意图；修复第 157 轮不可达相机包来源；缺少显式 repair/bridge 文案约定。

## Causal Chain
- firstDivergenceArtifact: evaluator / literal source comparison；可见 mismatch 出现在 `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-158/04-output.json` narrator 正文。
- 第 158 轮 Director summary 抽象为“拿出香烟点燃，通过吸烟稳定呼吸”，没有保留“相机包”来源。
- Narrator 写成“从外套内袋里摸出烟盒”，使当前坐在石阶上的动作可执行。
- 这可以被读作无说明替换，也可以读作对前一轮错误选项的隐性修复；证据不足以判定核心输入被忽略。

## Root Cause
未分配 rootCause，因为 issueValidity=questionable。若产品要消除该观感，潜在修复面是 selected choice repair contract：当选项来源与当前场景可达性冲突时，正文应显式桥接，例如说明相机包不在手边、转而摸向外套内袋；根本修复仍是 issue 67 的 Choice 可达性校验。

## Evidence
- playerVisible: 第 157/158 轮“相机包”与第 158 轮“外套内袋”字面冲突；同一正文保留了点烟和稳定呼吸。
- internalTrace: 第 158 轮 Director 抽象掉来源，Narrator 使用外套内袋；events 无额外 pre-LLM 事件说明修正。

## Recommended Fix Area
优先修 issue 67 的 Choice 可达性校验；同时给 Narrator/Director 增加 selected choice repair bridge，避免无说明替换玩家可见来源。

## Confidence
medium
