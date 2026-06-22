# Problem

issueIndex=16, turn=42, type=`space-time-break`, scope=`mixed`。玩家此前已经进入卡琳娜公寓，本轮末尾却让卡琳娜对玩家说“进来吧。外面冷。”，并在 choices 中提供“走进公寓，顺手关上身后的门”，把玩家重新放到门外。

# Validity

`issueValidity`: `valid`。

只看玩家可见证据，turn 34 玩家已经“跨过门槛，脚落在地板上”，进入卡琳娜公寓；turn 36 到 turn 41 的动作都发生在房间内或门内侧，例如翻看书架上的薄册子、卡琳娜从壁炉旁走向门口、她经过玩家身侧、玩家从卡琳娜身侧观察门外。turn 42 末尾却出现“进来吧。外面冷。”，下一步选项又要求“走进公寓，顺手关上身后的门”。这不是合理移动，因为正文没有写玩家走出公寓或退到走廊。

# Context Assessment

问题发生前，玩家实际状态是：帕兹在卡琳娜公寓内，靠近门口，从卡琳娜身侧或门缝观察站在门外/门槛附近的德索洛。德索洛完成交易后离开走廊，门口只剩卡琳娜和帕兹，门仍未关。

相关事实：

- 玩家已进入卡琳娜公寓：`present-clear`。证据见 `visible-timeline.jsonl` turn 34 “你跨过门槛，脚落在地板上”，历史情节概览也写“主角最终决定跟上，进入公寓内部”。
- 最近几轮仍在公寓内：`present-clear`。证据见 turn 36 书架薄册子、turn 38 卡琳娜经过玩家身侧、turn 41 卡琳娜站在门内，玩家从她肩线看出她在听。
- runtime 结构化状态没有玩家精确位置/current scene anchor：`absent`。证据见 `turn-42/05-runtime-after.json` 的 `worldState` 只有 phase、branch、charactersOnStage 等，`entityStates` 也没有玩家位置或公寓内外状态。
- 门口几何关系比较复杂：`present-ambiguous`。德索洛在门外/门槛，卡琳娜在门内并可能跨出半步，玩家从门缝观察；如果没有 scene anchor，Narrator 容易把“门口”误读成玩家在外面。

竞争压力包括：最近几轮反复写“门外/门内/门缝”、德索洛离开走廊、卡琳娜站在门口、Choice worker 需要生成下一步可行动作、runtime 没有结构化玩家位置可供校验。

# Causal Chain

`firstDivergenceArtifact`: `turn-42/06-llm-calls.json[1].text` 的结尾“进来吧。外面冷。”。

Narrator prompt 中 recent visible text 和历史概览都包含玩家已进入公寓的信息；Director output 也没有要求玩家离开或重新进屋。偏离发生在 Narrator 结尾，它从“门口只剩下你和卡琳娜”“卡琳娜没有立刻关上门”推断出玩家在外面，于是让卡琳娜邀请玩家进来。

触发压力是：门口场面中有大量“门外冷光”“门缝”“走廊”“门内/门外”的局部描写，且本轮又让卡琳娜“跨出了半步”，使局部空间语义压过了更早但仍有效的“玩家已在室内”事实。

缺失防线是：没有结构化 `currentScene` / `playerPosition` / `insideOutside` anchor，也没有在 Narrator/Choice prompt 中以高显著度写出“帕兹仍在公寓内，不能生成重新进屋选项”。Choice prompt 只要求“以本轮正文结尾为准”，因此继承了 Narrator 的错误结尾。

传播上，Choice worker 在 `turn-42/06-llm-calls.json[2].object.options` 中生成“走进公寓，顺手关上身后的门”，把空间错误变成玩家可选行动。turn 43 虽然选择了询问女儿，没有选“走进公寓”，但正文仍写“那扇门还敞着，走廊冷风沿着地板灌进来”，继续让空间状态不稳。

非主因：

- 不是长期记忆问题；进入公寓的事实在 prompt 的历史概览和 recentTurns 中都存在。
- 不是单纯 Choice 绑定错误；Narrator 结尾已经把玩家放错位置，Choice 只是固化。
- 不是玩家输入导致；玩家输入关注德索洛父亲矛盾，没有移动到门外。

# Root Cause

`rootCause.label`: `missing-current-scene-anchor`。

`family`: `agent-system`。secondary family 为 `recent-context`，因为所需信息在最近可见上下文中，但没有被结构化为当前场景约束。

L3 root mechanism：系统依赖长篇 recent visible prose 维持玩家站位，而没有把“玩家当前在公寓内、门开着、德索洛在门外/门槛处”写入可执行的 scene anchor。门口场景的局部词汇与结尾动作覆盖了真实位置，Narrator 生成了错误邀请；Choice worker 又以错误结尾为准，把重新进屋做成选项。

# Evidence

玩家可见证据：

- `visible-timeline.jsonl` turn 34：玩家“跨过门槛，脚落在地板上”，进入公寓。
- `visible-timeline.jsonl` turn 38：卡琳娜从壁炉旁朝门口走去，并“经过你身侧”。
- `visible-timeline.jsonl` turn 41：卡琳娜站在门内，玩家从她肩线看她在听。
- `visible-timeline.jsonl` turn 42：末尾“进来吧。外面冷。”，choices 含“走进公寓，顺手关上身后的门”。

内部链路证据：

- `turn-42/03-story-state.json` recentTurns 保存了 turn 37-41 的室内门口过程。
- `turn-42/06b-narrator-prompt.md` 历史情节概览写“主角最终决定跟上，进入公寓内部”，recentTurns 也包含室内证据。
- `turn-42/05-runtime-after.json` 的 `worldState` 无 location/playerPosition/currentScene；`entityStates` 也没有玩家位置。
- `turn-42/06-llm-calls.json[1].text` 首次生成“进来吧。外面冷。”；`turn-42/06-llm-calls.json[2].object.options` 生成“走进公寓，顺手关上身后的门”。

# Recommended Fix Area

优先修复 `scene state/writeback` 与 `Choice context guard`。运行态应维护结构化 `currentScene`、`playerPosition`、`doorState`、`npcPositions` 等轻量锚点；每轮 Narrator 前应把当前 scene anchor 作为高优先级约束注入，Choice worker 生成选项前应校验选项动作是否与 anchor 冲突。

# Confidence

`high`。
