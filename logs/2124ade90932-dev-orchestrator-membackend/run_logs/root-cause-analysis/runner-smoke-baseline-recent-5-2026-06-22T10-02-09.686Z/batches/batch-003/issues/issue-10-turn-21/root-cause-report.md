# Problem

issueIndex=10，turn=21，type=`repeated-scene`，scope=`visibleText`。

turn 20 已经写完“跟在卡琳娜身后走回公寓”“站到窗台前”“你一句话都没说”“你觉得他可怜吗？”并以这个问题生成选项。玩家在 turn 21 选择“可怜。但走投无路才想起你，这更可悲。”turn 21 的正文却先完整复写 turn 20 的场景和提问，然后才让主角回答，造成短暂回退。

# Validity

`issueValidity`: `valid`

玩家可见证据足够。turn 20 已经完成卡琳娜走到窗台前并提出“你觉得他可怜吗？”，turn 21 应直接从玩家回答开始或用很短承接句落到回答。turn 21 重新铺陈走回公寓、窗台姿态和同一句提问，不是合理回顾，而是重复演出。

# Context Assessment

问题发生前，玩家实际状态是：卡琳娜已经在窗边转身看着主角，刚问出“你觉得他可怜吗？”，玩家选择了回答。当前轮的核心任务是执行这个回答并让卡琳娜回应。

Relevant facts:

- claim: turn 20 已完成窗台前提问。availability: `present-clear`。artifacts: `visible-timeline.jsonl`, `turn-21/03-story-state.json`, `turn-21/06a-director-prompt.md`。notes: recentTurns 里完整保留 turn 20 的可见正文。
- claim: turn 21 玩家输入是上一轮问题的直接回答。availability: `present-clear`。artifacts: `visible-timeline.jsonl`, `turn-21/03-story-state.json`, `turn-21/06a-director-prompt.md`。notes: playerInput 为“可怜。但走投无路才想起你，这更可悲。”
- claim: Director 正确理解了玩家输入。availability: `present-clear`。artifacts: `turn-21/06-llm-calls.json[0].object`, `turn-21/04-output.json` plotPoint。notes: Director summary 写“玩家回答卡琳娜关于德索洛是否可怜的提问”，requiredContent 只要求主角说出该回答和卡琳娜回应。
- claim: Narrator prompt 中最近 turn 20 全文靠近玩家输入，且最终 narrator 指令没有把“最新可见末帧/本轮从玩家回答开始”作为硬锚点。availability: `present-buried`。artifacts: `turn-21/06b-narrator-prompt.md`。notes: prompt 有不要重复规则，但最终指令更强调落地 Director 安排。

Competing pressures:

- recent turn 20 文本提供了完整、可复制的场景铺陈。
- Director 的剧情目标是正确的，但没有显式 `startFrame` 指示“此刻卡琳娜已问完，直接写玩家回答”。
- Narrator 被要求把 Director 安排写成自然、有节奏的正文，模型可能把上一轮提问场景当作回答前的铺垫。
- “不要重复”规则存在，但相对远离最终 generation instruction。

# Causal Chain

First divergence artifact: `turn-21/06-llm-calls.json[1].text`，即 Narrator output。

Director 没有要求重复 turn 20。它的 `requiredContent` 是：

- “主角说出『可怜。但走投无路才想起你，这更可悲。』”
- “卡琳娜对这句话的直接回应……”

Triggering pressure: Narrator prompt 中紧邻目标轮的 recentTurns 包含 turn 20 完整场景和提问，Narrator 在生成自然正文时把这段最近文本复用为回答前铺垫。

Missing guard: 缺少 selected-choice continuation contract。系统没有把“玩家选择的是上一轮最后问题的回答；上一轮问题已玩家可见；本轮正文不得复写提问，只能承接回答”作为硬性 handoff 字段传给 Narrator。

Mechanism statement: 选择项语义虽然被 Director 正确理解，但 handoff 没有把“last-frame question already shown + selected answer must start now”结构化传递给 Narrator；Narrator 受 recentTurn 文本和铺垫节奏牵引，复写上一轮场景后才执行回答。

Direct cause: Narrator 在执行正确 Director 安排前，复制了上一轮的场景建立和问题对白。

Propagation: `turn-21/04-output.json` 将重复片段提交为 visibleText；Choice 基于重复后的新结尾生成后续选项。后续 turn 22 继续正常推进，没有长期状态污染。

Non-causes:

- 不是 Director 根因；Director 已识别玩家是在回答问题。
- 不是 fixed beat consumption 主因；turn 21 的重复内容来自上一轮 recentTurn，而非德索洛交易固定素材。
- 不是长期 memory 问题；信息全部在最近一轮。

# Root Cause

`rootCause.label`: `selected-choice-continuation`

`family`: `agent-system`

`secondaryFamilies`: `recent-context`

根因是选择项承接 contract 太弱。系统把上一轮选项文本作为 playerInput 给到 workers，但没有向 Narrator 明确编码“该输入是对上一轮最后一句问题的回答，正文起点应在问题之后”。Director 能推理出这一点，Narrator 却只收到自然语言安排和 recentTurn 文本，在缺少强 start-frame 约束时复写了上一轮问题场景。

`fixSurface`:

- selected choice handoff：为 playerInput 增加 `selectedFromTurn`, `respondsToLastPrompt`, `lastVisibleFrame` 等结构字段。
- Narrator prompt：最终指令强制“不要重写 lastVisibleFrame；从 player action / selected answer 开始”。
- Duplicate guard：比较 Narrator 输出前段与最近一轮 visibleText，若长片段重复则触发修复。

# Evidence

Player-visible evidence:

- turn 20: “你跟在卡琳娜身后走回公寓里……‘你一句话都没说。’……‘你觉得他可怜吗？’”
- turn 21: 开头再次出现同一场景和同一提问，然后才出现玩家回答。

Internal trace:

- `turn-21/06-llm-calls.json[0].object`: Director summary 与 requiredContent 正确聚焦玩家回答和卡琳娜回应。
- `turn-21/06-llm-calls.json[1].text`: Narrator 在回答前复写上一轮窗台场景和提问。
- `turn-21/03-story-state.json`: recentTurns 包含 turn 20 的完整提问场景。

# Recommended Fix Area

优先修复 selected-choice handoff 与 Narrator start-frame contract。对从上一轮选项进入的新 turn，Narrator 应收到机器可读的 lastVisibleFrame 和 selected answer relation，并在输出前做 recent-prefix duplicate check。

# Confidence

`medium`

日志清楚显示 Director 正确而 Narrator 复写；具体是 prompt 缺少 start-frame contract 还是模型局部复制失误，仍有重叠。但可复发机制与修复表面明确。
