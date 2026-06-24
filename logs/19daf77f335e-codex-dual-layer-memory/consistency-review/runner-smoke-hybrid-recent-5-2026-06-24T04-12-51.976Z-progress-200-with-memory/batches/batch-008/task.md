请使用这个 skill 审阅一个互动叙事一致性批次：
/Users/wqy/Code/story_refined_logs/skills/consistency_evaluator/skills/batch_reviewer/SKILL.md

运行目录：
/Users/wqy/Code/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory

玩家可见时间线：
/Users/wqy/Code/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/consistency-review/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/visible-timeline.jsonl

窗口范围：
61-80

重点评估范围：
71-80

输出目录：
/Users/wqy/Code/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/consistency-review/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/batches/batch-008

要求：
- 只统计重点评估范围内的问题。
- 窗口上文只作为上下文和冲突证据。
- 审阅完整玩家可见 turn，包括 visibleText、choices 和 preLlmEvents。
- 每条 issue 必须写 scope 字段：visibleText、choices、preLlmEvents 或 mixed。
- 可以按需回查完整玩家可见时间线，但不要通读完整运行正文。
- 按 skill 的输出约定落盘 batch-issues.json、batch-summary.json 和 batch-summary.md。
