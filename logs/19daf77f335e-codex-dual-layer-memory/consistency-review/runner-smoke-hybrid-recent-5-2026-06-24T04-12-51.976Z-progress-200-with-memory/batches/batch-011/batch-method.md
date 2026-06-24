# Batch 011 Method

使用 skill：
`/Users/wqy/Code/story_refined_logs/skills/consistency_evaluator/skills/batch_reviewer/SKILL.md`

输入确认：

- 运行目录：`/Users/wqy/Code/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory`
- 玩家可见时间线：`/Users/wqy/Code/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/consistency-review/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/visible-timeline.jsonl`
- 窗口范围：91-110
- 重点评估范围：101-110
- 输出目录：`/Users/wqy/Code/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/consistency-review/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/batches/batch-011`

执行方式：

1. 读取 skill 与 `references/review_guidelines.md`，按玩家可见证据边界评估。
2. 从 `visible-timeline.jsonl` 抽取窗口 91-110 的 `playerInput`、`preLlmEvents`、`visibleText` 和 `choices`。
3. 对重点范围 101-110 逐轮审阅，只把该范围内的新问题计入本批次；91-100 仅作为上文和冲突证据。
4. 为长程一致性按需检索玩家可见时间线中的关键词「康纳」「宴会厅」「调光」「黑猫」「真正的家」「手空」「不急着知道」，确认相关人物、地点和隐喻均已有可见支撑。
5. 未通读完整运行正文，也未使用隐藏剧本、角色卡或内部状态作为判错依据。

范围说明：

- 91-100 只作为上下文和冲突证据。
- 101-110 计入统计。
- 101-110 的 `preLlmEvents` 均为空，因此本批次问题均来自 `visibleText` 或 `choices`，其中一条问题跨越上一轮选项和下一轮正文，标为 `mixed`。
