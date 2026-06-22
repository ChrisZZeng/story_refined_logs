---
name: narrative-consistency-coordinator
description: Use when coordinating a full interactive narrative consistency evaluation across many turns by preparing visible timelines, planning independent review batches, and aggregating batch reviewer outputs.
---

# Narrative Consistency Coordinator

用这个 skill 组织一次完整的互动叙事一致性评测。

Coordinator 只负责准备数据、切分批次、分派审阅和聚合结果，不亲自审阅所有正文。真正的语义判断交给 `narrative-consistency-batch-reviewer`，每个批次应该在独立上下文中完成；如果当前环境支持 subagent，就优先把批次任务分发给 subagent。

## 工作流程

一次评测目录约定为 `logs/<branch+version>/`：文件化运行日志放在 `run/`，一致性评测结果放在同级的 review 目录中。Coordinator 不直接调用 `oreturn`；如果输入来自 `oreturn`，先用单独导出步骤生成 `logs/<branch+version>/run`。

1. 从运行目录生成玩家可见时间线：

   ```bash
   node <coordinator-skill-dir>/scripts/build-visible-timeline.mjs logs/<branch+version>/run --out logs/<branch+version>/consistency-review/visible-timeline.jsonl
   ```

2. 生成批次计划和每个批次的任务文件：

   ```bash
   node <coordinator-skill-dir>/scripts/plan-batches.mjs logs/<branch+version>/consistency-review/visible-timeline.jsonl --out-dir logs/<branch+version>/consistency-review --run-dir logs/<branch+version>/run
   ```

3. 为 `batch-plan.json` 中的每个批次开启独立上下文。优先分发 subagent，让每个 subagent 使用 `narrative-consistency-batch-reviewer` 审阅对应窗口；如果当前环境没有 subagent 能力，就把 `batches/<batch-id>/task.md` 交给独立 session 执行。不要把其他批次的结论或预期答案塞给它。

4. 所有批次完成后聚合结果：

   ```bash
   node <coordinator-skill-dir>/scripts/aggregate-batches.mjs <review-dir>
   ```

5. 读取 `<review-dir>/summary.md` 和 `<review-dir>/issues.json`，给出最终结论。`summary.md` 会同时包含 `visibleText` 正文报告和 `fullTurn` 完整玩家体验报告。

## 输出结构

建议把一次评测的输入和结果放在同一个 `logs/<branch+version>/` 下，例如：

```text
logs/<branch+version>/
  run/
    turn-001/
      01-summary.json
      02-script-state.json
      03-story-state.json
      04-output.json
  consistency-review/
    visible-timeline.jsonl
    batch-plan.json
    summary.json
    summary.md
    summary-visible-text.json
    summary-visible-text.md
    summary-full-turn.json
    summary-full-turn.md
    issues-visible-text.json
    issues.json
    coordinator-method.md
    batches/
      batch-001/
        task.md
        batch-method.md
        window-timeline.md
        batch-issues.json
        batch-summary.json
        batch-summary.md
```

字段约定见 `references/output_contract.md`。只有需要确认输出格式时才读取它。

## 调度原则

- 不要在 coordinator 上下文中通读所有批次正文。
- 批次之间可以并行审阅，但每个批次要在独立上下文中完成并独立落盘。
- Coordinator 只读取批次任务文件和批次结构化输出，不代替 batch reviewer 审正文。
- Batch reviewer 一次审阅完整玩家可见 turn，并用 `scope` 标注问题发生在 `visibleText`、`choices`、`preLlmEvents` 还是 `mixed`。
- 聚合层会用同一批 issues 同时生成两种报告：`visibleText` 报告只统计正文问题，`fullTurn` 报告统计全部玩家可见体验问题。
- 聚合时优先读取结构化 JSON；只有证据有争议时才回到原始日志抽查。
- 如果批次输出缺文件或 JSON 格式不对，先让对应批次补齐，不要凭印象修统计。
