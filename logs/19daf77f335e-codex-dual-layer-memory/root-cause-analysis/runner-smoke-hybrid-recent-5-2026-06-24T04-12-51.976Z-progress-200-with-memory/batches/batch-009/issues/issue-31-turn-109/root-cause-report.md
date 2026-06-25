# Issue 31 / Turn 109

## Problem
第109轮正文已经回答“手空出来了，打算做什么”，但同轮选项又给出“问她空下来的手，想试试做什么”，把刚回答的问题换一种说法继续提供。

## Validity
issueValidity: `valid`

turn-109 玩家输入是“那现在呢——手空出来了，打算做什么？”卡琳娜回答“还没想好”“你问我打算做什么——我不知道”“但是……不急着知道”。同轮选项“问她空下来的手，想试试做什么”语义上仍是追问同一件事，且 turn-110 选中后确实导向重复回答。

## Context Assessment
- actualStateBeforeIssue: 当前问题已得到“不知道/不急”的回答，后续应陪伴、换话题、分享经验或提出真正新的细分方向。
- relevant fact: 本轮 playerInput 的 core intent 已被满足；在 `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-109/06c-choice-prompt.md` 中 `present-clear`。
- competing pressure: “空出来的手”是正文结尾高显著意象，Choice 又必须产出主动行动，容易把未定状态误当成可重复追问。

## Causal Chain
- firstDivergenceArtifact: `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-109/04-output.json#choices`
- triggeringPressure: 高显著“空手”意象 + 没有强剧情出口。
- missingGuard: Choice 没有 answered-intent 记录，也没有语义去重检查。
- directCause: Choice 输出“问她空下来的手，想试试做什么”。
- propagation: 玩家在 turn-110 选中该重复选项，触发下一轮重复场景。

## Root Cause
rootCause.label: `choice-action-binding`

family: `agent-system`  
secondaryFamilies: `recent-context`

L3 mechanism: 选项生成没有把“玩家刚问的问题”和“正文已经给出的回答”绑定成已满足意图，导致同一语义槽被重新包装为下一步行动。

## Evidence
- playerVisible: `logs/19daf77f335e-codex-dual-layer-memory/consistency-review/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/visible-timeline.jsonl` turn-109。
- internalTrace: `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-109/06c-choice-prompt.md`、`logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-109/04-output.json`。

## Recommended Fix Area
在 Choice worker 中加入 answered-intent extraction：对本轮 playerInput 与 visible answer 建立语义槽，过滤近义重复选项；需要继续该话题时，必须明确推进到新维度。

## Confidence
`high`
