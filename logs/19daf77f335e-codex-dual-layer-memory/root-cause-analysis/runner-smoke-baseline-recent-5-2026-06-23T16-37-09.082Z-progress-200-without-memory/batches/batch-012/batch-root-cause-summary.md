# Batch Root Cause Summary: batch-012

- run: `runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory`
- issueCount: `4`
- validityCounts: valid=4, questionable=0, invalid=0

| issueIndex | turn | validity | rootCause.label | family | confidence | report |
|---:|---:|---|---|---|---|---|
| 34 | 76 | `valid` | `current-scene-anchor` | `agent-system` | `high` | `logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-012/issues/issue-34-turn-76/root-cause-report.md` |
| 35 | 78 | `valid` | `model-local` | `llm-self` | `high` | `logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-012/issues/issue-35-turn-78/root-cause-report.md` |
| 36 | 84 | `valid` | `context-priority` | `recent-context` | `medium` | `logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-012/issues/issue-36-turn-84/root-cause-report.md` |
| 37 | 86 | `valid` | `choice-action-binding` | `agent-system` | `high` | `logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-012/issues/issue-37-turn-86/root-cause-report.md` |

## Notes
- 每条 issue 均已生成独立目录，并包含 `root-cause-report.md` 与 `root-cause-result.json`。
- 全部 validity 判断均先使用玩家可见证据确认，内部 artifact 仅用于追踪 rootCause。
