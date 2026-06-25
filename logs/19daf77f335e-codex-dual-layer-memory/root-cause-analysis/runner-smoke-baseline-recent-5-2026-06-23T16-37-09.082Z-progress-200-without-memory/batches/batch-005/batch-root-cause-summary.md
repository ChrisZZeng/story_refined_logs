# Batch Root Cause Summary - batch-005

| issueId | turn | validity | rootCause.label | family | confidence | report |
|---|---:|---|---|---|---|---|
| `issue-17` | 26 | `valid` | `storyline-lifecycle` | `agent-system` | `high` | `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-005/issues/issue-17-turn-26/root-cause-report.md` |

本批次共 1 条 issue，已逐条分析。该 issue 是有效的玩家可见空间跳转问题，L3 root mechanism 为 `storyline-lifecycle`：transition beat 在玩家可见转场完成前被消费并推进，导致宴会厅 storyline/location 覆盖最近公寓场景。
