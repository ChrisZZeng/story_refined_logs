# Batch Root Cause Summary - batch-003

| issueIndex | turn | validity | rootCause.label | family | confidence | report |
|---:|---:|---|---|---|---|---|
| 9 | 16 | `valid` | `storyline-lifecycle` | `agent-system` | `high` | `issues/issue-9-turn-16/root-cause-report.md` |
| 10 | 19 | `valid` | `choice-action-binding` | `agent-system` | `high` | `issues/issue-10-turn-19/root-cause-report.md` |
| 11 | 20 | `valid` | `choice-action-binding` | `agent-system` | `high` | `issues/issue-11-turn-20/root-cause-report.md` |
| 12 | 21 | `valid` | `state-writeback` | `agent-system` | `high` | `issues/issue-12-turn-21/root-cause-report.md` |

## Notes

- issue 9 的主因是 future storyline/角色卡过早进入 Choice prompt。
- issue 10-11 是同一物件可用性问题的选项绑定与 selected action 执行链路。
- issue 12 是第 20 轮错误状态被写回并在最近上下文中继续传播。
