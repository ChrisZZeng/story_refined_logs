# Batch 001 审阅方法

使用 skill：`skills/consistency_evaluator/skills/batch_reviewer/SKILL.md`

审阅规则参考：`skills/consistency_evaluator/skills/batch_reviewer/references/review_guidelines.md`

输入：

- runDir: `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/2124ade90932-dev-orchestrator-membackend/run_logs/runner-smoke-baseline-recent-5-2026-06-22T10-02-09.686Z`
- timelinePath: `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/2124ade90932-dev-orchestrator-membackend/run_logs/consistency-review/runner-smoke-baseline-recent-5-2026-06-22T10-02-09.686Z/visible-timeline.jsonl`
- windowRange: 1-10
- evalRange: 1-10

处理方式：

1. 完整读取 batch reviewer skill 与审阅规则参考。
2. 只抽取 `visible-timeline.jsonl` 的第 1-10 行作为本批次窗口，没有通读完整运行正文。
3. 对每一轮依次检查 `visibleText`、`choices` 和 `preLlmEvents`。本窗口内 `preLlmEvents` 全为空数组。
4. 只统计 evalRange 1-10 内出现的问题；本批次没有窗口上文超出评估范围的情况。
5. 对问题逐条记录 scope、type、severity、currentEvidence、conflictingEvidence、conflictingTurns、source 和 reason。
