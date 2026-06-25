# batch-011 Root Cause Summary

| issueIndex | turn | validity | rootCause.label | family | confidence | report |
|---:|---:|---|---|---|---|---|
| 30 | 63 | `valid` | `model-local` | `llm-self` | `high` | `issues/issue-30-turn-63/root-cause-report.md` |
| 31 | 68 | `valid` | `context-priority` | `recent-context` | `high` | `issues/issue-31-turn-68/root-cause-report.md` |
| 32 | 70 | `valid` | `choice-action-binding` | `agent-system` | `medium` | `issues/issue-32-turn-70/root-cause-report.md` |
| 33 | 72 | `valid` | `state-writeback` | `agent-system` | `high` | `issues/issue-33-turn-72/root-cause-report.md` |

## Notes
- 本批次 4 条 issue 均已按玩家可见证据先做 issueValidity 判断。
- valid issue 均追踪到 L3 root mechanism；worker 名称仅作为 divergence artifact 使用。
- issue-33 的内部根因涉及 hidden runtime/storyline writeback，但 validity 仅由玩家可见 turn-27/28/72 证明。
