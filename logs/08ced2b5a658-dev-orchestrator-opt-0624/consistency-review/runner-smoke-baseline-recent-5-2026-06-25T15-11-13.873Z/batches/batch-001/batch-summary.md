# Batch 001 Summary

## 范围

- 运行目录：`/Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/08ced2b5a658-dev-orchestrator-opt-0624/run_logs/runner-smoke-baseline-recent-5-2026-06-25T15-11-13.873Z`
- 玩家可见时间线：`/Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/08ced2b5a658-dev-orchestrator-opt-0624/consistency-review/runner-smoke-baseline-recent-5-2026-06-25T15-11-13.873Z/visible-timeline.jsonl`
- 窗口范围：1-10
- 重点评估范围：1-10
- 已评估 turn 数：10

## 指标

- 首个不一致 turn：2
- 不一致 turn 数：4
- issue 数：6
- uncertain turn 数：0
- 不一致 turns：2, 3, 6, 10
- uncertain turns：无

## 主要发现

本批次中，1-10 轮整体主线能够连续推进：帕兹从中央区醒来，追查敏特线索，跟随卡琳娜进入暗街，通过黑帮成员拦截，抵达卡琳娜的安全屋。`preLlmEvents` 在本窗口内均为空，未发现生成前事件层面的问题。

确认的问题集中在四处：

1. Turn 2 小贩把未建立过的“红头发”说成帕兹已经提到的信息。
2. Turn 3 一个选项文本状态滞后且语义突兀。
3. Turn 6 卡琳娜在对峙中的站位从帕兹与黑帮成员之间漂移到帕兹身后，同时正文声称她没有移动。
4. Turn 10 同时出现安全屋道具/炉灶状态不连续、卡琳娜重复追问已知找人目标，以及正文插入钥匙 emoji 的格式问题。

没有标记 uncertain issue。所有问题都发生在重点评估范围 1-10 内。
