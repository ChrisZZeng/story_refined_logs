# batch-017 Root Cause Summary

| issueIndex | turn | validity | rootCause.label | family | confidence | report |
|---:|---:|---|---|---|---|---|
| 53 | 128 | valid | object-affordance-contract | agent-system | high | issues/issue-53-turn-128/root-cause-report.md |
| 54 | 128 | valid | memory-persistence | detail-memory | medium | issues/issue-54-turn-128/root-cause-report.md |
| 55 | 129 | valid | context-priority | agent-system | high | issues/issue-55-turn-129/root-cause-report.md |
| 56 | 130 | valid | current-scene-anchor | agent-system | high | issues/issue-56-turn-130/root-cause-report.md |

## Notes
- 四条 issue 均先用玩家可见文本确认 validity，再使用内部 prompt、LLM calls、events 与 output 追踪根因。
- issue-53 与 issue-54 同源于第 128 轮 Narrator 细节补写，但根机制不同：前者是物品 affordance 合约缺口，后者是备用胶卷库存 detail memory 未持久化。
- issue-56 的显性错误在 Narrator，前置机制是 Director/Choice handoff 未携带 current-scene anchor。
