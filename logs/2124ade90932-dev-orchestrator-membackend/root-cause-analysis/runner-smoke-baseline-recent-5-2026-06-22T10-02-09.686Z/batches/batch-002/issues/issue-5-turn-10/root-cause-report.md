# Issue 5 / Turn 10 Root Cause Report

## Problem

本 issue 指向 turn 10 的 `visibleText`：帕兹把敏特照片描述成“港口区边缘的街景，废弃的仓库，敏特站在镜头前”。这和 turn 1 玩家已经看到的匿名信照片不一致。turn 1 的照片背景是“完全陌生的街道。路灯、石板路、远处的椰子酒招牌”。

## Validity

`issueValidity`: `valid`

玩家可见证据足以确认问题成立。turn 1 已经把匿名信照片作为帕兹来新西西里的核心线索呈现，并给出明确视觉背景。turn 10 的玩家输入只说“收到了一张她在这里拍的照片”，没有要求重新设定照片内容；正文却把同一张线索照片改成港口区和废弃仓库。这里不是合理补充，而是把照片从“街道路牌线索”改成“港口仓库线索”，会改变玩家对敏特活动位置的判断。

## Context Assessment

问题发生前，玩家实际看到的状态是：帕兹因为匿名信照片来到新西西里，照片里敏特站在陌生街道背景中，背景元素是路灯、石板路和椰子酒招牌。到 turn 10 时，玩家选择说明来意：自己收到敏特在这里拍的照片，想确认她是否还活着。

关键事实与可用性：

- 匿名信照片的玩家可见背景是“路灯、石板路、远处的椰子酒招牌”。该事实在 `turn-01/04-output.json` 和 `visible-timeline.jsonl` 中 `present-clear`，但在 `turn-10/03-story-state.json`、`turn-10/06a-director-prompt.md` 和 `turn-10/06b-narrator-prompt.md` 中只剩“敏特的照片，拍摄地点是新西西里”这种粗摘要，因此对 turn 10 Narrator 是 `absent`。
- turn 10 Director 要求“卡琳娜对'照片'做出反应，询问照片内容或来源”，这是 `present-clear` 的本轮局部压力，但没有附带“沿用已出现照片背景”的约束。
- 世界观中 `港口区`、`秘密仓库`、`骷髅会` 是 `present-clear`，并且比 turn 1 具体照片背景更靠近当前 prompt 的设定区块，形成了可被模型借用的地点词库。

竞争压力主要来自三个方向：玩家输入要求谈照片；Director 要求追问照片细节；世界观与当前悬疑线把“港口区/仓库/骷髅会”作为更戏剧化的线索素材提供给 Narrator。

## Causal Chain

最早的可见偏离出现在 `turn-10/06-llm-calls.json[1].text`，也同步落入 `turn-10/04-output.json`。Narrator 在描述“那张照片的内容”时新增了“港口区边缘的街景，废弃的仓库”。

触发压力是：turn 10 Director 将本轮组织成“追问照片内容或来源”，但 handoff 中没有照片的既有视觉细节。Narrator prompt 只能看到“照片拍摄地点是新西西里”的角色背景摘要，以及世界观里的港口区和仓库设定。

缺失防线是：关键物证照片没有作为稳定 detail fact 持久化到 story state 或记忆中；prompt 也没有在本轮追问照片时把已出现的照片背景作为 must-preserve 约束注入。通用“保持一致”无法告诉 Narrator 具体应该保持什么。

失败运动是：Narrator 为了让“照片内容”更有线索感，从可见但泛化的“新西西里照片”跳到世界观中更强情节信号的“港口区/废弃仓库”，于是改写了玩家已经看过的照片背景。turn 11 又继续引用“港口区的照片”，说明错误被 recent visible text 传播。

非主因：

- `Choice` 不是主因；turn 9 的选项只是让玩家说明照片动机，没有给出港口区。
- runtime events / `runtime-after` 不是主因；turn 10 之后只写入剧情摘要和锚点，没有把照片背景作为结构化事实写回。
- 隐藏真相不是判定依据；玩家可见层面已经能确认照片背景冲突。

## Root Cause

`rootCause.label`: `memory-persistence`

`family`: `detail-memory`

L3 机制是关键线索物件的视觉细节没有被持久化为可检索、可约束的 detail fact。turn 1 的匿名信照片背景是玩家理解敏特线索的稳定事实，但进入 turn 10 时，story state 和 prompt 只保留了“敏特照片在新西西里”这个粗粒度摘要。Director 又把“询问照片内容”作为本轮重点，却没有把原始背景一并 handoff 给 Narrator。于是 Narrator 在缺少具体照片锚点时，从当前世界观和悬疑压力中推断出“港口区/废弃仓库”，造成玩家可见事实冲突。

## Evidence

玩家可见证据：

- `visible-timeline.jsonl`, turn 1：匿名信照片背景为陌生街道、路灯、石板路、椰子酒招牌。
- `visible-timeline.jsonl`, turn 10：同一来意下，照片内容变成港口区边缘街景和废弃仓库。
- `visible-timeline.jsonl`, turn 11：卡琳娜继续说“你刚才描述的那张港口区的照片”，错误进入下一轮。

内部链路证据：

- `turn-10/03-story-state.json` 的主角背景只说“敏特的照片，拍摄地点是新西西里”，缺少 turn 1 的具体背景。
- `turn-10/06a-director-prompt.md` 和 `turn-10/06b-narrator-prompt.md` 中，Director 输出要求“卡琳娜对'照片'做出反应，询问照片内容或来源”，但未提供原照片背景。
- `turn-10/06-llm-calls.json[1].text` 是第一次生成“港口区边缘的街景，废弃的仓库”的 artifact。
- `turn-10/05-runtime-after.json` 与 `turn-10/07-events.json` 没有照片背景 detail 的结构化写回。

## Recommended Fix Area

优先修复 detail fact persistence 和 prompt assembly。将固定演出或 CG 里出现的关键物证细节，例如“敏特的照片背景=陌生街道/路灯/石板路/椰子酒招牌”，写入可检索的物件事实，并在后续 Director/Narrator 需要谈同一物件时作为 must-preserve context 注入。另一个防线是在 Narrator 后处理或 evaluator 前置检查中，对“同一照片/信件/物件”描述做已知 detail conflict 检查。

## Confidence

`confidence`: `high`
