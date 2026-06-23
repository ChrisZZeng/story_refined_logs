# Batch Method

- 运行目录：`/Users/wanghaha/code/oreturn-owlet-hybrid-dual-layer-memory/tmp/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random`
- 玩家可见时间线：`/Users/wanghaha/code/oreturn-owlet-hybrid-dual-layer-memory/tmp/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/consistency-review/visible-timeline.jsonl`
- 窗口范围：31-50
- 重点评估范围：41-50
- 输出目录：`/Users/wanghaha/code/oreturn-owlet-hybrid-dual-layer-memory/tmp/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/consistency-review/batches/batch-005`

读取方式：

1. 读取 skill 主说明和 `references/review_guidelines.md`。
2. 使用 `jq` 仅抽取 `visible-timeline.jsonl` 中 31-50 轮的 `playerInput`、`preLlmEvents`、`visibleText`、`choices`。
3. 顺序复盘 31-40 作为上下文，不把其中问题计入本批次。
4. 逐轮审阅 41-50 的正文、选项和生成前事件；本批次 41-50 的 `preLlmEvents` 均为空。
5. 对重点范围内发现的问题回引窗口内此前玩家可见证据；未通读完整运行正文。
