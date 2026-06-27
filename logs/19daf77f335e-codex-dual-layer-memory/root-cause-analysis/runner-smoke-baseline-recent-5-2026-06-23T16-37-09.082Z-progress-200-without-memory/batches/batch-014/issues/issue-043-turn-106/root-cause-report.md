# issue-43-turn-106 Root Cause Report

## Problem
turn 106 将玩家未实际经历的 Connor 会面写成具体回忆：“我坐在那个位子上——康纳正对面那张椅子的扶手...”，并让卡琳娜确认“那张椅子的左扶手”。

## Validity
- issueValidity: valid
- 玩家可见证据：turn 27 只介绍 Connor，并建议“你应该见见她”；turn 28 玩家选择“仍然决定告辞，改日再说”，正文写玩家离开宴会厅走进雨里。
- turn 106 的坐在 Connor 对面、观察椅子左扶手没有玩家可见前因。
- caveat: turn 31 已经错误出现“你见到康纳了/见到了”，但这是污染链的一部分，不是对 turn 106 具体座位记忆的有效支持。

## Context Assessment
- actualStateBeforeIssue: 玩家去过宴会相关场景，听过 Connor 的名字，也讨论过宴会权力结构；但没有可见的 Connor 对坐谈判或椅子观察。
- relevantFacts:
  - `present-buried`: 未见 Connor 的事实存在于 `logs/19daf77f335e-codex-dual-layer-memory/consistency-review/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/visible-timeline.jsonl` turn 27-28，也在 `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-106/06a-director-prompt.md` 历史摘要“主角坚持告辞...离开宴会厅”中。
  - `present-clear`: 玩家输入只是在回应卡琳娜对宴会结构的追问。
  - `over-constraining`: `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-106/06-llm-calls.json` Director requiredContent 允许“对康纳或德索洛家族的观察”。
  - `contradicted`: 历史概览仍保留“推进节点 05-02：康纳出场”和“推进节点 05-03：权力试探”，但同处又说玩家离开。
- competingPressures: fixed storyline 仍想推进 Connor 出场；帕兹角色卡强调观察取证；前序 turn 31 已污染为“见过康纳”。

## Causal Chain
- firstDivergenceArtifact: `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-106/06-llm-calls.json[1].text`；更早污染见 `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-31/06-llm-calls.json[1].text`。
- triggeringPressure: declined 的 Connor 节点没有被生命周期系统标记为 skipped/incompatible，仍通过历史概览和 Director handoff 对本轮施压。
- missingGuard: 没有“只能提及玩家已可见观察”的约束，也没有区分“可以谈 Connor 相关信息”和“玩家已经亲身见过 Connor”。
- directCause: Narrator 将“宴会被很多人穿过”的抽象感受具象化为玩家坐在 Connor 对面的未发生 prior event。
- propagation: turn 106 错误会成为后续最近上下文，继续固化 Connor 会面事实。
- nonCauses: 不是玩家主动要求补写会面；不是 Choice worker；不是单纯缺少记忆，而是 storyline lifecycle 与 handoff 边界错误。

## Root Cause
- label: storyline-lifecycle
- family: agent-system
- secondaryFamilies: recent-context
- description: 玩家拒绝 Connor encounter 后，相关 storyline 节点没有进入 skipped/incompatible 状态，仍以固定剧情压力留在 prompt；Director/Narrator handoff 未保护玩家可见事件边界，导致未发生分支被补成回忆。
- fixSurface:
  - Storyline node lifecycle 增加 skipped/incompatible 状态。
  - Director handoff 区分 topic mention 与 already-seen event detail。
  - Narrator prompt 禁止创建没有 visible support 的 prior event。

## Evidence
- playerVisible: `logs/19daf77f335e-codex-dual-layer-memory/consistency-review/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/visible-timeline.jsonl` turn 26-28, turn 106。
- internalTrace: `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-106/06a-director-prompt.md`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-106/06b-narrator-prompt.md`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-106/06-llm-calls.json`, `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/turn-31/06-llm-calls.json`。

## Recommended Fix Area
优先修复 declined branch 的 storyline lifecycle 和 Director/Narrator 可见性边界；当玩家离开/拒绝节点时，后续只能引用“被建议见 Connor/尚未见”，不能生成已会面的细节。

## Confidence
high
