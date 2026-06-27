# issue-1-turn-1 Root Cause Report

## Problem
同一名小贩在 turn-1 内先被叙述为“他看着你”，随后又被叙述为“她没有直接回答/她的目光”，玩家可见层面没有交代这是换人或伪装变化。

## Validity
- issueValidity: `valid`
- verdictReason: 该问题成立。玩家只看到一个摊车后的“小贩”持续与帕兹对话，正文没有引入第二名小贩，也没有解释代词变化；同一可见实体的性别/代词在同一场景内漂移。
- playerVisibleSupport: turn-1 visibleText 先写“小贩一边擦着杯子……他看着你”，后文仍是玩家把敏特照片递给同一小贩，却写“她没有直接回答。她的目光在你脸上停了停”。
- caveats:
- “小贩”真实身份属于内部信息，不能用于证明玩家可见问题；这里只以同轮 visibleText 的连续对话和单一摊位人物为有效性依据。

## Context Assessment
actualStateBeforeIssue: turn-1 开场中，卡琳娜离开后，玩家仍坐在中央区庆典附近长椅旁，与同一辆推车后的“小贩”继续交谈并出示敏特照片。

relevantFacts:
- `present-clear` 玩家可见层面只有一名摊车后的“小贩”在和帕兹连续对话。 artifacts: visible-timeline.jsonl, turn-01/04-output.json. 正文以同一称呼、小贩摊位和连续动作承接，没有新角色入场。
- `absent` Narrator prompt 中“小贩”作为角色出现，但没有公开角色卡、性别或 pronoun 字段。 artifacts: turn-01/06b-narrator-prompt.md. 提示里只有“【角色：“小贩”】”以及地点，choice prompt 也显示“角色 “小贩”：（无补充）”。
- `present-buried` 故事线把“小贩”的真实身份设为罗英并要求不得揭示。 artifacts: turn-01/03-story-state.json, turn-01/06b-narrator-prompt.md. 这是内部约束，不应直接进入玩家可见判断；它在根因层面提供了与公开别名相冲突的隐藏身份压力。
- `present-clear` 全局写作一致性规则要求已出现事实和称呼后续保持一致。 artifacts: turn-01/06b-narrator-prompt.md. 规则存在，但没有针对单个临时 NPC 的 pronoun 锁定或自动校验。

competingPressures: 临时身份“小贩”缺少显性性别信息；隐藏真实身份“罗英”不能揭示但会暗示女性代词；开场固定演出很长，叙述焦点在卡琳娜、照片和主角身份上；“小贩模样的人”容易触发默认男性路人写法

## Causal Chain
- firstDivergenceArtifact: `turn-01/06-llm-calls.json call[1] Narrator output；同样内容落入 turn-01/04-output.json`
- triggeringPressure: Prompt 只给了公开别名“小贩”和隐藏约束“真实身份是罗英、不得展示罗英 ID”，没有给可见 persona 的稳定性别/pronoun；叙述又先把小贩写成泛称“一个……的人”。
- missingGuard: 缺少 alias persona 的 visiblePronoun/gender 字段、缺少“同一 alias 在同一场景内代词必须一致”的硬约束和输出校验；隐藏身份也没有被隔离成不能影响表层代词的资料。
- mechanismStatement: 临时 NPC 的公开 alias 没有稳定 pronoun 合约，同时隐藏真实身份提供了女性化压力，Narrator 在长固定开场里先按普通“小贩”默认成“他”，后又受隐藏/后续语境牵引改用“她”，从而让玩家看到同一角色代词漂移。
- directCause: Narrator 在同一段 visibleText 内生成了“他看着你”和“她没有直接回答”。
- propagation: 该漂移被写入 turn-01/04-output.json 和 visible-timeline.jsonl；后续 turn-2/turn-3 继续使用女性代词，等于把后半段选择固定下来，但没有修复 turn-1 内部冲突。
- nonCauses:
- 不是长期记忆缺失，问题发生在初始回合内部。
- 不是 evaluator 误判，玩家可见正文有直接冲突。
- 不是单纯 Director 标签错误；Director 只列“小贩”，真正代词漂移发生在 Narrator 可见正文。

## Root Cause
- label: `alias-pronoun-contract`
- family: `agent-system`
- secondaryFamilies: `llm-self`
- description: 系统为伪装/临时角色只传递了别名和隐藏真实身份，没有传递可见 persona 的稳定 pronoun 合约，也没有输出一致性校验；在隐藏女性身份与“小贩”默认路人写法的压力下，局部生成先后采用不同代词。
- fixSurface:
- entity/alias schema: 为 visibleAlias 增加 visiblePronoun 或 genderPresentation
- prompt assembly: 将隐藏真实身份与玩家可见 persona 分区并说明不可影响表层称谓
- post-generation validator: 同一 named entity/alias 单回合 pronoun drift 检查

## Evidence
- playerVisible: turn-1 visibleText：“他看着你，眼里带着点好奇”与稍后“她没有直接回答。她的目光在你脸上停了停”指向同一小贩。
- internalTrace: turn-01/06b-narrator-prompt.md 中“小贩”无补充角色卡；同 prompt/story state 又包含“真实身份是黄昏会的罗英，禁止直接展示”的隐藏约束。Director output 只列“小贩”行动，没有指定 pronoun。
- tracePacket: `issues/issue-1-turn-1/trace.md`

## Recommended Fix Area
优先修复角色 alias/persona 的 prompt contract：公开称呼、隐藏身份、可见 pronoun 分离，并在 Narrator 输出后做同场景实体代词一致性校验。

## Confidence
`high`
