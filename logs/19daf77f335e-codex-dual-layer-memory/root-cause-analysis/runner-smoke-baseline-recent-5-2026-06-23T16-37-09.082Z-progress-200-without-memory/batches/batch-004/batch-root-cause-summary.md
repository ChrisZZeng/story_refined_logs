# batch-004 Root Cause Summary

- run: `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory`
- review: `logs/19daf77f335e-codex-dual-layer-memory/consistency-review/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory`
- issueCount: 4

| issue | turn | validity | rootCause.label | family | confidence | report |
|---:|---:|---|---|---|---|---|
| 13 | 22 | `valid` | `current-scene-anchor` | `agent-system` | `high` | `logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-004/issues/issue-13-turn-22/root-cause-report.md` |
| 14 | 23 | `valid` | `location-transition-bridge` | `agent-system` | `high` | `logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-004/issues/issue-14-turn-23/root-cause-report.md` |
| 15 | 24 | `valid` | `choice-affordance-state-gating` | `agent-system` | `high` | `logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-004/issues/issue-15-turn-24/root-cause-report.md` |
| 16 | 24 | `valid` | `current-scene-anchor` | `agent-system` | `high` | `logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-004/issues/issue-16-turn-24/root-cause-report.md` |

## Notes
- issue-13 和 issue-16 共享 `current-scene-anchor` 机制：最近正文里的旧姿态没有 consumed/final-state 优先级，被 Narrator 复用。
- issue-14 是位置转换桥接契约不足：Director soft actionHint 给出书架 endpoint，但 Narrator 没有显式移动过渡。
- issue-15 是传播型 `choice-affordance-state-gating`：turn 19 的无效信封选项被 turn 20 实体化，污染后续局部上下文。
