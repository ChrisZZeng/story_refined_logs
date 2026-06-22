# Problem

Turn 45 的正文在卡琳娜讲述卡尔来历时出现对白与叙述边界断裂：“有一天夜里，它蹲在我的窗台上——浑身湿透，瘦得肋骨一根根数得清。”没有闭合引号，下一段“她伸出手……”被接在半开的对白之后。

# Validity

issueValidity: `valid`

玩家可见 timeline 和 `turn-45/04-output.json` 都保留该问题。它不依赖隐藏设定或内部状态判断，是纯玩家可见的格式与可读性退化。由于主要剧情仍可理解，`severity=low` 合理。

# Context Assessment

问题前，玩家选择“暂时不追问，先换个话题”。系统自然转向卡琳娜与卡尔的相遇回忆。`turn-45/06-llm-calls.json[0]` 的 Director 输出要求“卡琳娜提及与卡尔在福利院后的相遇”，这个剧情安排本身成立。

相关事实：

- `present-clear`: Narrator 必须输出 v3-html，角色对白必须使用 `data-speaker` 帧。证据在 `turn-45/06b-narrator-prompt.md:628-655`。
- `present-clear`: 本轮需要写卡琳娜与卡尔的相遇回忆。证据在 `turn-45/04-output.json` 的 `plotPoint.requiredContent`。
- `present-clear`: 玩家可见文本需要稳定区分对白和叙述。问题段之前和之后都使用引号或 `data-speaker` 帧，局部断裂明显。

竞争压力是长段回忆对白、叙述动作和 HTML 帧混合生成；同时文本混用 ASCII 双引号和中文引号，局部格式滑脱更容易发生。

# Causal Chain

firstDivergenceArtifact: `turn-45/06-llm-calls.json[1]`

Narrator 的 streamText 输出已经包含半开对白帧：

`<p data-speaker="卡琳娜" data-to="帕兹">"那时候我刚被德索洛安顿下来，还不知道自己能在暗街做什么。有一天夜里，它蹲在我的窗台上——浑身湿透，瘦得肋骨一根根数得清。</p>`

直接原因是 Narrator 漏掉了该台词的闭合引号。随后 rawHtml 写入 `turnContent`，`visibleText` 归一化后继承同样问题，并进入 `visible-timeline.jsonl`。

这不是 Director 剧情判断、Choice 阶段、storyline 或 memory 问题；内部素材足以支持本轮内容，失败发生在 Narrator 文本格式输出和后置校验之间。

# Root Cause

rootCause.label: `format-protocol-validation-gap`

family: `agent-system`

secondaryFamilies: `llm-self`

L3 root mechanism 是 v3-html 协议缺少确定性后置校验。触发压力是 Narrator 在自由文本 HTML 中生成长对白并穿插叙述动作；缺失防线是没有检查 `data-speaker` 帧的引号平衡和对白/叙述边界；失败运动是一次局部 LLM 格式滑脱被原样传播到玩家可见文本。

# Evidence

玩家可见证据：`visible-timeline.jsonl` turn 45 中半开引号直接出现在正文。

内部链路证据：`turn-45/06-llm-calls.json[1]` 的 Narrator output 已经包含问题；`turn-45/06b-narrator-prompt.md:645-655` 有格式协议，但没有 artifact 显示校验或 retry 拦截。

# Recommended Fix Area

优先修复 `Narrator output validator` / `v3-html parser/normalizer`：对 `data-speaker` 帧做引号平衡、根级文本、段落闭合和对白/叙述切换检查；失败时重试或修复。

# Confidence

`high`
