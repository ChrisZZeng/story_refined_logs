# Batch 005 审阅方法

输入确认：

- 运行目录：`/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/2124ade90932-dev-orchestrator-membackend/run_logs/runner-smoke-baseline-recent-5-2026-06-22T09-46-37.258Z`
- 玩家可见时间线：`/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/2124ade90932-dev-orchestrator-membackend/run_logs/consistency-review/runner-smoke-baseline-recent-5-2026-06-22T09-46-37.258Z/visible-timeline.jsonl`
- 窗口范围：`31-50`
- 重点评估范围：`41-50`
- 输出目录：`/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/2124ade90932-dev-orchestrator-membackend/run_logs/consistency-review/runner-smoke-baseline-recent-5-2026-06-22T09-46-37.258Z/batches/batch-005`

读取方式：

- 使用 `jq` 顺序读取 `31-50` 的 `playerInput`、`preLlmEvents`、`visibleText` 和 `choices`。
- 仅用窗口上文 `31-40` 建立公寓、书架、门口来客、卡尔和玩家站位等上下文。
- 对 `41-50` 逐轮审阅正文、选项和生成前事件；本批次所有 `preLlmEvents` 均为空数组。
- 按需使用 `rg` 在完整玩家可见时间线中回查关键词：`德索洛`、`被害者`、`申诉`、`晚宴`、`康纳`、`罗英`、`敏特`、`凯旋门` 等，确认相关信息是否曾在玩家可见层面出现。
- 未通读完整运行正文，也未使用隐藏剧本、角色卡或内部状态。
