# story_refined_logs

使用方式：
- 整体评测prompt，修改对应的run日志路径：

```text
请在仓库根目录：
/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/oreturn

直接读取并遵循这个 coordinator skill：
/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/skills/consistency_evaluator/skills/coordinator/SKILL.md

请顺序评测这两个 run：
/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/oreturn/tmp/v7_test/runner-smoke-baseline-recent-5-2026-06-17T19-52-51.669Z
/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/oreturn/tmp/v7_test/runner-smoke-baseline-recent-5-2026-06-17T20-40-00.127Z

把结果写到：
/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/main-v0.0.1/consistency-review

每个 run 都请生成玩家可见 timeline、切分 batch，并显式使用 subagents 审阅各 batch。
派发 subagent 时，直接复用 plan-batches 生成的 batches/<batch-id>/task.md 中文内容，不要改写成英文。
每个 subagent 需要按 task.md 中指定的 batch reviewer skill 执行。
最后聚合并报告两个 run 的评测摘要和报告路径。
```