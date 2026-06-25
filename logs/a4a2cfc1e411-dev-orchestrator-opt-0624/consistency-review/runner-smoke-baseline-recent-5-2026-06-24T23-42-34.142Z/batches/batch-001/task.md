请使用这个 skill 审阅一个互动叙事一致性批次：
/Users/ethan/Documents/workspace/Novel/code/story_refined_logs/skills/consistency_evaluator/skills/batch_reviewer/SKILL.md

运行目录：
/Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/a4a2cfc1e411-dev-orchestrator-opt-0624/run_logs/runner-smoke-baseline-recent-5-2026-06-24T23-42-34.142Z

玩家可见时间线：
/Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/a4a2cfc1e411-dev-orchestrator-opt-0624/consistency-review/runner-smoke-baseline-recent-5-2026-06-24T23-42-34.142Z/visible-timeline.jsonl

窗口范围：
1-10

重点评估范围：
1-10

输出目录：
/Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/a4a2cfc1e411-dev-orchestrator-opt-0624/consistency-review/runner-smoke-baseline-recent-5-2026-06-24T23-42-34.142Z/batches/batch-001

要求：
- 只统计重点评估范围内的问题。
- 窗口上文只作为上下文和冲突证据。
- 审阅完整玩家可见 turn，包括 visibleText、choices 和 preLlmEvents。
- 每条 issue 必须写 scope 字段：visibleText、choices、preLlmEvents 或 mixed。
- 可以按需回查完整玩家可见时间线，但不要通读完整运行正文。
- 按 skill 的输出约定落盘 batch-issues.json、batch-summary.json 和 batch-summary.md。
