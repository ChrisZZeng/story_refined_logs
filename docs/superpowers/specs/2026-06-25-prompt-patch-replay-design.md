# Prompt Patch Replay 一键复测系统设计

## 背景

`story_refined_logs` 当前已经保存了外部小说系统的运行日志、一致性评测结果和根因分析结果。已有数据结构围绕下面三类目录展开：

```text
logs/<branch-version>/
  run_logs/<run-id>/
  consistency-review/<run-id>/
  root-cause-analysis/<run-id>/
```

本设计的目标是在本项目内新增一个统一入口，用于验证局部 prompt 修改是否能修复一组已知 badcase。第一版只覆盖 prompt patch badcase replay，不覆盖完整端到端生成和一致性评测。

## 目标

第一版系统要支持：

- 用户提供一个 prompt patch bundle。
- 用户人工指定一个 run 下需要复测的 turn 列表。
- 系统对每个 turn 基于原始日志构造固定的 `TurnReplayContext`。
- 系统复用 `oreturn` 中已有的 novel-creator strategy，完整重放该 turn 的 `Director -> Narrator -> Choice` 链路。
- 系统在 LLM 调用发出前对最终 assembled prompt 做精确 patch。
- 系统生成新的 `04-output.json` 风格输出。
- 系统读取该 turn 在 `issues.json` 中对应的一个或多个 issue，并用 targeted judger 判断原 issue 是否被修复。
- 所有输入、patch 应用记录、LLM 调用、replay writes、judge 输入输出和汇总报告都落盘在本项目内。

## 非目标

第一版不做：

- 不拉取、启动或编排完整外部小说系统。
- 不跑完整端到端小说生成。
- 不调用本项目的一致性评测 coordinator 生成新的 `consistency-review`。
- 不重算或生成新的 `05-runtime-after.json`。
- 不调用真实 Memorax、bucket 或长期记忆检索。
- 不支持多个 patch bundle 的横向比较。
- 不把 patch 写回 `oreturn` 源码。
- 不在 `story_refined_logs` 中重写 `Director`、`Narrator`、`Choice` prompt assembly 逻辑。

这里的“不拉取、启动或编排完整外部小说系统”不表示可以忽略小说系统源码版本。Replay 仍然必须使用 badcase 原始 run 对应的 `oreturn` commit 来执行 prompt assembly 和 worker 调用链，只是不启动完整服务、不跑完整端到端生成。

## 术语

### Prompt Patch Bundle

一次局部 prompt 修改集合。每个 patch 由原始整段文本和修改后整段文本组成。

```json
{
  "id": "narrator-continuity-v1",
  "description": "强化正文承接上一轮结尾",
  "patches": [
    {
      "id": "continuity-rule",
      "originalText": "原始 prompt 整段文本",
      "replacementText": "修改后的 prompt 整段文本"
    }
  ]
}
```

### Case Set

人工指定的一组 badcase turn。第一版以 turn 为 replay 粒度，而不是以 issue 为 replay 粒度。

```json
{
  "logGroupDir": "logs/e438827269de-codex-hybrid-dual-layer-memory",
  "runId": "runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random",
  "turns": [3, 9, 24, 34]
}
```

### TurnReplayContext

从原始 badcase turn 日志恢复出来的固定输入上下文。这个名字在一键测评系统中替代 `memoryStore`，避免和 MemoraX、长期记忆或 memory architecture 混淆。

`TurnReplayContext` 至少包含：

- `storyState`：来自 `run_logs/<run-id>/turn-k/03-story-state.json`。
- `turnInput`：从 `01-summary.json` 的 `playerInput` 或 `selectedFromPreviousTurn.text` 推导。
- `originalOutput`：来自 `04-output.json`。
- `issues`：从 `consistency-review/<run-id>/issues.json` 中筛选出的同 turn issues。
- `rootCauseReports`：如果已有 `root-cause-analysis/<run-id>`，可按 turn 匹配相关 issue 报告作为辅助上下文。
- `visibleContext`：用于 judger 的玩家可见上下文。
- `sourceFiles`：参与构造上下文的原始文件路径。

实现层面可以把 `TurnReplayContext` 适配成 `oreturn` `runStrategy` 需要的接口，但一键测评系统的配置、报告和文档不暴露 `memoryStore` 这个名称。

## 架构

第一版由 `story_refined_logs` 提供统一 CLI 入口，由 `oreturn` 提供 replay engine。

```text
story_refined_logs CLI
  -> 读取 replay config、patch bundle、case set
  -> 为每个 turn 构造 TurnReplayContext
  -> 调用 oreturn novel-creator strategy
  -> wrapped LLM adapter 应用 prompt patch
  -> 产出 new-04-output.json 和 replay-writes.json
  -> targeted judger 判断 issue 修复情况
  -> 聚合 summary.md / summary.json
```

