# Batch Root Cause Summary

| issue | turn | validity | rootCause.label | family | confidence | report |
|---|---:|---|---|---|---|---|
| 19 | 28 | valid | `storyline-lifecycle` | `agent-system` | high | `issues/issue-19-turn-28/root-cause-report.md` |
| 20 | 28 | questionable | null | null | medium | `issues/issue-20-turn-28/root-cause-report.md` |

## 批次结论
- issue 19 是本批次的主要有效问题：storyline runtime 过早推进宴会厅/康纳节点，并把未可见兑现的转场当作已发生，最终在 turn 28 生成 unsupported exit route 和 “卡尔的小屋”。
- issue 20 只构成姿态桥接疑点：可见文本允许“她在回合间把手重新插回口袋”的合理读法，评测摘要对“没有再”的解释偏强，因此不分类 valid root cause。
