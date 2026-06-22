# Issue 4 Turn 9 Root Cause Report

## Problem

issueIndex=4，turn=9，type=`space-time-break`，scope=`visibleText`。

turn 8 末尾卡尔“轻盈地跳下沙发，走到窗台边，在薄荷盆栽旁边蹲坐下来”。turn 9 却写：“沙发角落里，黑猫卡尔从窗台上跳下来”。同一句同时用“沙发角落里”和“从窗台上跳下来”锚定卡尔的位置，动作承接不清。

## Validity

`issueValidity`: `valid`

只看玩家可见证据，问题成立。上一轮卡尔的最终位置是窗台边/薄荷盆栽旁；本轮从窗台下来是合理承接，但句首“沙发角落里”把它又锚回旧位置。读者会同时读到两个空间起点。

## Context Assessment

问题发生前，玩家可见状态是：卡尔已经从沙发到窗台边，蹲在薄荷盆栽旁。turn 9 玩家回答自己和敏特的关系后，卡尔可以从窗台或薄荷旁移动到茶几边，但不应再被称作在沙发角落里。

相关事实：

- `present-clear`: turn 8 最终位置是窗台边/薄荷盆栽旁。来源：`turn-08/04-output.json`。
- `present-clear`: turn 9 Director 的 `characterBeats` 正确写“从薄荷盆栽旁站起，走到茶几边缘蹲坐下”。来源：`turn-09/06-llm-calls.json`。
- `present-buried`: turn 9 Narrator prompt 的 recent visible 同时包含 turn 8 的旧短语“沙发角落，那只黑猫”和后续新位置“走到窗台边”。来源：`turn-09/06b-narrator-prompt.md`。
- `absent`: `runtime-after` 没有把卡尔加入 `charactersOnStage`，也没有结构化记录卡尔位置。来源：`turn-08/05-runtime-after.json`，`turn-09/05-runtime-after.json`。

竞争压力来自两种文本锚点：recent prose 中的旧位置短语很醒目，而 Director handoff 中的新位置动作才是当前状态。缺少结构化位置状态时，Narrator 需要自行从长文本中解出最新位置。

## Causal Chain

第一处可见偏离发生在 `turn-09/06-llm-calls.json[1].text` 的 Narrator output。Director 在同一文件中已经给出正确动作 hint：“从薄荷盆栽旁站起，走到茶几边缘蹲坐下”。Narrator 却将 turn 8 旧短语“沙发角落”与正确动作“从窗台上跳下来”拼到同一句。

触发压力是 recent visible prose 里旧位置和新位置都存在，并且当前 storyline 仍写“黑猫卡尔在沙发上的存在感”。缺失防线是系统没有把可移动实体的最新位置写入当前场景状态，也没有在 Narrator prompt 中提供“卡尔当前在窗台/薄荷旁”的显式 scene anchor。失败运动是：Narrator 在局部生成时抓取了旧位置短语作为句首场景锚，同时又执行了 Director 的窗台移动动作。

非主因：

- Director 本轮不是主因；它给出的卡尔动作位置是正确的。
- 不是卡尔未出现导致的同一个问题；turn 9 的问题发生在卡尔已被 turn 8 可见引入之后。
- 不是长期记忆问题；所需位置就在上一轮，但没有被结构化和强约束。

## Root Cause

`rootCause.label`: `entity-location-anchor`

`family`: `recent-context`

这是最近场景内可移动实体位置锚点缺失。系统依赖长篇 recent prose 和 Director actionHint，而没有结构化保存“卡尔当前在窗台/薄荷盆栽旁”。当 prompt 中同时出现旧位置短语、当前 storyline 的“沙发存在感”和正确动作 hint 时，Narrator 混合了两个锚点，造成同句空间断裂。

## Evidence

玩家可见证据：`visible-timeline.jsonl` turn 8 显示卡尔从沙发移动到窗台边；turn 9 显示“沙发角落里，黑猫卡尔从窗台上跳下来”。

内部链路证据：`turn-09/06-llm-calls.json` Director actionHint 正确，Narrator raw text 首次出现冲突句；`turn-09/06b-narrator-prompt.md` 中 recent visible 同时包含旧位置和新位置；`turn-08/05-runtime-after.json` / `turn-09/05-runtime-after.json` 未记录卡尔位置。

## Recommended Fix Area

优先修复 statefold / runtime-after 的 scene entity location writeback，并在 Narrator prompt 中提供“当前场景实体位置”短表。对同一句中的位置介词和动作来源增加轻量一致性检查。

## Confidence

`medium`