推荐实现方式是：在 `oreturn` 侧暴露一个专门的 replay CLI 或可复用模块，`story_refined_logs` 的一键入口负责调用它并管理产物目录。这样可以复用 `oreturn` 的 package imports、Bun/pnpm 环境和现有 `.mts` 模块，不需要在 `story_refined_logs` 中深度解决跨仓库 TypeScript import。

可复用的 `oreturn` 模块包括：

- `packages/core/src/orchestrator/strategies/novel-creator/novel-creator-strategy.mts`
- `packages/core/src/orchestrator/controller.mts`
- `packages/core/src/orchestrator/adapters/ai-sdk-llm.mts`
- `packages/core/scripts/_model.mts`

## Oreturn 版本锁定

Replay 的可信度依赖于一个前置条件：执行 replay 的 `oreturn` prompt assembly 和 worker 代码，必须与原始 badcase run 生成时使用的小说系统版本一致。否则 patch replay 会混入新旧代码差异，无法判断变化来自 prompt patch 还是来自 `oreturn` 代码。

### 版本来源

第一版按下面优先级解析原始 run 对应的 `oreturn` commit：

1. 优先读取 `run_logs/<run-id>/00-run-config.json` 中显式记录的 commit 字段。如果未来导出日志时能写入 `oreturnCommit`、`sourceCommit` 或类似字段，应以该字段为准。
2. 如果 run config 没有显式字段，从 `logs/<branch-version>` 目录名解析前缀 commit。例如 `logs/a4a2cfc1e411-dev-orchestrator-opt-0624` 的 commit 前缀是 `a4a2cfc1e411`。
3. 如果目录名也无法解析 commit，要求用户在 replay config 中显式填写 `source.oreturnCommit`。

解析出的 commit 应写入 replay 输出的 `resolved-source-version.json`。

### 前置校验

运行 replay 前必须校验：

- `oreturnRepo` 是一个 git 仓库。
- 解析出的 commit 在该仓库中存在。
- 实际用于执行 replay 的 `oreturn` 工作区 commit 与解析出的 commit 一致，或者 replay 明确使用了该 commit 对应的隔离 worktree。

默认策略建议为 `require-matching-worktree`：

- 如果用户提供的 `oreturnRepo` 当前 checkout 正好在目标 commit，直接使用。
- 如果当前 checkout 不在目标 commit，但仓库中存在目标 commit，则系统可以在本项目输出目录下记录需要的 commit，并调用一个显式的 prepare step 创建隔离 worktree。
- 如果第一版暂不自动创建 worktree，则直接 fail，并提示用户把 `oreturnRepo` 切到目标 commit 后重试。

自动创建 worktree 不等于“启动或编排完整外部小说系统”。它只是为 replay engine 提供与原始 badcase 匹配的源码版本。实现时必须避免改动用户正在开发的 `oreturn` 工作区。

### 输出记录

每次 replay run 必须记录：

- `story_refined_logs` 当前 commit。
- 原始 run 解析出的 `sourceOreturnCommit`。
- 实际执行 replay 的 `replayEngineOreturnCommit`。
- `oreturnRepo` 路径。
- 如果使用 worktree，记录 worktree 路径。
- 是否存在 uncommitted changes。若有，默认 fail，除非用户显式允许 dirty engine。

如果 `sourceOreturnCommit` 与 `replayEngineOreturnCommit` 不一致，第一版必须 fail，不能生成成功的 judge 结论。

## Prompt Patch 应用规则

Patch 不直接修改源文件，而是在 LLM adapter 层对最终 LLM 请求做精确替换。扫描字段包括：

- `params.system`
- `params.prompt`
- `params.messages[*].content`

规则如下：

- 默认全局扫描所有 LLM call。
- 每个 patch 在每个 case 中必须至少命中一次。
- 同一个 patch 在同一个 case 中如果命中多处，直接失败。
- 如果 `originalText` 未命中，直接失败。
- 如果 `originalText` 命中多处，直接失败，要求用户提供更长的原始段落。
- 每次命中都要记录 stage、call kind、字段路径和替换前后 hash。

Patch application 记录示例：

```json
{
  "caseId": "turn-024",
  "applications": [
    {
      "patchId": "continuity-rule",
      "stage": "narrator",
      "callKind": "streamText",
      "fieldPath": "messages[2].content",
      "originalHash": "sha256:...",
      "replacementHash": "sha256:..."
    }
  ]
}
```

## Replay 流程

对每个 turn：

1. 读取 `01-summary.json`、`03-story-state.json` 和 `04-output.json`。
2. 从 `01-summary.json` 推导 `TurnInput`：
   - 如果存在 `playerInput`，使用它。
   - 否则使用 `selectedFromPreviousTurn.text`。
   - 如果两者都缺失，标记 case 构造失败。
