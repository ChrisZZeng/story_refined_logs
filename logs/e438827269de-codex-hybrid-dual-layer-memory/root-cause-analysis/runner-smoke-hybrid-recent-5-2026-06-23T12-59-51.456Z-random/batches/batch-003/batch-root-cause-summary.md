# Batch Root Cause Summary: batch-003

| issueIndex | turn | validity | rootCause.label | family | confidence | report |
| --- | ---: | --- | --- | --- | --- | --- |
| 9 | 27 | `valid` | `choice-action-binding` | `agent-system` | `high` | `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/root-cause-analysis/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/batches/batch-003/issues/issue-9-turn-27/root-cause-report.md` |
| 10 | 34 | `valid` | `storyline-lifecycle` | `agent-system` | `high` | `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/root-cause-analysis/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/batches/batch-003/issues/issue-10-turn-34/root-cause-report.md` |
| 11 | 37 | `valid` | `choice-action-binding` | `agent-system` | `medium` | `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/root-cause-analysis/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/batches/batch-003/issues/issue-11-turn-37/root-cause-report.md` |
| 12 | 39 | `valid` | `model-local` | `llm-self` | `high` | `story_refined_logs/logs/e438827269de-codex-hybrid-dual-layer-memory/root-cause-analysis/runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random/batches/batch-003/issues/issue-12-turn-39/root-cause-report.md` |

## 主要聚类

- issue-10 显示 `storyline-lifecycle` 问题：活跃节点把公园 detour 前置，但没有桥接已建立的晚宴目标。
- issue-9 与 issue-11 都落在 `choice-action-binding`：抽象选项/抽象对话没有被压缩成增量、可执行的行动 contract。
- issue-12 是局部 `model-local` 字形 slip，应由 zh-Hans normalization/lint 兜底。
