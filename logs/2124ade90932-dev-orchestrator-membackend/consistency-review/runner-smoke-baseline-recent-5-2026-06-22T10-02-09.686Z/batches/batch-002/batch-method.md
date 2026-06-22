# Batch 002 审阅方法

- 运行目录：`logs/2124ade90932-dev-orchestrator-membackend/run_logs/runner-smoke-baseline-recent-5-2026-06-22T10-02-09.686Z`
- 玩家可见时间线：`logs/2124ade90932-dev-orchestrator-membackend/run_logs/consistency-review/runner-smoke-baseline-recent-5-2026-06-22T10-02-09.686Z/visible-timeline.jsonl`
- 窗口范围：`1-20`
- 重点评估范围：`11-20`

读取方式：

1. 读取 batch reviewer skill 和引用的 review guidelines，确认 scope、source、severity、统计范围口径。
2. 读取 `visible-timeline.jsonl` 的第 `1-20` 行，分段检查每个 turn 的 `playerInput`、`preLlmEvents`、`visibleText` 和 `choices`。
3. 对 `11-20` 逐轮判断正文、选项和生成前事件是否与窗口上文或当前玩家输入冲突。
4. 只将 `11-20` 内新发生的问题写入 `batch-issues.json` 和汇总统计；`1-10` 仅作为冲突证据。

本批次 `preLlmEvents` 在窗口内均为空，因此没有发现 `preLlmEvents` scope 的问题。
