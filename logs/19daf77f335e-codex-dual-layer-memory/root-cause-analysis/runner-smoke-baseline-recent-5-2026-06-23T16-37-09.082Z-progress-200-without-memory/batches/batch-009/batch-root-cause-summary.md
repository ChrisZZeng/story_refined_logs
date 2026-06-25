# Batch Root Cause Summary

| issue | turn | validity | rootCause.label | family | confidence | report |
| --- | ---: | --- | --- | --- | --- | --- |
| issue-22 | 33 | `valid` | `choice-action-binding` | `agent-system` | `high` | `logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-009/issues/issue-22-turn-33/root-cause-report.md` |
| issue-23 | 34 | `valid` | `choice-action-binding` | `agent-system` | `high` | `logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-009/issues/issue-23-turn-34/root-cause-report.md` |
| issue-24 | 41 | `valid` | `scene-fact-persistence-gap` | `detail-memory` | `medium` | `logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-009/issues/issue-24-turn-41/root-cause-report.md` |
| issue-25 | 45 | `valid` | `model-local` | `llm-self` | `medium` | `logs/19daf77f335e-codex-dual-layer-memory/root-cause-analysis/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200-without-memory/batches/batch-009/issues/issue-25-turn-45/root-cause-report.md` |

## Notes
- issue-22 与 issue-23 属于同一重复入口链路：turn 33 Choice 先生成已消费追问，turn 34 Director/Narrator 将其复演。
- issue-24 主要是局部场景事实未持久化后，由模糊历史摘要和 Director 暗示共同诱发的 detail-memory / agent-system 交界问题。
- issue-25 是最近上下文清晰时的局部生成滑移，建议以 quoted-fact 校验拦截。
