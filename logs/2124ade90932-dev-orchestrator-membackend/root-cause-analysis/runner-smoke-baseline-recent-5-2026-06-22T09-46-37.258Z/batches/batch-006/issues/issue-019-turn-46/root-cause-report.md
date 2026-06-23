# Problem

Turn 46 的选项出现“明天晚宴的事情，你准备好了吗”。但在此之前，玩家可见正文没有建立任何“晚宴”；turn 47 才由卡琳娜说明“凯旋门今晚有晚宴”，时间也从“明天”变成“今晚”。

# Validity

issueValidity: `valid`

玩家可见证据足够成立。turn 46 正文只解释“被害者申诉人”、公道、尊严和亏欠；晚宴没有出现。turn 46 choices 却提前暴露“明天晚宴”。turn 47 随后首次建立晚宴，并且是“今晚”。

# Context Assessment

问题前玩家刚追问“被害者申诉人”。故事仍处于卡琳娜公寓内的解释对话，晚宴尚未可见。

相关事实：

- `absent`: 晚宴在 turn 46 选项前未对玩家建立。证据是 `visible-timeline.jsonl turn 43-46`。
- `present-clear`: 内部 story state 已切到 `推进节点 04-01：准备`。证据在 `turn-46/03-story-state.json`。
- `over-constraining`: `turn-46/06c-choice-prompt.md:30-38` 把“询问晚宴的细节（地点、时间、目的）”列为当前情节边界参考。
- `contradicted`: 后续 turn 47 可见文本建立的是“今晚有晚宴”，与 turn 46 选项的“明天”冲突。

# Causal Chain

firstDivergenceArtifact: `turn-46/06c-choice-prompt.md`

内部链路是：state 已进入 04-01 准备节点，`interactionFollowup` 包含晚宴细节；Choice prompt 把这段 followup 作为当前边界参考；Choice output 生成“明天晚宴的事情，你准备好了吗”。

直接原因是未来节点 followup 被当作当前可见选项候选。缺失的 guard 是 storyline entry / visible-anchor gate：晚宴这类未来事件必须先在正文里建立，才可以出现在玩家选项里。

“明天”是额外的时间锚点失败。内部资料附近有“今晚过后”等信息，后续可见文本也建立为“今晚”，但 Choice 在没有可见时间锚点时自行填了“明天”。

# Root Cause

rootCause.label: `storyline-lifecycle`

family: `agent-system`

secondaryFamilies: `recent-context`

L3 root mechanism 是 storyline followup 的生命周期门控缺口。触发压力是 04-01 准备节点提前激活并提供晚宴交互；缺失防线是没有确认 entry beat 是否已经在玩家可见正文中完成；失败运动是 Choice 把未来节点交互转成当前选项，并生成错误时间词。

# Evidence

玩家可见证据：turn 46 无晚宴正文，选项出现“明天晚宴”；turn 47 才有“凯旋门今晚有晚宴”。

内部链路证据：`turn-46/03-story-state.json` 的 currentStoryline 为 `4-01-第一章`；`turn-46/06c-choice-prompt.md:30-38` 将晚宴细节列为 followup；`turn-46/06-llm-calls.json[2]` 输出问题选项。

# Recommended Fix Area

优先修复 storyline node activation 和 Choice candidate filtering：为未来节点 followup 增加 visible anchor validation；未被正文建立的名词、事件、地点和时间不得出现在选项中。

# Confidence

`high`
