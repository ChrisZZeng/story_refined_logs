# Batch Root Cause Summary: batch-005

| issue | turn | validity | rootCause.label | family | confidence | report |
|---:|---:|---|---|---|---|---|
| 17 | 48 | `valid` | `current-scene-anchor` | `agent-system` | `high` | `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/root-cause-analysis/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/batches/batch-005/issues/issue-17-turn-48/root-cause-report.md` |
| 18 | 49 | `valid` | `speaker-attribution-local-slip` | `llm-self` | `high` | `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/root-cause-analysis/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/batches/batch-005/issues/issue-18-turn-49/root-cause-report.md` |


## Notes
- 两条 issue 均按玩家可见证据判断为 `valid`。
- issue 17 的主因是缺少最新实体位置/姿态的 current-scene anchor，正确事实存在但未被强约束到 Narrator handoff。
- issue 18 的主因是同一段对白中的本地 speaker attribution slip，建议用 speaker-stack validator 和强制 dialogue tags 拦截。
