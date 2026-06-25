# Root Cause Report: issue-58-turn-132

## Problem
- issueIndex: 58
- turn: 132
- problemSummary: turn 132 在玩家选择相近动作后，把 turn 131 已经完成的走下台阶、门口来回走、走到巷口又折返几乎重新演出。

## Validity
- issueValidity: valid
- verdictReason: 该问题成立。玩家确实选择了相似动作，因此可以继续踱步，但正文没有写成“继续”或变化，而是从台阶重新下来并重复同一路径和同一动机，忽略了上一轮已经在屋外完成过这些动作。
- playerVisibleSupport: turn 131 已写“在门口来回走了几步”“走到巷口又折返”“回到门口，站定”；turn 132 又写“从台阶上走下来”“在门口来回走了几步”“走到巷口又折返”，并再次解释为活动在屋里蹲坐太久的腿脚。
- caveats:
  - 因为玩家选择了近似选项，适度继续踱步本身合理；问题在于系统把上一轮完成的起点、路径和动机重演，而不是承接。

## Context Assessment
- actualStateBeforeIssue: turn 131 末尾主角已经走过门口、到巷口折返并回到门槛边等待；玩家随后选择“在门口来回踱步，活动活动腿脚”，应被处理为继续等待中的小幅延续或变化。
- relevantFacts:
  - claim: 上一轮已经完成门口来回走动并到巷口折返。
    availability: present-clear
    artifacts: visible-timeline.jsonl, turn-132/06a-director-prompt.md, turn-132/06b-narrator-prompt.md
    notes: turn 132 prompt 的 recentTurns 明确包含 turn 131 完整走动过程。
  - claim: turn 131 Choice 输出提供了与刚完成动作高度相似的选项。
    availability: present-clear
    artifacts: turn-131/04-output.json, turn-131/06c-choice-prompt.md, turn-131/06-llm-calls.json
    notes: “在门口来回踱步，活动活动腿脚”把已完成动作包装成下一步可选行动。
  - claim: Director 系统提示有“不要重复、重演已发生情节”的通用规则。
    availability: present-clear
    artifacts: turn-132/06a-director-prompt.md
    notes: 该规则没有具体说明如何处理玩家选择了刚完成动作的近义选项。
  - claim: 选项和动作绑定缺少 consumed/duplicate 标记。
    availability: absent
    artifacts: turn-131/04-output.json, turn-132/01-summary.json
    notes: selectedFromPreviousTurn 只保留文本；Director 无法区分这是新动作、继续踱步还是重复点击。
- competingPressures:
  - 玩家选择本身与上一轮动作相近
  - Choice 阶段刚给出重复选项，强化了它的可执行性
  - Director 输出的 beats 明确要求走下台阶、来回走动、回到门口
  - Narrator 按 Director 骨架慢铺感官细节

## Causal Chain
- firstDivergenceArtifact: turn-131/04-output.json choices
- triggeringPressure: Choice generator 在 turn 131 结束时没有过滤刚刚消费过的“门口走动”活动，给了玩家一个近义重复选项；turn 132 Director 又把该文本当成全新行动来安排。
- missingGuard: 缺少 next-choice novelty/consumed-action guard，也缺少 Director 对重复选项的 continuation binding 规则：若玩家选择刚完成动作，应写“继续踱步/换个节奏/短暂延续”，而不是重置到动作起点。
- mechanismStatement: 已消费的低成本场景动作没有被标记为 consumed，Choice 把它重新暴露为下一步，Director 再把近义选择绑定成 fresh action，导致 Narrator 复演上一轮场景。
- directCause: turn 132 Director 输出重复 beats：走下台阶、来回走动、倾听、回到门口；Narrator 按这些 beats 写出几乎相同正文。
- propagation: 重复动作进入 visibleText，并通过 currentStoryline update 汇总为“来回踱步活动身体”，后续继续停留在等待循环。
- nonCauses:
  - 不是玩家脱轨；玩家只是在系统给出的选项中选择
  - 不是长程记忆缺失；上一轮就在 prompt 中
  - Narrator 不是唯一源头，它是在执行重复的 Director/choice 绑定

## Root Cause
- label: choice-action-binding
- family: agent-system
- secondaryFamilies: recent-context
- description: Choice 阶段缺少对刚完成动作的去重和 consumed 状态，Director 阶段缺少把重复选项解释为延续而非重演的绑定规则；两者叠加使相近玩家选择被重新演出为完整旧场景。
- fixSurface:
  - Choice generator option novelty scoring
  - selected action schema with consumed/continuation metadata
  - Director duplicate-action handling prompt

## Evidence
- playerVisible: turn 131 与 turn 132 的正文在动作起点、路径、动机和等待落点上高度重合。
- internalTrace: turn-131 choices 暴露近义重复选项；turn-132 Director beats 明确重复上一轮动作；turn-132 Narrator 输出只是按该骨架落文。

## Recommended Fix Area
为 Choice 增加已消费动作过滤和相似度去重；为 Director 增加 duplicate selected action 的 continuation/variation contract。

## Confidence
high
