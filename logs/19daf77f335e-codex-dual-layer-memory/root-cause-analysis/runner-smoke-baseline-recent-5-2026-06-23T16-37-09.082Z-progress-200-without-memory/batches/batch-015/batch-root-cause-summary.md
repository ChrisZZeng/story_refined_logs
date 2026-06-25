# Batch Root Cause Summary

| issueIndex | turn | validity | rootCause.label | family | confidence | report |
| --- | ---: | --- | --- | --- | --- | --- |
| 46 | 115 | `valid` | `current-scene-anchor` | `agent-system` | `high` | `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-015/issues/issue-46-turn-115/root-cause-report.md` |
| 47 | 117 | `valid` | `current-scene-anchor` | `agent-system` | `high` | `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-015/issues/issue-47-turn-117/root-cause-report.md` |
| 48 | 118 | `valid` | `storyline-lifecycle` | `agent-system` | `high` | `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-015/issues/issue-48-turn-118/root-cause-report.md` |
| 49 | 119 | `questionable` | `null` | `null` | `medium` | `/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-015/issues/issue-49-turn-119/root-cause-report.md` |

## Notes
- issue 46、47 都指向 `current-scene-anchor`：最新可见姿态/物品位置没有被结构化为 Narrator/Choice 的硬约束。
- issue 48 指向 `storyline-lifecycle`：四点半门口会合没有作为 time-gated objective 触发或过期。
- issue 49 标为 `questionable`：玩家可见证据允许卡尔在长时间间隔中 offscreen 移动，因此不强行归因。
