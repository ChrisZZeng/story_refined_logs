# batch-014 Root Cause Summary

| issue | turn | validity | rootCause.label | family | confidence | report |
|---:|---:|---|---|---|---|---|
| 42 | 97 | valid | context-priority | agent-system | high | `logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-014/issues/issue-42-turn-97/root-cause-report.md` |
| 43 | 106 | valid | storyline-lifecycle | agent-system | high | `logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-014/issues/issue-43-turn-106/root-cause-report.md` |
| 44 | 108 | valid | context-priority | recent-context | high | `logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-014/issues/issue-44-turn-108/root-cause-report.md` |
| 45 | 110 | valid | memory-persistence | detail-memory | high | `logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-014/issues/issue-45-turn-110/root-cause-report.md` |

## Notes
- 本批次 4 条 issue 均为 `valid`。
- issue 42 与 44 主要来自 recent/current-scene 状态优先级不足；issue 43 来自 declined storyline node 生命周期未正确收束；issue 45 来自命名物品 ownership 未持久化并被隐藏参考台词牵引。
