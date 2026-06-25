# Root Cause Report: issue-85

## Problem
- issueIndex: `85`
- turn: `198`
- issueValidity: `valid`
- problemSummary: turn 197 已把卡琳娜写成站在公园入口等玩家，turn 198 玩家也选择走近她；正文却无过渡地写她保持步行节奏、继续走着，造成当前空间动作断裂。

## Validity
- verdictReason: 玩家可见上下文明确：上一轮玩家停下回望公园，结尾说卡琳娜“正站在晨风中等着你”“只是站在那儿”；本轮输入是“走近她”。turn 198 正文开头却写“她没有加快脚步，也没有放慢——保持着刚才的节奏”，后文又说她继续走着。
- playerVisibleSupport: turn 197 结尾：卡琳娜披着外套，正站在晨风中等着你；turn 198 输入：走近她；turn 198 正文：她没有加快脚步也没有放慢、保持刚才节奏、她只是继续走着。
- caveats:
- turn 196 曾经写她迈步朝入口走去；如果 turn 197 没有停下等待，这个步行承接可以成立。但 turn 197 的最新可见状态已经覆盖了该旧动作。

## Context Assessment
- actualStateBeforeIssue: turn 197 后，玩家停下回望公园，随后转身朝卡琳娜站着等待的方向走去；卡琳娜位于公园入口/通往巷口的路边，处于静止等待状态。turn 198 应先写玩家走近这个静止目标，再自然开启对话或重新出发。
- relevantFacts:
- 卡琳娜在最新可见结尾是站着等待，而非行走。
  - availability: `present-clear`
  - artifacts: `visible-timeline.jsonl, turn-198/06a-director-prompt.md, turn-198/06b-narrator-prompt.md`
  - notes: recentTurns 明确包含“正站在晨风中等着你”“只是站在那儿”。
- 本轮玩家动作是走近她并询问等候时在想什么。
  - availability: `present-clear`
  - artifacts: `batch-issues.json, turn-198/01-summary.json, turn-198/06a-director-prompt.md`
  - notes: 输入里的“等的时候”进一步强化她处于等待状态。
- turn 196 的“迈步走出长椅旁阴影、步伐不大但稳”是旧动作，已被 turn 197 的停下/等待覆盖。
  - availability: `stale`
  - artifacts: `visible-timeline.jsonl, turn-198/06b-narrator-prompt.md`
  - notes: 该步行动作仍在 recentTurns 中，和最新站立等待状态并列出现。
- Director handoff 没有把“当前必须从站立等待恢复”提升为约束。
  - availability: `present-ambiguous`
  - artifacts: `turn-198/06-llm-calls.json, turn-198/04-output.json`
  - notes: Director summary 只说“主角走近卡琳娜”，beats 只说询问/回应；没有 location/pose/locomotion anchor，还错误把卡尔列入 involvedCharacters 和可能插话。
- 结构化 state 未保存当前物理姿态/运动状态。
  - availability: `absent`
  - artifacts: `turn-198/03-story-state.json, turn-198/05-runtime-after.json`
  - notes: entityStates 只有公园和卡琳娜的空/态度字段，缺少“standing_waiting”“walking”等可执行场景锚点。
- competingPressures:
- 当前故事线名为“归途反思”，整体目标是回卡尔小屋，天然推动“继续走”。
- recentTurns 同时包含 turn 196 的步行动作和 turn 197 的等待状态，且没有结构化优先级字段。
- Director handoff 停留在高层“走近/询问/回应”，未把最新可见站位变成 Narrator 必须满足的合同。
- Narrator 的风格材料反复使用“步伐、节奏、走路”来呈现温馨安静的关系节奏。

## Causal Chain
- firstDivergenceArtifact: `turn-198/06-llm-calls.json call 0 (director generateObject) 首次弱化当前站立等待锚点；可见的错误在 call 1 Narrator 输出和 turn-198/04-output.json 中成形。`
- triggeringPressure: Director 面对“归途”故事线和 recentTurns 中旧的步行动作，只输出高层“走近卡琳娜、询问她在想什么”，没有写明“她此刻仍站在入口等待”；Narrator 随后从旧的步伐/节奏素材中续写为正在行走。
- missingGuard: 缺少 current-scene anchor handoff：最新可见位置、姿态、运动状态没有独立字段，也没有规则要求当 recent text 冲突时必须优先 turn 197 结尾和本轮玩家输入。
- mechanismStatement: 最新可见的“站着等待”只埋在 recent prose 中，而 Director handoff 没有把它变成 Narrator 的 must-satisfy 约束；在“归途/步伐/节奏”的压力下，Narrator 选用了已过期的行走状态，生成无桥接的空间动作断裂。
- directCause: Narrator 将玩家“走近她”解释为追上正在行走的卡琳娜，而不是接近正在等待的卡琳娜。
- propagation: 错误首先进入 turn-198/04-output.json 的 visibleText，并通过 turn 199、turn 200 的 recentTurns 继续固化为两人一路行走的状态；runtime-after 没有单独纠正姿态/运动状态。
- nonCauses:
- 不是评测误判：玩家可见文本中“站着等”和“保持步行节奏”直接冲突。
- 不是 long-term memory 问题：所需信息就在最近一轮。
- 不是玩家输入歧义：玩家明确“走近她”且提到她“等的时候”。

## Root Cause
- label: `handoff-contract`
- family: `agent-system`
- secondaryFamilies: `recent-context`
- description: Director→Narrator handoff 缺少 current-scene anchor 合同：最新可见的“卡琳娜站着等待”没有被提升为结构化 must-satisfy 字段，旧的步行文本和“归途”故事线压力仍留在 prompt 中；Narrator 因而沿用过期运动状态，把静止会合写成持续行走。
- fixSurface:
- `Director output schema：加入 currentSceneAnchor / locomotionState / mustRespectRecentVisible 字段`
- `Narrator prompt：当 recentTurns 有冲突时显式优先最新可见结尾和本轮玩家输入`
- `state writeback：保存角色当前位置、姿态和运动状态，供下一轮检索`
- `continuity lint：检测“上一轮站着等”后无桥接出现“保持步行节奏/继续走着”的冲突`

## Evidence
- playerVisible: turn 197 结尾写卡琳娜“正站在晨风中等着你”“只是站在那儿”；turn 198 正文写“她没有加快脚步，也没有放慢——保持着刚才的节奏”以及“她只是继续走着”。
- internalTrace: turn-198/06a-director-prompt.md 与 06b-narrator-prompt.md 都包含最新站立等待文本；turn-198/06-llm-calls.json 的 Director object 未保留该姿态锚点，反而给出泛化场景“公园”和 stale 的卡尔参与提示；Narrator call 1 首次把该轮写成持续行走。turn-198/05-runtime-after.json 的 entityStates 没有记录运动状态。

## Recommended Fix Area
优先修复 Director 到 Narrator 的 current-scene anchor handoff，并增加 recent visible conflict priority；结构化保存角色姿态/运动状态可作为长期防线。

## Confidence
`high`
