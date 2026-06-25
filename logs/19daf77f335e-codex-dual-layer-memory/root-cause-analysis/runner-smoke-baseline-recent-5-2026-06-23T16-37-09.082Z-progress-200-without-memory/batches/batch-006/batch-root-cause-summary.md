# Batch 006 Root Cause Summary

| issueIndex | turn | validity | rootCause.label | family | confidence | report |
|---:|---:|---|---|---|---|---|
| 18 | 27 | valid | storyline-lifecycle | agent-system | high | `issues/issue-18-turn-27/root-cause-report.md` |

本批次只有 1 条 issue。该 issue 有效，但 turn 27 是 turn 26 场景漂移后的传播点；L3 root mechanism 是 `storyline-lifecycle`：未可见完成的 `4-03` 入场/地点切换节点被提前消费，导致后续 `5-01/5-02` 宴会厅节点成为当前上下文并压过最近可见公寓场景。
