# Batch 002 Consistency Review

## 范围

- 运行目录：`/Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/a4a2cfc1e411-dev-orchestrator-opt-0624/run_logs/runner-smoke-baseline-recent-5-2026-06-24T23-42-22.095Z`
- 玩家可见时间线：`/Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/a4a2cfc1e411-dev-orchestrator-opt-0624/consistency-review/runner-smoke-baseline-recent-5-2026-06-24T23-42-22.095Z/visible-timeline.jsonl`
- 窗口范围：1-20
- 重点评估范围：11-20

## 结果

- 评估 turn 数：10
- 问题数：6
- 涉及问题的 turn：13、17、20
- 首个不一致 turn：13
- 不确定 turn：无

## 主要问题

1. Turn 13 的便条内容带有 `[narrator → player]` 元标签，破坏正文协议。
2. Turn 17 把至少一小时前的巷口冲突写成“几分钟前追过你”，时间和行动承接不稳。
3. Turn 17 多处把黑帮成员或叙述动作标成“小贩”，造成说话人身份漂移。
4. Turn 17 开始把此前一直作为相机本体呈现的物件写成“相机包”，物件状态轻微漂移。
5. Turn 20 开头出现“目光落在我脸上”，在第二人称叙述中滑入第一人称。
6. Turn 20 的选项说“配电室找到的旧地图和签收单”，但玩家此前只看到便条、路线图、小纸卷和值班表，没有看到签收单。

## preLlmEvents

窗口 1-20 的 `preLlmEvents` 均为空数组，因此本批次没有计入 `preLlmEvents` 范围的问题。
