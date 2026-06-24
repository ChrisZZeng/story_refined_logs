# story_refined_logs

文档：
- 当前需要解决的问题清单：`docs/orchestrator-issue-backlog.md`
- 新同事 case 根因分析 onboarding：`docs/case-root-cause-onboarding.md`

使用方式：
- 整体评测 prompt，修改对应的日志组路径：

```text
请在仓库根目录：
current_dir/

直接读取并遵循这个 coordinator skill：
current_dir/story_refined_logs/skills/consistency_evaluator/skills/coordinator/SKILL.md

请顺序评测这个 run logs 目录下的所有 run：
current_dir/story_refined_logs/logs/<current_branch>-<current_version>/run_logs

如果只需要评测其中一部分 run，请只处理这些 run-id：
<run-id-1>
<run-id-2>

把结果分别写到和 run_logs 平行的目录：
current_dir/story_refined_logs/logs/<current_branch>-<current_version>/consistency-review/<run-id>

每个 run 都请生成玩家可见 timeline、切分 batch，并显式使用 subagents 审阅各 batch。
派发 subagent 时，直接复用 plan-batches 生成的 batches/<batch-id>/task.md 中文内容，不要改写成英文。
每个 subagent 需要按 task.md 中指定的 batch reviewer skill 执行。
最后聚合并报告每个 run 的评测摘要和报告路径。
```

- 根因分析 prompt，基于 consistency-review 输出继续分析：

```text
请在仓库根目录：
current_dir/

直接读取并遵循这个 root cause coordinator skill：
current_dir/story_refined_logs/skills/consistency_root_cause/skills/coordinator/SKILL.md

请顺序分析这个 run logs 目录下所有 run 对应的 consistency review：
current_dir/story_refined_logs/logs/<current_branch>-<current_version>/run_logs

每个 run-id 对应的 consistency review 目录是：
current_dir/story_refined_logs/logs/<current_branch>-<current_version>/consistency-review/<run-id>

如果只需要分析其中一部分 run，请只处理这些 run-id：
<run-id-1>
<run-id-2>

把结果分别写到和 run_logs 平行的目录：
current_dir/story_refined_logs/logs/<current_branch>-<current_version>/root-cause-analysis/<run-id>

每个 review 都请读取全部 issues，包括 low，自动切分 issue batch，并显式使用 subagents 分析各 batch。
派发 subagent 时，直接复用 plan-issues/build-issue-tasks 生成的 batches/<batch-id>/task.md 中文内容，不要改写成英文。
每个 subagent 需要按 task.md 中指定的 issue tracer skill 执行，并为 batch-issues.json 中的每条 issue 生成独立 root-cause-report.md 和 root-cause-result.json。
如果某个 run 缺少对应的 consistency-review/<run-id>，请先报告并跳过，不要臆造评测结果。
所有 batch 完成后聚合 root cause 结果，报告每个 run 的 validity 分布、rootCause.label/family 分布、修复优先级和报告路径。
```

- consistency review 可视化 HTML，基于已有评测结果生成每个 run 的气泡对照报告：

```bash
node story_refined_logs/scripts/render-consistency-review-html.mjs \
  story_refined_logs/logs/<current_branch>-<current_version>
```

默认会扫描 `run_logs/` 下的所有 run，并把 HTML 写到：

```text
story_refined_logs/logs/<current_branch>-<current_version>/consistency-review/<run-id>/fullturn-bubble-review.html
```

如只生成某个 run，可以指定：

```bash
node story_refined_logs/scripts/render-consistency-review-html.mjs \
  story_refined_logs/logs/<current_branch>-<current_version> \
  --run-id <run-id>
```