3. 从 `consistency-review/<run-id>/issues.json` 中筛选 `turn === k` 的 issues。
4. 构造 `TurnReplayContext`。
5. 调用 `oreturn` novel-creator strategy 完整重放 `Director -> Narrator -> Choice`。
6. 捕获所有 LLM calls，写入 `llm-calls.json`。
7. 捕获 strategy 输出，写入 `new-04-output.json`。
8. 捕获 replay writes，写入 `replay-writes.json`，只供审计，不写回原日志和状态。
9. 对该 turn 的每个 issue 分别运行 judger。

同一个 turn 如果有多个 issue，只 replay 一次，然后对同一个 `new-04-output.json` 分别运行多个 judger。

### Issue Source Resolution

用户只需要在 case set 中人工输入 turn list。系统负责为每个 turn 自动收集 issue 内容。

主来源：

- `logs/<branch-version>/consistency-review/<run-id>/issues.json`
- 按 `issue.turn === k` 筛选当前 turn 的 issues。

辅助来源：

- 如果存在 `logs/<branch-version>/root-cause-analysis/<run-id>/`，系统可以按 issue 目录名、`root-cause-result.json` 或报告中的 turn 字段匹配同 turn 的 root-cause 报告。
- root-cause 报告只作为 judger 的辅助背景和人工追溯材料，不替代原 consistency issue。

如果某个 turn 在 `issues.json` 中没有匹配 issue，当前 case 标记为失败并写入 summary。

## Judger 设计

Judger 是 targeted judge，不替代完整 consistency evaluator。它只回答：新输出是否修复了原 issue。

输入包括：

- 原 issue 对象。
- 原始 `04-output.json`。
- 新的 `new-04-output.json`。
- target turn 前 3 轮玩家可见上下文。
- 如果 issue 中存在 `conflictingTurns`，额外加入这些 turn 的玩家可见上下文。
- 必要的 source file 路径，便于人工追溯。

Judger 使用 OpenAI-compatible 模型配置。Replay 模型和 judge 模型可以不同，由用户配置。

Judger 输出枚举：

- `fixed`：原 issue 明确消失。
- `improved`：问题减轻，但仍有残留。
- `unchanged`：基本没变化。
- `regressed`：原问题未解决，或引入更明显退化。
- `uncertain`：证据不足，无法可靠判断。

结构化输出示例：

```json
{
  "issueId": "issue-008",
  "turn": 24,
  "verdict": "fixed",
  "confidence": "high",
  "reason": "新输出从上一轮结尾继续，没有再次重复已经完成的交易条件。",
  "remainingProblems": [],
  "newRegressions": []
}
```

## 配置

Replay config 示例：

```json
{
  "replayId": "narrator-continuity-v1-known-repeat-cases",
  "logGroupDir": "logs/e438827269de-codex-hybrid-dual-layer-memory",
  "runId": "runner-smoke-hybrid-recent-5-2026-06-23T12-59-51.456Z-random",
  "turns": [6, 9, 24, 34],
  "patchBundlePath": "prompt-patches/narrator-continuity-v1.json",
  "source": {
    "oreturnRepo": "/Users/lidong/Projects/MemoraXAI/codebase/oreturn",
    "oreturnCommit": "e438827269de",
    "versionPolicy": "require-matching-worktree"
  },
  "models": {
    "replay": {
      "provider": "openai-compatible",
      "baseUrl": "https://example.com/v1",
      "apiKeyEnv": "REPLAY_LLM_API_KEY",
      "model": "model-name"
    },
    "judge": {
      "provider": "openai-compatible",
      "baseUrl": "https://example.com/v1",
      "apiKeyEnv": "JUDGE_LLM_API_KEY",
      "model": "judge-model-name"
    }
  }
}
```

## 输出目录

输出目录放在 log group 下，与 `run_logs` 和 `consistency-review` 平级：

```text
logs/<branch-version>/prompt-patch-replay/<replay-id>/
  replay-config.json
  patch-bundle.json
  resolved-source-version.json
  cases/
    turn-024/
      turn-replay-context.json
      patch-application.json
      llm-calls.json
      new-04-output.json
      replay-writes.json
      issues/
        issue-008/
          judge-input.json
          judge-result.json
          report.md
        issue-009/
          judge-input.json
          judge-result.json
          report.md
  summary.json
  summary.md
```

`summary.md` 应包含：

- replay id。
- patch bundle id。
- patch 文件路径和 hash。
- `story_refined_logs` git commit。
- 原始 run 解析出的 `sourceOreturnCommit`。
- 实际执行 replay 的 `replayEngineOreturnCommit`。
- run id。
- turn 数。
- issue 数。
- `fixed / improved / unchanged / regressed / uncertain` 分布。
- 每个 turn 的结果表。
- 所有失败 case 的失败原因。
- 结果目录路径。

## 失败处理

