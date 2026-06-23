# issue-14-turn-47 Root Cause Report

## Problem

issueIndex=14，turn=47，type=`identity-drift`，scope=`visibleText`。同一清晨场景里，第 33 轮玩家已经看到卡琳娜穿着一件宽大的、褪成近乎灰色的毛衣；第 47 轮没有换衣承接，却写成“白色棉衣的袖口微微卷起”，回到了角色卡默认外观。

## Validity

issueValidity: `valid`

该问题可以由玩家可见证据确认。第 33 轮清晨客厅首次建立卡琳娜当前服装：“她穿着一件宽大的、褪成近乎灰色的毛衣，领口松垮地滑到一侧肩膀，露出锁骨和白色的棉布吊带。”第 47 轮仍是同一清晨、同一公寓内连续对话，前一轮她只是从沙发站起、拿杯壶去厨房水槽、擦手并靠在厨房台边，没有任何换衣描写。第 47 轮却写“白色棉衣的袖口微微卷起”，造成外观漂移。

可能的解释是她换了衣服，但玩家可见时间线没有给出动作、时间或场景承接，因此不能作为合理修复。

## Context Assessment

问题发生前，场景从第 33 轮清晨客厅连续推进到第 47 轮厨房台边。第 46 轮结尾卡琳娜从沙发拿起搪瓷杯和茶壶，走向厨房水槽，擦手后转身靠在厨房台边。第 47 轮开头直接承接“靠在厨房台边的姿势没有变”，因此服装应延续第 33 轮建立的灰色毛衣，除非正文显式换衣。

relevantFacts:

- claim: 卡琳娜当前清晨服装是宽大的近灰色毛衣。
  availability: `absent`
  artifacts: `turn-47/06b-narrator-prompt.md`, `turn-47/03-story-state.json`, `turn-47/05-runtime-after.json`
  notes: 该事实在第 33 轮可见文本中 present-clear，但到第 47 轮 prompt recent window 只含第 42-46 轮，storyline summary 和 runtime-after 都没有持久化该服装细节。
- claim: 角色卡默认外观包含白色棉衣。
  availability: `over-constraining`
  artifacts: `turn-47/06b-narrator-prompt.md`, `turn-47/02-script-state.json`
  notes: prompt 前部角色卡写“白色棉衣”，在当前服装事实缺失时成为最强外观来源。
- claim: 第 46 到第 47 轮没有换衣承接。
  availability: `present-clear`
  artifacts: `visible-timeline.jsonl`, `turn-47/06b-narrator-prompt.md`
  notes: 第 46 轮只写她去厨房水槽、擦手、靠在厨房台边；第 47 轮开头承接该姿势没有变。

competingPressures:

- 角色卡默认外貌被放在 prompt 前部，并且包含白色棉衣。
- 当前服装是第 33 轮局部可见细节，超出 turn-47 recent window。
- story state/currentStoryline summary 只记录剧情推进，没有记录服装临时状态。
- Narrator 在写袖口和手腕细节时需要服装材质，于是回落到默认角色卡。

## Causal Chain

firstDivergenceArtifact: `turn-47/06b-narrator-prompt.md` 的 context assembly：当前灰色毛衣事实缺失，角色卡默认“白色棉衣”仍 present-clear；随后 `turn-47/07-events.json` / `turn-47/04-output.json` 的 Narrator 正文显性输出错误服装。

triggeringPressure: 第 47 轮动作提示让卡琳娜保持靠在厨房台边，并描写手、袖口、抹布等细节；生成袖口细节时，prompt 中最可用的服装来源是角色卡默认“白色棉衣”。

missingGuard: 没有把第 33 轮建立的临时当前服装写入 character/location state 或 current appearance memory；也没有明确优先级规则说明“角色卡默认服装不得覆盖同一场景内未被改变的玩家可见服装”。

mechanismStatement: 当同一场景内的临时服装事实没有持久化，且 recent window 滑出该事实后，Narrator 会在需要衣袖细节时回落到角色卡默认外观；缺少 current-appearance persistence 和默认外观降权机制，使白色棉衣覆盖了玩家可见的灰色毛衣。

directCause: Narrator 使用角色卡默认服装生成第 47 轮袖口描写。

propagation: 错误在第 47 轮正文显性出现，并在第 48 轮继续被写成“白色棉衣的轮廓边缘”，说明漂移已经进入后续可见上下文。

nonCauses:

- 不是玩家输入造成；玩家只追问德索洛。
- 不是合理换衣；可见时间线没有换衣动作或时间跳跃。
- 不是 Choice 问题；错误发生在 Narrator 正文。

## Root Cause

rootCause.label: `current-appearance-persistence`

family: `detail-memory`

secondaryFamilies: [`agent-system`]

L3 root mechanism 是当前外观细节没有从可见正文写回或保留为优先级高于角色卡默认的临时状态。服装属于局部 detail-memory：它不是世界观大事实，却在同一场景连续描写中必须稳定。第 33 轮生成了灰色毛衣，但该事实既没有进入 currentStoryline summary，也没有进入 character state；到第 47 轮 recent window 已经丢失它，默认角色卡“白色棉衣”重新成为外观来源。

这不是停在 `statefold` 或 `recent-context` 的问题；具体机制是“玩家可见的当前服装没有持久化为 current appearance，导致默认角色卡在窗口滑动后覆盖临时服装状态”。

## Evidence

playerVisible:

- `visible-timeline.jsonl` turn 33: 卡琳娜穿“宽大的、褪成近乎灰色的毛衣”。
- `visible-timeline.jsonl` turn 46: 卡琳娜从沙发拿杯壶去厨房水槽，擦手后靠在厨房台边，没有换衣。
- `visible-timeline.jsonl` turn 47: “白色棉衣的袖口微微卷起”。
- `visible-timeline.jsonl` turn 48: 后续继续写“白色棉衣的轮廓边缘”。

internalTrace:

- `turn-47/06b-narrator-prompt.md`: recent window 只含第 42-46 轮，没有第 33 轮灰色毛衣；角色卡中“白色棉衣” present-clear。
- `turn-47/03-story-state.json`: currentStoryline summary 记录清晨喝茶和对话推进，但没有记录卡琳娜当前服装。
- `turn-47/05-runtime-after.json`: 搜索灰色毛衣/白色棉衣没有当前服装写回命中。

## Recommended Fix Area

优先修复 visible-detail writeback 和 prompt priority。对同一场景内出现的角色当前外观、手持物、位置和临时服装，需要写入 `currentAppearance` 或等价 state，并在 prompt 中明确高于角色卡默认外观。角色卡应作为默认设定，不能覆盖未被可见文本改变的当前服装。

## Confidence

confidence: `high`
