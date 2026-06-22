# logs

本目录用于存放不同分支和版本对应的评估日志。

每个子目录都以“分支 + 版本”的形式命名：

```text
<branch>-<version>/
```

示例：

```text
main-v1/
feature-memory-v2/
```

每个子目录下约定包含文件化运行日志和评测结果，例如：

```text
<branch>-<version>/
  run_logs/
    <run-id>/
      turn-001/
        01-summary.json
        02-script-state.json
        03-story-state.json
        04-output.json
  consistency-review/
    <run-id>/
      visible-timeline.jsonl
      batch-plan.json
      issues.json
      summary.md
```

如果运行数据来自同级目录中的 `../oreturn`，需要先通过单独导出步骤生成这里的 `run_logs/<run-id>/turn-*` 文件结构；评测 skill 不直接调用 `oreturn`。
