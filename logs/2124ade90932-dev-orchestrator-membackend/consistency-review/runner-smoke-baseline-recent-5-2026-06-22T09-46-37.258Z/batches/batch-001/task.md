请使用这个 skill 审阅一个互动叙事一致性批次：
/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/skills/consistency_evaluator/skills/batch_reviewer/SKILL.md

运行目录：
/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/2124ade90932-dev-orchestrator-membackend/run_logs/runner-smoke-baseline-recent-5-2026-06-22T09-46-37.258Z

玩家可见时间线：
/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/2124ade90932-dev-orchestrator-membackend/run_logs/consistency-review/runner-smoke-baseline-recent-5-2026-06-22T09-46-37.258Z/visible-timeline.jsonl

窗口范围：
1-10

重点评估范围：
1-10

输出目录：
/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/2124ade90932-dev-orchestrator-membackend/run_logs/consistency-review/runner-smoke-baseline-recent-5-2026-06-22T09-46-37.258Z/batches/batch-001

要求：
- 只统计重点评估范围内的问题。
- 窗口上文只作为上下文和冲突证据。
- 审阅完整玩家可见 turn，包括 visibleText、choices 和 preLlmEvents。
- 每条 issue 必须写 scope 字段：visibleText、choices、preLlmEvents 或 mixed。
- 可以按需回查完整玩家可见时间线，但不要通读完整运行正文。
- 按 skill 的输出约定落盘 batch-issues.json、batch-summary.json 和 batch-summary.md。
