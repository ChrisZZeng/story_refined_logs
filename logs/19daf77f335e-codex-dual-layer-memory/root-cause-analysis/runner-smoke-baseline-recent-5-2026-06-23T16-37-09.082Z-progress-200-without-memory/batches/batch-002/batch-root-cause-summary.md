# batch-002 root cause summary

| issue | turn | validity | rootCause.label | family | confidence | report |
|---:|---:|---|---|---|---|---|
| 5 | 8 | `valid` | `context-priority` | `agent-system` | `high` | `issues/issue-5-turn-8/root-cause-report.md` |
| 6 | 9 | `valid` | `choice-action-binding` | `agent-system` | `medium` | `issues/issue-6-turn-9/root-cause-report.md` |
| 7 | 10 | `valid` | `fixed-beat-consumption` | `agent-system` | `high` | `issues/issue-7-turn-10/root-cause-report.md` |
| 8 | 14 | `valid` | `choice-action-binding` | `agent-system` | `medium` | `issues/issue-8-turn-14/root-cause-report.md` |

## Notes
- 全部 issue 均先用玩家可见证据完成 validity 判断；内部 artifact 仅用于追踪 root mechanism。
- 本批次主要聚类到 `agent-system`，其中 issue-5 是隐藏/可见事实优先级冲突，issue-6 与 issue-8 是选项语义绑定不足，issue-7 是固定 beat 消费状态缺失。
