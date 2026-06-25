# issue-2-turn-3 Root Cause Report

## Problem
turn-3 选项“直接去暗街，往日总是如影随形”把明确行动和抽象短语硬拼，玩家难以判断后半句是否也是行动内容或情绪承诺。

## Validity
- issueValidity: `valid`
- verdictReason: 该问题成立。turn-3 正文只建立了“去暗街找卡琳娜/注意外来者被盯上”的行动场景，选项前半句可执行，后半句“往日总是如影随形”既不是动作，也没有在本轮正文中被建立为可点击意图。
- playerVisibleSupport: turn-3 visibleText 结尾是“暗街。申诉人。情报有价。”和“这个地方不会白白告诉你任何事。”，随后 choices 显示“直接去暗街，往日总是如影随形”。
- caveats:
- 后半句可以被理解为主题化文案，但作为可点击选择缺少动作边界，因此仍是 choices scope 的质量退化。

## Context Assessment
actualStateBeforeIssue: 玩家刚进一步打听卡琳娜，小贩说明卡琳娜住在暗街、情报有价，并提醒外来记者可能被盯上；此时自然选择应是去暗街或观察异常目光。

relevantFacts:
- `present-clear` 本轮可执行目标是前往暗街或留意被盯上。 artifacts: visible-timeline.jsonl, turn-03/04-output.json. 正文和第二个选项都围绕这两个动作。
- `present-clear` story state 的 candidateActions 已经包含问题文案。 artifacts: turn-03/03-story-state.json. candidateActions[0].text 为“直接去暗街，往日总是如影随形”，且 key=true。
- `present-clear` Choice prompt 本身要求选项短、具体、可点击，并以正文结尾判断玩家能合理做什么。 artifacts: turn-03/06c-choice-prompt.md. 该质量约束存在，但没有约束最终可见选项覆盖逻辑。
- `present-clear` raw Choice LLM call 曾给出较清晰选项。 artifacts: turn-03/06-llm-calls.json. call[2].object 中有“按小贩的指点，起身前往暗街”，但运行事件和 04-output 最终采用了 candidateActions 文案。

competingPressures: key choice/actionId 需要暴露剧情出口；candidateActions 被视为强绑定选项；choiceGenerator 的文本质量要求没有覆盖状态机候选动作的 display text；lockInput=true 使玩家只能在这些关键出口中选择

## Causal Chain
- firstDivergenceArtifact: `turn-03/03-story-state.json candidateActions[0].text；传播到 turn-03/07-events.json choiceGenerator worker-done 和 turn-03/04-output.json choices`
- triggeringPressure: 状态机候选动作把 key action 的展示文案直接写成“直接去暗街，往日总是如影随形”，并带 actionId=choice:前往暗街/key=true；choiceGenerator 最终以 lockInput 输出该候选动作。
- missingGuard: 缺少 candidateAction.displayText 的可点击性校验，也缺少“actionId/anchor label 可绑定，但最终玩家可见文本必须由 Choice prompt 改写或审核”的合约。
- mechanismStatement: 关键剧情出口的 candidateAction 文案被直接当作玩家可见 choice 使用，且 lockInput 强化了该绑定；由于没有把机器动作语义与可见按钮文本分离，抽象主题短语绕过 Choice prompt 的清晰行动要求进入了最终选项。
- directCause: choiceGenerator worker-done 输出了 candidateActions 中的原始 text，而不是 raw Choice LLM call 中更清晰的“按小贩的指点，起身前往暗街”。
- propagation: 问题选项进入 turn-03/04-output.json，turn-04 的 playerInput 也变成“直接去暗街，往日总是如影随形”，继续污染下一轮输入语义。
- nonCauses:
- 不是玩家输入导致，问题出现在玩家选择前的 options。
- 不是 Narrator 正文问题，正文目标足够清楚。
- 不是纯 LLM 选择生成失败，因为 raw choice call 中存在清晰改写；最终可见文本来自状态机候选动作覆盖。

## Root Cause
- label: `choice-action-binding`
- family: `agent-system`
- secondaryFamilies: `none`
- description: 状态机 key action 的 display text 与 actionId 绑定过紧，候选动作文案未经 Choice worker 的可点击性改写/校验就被 lockInput 输出；触发压力是关键剧情出口必须暴露，缺失防线是 display text 质量 gate，失败运动是候选动作文本绕过清晰选项合约进入 UI。
- fixSurface:
- choiceGenerator: key candidateActions 也必须通过可见文本改写或 lint
- candidate action schema: 分离 machineLabel/actionId 与 playerFacingText
- choice output validator: 禁止逗号拼接的抽象短语或非动作尾巴

## Evidence
- playerVisible: turn-3 choices 直接显示“直接去暗街，往日总是如影随形”；同轮正文只支持“去暗街”和“可能被盯上”。
- internalTrace: turn-03/03-story-state.json candidateActions[0].text 已含问题文案；turn-03/07-events.json 的 choiceGenerator worker-done 输出相同文案并 lockInput=true；turn-03/06-llm-calls.json call[2] 反而有更清晰的选项。
- tracePacket: `issues/issue-2-turn-3/trace.md`

## Recommended Fix Area
优先修复 choice pipeline：所有 key choice 的 player-facing text 都经过同一套短、具体、动作化的改写和 lint，不允许状态机 text 直接覆盖最终 choices。

## Confidence
`high`
