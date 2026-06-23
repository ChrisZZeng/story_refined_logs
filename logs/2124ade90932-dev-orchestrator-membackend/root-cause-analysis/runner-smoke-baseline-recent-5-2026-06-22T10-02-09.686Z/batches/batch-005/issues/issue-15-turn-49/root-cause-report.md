# Issue 15 / Turn 49 Root Cause Report

## Problem

`issueValidity`: `valid`

第 48 轮结尾，玩家可见文本已经让卡琳娜完成转身、靠在窗台上，并且“视线重新落在你脸上”。第 49 轮在没有任何过渡的情况下，又写成“她的手刚搭上里间窗台”“她没有回头，只是侧过脸来，用余光看你”。这不是合理的省略，而是把同一身体动作回退到了上一轮中途的姿态。

## Validity

玩家可见证据足够成立。第 48 轮可见文本先写卡琳娜“把手从窗台上放下来”，随后“终于完全转过身来，靠在窗台上，双手交握在身前”，最后“就那样站在原地，隔着几步的距离，看着你”。第 49 轮却从“手刚搭上里间窗台”“没有回头”“侧过脸”重新开始。玩家输入只是继续追问“交易尾巴”，没有要求她重新背过去，也没有任何桥接动作解释她为什么转回窗前。

可 caveat 的空间很小。角色可以回避问题，也可以转身离开，但正文需要先写出她转身、移位或重新背对的过渡；当前文本直接复用旧姿态，所以是有效一致性问题。

## Context Assessment

问题发生前的实际状态是：主角站在里间门口追问，卡琳娜已经面对主角，靠在窗台上，双手交握，仍留在原地看着主角。

Relevant facts:

- `claim`: 第 48 轮终态是卡琳娜已经正面面对主角，并靠在窗台上。
  `availability`: `present-clear`
  `artifacts`: `visible-timeline.jsonl`, `turn-49/03-story-state.json`, `turn-49/06a-director-prompt.md`, `turn-49/06b-narrator-prompt.md`
  `notes`: 该事实在最近一轮完整正文中清楚出现，但只是长篇 prose 的末段事实，没有被提升为结构化 `currentScene` 或角色姿态字段。

- `claim`: 玩家第 49 轮动作只是继续追问“交易尾巴”的含义。
  `availability`: `present-clear`
  `artifacts`: `turn-49/06a-director-prompt.md`
  `notes`: 玩家输入没有请求移动，也没有改变卡琳娜姿态的语义压力。

- `claim`: Director 在第 49 轮生成了与终态冲突的姿态提示。
  `availability`: `contradicted`
  `artifacts`: `turn-49/06-llm-calls.json`, `turn-49/07-events.json`, `turn-49/06b-narrator-prompt.md`
  `notes`: Director 的 `characterBeats.actionHint` 写成“背对主角停顿，侧头回应”，并在 beats 中写“卡琳娜停下脚步，侧身回应”。

Competing pressures:

- 卡琳娜处于审视/试探阶段，系统持续强调用物理细节表现疏离。
- 第 48 轮前半段确实出现过“没有回头”“一只手搭在窗台上”的动作，容易被抽成卡琳娜本轮的代表姿态。
- 当前故事线要求继续回避交易细节，Director 倾向用“背对、侧头、离开”表达回避。

## Causal Chain

`firstDivergenceArtifact`: `turn-49/06-llm-calls.json[0].object.characterBeats[0].actionHint`，同一内容也进入 `turn-49/07-events.json` 的 `worker-done/director`。

`triggeringPressure`: 最近一轮正文同时包含两个姿态片段：前半段是卡琳娜背对窗台、侧脸回应，末段才是她完全转身面对玩家。Director 在“继续回避、保持距离”的压力下，选取了前半段更符合疏离感的姿态。

`missingGuard`: prompt 和状态没有给 Director 一个结构化的当前场景锚点，例如“上一轮终态：卡琳娜面对主角、靠窗台、双手交握”。也没有硬约束要求如果要改变终态姿态，必须写出过渡动作。`locationStates` 和角色状态也没有记录这种短期姿态。

`mechanismStatement`: 由于上一轮终态只埋在长篇 recent prose 末端，Director 的 `beats/actionHint` 生成缺少 `current-scene-anchor` 约束，于是在回避氛围压力下重选了上一轮早些时候的背对姿态；Narrator 又按该 actionHint 落成玩家可见正文，造成身体动作回退。

`directCause`: Director 把本轮动作提示写成“背对主角停顿，侧头回应”，而不是从“已经面对玩家靠在窗台上”继续。

`propagation`: Narrator prompt 明确把 Director 输出作为骨架，要求不要改变导演已确定的剧情方向。Narrator 因此写出“她的手刚搭上里间窗台”“没有回头”“侧过脸”。`04-output.json` 和 `07-events.json` 随后提交该正文。

`nonCauses`:

- 不是长程记忆缺失；所需事实在最近一轮 prompt 中清楚存在。
- 不是 Choice 生成问题；正文错误在 Choice 之前已经出现。
- 不是 storyline 或固定剧本强制要求；当前 storyline 只要求继续回避交易细节。

## Root Cause

`rootCause.label`: `current-scene-anchor`

`family`: `agent-system`

`secondaryFamilies`: [`recent-context`]

L3 机制是当前场景终态锚点缺失。系统把最近正文交给 Director，但没有把“上一轮最后一刻的角色位置、朝向、手部状态”转成高优先级、可执行的场景状态；Director 输出 schema 又允许直接生成新的 `actionHint`，没有校验它是否从上一轮终态连续。因此，最近上下文虽然存在，仍没有成为可执行的连续性防线。

## Evidence

Player-visible:

- `visible-timeline.jsonl` 第 48 轮：卡琳娜“终于完全转过身来，靠在窗台上，双手交握在身前”，并且“视线重新落在你脸上”。
- `visible-timeline.jsonl` 第 49 轮：正文回到“她的手刚搭上里间窗台”“她没有回头，只是侧过脸来”。

Internal trace:

- `turn-49/06a-director-prompt.md` lines 643-656：最近一轮终态清楚在 Director prompt 中，但只是 prose。
- `turn-49/06-llm-calls.json[0].object`: Director 输出 `beats` 为“卡琳娜停下脚步，侧身回应”，`characterBeats.actionHint` 为“背对主角停顿，侧头回应”。
- `turn-49/06b-narrator-prompt.md` lines 694-718：Narrator 接收到上述 Director JSON。
- `turn-49/04-output.json`: 最终正文固化了“手刚搭上窗台”“没有回头”。

## Recommended Fix Area

优先修复 Director 的上下文组装和输出校验：在 prompt 中加入高显著度 `currentSceneAnchor`，由上一轮 visibleText 末段或 runtime state 提取角色位置、朝向、手部关键状态；同时在 Director 或 Narrator 阶段加连续性检查，要求任何姿态回退必须有显式过渡。若没有可靠结构化抽取，也应在 Director prompt 末尾加入“以上一轮正文结尾为物理状态基准”的硬约束。

## Confidence

`high`
