# batch-010 root cause summary

| issueIndex | turn | validity | rootCause.label | family | confidence | report |
|---:|---:|---|---|---|---|---|
| 26 | 48 | valid | temporal-anchor-contract | agent-system | high | `issues/issue-26-turn-48/root-cause-report.md` |
| 27 | 54 | valid | speaker-pronoun-alignment | llm-self | high | `issues/issue-27-turn-54/root-cause-report.md` |
| 28 | 57 | valid | hidden-referent-pronoun-contract | agent-system | high | `issues/issue-28-turn-57/root-cause-report.md` |
| 29 | 58 | valid | model-local | llm-self | high | `issues/issue-29-turn-58/root-cause-report.md` |

## Notes
- 4/4 issues judged `valid` using player-visible evidence first.
- issue-26 and issue-28 are primarily `agent-system` handoff/context-contract failures; issue-27 and issue-29 are local Narrator generation slips with clear artifacts.
- All report paths are confined to this batch output directory.
