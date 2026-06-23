# Problem

issueIndex=15, turn=42, type=`identity-drift`, scope=`visibleText`。玩家可见正文在卡琳娜开口控诉德索洛时，把一句旁白式描写写成“你的声音甚至没有抬高”，使说话人从卡琳娜漂到第二人称玩家，削弱了读者对控诉主体的判断。

# Validity

`issueValidity`: `valid`。

只看玩家可见文本，前文先写“她终于开了口”，随后卡琳娜的控诉应由她发出：“德索洛。你找我多少次？”接下来的长句却变成：“你从来没有称过我'阁下'。你从来没有邀请过我参加哪怕一个聚餐。你说——”你的声音甚至没有抬高……。在本叙事系统里，“你”长期指向玩家/帕兹，因此“你的声音”插入卡琳娜对白中会把旁白视角误指到玩家。

这条 issue 的风险不是“对白中的你”本身。卡琳娜对德索洛说“你从来没有……”是合理的第二人称称呼；真正的问题是对白中嵌入的叙述片段“你的声音甚至没有抬高”，它应为“她的声音”或“卡琳娜的声音”。

# Context Assessment

问题发生前，玩家选择点明德索洛父亲身份与疏远家人的矛盾。Director output 安排卡琳娜“表情冷淡，语气平稳而带刺”，并让她指出德索洛过去从未称她“阁下”、从未邀请她。上下文需要的是卡琳娜作为申诉人发出冷静控诉。

相关事实：

- 卡琳娜是控诉德索洛的人：`present-clear`。证据见 visibleText “她终于开了口”与 `turn-42/06-llm-calls.json[0].object.characterBeats`。
- 叙事正文中“你”默认是帕兹/玩家：`present-clear`。证据见 `turn-42/06b-narrator-prompt.md` 的底层逻辑“你=帕兹=玩家=主角”。
- NPC 对白需要 `data-speaker` 标注：`present-clear`。证据见 `turn-42/06b-narrator-prompt.md` 输出格式要求。
- NPC 对白内部若嵌入旁白，如何处理“你/她/他说”没有专门约束：`absent`。prompt 规定了 `data-speaker`，但没有禁止在非玩家对白段中写第二人称旁白。

竞争压力包括：中文对白内“你”既可以是角色对角色称呼，又可以是系统第二人称旁白；Narrator 的全局风格规则强推“你=玩家”；本段又需要卡琳娜连续使用“你”控诉德索洛。

# Causal Chain

`firstDivergenceArtifact`: `turn-42/06-llm-calls.json[1].text`。

Director output 没有身份漂移，只要求卡琳娜以冷淡、带刺的语气指出德索洛过去的疏远。Narrator 输出时在 `data-speaker="卡琳娜"` 的段落中混入了非对白旁白“你的声音甚至没有抬高”，这在玩家可见文本中变成卡琳娜对白和玩家视角的混合。

触发压力是：Narrator prompt 强调“你作为旁白，必须以‘你’写主角经历”，同时本段卡琳娜对白也大量使用“你”称呼德索洛。模型在处理“你说——”后插入声音描写时，把全局第二人称旁白习惯套进了卡琳娜的发声描写。

缺失防线是：`data-speaker` 只标注整段说话人，却没有要求非玩家 `data-speaker` 段内不得出现旁白式“你的声音/你的目光/你的手”等玩家指代；也没有生成后校验“非玩家 speaker 段内第二人称身体/声音描写”的 actor mismatch。

传播上，该错误进入 `turn-42/04-output.json` 的 visibleText。它没有被 runtime 修正；但后续剧情仍能大体看出卡琳娜在控诉，所以影响局限在该段说话人清晰度。

非主因：

- 不是玩家输入含糊导致；玩家输入只要求点明矛盾。
- 不是 Choice worker 首发问题；错误在 Narrator 文本中已出现。
- 不是角色身份长期记忆丢失；卡琳娜、德索洛身份都在 prompt 中清楚存在。

# Root Cause

`rootCause.label`: `speaker-pronoun-contract`。

`family`: `agent-system`。secondary family 为 `llm-self`，因为局部生成也有明显 slip；但更可优化的机制是 speaker 与第二人称旁白之间缺少可执行合同。

L3 root mechanism：Narrator 的输出合同只规定了 `data-speaker` 和全局“你=玩家”，没有约束“非玩家对白段内部的旁白插入必须以 speaker 为主语，不能用玩家第二人称”。在 NPC 对另一个 NPC 使用“你”的句式中，这个缺口使模型把角色称呼、旁白视角和发声动作混在同一段里。

# Evidence

玩家可见证据：

- `visible-timeline.jsonl` turn 42：“她终于开了口”之后，同一段出现“你的声音甚至没有抬高”。

内部链路证据：

- `turn-42/06-llm-calls.json[0].object.characterBeats` 要求卡琳娜“表情冷淡，语气平稳而带刺”。
- `turn-42/06b-narrator-prompt.md` 第 302 行附近规定“你=帕兹=玩家=主角”。
- `turn-42/06b-narrator-prompt.md` 第 657 行以后规定 `data-speaker` 对话帧，但没有 actor-pronoun 禁止项。
- `turn-42/06-llm-calls.json[1].text` 首次生成错误片段。

# Recommended Fix Area

优先修复 `Narrator prompt/output schema` 与生成后校验。给非玩家 `data-speaker` 段增加约束：对白内的“你”可作为角色对听者称呼，但任何旁白式身体、声音、视线、动作描写必须绑定到 speaker 或具名角色；出现“你的声音/你的手/你的目光”时，若 speaker 不是 `帕兹`，应拒绝或重写。

# Confidence

`medium`。可见文本前后仍有“她终于开了口”帮助读者推断卡琳娜是说话人，所以问题有效但影响范围小于 issue 14。
