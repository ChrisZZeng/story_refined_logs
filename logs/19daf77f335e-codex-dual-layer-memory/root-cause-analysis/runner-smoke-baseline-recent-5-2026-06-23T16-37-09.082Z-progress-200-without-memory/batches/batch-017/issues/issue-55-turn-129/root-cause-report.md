# issue-55-turn-129 Root Cause Report

## Problem
- issueIndex: 55
- turn: 129
- problemSummary: 第 129 轮把一直贴在胸口内袋、此前多次被写成温热/贴着体温的银色铃铛改成冰凉触感，没有可见降温过程。

## Validity
- issueValidity: valid
- verdictReason: 问题有效。第 116、123、124、126、127 轮均支持银铃在外套内袋贴着胸口温度；第 129 轮检查时仍是在开门前、室内整理装备阶段，却写成冰凉金属，缺少合理承接。
- playerVisibleSupport: 第 123 轮玩家把铃铛放回内袋时感到‘那团温热重新贴上了胸口’；第 124、126、127 轮都写银铃贴着胸口的温度；第 129 轮突然写‘冰凉的金属触感’。
- caveats: 金属本身可比体表显凉，但文本此前反复强调温热，且第 129 轮用‘冰凉’作强对比，超出了自然温差的合理范围。

## Context Assessment
- actualStateBeforeIssue: 问题发生前，主角仍在卡尔小屋内整理装备准备出门；银色铃铛一直放在外套左胸内袋，贴近胸口和体温，没有被放到冷处。
- relevantFacts:
  - claim: 银铃在外套内袋，贴着胸口温度 | availability: present-clear | artifacts: turn-129/06a-director-prompt.md:650, turn-129/06a-director-prompt.md:686, turn-129/06a-director-prompt.md:702 | notes: 最近几轮玩家经历中多次出现，尤其第 124、126、127 轮都在 prompt 内。
  - claim: 第 123 轮专门检查过铃铛，放回时仍温热 | availability: present-buried | artifacts: visible-timeline.jsonl turn 123, turn-128/06a-director-prompt.md | notes: 到第 129 轮已滑出 recentTurns，但被当前故事线摘要保留为‘拿出银色铃铛检查’。
  - claim: 第 129 轮 Director 要求检查银色铃铛 | availability: present-clear | artifacts: turn-129/06-llm-calls.json call0 | notes: requiredContent 点名银铃，但没有把温热/贴胸口作为必须保留的物体状态。
  - claim: 金属常见触感可被写成凉 | availability: over-constraining | artifacts: turn-129/06-llm-calls.json call1 | notes: 不是 prompt 明示，而是模型在感官细节优先和金属描写习惯下的局部生成压力。
- competingPressures: 本轮 requiredContent 要逐项检查装备；pacing 为感官细节优先；银铃是金属物件，模型容易套用‘冰凉金属’描写；温热事实存在于长 recent prose 中，而不是当前物品状态字段或 Director JSON

## Causal Chain
- firstDivergenceArtifact: turn-129/06-llm-calls.json call1 narrator text（同步落入 turn-129/04-output.json）
- triggeringPressure: Director 要求检查银色铃铛，并建议感官细节优先；Narrator 需要为手指触碰铃铛补一个触觉形容。
- missingGuard: 最近几轮‘贴着胸口的温度/温热’没有被提升为当前 object state 或 Director required constraint；Narrator 虽能在长上下文中读到该事实，但没有更高优先级的保留约束来压过金属=冷的局部联想。
- mechanismStatement: 在感官细节优先的装备检查中，银铃温热事实只以长 prose 形式存在而未被结构化锚定，Narrator 用默认金属触感补写为‘冰凉’，使近期明确物体状态被局部描写习惯覆盖。
- directCause: 第 129 轮 Narrator 在检查铃铛段落生成‘冰凉的金属触感’。
- propagation: 该温度错误出现在正文中，但本轮结尾又写‘铃铛贴着心跳’，未进一步写入结构化 runtime state；主要影响停留在可见文本局部冲突。
- nonCauses: 不是玩家输入要求降温或取出铃铛暴露在冷空气中。；不是卡琳娜/卡尔剧情信息影响；两者本轮不出场。；不是旧远期记忆缺失 alone；第 124、126、127 轮温度线索就在第 129 轮 prompt 中。

## Root Cause
- label: context-priority
- family: agent-system
- secondaryFamilies: recent-context
- description: 触发压力是感官细节优先的装备检查需要描写金属触感；缺失防线是最近明确的‘银铃贴胸口温热’没有以高优先级 object state/requiredContent 进入 Narrator 合约。于是模型用更常见的金属冰凉描写覆盖了 recent context 中的物体温度。
- fixSurface: current-object-state extraction from recent turns；Director handoff should include salient object properties when requiring item checks；Narrator prompt priority rule for last-described physical state over generic sensory defaults

## Evidence
- playerVisible: 第 123 轮铃铛被写成温热并放回胸口内袋；第 124、126、127 轮继续贴着胸口温度；第 129 轮在出门前摸到时却冰凉。
- internalTrace: turn-129/06a-director-prompt.md 最近几轮玩家经历包含多处‘贴着你胸口的温度’；turn-129/06-llm-calls.json call0 只写‘检查...银色铃铛’，call1 首次生成‘冰凉的金属触感’。

## Recommended Fix Area
在 Director/Narrator handoff 中加入当前物体状态锚点，尤其当 requiredContent 要检查某件物品时，自动提取最近一次描述的温度、位置、封装和完整性作为 must-preserve facts。

## Confidence
high
