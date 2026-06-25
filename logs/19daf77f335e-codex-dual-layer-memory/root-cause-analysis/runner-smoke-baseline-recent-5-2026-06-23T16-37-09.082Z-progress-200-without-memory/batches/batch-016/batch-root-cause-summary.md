# Batch Root Cause Summary: batch-016

| issueIndex | turn | issueValidity | rootCause.label | family | confidence | report |
|---:|---:|---|---|---|---|---|
| 50 | 120 | `valid` | `context-priority` | `agent-system` | `high` | `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-016/issues/issue-050-turn-120/root-cause-report.md` |
| 51 | 123 | `valid` | `choice-action-binding` | `agent-system` | `high` | `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-016/issues/issue-051-turn-123/root-cause-report.md` |
| 52 | 125 | `valid` | `choice-action-binding` | `agent-system` | `high` | `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-016/issues/issue-052-turn-125/root-cause-report.md` |

## Notes

- issue 50 是 Narrator 在可见正文中复用 stale 物品位置，属于 `context-priority`。
- issue 51 和 issue 52 都是 Choice generator 把胶片相机误绑定为可即时回看照片的 action，属于 `choice-action-binding`。
