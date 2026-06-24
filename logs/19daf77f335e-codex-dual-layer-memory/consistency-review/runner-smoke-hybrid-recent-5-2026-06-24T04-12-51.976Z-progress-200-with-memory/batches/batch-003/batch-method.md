# Batch 003 Method

使用 skill：
`/Users/wqy/Code/story_refined_logs/skills/consistency_evaluator/skills/batch_reviewer/SKILL.md`

输入确认：

- 运行目录：`/Users/wqy/Code/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory`
- 玩家可见时间线：`/Users/wqy/Code/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/consistency-review/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/visible-timeline.jsonl`
- 窗口范围：11-30
- 重点评估范围：21-30
- 输出目录：`/Users/wqy/Code/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/consistency-review/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/batches/batch-003`

执行方式：

1. 读取 skill 与 `references/review_guidelines.md`，按玩家可见证据边界评估。
2. 从 `visible-timeline.jsonl` 抽取窗口 11-30 的 `playerInput`、`preLlmEvents`、`visibleText` 和 `choices`。
3. 对重点范围 21-30 逐轮审阅，只把该范围内的新问题计入本批次。
4. 为长程冲突按需回看 1-10 轮的玩家可见摘要，并检索关键词「名片」「亏欠」「记者先生」。
5. 未通读完整运行正文，也未使用隐藏剧本、角色卡或内部状态作为判错依据。

范围说明：

- 11-20 只作为上下文和冲突证据。
- 21-30 计入统计。
- 11-30 的 `preLlmEvents` 均为空，因此本批次问题均来自 `visibleText` 或 `choices`，另有一条由玩家输入与正文推进共同构成的 `mixed` 问题。
