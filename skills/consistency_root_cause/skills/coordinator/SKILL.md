---
name: narrative-consistency-root-cause-coordinator
description: Use when coordinating root-cause analysis for a full batch of interactive narrative consistency issues by reading consistency evaluator outputs, planning issue batches, dispatching subagents to run the issue tracer for every issue, and aggregating root-cause reports into mechanism clusters and fix priorities.
---

# Narrative Consistency Root Cause Coordinator

用这个 skill 组织一次完整的一致性问题根因分析。输入是一份 consistency evaluator 输出目录，输出是每条 issue 的根因报告、批次汇总、机制聚类和修复优先级。

Coordinator 只负责准备任务、切分 issue batch、分派 subagent 和聚合结果。不要在 coordinator 上下文中替代 `issue_tracer` 做单条根因判断。每个 issue 的根因必须来自单条分析结果，或者明确标记为未完成。

## Core Rule

所有 issue 都要分析，包括 `low`。严重程度只影响报告篇幅和人工优先级，不影响是否追根因。

对每条 issue 都必须得到：

- `issueValidity`: `valid`、`questionable` 或 `invalid`。
- valid issue 的 `rootCause.label`、`rootCause.family`、`confidence` 和报告路径。
- questionable 或 invalid issue 的证据不足原因或评测误判说明。

## Workflow

一次根因分析建议放在日志仓库中，例如：

```text
logs/<branch+version>/root-cause-analysis/<run-id>/
```

运行步骤：

1. 生成 issue 计划：

   ```bash
   node <coordinator-skill-dir>/scripts/plan-issues.mjs \
     <consistency-review-dir> \
     --run-dir <run-dir> \
     --out-dir <analysis-dir>
   ```

2. 生成每个 batch 的中文任务文件：

   ```bash
   node <coordinator-skill-dir>/scripts/build-issue-tasks.mjs <analysis-dir>
   ```

3. 为 `issue-plan.json` 中的每个 batch 派发独立 subagent。派发时直接复用 `batches/<batch-id>/task.md` 的中文内容，不要改写成英文，也不要把其他 batch 的结论或预期答案塞给 subagent。

4. 每个 subagent 必须按 `task.md` 使用 `../issue_tracer/SKILL.md`，逐条输出：

   ```text
   batches/<batch-id>/issues/issue-<index>-turn-<turn>/
     trace.md
     trace-packet.json
     root-cause-report.md
     root-cause-result.json
   ```

5. 所有 batch 完成后聚合：

   ```bash
   node <coordinator-skill-dir>/scripts/aggregate-root-causes.mjs <analysis-dir>
   ```

6. 读取 `summary.md`、`root-cause-table.md`、`mechanism-clusters.md` 和 `fix-priority.md`，向 Ethan 汇报批次级结论和报告路径。

## Batch Planning

默认由 `plan-issues.mjs` 自动分配：

- 按 issue index 和 turn 顺序处理。
- 同一 turn 的多个 issue 尽量放在同一个 batch。
- `high` issue 单独成 batch，除非同一 turn 还有紧密相关 issue。
- 每个普通 batch 默认最多 4 个 issue。
- 相邻 issue 可以同批，便于分析传播关系；但每条 issue 仍必须独立输出结果。

如果自动分配明显不合适，可以手动编辑 `issue-plan.json`，然后重新运行 `build-issue-tasks.mjs`。

## Subagent Instructions

每个 subagent 的任务边界是一个 batch，但输出粒度必须是一条 issue 一个结果文件。

Subagent 必须：

- 完整读取 `task.md` 指定的 issue tracer skill。
- 对 `batch-issues.json` 中的每条 issue 先做玩家可见 validity gate。
- 对 valid issue 追到 L3 root mechanism，不要停在 `Director`、`Narrator`、`Choice`、`storyline`、`statefold`、`agent-system` 或 `recent-context`。
- 根据需要读取 visible timeline、story state、Director/Narrator/Choice prompt、LLM calls、output、events 和 runtime-after。
- 报告用中文编写。enum、机制标签、字段名和路径保持英文。

Coordinator 不要把一个 subagent 对某条 issue 的根因复制到另一个 issue 上；如果两个 issue 共享机制，必须在每条独立 result 中说明各自的证据链。

## Aggregation

聚合时只读取结构化结果和报告路径。不要凭 consistency issue 摘要直接推断根因。

聚合输出：

- `summary.json`: 批次指标、validity 分布、family 分布、mechanism 分布、缺失结果。
- `summary.md`: 给人读的总览。
- `root-cause-table.md`: 每条 issue 的根因表。
- `mechanism-clusters.md`: 按 `rootCause.label` 聚类。
- `fix-priority.md`: 按机制频次、severity 和 confidence 推导的修复优先级。

字段约定见 `references/output_contract.md`。只有需要确认输出格式或脚本结果时才读取它。

## Quality Gates

- 不得跳过 low issue。
- 不得把 issue type 当 root cause。
- 不得把 subagent 没有产出的 issue 当成已分析。
- 如果 `root-cause-result.json` 缺失、JSON 无法解析或没有必填字段，聚合结果必须列入 `missingResults` 或 `invalidResults`。
- 如果一个 issue 被判为 invalid/questionable，批次报告仍要保留它，但不要计入 valid root mechanism 分布。
- 如果当前环境支持 subagent，优先使用 subagent。没有 subagent 能力时，必须显式说明，并按 batch task 顺序在独立上下文或当前会话中逐条完成。
