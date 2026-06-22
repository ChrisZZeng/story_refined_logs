# Problem

Turn 45 的选项出现“转向卡琳娜：‘你刚才说的‘被害者申诉人’——那是什么？’”。但在该选项之前，玩家可见正文没有出现过“被害者申诉人”，也没有角色刚才说过这个词。

# Validity

issueValidity: `valid`

玩家可见证据足够成立。`visible-timeline.jsonl` turn 41-45 中，相关话题是德索洛、敏特、骷髅会、卡尔来历和“它来找我不是偶然”。“被害者申诉人”只在选项中突然出现，并被错误标记为“刚才说的”。

隐藏角色卡里确实有该术语，但这不能反证玩家可见问题。

# Context Assessment

问题前玩家只知道：卡尔会说话，敏特来找过卡琳娜，卡琳娜与卡尔存在更深关系，卡尔来找卡琳娜“不是偶然”。玩家并不知道“被害者申诉人”这个正式称谓。

相关事实：

- `absent`: “被害者申诉人”在 turn 45 选项前对玩家不可见。证据是 `visible-timeline.jsonl` 和 `turn-45/04-output.json`。
- `present-clear`: 隐藏资料有“卡尔赋予卡琳娜‘被害者申诉人’的使命”。证据在 `turn-45/02-script-state.json` 和 `turn-45/06a-director-prompt.md:165-171`。
- `over-constraining`: Director 输出把“使命仅提及名称‘被害者申诉人’”写入本轮约束，但 Narrator 没有实际写出该词。
- `contradicted`: Choice prompt 既包含最终正文，又包含 Director 计划；二者对“该术语是否已可见”给出了相反信号。

# Causal Chain

firstDivergenceArtifact: `turn-45/06-llm-calls.json[2]`

内部链路是：storyline/角色卡含有该术语，Director 将它前景化为本轮 `requiredContent/currentTurnConstraints`，Narrator 没有把它写进正文，Choice 阶段却仍依据 Director 计划生成了“你刚才说的‘被害者申诉人’”。

直接原因是 Choice 生成时把 planned content 当成 observed visible content。缺失的 guard 是：选项中的专有名词和“刚才说的”必须回查 final visibleText，而不是只相信 Director 摘要或隐藏设定。

该错误随后被 turn 46 吸收：玩家选择这个选项后，正文开始解释“被害者申诉人”，把原本未建立的术语变成剧情事实。

# Root Cause

rootCause.label: `choice-visible-grounding-gap`

family: `agent-system`

secondaryFamilies: `recent-context`

L3 root mechanism 是 Choice 的可见锚定缺口。触发压力来自 Director 和隐藏 storyline 对“被害者申诉人”的前景化；缺失防线是 Choice 没有检查选项预设是否已经出现在玩家可见正文；失败运动是计划中应揭示但实际未揭示的术语被包装成玩家刚听过的追问。

# Evidence

玩家可见证据：turn 45 正文未出现“被害者申诉人”，选项却出现并称“刚才说的”。

内部链路证据：`turn-45/06-llm-calls.json[0]` 要求提及名称；`turn-45/06-llm-calls.json[1]` 未写出该名称；`turn-45/06-llm-calls.json[2]` 输出了问题选项。

# Recommended Fix Area

优先修复 Choice prompt/context assembly 和 choice validator：把 `plannedContent` 与 `observedVisibleContent` 分开；对选项中的专有名词、回指短语、“刚才说的”做 visibleText grounding 检查。

# Confidence

`high`
