# Batch 002 Method

本次使用 `/Users/ethan/Documents/workspace/Novel/code/story_refined_logs/skills/consistency_evaluator/skills/batch_reviewer/SKILL.md` 和其 `references/review_guidelines.md` 作为审阅规则。

读取范围：

- 运行目录：`/Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/58041ee23322-dev-orchestrator-opt-0624/run_logs/runner-smoke-baseline-recent-5-2026-06-26T07-28-34.149Z`
- 玩家可见时间线：`/Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/58041ee23322-dev-orchestrator-opt-0624/consistency-review/runner-smoke-baseline-recent-5-2026-06-26T07-28-34.149Z/visible-timeline.jsonl`
- 窗口范围：turn 1-20
- 重点评估范围：turn 11-20

审阅方式：

1. 先读取 skill 和审阅规则，确认只使用玩家可见证据。
2. 用 `jq` 抽取 turn 1-20 的 `playerInput`、`preLlmEvents`、`visibleText` 和 `choices`。由于每轮文本较长，正文按 turn 分块读取。
3. 逐轮审阅 turn 11-20，并把 turn 1-10 作为上下文和冲突证据。
4. 针对候选问题回查玩家可见时间线中的门状态、照片描述、房间物件、玩家姿态和选项文本；没有通读完整运行正文。
5. 只把 turn 11-20 内新出现的玩家可见问题计入本批次。

