# Batch 004 Method

本次使用 `/Users/ethan/Documents/workspace/Novel/code/story_refined_logs/skills/consistency_evaluator/skills/batch_reviewer/SKILL.md` 和其 `references/review_guidelines.md` 作为审阅规则。

读取范围：

- 运行目录：`/Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/58041ee23322-dev-orchestrator-opt-0624/run_logs/runner-smoke-baseline-recent-5-2026-06-26T07-28-34.149Z`
- 玩家可见时间线：`/Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/58041ee23322-dev-orchestrator-opt-0624/consistency-review/runner-smoke-baseline-recent-5-2026-06-26T07-28-34.149Z/visible-timeline.jsonl`
- 窗口范围：turn 21-40
- 重点评估范围：turn 31-40

审阅方式：

1. 先读取 skill 和审阅规则，确认只使用玩家可见证据。
2. 用 `jq` 抽取 turn 21-40 的 `playerInput`、`preLlmEvents`、`visibleText` 和 `choices`。由于每轮文本较长，正文按 turn 分块读取。
3. 逐轮审阅 turn 31-40，并把 turn 21-30 作为上下文和冲突证据。
4. 对候选问题做针对性回查，只查询玩家可见时间线中的时间词、凯旋门/康纳关系、卡尔和随身物件位置；没有通读完整运行正文。
5. 只把 turn 31-40 内新出现的玩家可见问题计入本批次。
