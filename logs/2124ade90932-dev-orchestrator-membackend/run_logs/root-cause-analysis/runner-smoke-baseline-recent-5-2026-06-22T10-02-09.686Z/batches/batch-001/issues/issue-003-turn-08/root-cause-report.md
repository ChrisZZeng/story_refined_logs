# Issue 3 Turn 8 Root Cause Report

## Problem

issueIndex=3，turn=8，type=`unsupported-jump`，scope=`visibleText`。

turn 8 正文突然写：“沙发角落，那只黑猫——卡尔——一直蜷在毛毯尾端，像是睡着了。” 玩家此前只在 turn 6 的巷子里见过一只瘦削的灰猫；turn 7 完整观察卡琳娜公寓客厅时没有看到室内黑猫，也没有听到“卡尔”这个名字。

## Validity

`issueValidity`: `valid`

只看玩家可见证据，问题成立。turn 7 玩家进入公寓并扫视客厅，文本列出了沙发、毛毯、茶几、薄荷、窗帘、帆布背包等细节，还写卡琳娜弯腰叠了沙发上的毛毯。如果一只黑猫一直蜷在毛毯尾端，玩家在该观察段落中理应看到，或 turn 8 应先以“你这才注意到”之类方式引入。直接称“那只黑猫——卡尔——一直”把它当成玩家已知对象处理，缺少可见铺垫。

## Context Assessment

问题发生前，玩家可见场景是卡琳娜的公寓客厅：深色木质沙发上搭着粗毛毯，窗台上有薄荷，墙角有帆布背包，卡琳娜坐在沙发上试探主角。玩家可见的动物只有 turn 6 巷子里的灰猫，不是室内黑猫卡尔。

相关事实：

- `absent`: turn 7 可见公寓观察中没有黑猫或卡尔。来源：`visible-timeline.jsonl`，`turn-07/04-output.json`。
- `present-clear`: turn 8 当前 storyline 内部内容要求“黑猫卡尔在沙发上的存在感”，约束写着“卡尔暂时只会观察主角”。来源：`turn-08/03-story-state.json`。
- `over-constraining`: Director 在 turn 8 把卡尔加入 `involvedCharacters`，并要求“卡尔做出一个可被主角注意到的动作（如跳下沙发）”。来源：`turn-08/06-llm-calls.json`。
- `present-buried`: Narrator prompt 中有“优先相信最近几轮玩家看到的正文”的一致性规则，但它是泛化原则，没有针对“未可见实体必须先引入”的硬约束。来源：`turn-08/06b-narrator-prompt.md`。

竞争压力是内部剧情确实希望让卡尔在公寓中露面，并用动作暗示其存在；但最近可见场景没有为这次露面建立实体锚点。

## Causal Chain

第一处偏离是 `turn-08/06-llm-calls.json` 的 Director output：它在 recent visible 没有卡尔的情况下，把卡尔列为本轮参与角色，并把“跳下沙发”作为动作要求。

上游压力来自 `turn-08/03-story-state.json` 的 `currentStoryline.content` 和 constraints：内部剧本把“黑猫卡尔在沙发上的存在感”当作公寓环境的一部分。Director 没有把这个隐藏设定转换成玩家可见的首次引入，而是直接交给 Narrator。Narrator 随后写出“那只黑猫——卡尔——一直蜷在毛毯尾端”，使玩家看到一个像是早已在场的对象。

触发压力是 storyline 里的隐藏公寓实体和角色卡在 prompt 中非常显眼。缺失防线是缺少 current-scene entity anchor：系统没有检查卡尔是否已在玩家可见场景中出现，也没有要求首次出现必须先自然引入、再命名或赋予连续在场状态。失败运动是：内部已知实体被直接投射到玩家可见正文，变成 unsupported jump。

非主因：

- 不是玩家遗忘；玩家可见文本确实没有室内黑猫铺垫。
- 不是长期 memory 缺失；相反，是隐藏设定过早进入可见叙事。
- 不是单纯模型凭空发明；卡尔来自内部 storyline 和角色状态。

## Root Cause

`rootCause.label`: `current-scene-anchor`

`family`: `agent-system`

这是当前场景实体锚点缺失。系统把内部 storyline 中的实体“卡尔”当作当前可见场景成员，但没有验证它是否已经被玩家看到；Director/Narrator handoff 也没有要求“未可见实体先引入、不得写成一直在场”。因此隐藏剧本事实越过玩家可见时间线，成为看似已知的室内对象。

## Evidence

玩家可见证据：turn 7 公寓观察没有卡尔，turn 8 直接出现“那只黑猫——卡尔——一直蜷在毛毯尾端”。来源：`visible-timeline.jsonl`，`turn-07/04-output.json`，`turn-08/04-output.json`。

内部链路证据：`turn-08/03-story-state.json` 的 storyline 写有“黑猫卡尔在沙发上的存在感”；`turn-08/06-llm-calls.json` Director 要求卡尔动作；`turn-08/06b-narrator-prompt.md` 接收了该 Director 安排；`turn-08/04-output.json` 将 unsupported introduction 提交。

## Recommended Fix Area

优先修复 Director/Narrator handoff 和 scene entity inventory：当 storyline 要求实体出场时，先检查最近可见场景是否已有该实体；若没有，必须生成首次引入桥段，禁止使用“那只”“一直”“卡尔”等已知化表述。

## Confidence

`high`
