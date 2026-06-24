# Batch 017 审阅方法

- 运行目录：`/Users/wanghaha/code/oreturn-owlet-hybrid-dual-layer-memory/tmp/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200`
- 玩家可见时间线：`/Users/wanghaha/code/oreturn-owlet-hybrid-dual-layer-memory/tmp/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200/consistency-review/visible-timeline.jsonl`
- 窗口范围：151-170
- 重点评估范围：161-170
- 输出目录：`/Users/wanghaha/code/oreturn-owlet-hybrid-dual-layer-memory/tmp/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200/consistency-review/batches/batch-017`

读取方式：

1. 使用 `jq` 从 `visible-timeline.jsonl` 中抽取 151-170 的玩家可见记录。
2. 对每个 turn 阅读 `playerInput`、`preLlmEvents`、`visibleText` 和 `choices`。
3. 151-160 只用于建立上下文和冲突证据，不计入本批次问题统计。
4. 逐轮审阅 161-170，检查空间位置、物件状态、行动承接、互动状态、因果推进、语言与格式稳定性。
5. 对疑似长程冲突，回查玩家可见时间线中的相关早期 turn；本批次未通读完整运行正文。

本窗口 `preLlmEvents` 均为空，因此没有发现 `preLlmEvents` 范围内的问题。
