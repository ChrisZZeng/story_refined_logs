# story_refined_logs

使用方式：
- 整体评测prompt，修改对应的run日志路径：

```text
请在仓库根目录：
current_dir/oreturn

直接读取并遵循这个 coordinator skill：
current_dir/story_refined_logs/skills/consistency_evaluator/skills/coordinator/SKILL.md

请顺序评测这两个 run：
current_dir/story_refined_logs/logs/2124ade90932-dev-orchestrator-membackend/run_logs/runner-smoke-baseline-recent-5-2026-06-22T09-46-37.258Z
current_dir/story_refined_logs/logs/2124ade90932-dev-orchestrator-membackend/run_logs/runner-smoke-baseline-recent-5-2026-06-22T10-02-09.686Z

把结果分别写到：
current_dir/story_refined_logs/logs/<current_branch>-<current_version>/consistency-review/<run-id>

每个 run 都请生成玩家可见 timeline、切分 batch，并显式使用 subagents 审阅各 batch。
派发 subagent 时，直接复用 plan-batches 生成的 batches/<batch-id>/task.md 中文内容，不要改写成英文。
每个 subagent 需要按 task.md 中指定的 batch reviewer skill 执行。
最后聚合并报告两个 run 的评测摘要和报告路径。
```

- 根因分析 prompt，基于 consistency-review 输出继续分析：

```text
请在仓库根目录：
current_dir/oreturn

直接读取并遵循这个 root cause coordinator skill：
current_dir/story_refined_logs/skills/consistency_root_cause/skills/coordinator/SKILL.md

请顺序分析这两个 consistency review：
current_dir/story_refined_logs/logs/<current_branch>-<current_version>/consistency-review/<run-id-1>
current_dir/story_refined_logs/logs/<current_branch>-<current_version>/consistency-review/<run-id-2>

对应的 run 日志目录分别是：
current_dir/story_refined_logs/logs/<current_branch>-<current_version>/run_logs/<run-id-1>
current_dir/story_refined_logs/logs/<current_branch>-<current_version>/run_logs/<run-id-2>

把结果分别写到：
current_dir/story_refined_logs/logs/<current_branch>-<current_version>/root-cause-analysis/<run-id>

每个 review 都请读取全部 issues，包括 low，自动切分 issue batch，并显式使用 subagents 分析各 batch。
派发 subagent 时，直接复用 plan-issues/build-issue-tasks 生成的 batches/<batch-id>/task.md 中文内容，不要改写成英文。
每个 subagent 需要按 task.md 中指定的 issue tracer skill 执行，并为 batch-issues.json 中的每条 issue 生成独立 root-cause-report.md 和 root-cause-result.json。
所有 batch 完成后聚合 root cause 结果，报告每个 run 的 validity 分布、rootCause.label/family 分布、修复优先级和报告路径。
```