系统遇到下面情况时，应标记当前 case 失败并继续处理其他 case，除非是全局配置错误：

- turn 目录不存在。
- `01-summary.json`、`03-story-state.json` 或 `04-output.json` 缺失或无法解析。
- 无法从 summary 推导 `TurnInput`。
- 指定 turn 在 `issues.json` 中找不到 issue。
- patch 未命中。
- patch 多处命中。
- replay LLM 调用失败。
- replay 输出无法生成 `04-output.json` 风格结构。
- judger 调用失败或输出 schema 不合法。

全局配置错误直接停止：

- patch bundle 文件不存在或 schema 不合法。
- `oreturnRepo` 不存在。
- 无法解析或校验原始 run 对应的 `oreturn` commit。
- 实际 replay engine commit 与原始 run commit 不一致。
- `oreturnRepo` 存在未提交改动，且用户未显式允许 dirty engine。
- replay model 或 judge model 配置缺失。
- review dir 或 run dir 无法推断。

## Subagent 开发拆分

实现阶段可以使用 subagent 模式并行推进，但每个 subagent 的边界要清楚，避免共享写同一文件。

推荐拆分：

1. **Replay Context 子任务**
   负责读取 case-set、turn 日志和 issues，生成 `TurnReplayContext`，并实现 visible context 收集规则。

2. **Oreturn Replay Adapter 子任务**
   负责在 `oreturn` 侧封装 replay CLI 或模块，复用 `createNovelCreatorStrategy`，并暴露输入输出契约给 `story_refined_logs`。

3. **Prompt Patch LLM Adapter 子任务**
   负责实现 wrapped LLM adapter，在 `system / prompt / messages` 上执行精确 patch，并记录命中信息。

4. **Judger 子任务**
   负责 targeted judge prompt、OpenAI-compatible 调用、schema 校验和 per-issue 报告。

5. **Report Aggregator 子任务**
   负责生成 `summary.json`、`summary.md` 和每个 issue 的 `report.md`。

串行集成顺序建议：

```text
Replay Context
  -> Oreturn Replay Adapter
  -> Prompt Patch LLM Adapter
  -> Judger
  -> Report Aggregator
```

其中 `Replay Context` 和 `Judger` 可以先用 fixtures 并行开发；`Prompt Patch LLM Adapter` 可以用 fake LLM 单测开发；`Oreturn Replay Adapter` 需要最后和真实 `oreturn` 模块做集成验证。

## 测试策略

最小测试面：

- Patch bundle schema 校验。
- Patch 未命中、多处命中、唯一命中的单元测试。
- 从 `01-summary.json` 推导 `TurnInput` 的单元测试。
- 从 `issues.json` 按 turn 筛选 issue 的单元测试。
- `TurnReplayContext` 生成 fixture 测试。
- Fake LLM 下的完整 replay 测试，确认调用顺序为 `Director -> Narrator -> Choice`。
- Judger 输出 schema 校验测试。
- 汇总报告 fixture 测试。

集成测试：

- 使用一个小型真实 run fixture，跑一个 turn，产出 `new-04-output.json`、`replay-writes.json`、`judge-result.json` 和 `summary.md`。

真实模型 smoke：

- 用 1 个 patch bundle + 1 个 turn 跑真实 OpenAI-compatible 模型。
- 验证 patch application、LLM calls、new output、judge result 全部落盘。

## 风险与约束

- `oreturn` 的 novel-creator strategy 是跨仓库依赖，接口变更会影响 replay。需要在输出中记录 `oreturn` git commit。
- 必须使用原始 badcase run 对应的 `oreturn` commit 做 replay。只记录当前 commit 不足以保证可信度；需要在运行前校验 source commit 和 engine commit 一致。
- Patch 在最终 assembled prompt 上应用，因此它验证的是实际 LLM 输入层面的修改，不等同于源码模板已经被修改。
- 第一版固定使用原始 `03-story-state.json`，不会反映新的长期记忆检索结果。
- 第一版只验证 target turn 的输出，不验证后续状态写回和多轮传播。
- Judger 是语义判断，仍需人工抽查，不能直接替代最终人工复核。

## 第一版验收标准

一次成功的 replay run 应满足：

- 用户能用一个 patch bundle 和一个 turn list 启动复测。
- 每个 turn 只 replay 一次。
- 每个 turn 生成新的 `new-04-output.json`。
- 每个 turn 保存 `llm-calls.json`、`patch-application.json` 和 `replay-writes.json`。
- 每个 issue 生成 `judge-input.json`、`judge-result.json` 和 `report.md`。
- 顶层生成 `summary.json` 和 `summary.md`。
- 所有产物都位于 `logs/<branch-version>/prompt-patch-replay/<replay-id>/` 下。
- 不修改原始 `run_logs`、`consistency-review` 或 `oreturn` 源码。
