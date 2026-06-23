# Issue 003 Turn 9 Root Cause Report

## Problem

Turn 9 的问题是帕兹说“胶卷和记忆卡都给你”。此前玩家已经看到他携带的是老旧胶卷相机，Turn 8 也围绕“一卷胶卷”施压。正文没有说明“记忆卡”是谎话、口误或故意误导，因此形成轻微道具属性漂移。

## Validity

`issueValidity`: `valid`

玩家可见证据足够。Turn 1 建立“老旧的胶卷相机”；Turn 8 黑帮说“你的命就不值一卷胶卷的钱”；Turn 9 却出现“胶卷和记忆卡都给你”。虽然这句在假装示弱语境中理论上可以解释为胡扯，但正文没有标记这种解释，因此玩家会按道具事实读成相机同时有记忆卡。

## Context Assessment

问题前的实际状态是：帕兹有一台老旧胶卷相机，黑帮威胁要他交出相机。玩家选择“平复呼吸，假装示弱，看看对方的反应”。

相关事实：

- `present-clear`: 帕兹携带的是老旧胶卷相机。证据在 `visible-timeline.jsonl` 和 Turn 9 prompt 的 recentTurns。
- `present-clear`: Turn 8 对峙围绕相机和胶卷。证据在 `turn-08/04-output.json` 和 `turn-09/06b-narrator-prompt.md`。
- `over-constraining`: 固定 `interactionFollowup` 要求主角说“胶卷和记忆卡都给你”。证据在 `turn-08/03-story-state.json`、`turn-09/03-story-state.json`、`turn-09/06a-director-prompt.md` 和 `turn-09/06b-narrator-prompt.md`。
- `absent`: prompt 没有说明当固定台词和已建立道具事实冲突时应改写、标注谎言或回退为胶卷。

竞争压力是：固定台词被提升为 `requiredContent`，而写作一致性原则只是一般规则。更近、更硬的 requiredContent 压过了旧道具事实。

## Causal Chain

最早偏离出现在 `turn-08/03-story-state.json` 和 `turn-09/03-story-state.json` 的 `currentStoryline.interactionFollowup`。固定分支台词已经包含“胶卷和记忆卡都给你”。

Turn 9 Director 在 `turn-09/06b-narrator-prompt.md` 第 420-422 行把这句台词升为 `requiredContent`。Narrator prompt 又要求 `requiredContent` 必须自然融入正文，不要丢失、改义或作为注释输出。于是 Narrator 按硬要求写出这句，未能依据胶卷相机事实做修正。

机制说明：固定分支台词中的道具细节与已建立胶卷相机事实不兼容，但固定 beat 到 Director 的 handoff 缺少事实一致性校验和冲突改写规则，导致错误细节以 `requiredContent` 身份压过 recent visible fact。

非主因：

- 不是 Narrator 自发添加“记忆卡”；该词已经在 fixed followup 中。
- 不是玩家输入造成；玩家只选择假装示弱。

## Root Cause

`rootCause.label`: `fixed-beat-detail-incompatibility`

`family`: `agent-system`

`secondaryFamilies`: `detail-memory`

根因是固定剧情台词与已建立道具事实之间缺少一致性校验。系统没有在固定 `interactionFollowup` 进入 Director `requiredContent` 前发现“记忆卡”与胶卷相机冲突，也没有提供最小改写策略。

## Evidence

玩家可见证据：Turn 1 是“老旧的胶卷相机”；Turn 8 是“一卷胶卷”；Turn 9 是“胶卷和记忆卡都给你”。

内部链路证据：`turn-09/03-story-state.json` 的 `currentStoryline.interactionFollowup` 含“记忆卡”；`turn-09/06b-narrator-prompt.md` 第 241-247 行显示该 followup，第 420-422 行显示 Director 将其作为 `requiredContent`；`turn-09/07-events.json` 显示 Narrator 写入最终正文。

## Recommended Fix Area

为 fixed beat / `interactionFollowup` 增加道具事实 lint。Director 构造 `requiredContent` 时，如果固定台词与玩家已见事实冲突，应允许最小事实修正，或要求正文显式标注为谎话、口误或策略性误导。

## Confidence

`high`
