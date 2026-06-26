# Prompt Patch Replay 使用说明

本文说明如何使用第一版 Prompt Patch Replay 工具，对一个 prompt patch bundle 在多个 badcase turn 上做轻量复测。

## 适用场景

这个工具用于“局部 prompt 修改复测”：

- 用户准备一个 patch bundle，里面包含一组精确的 prompt 原文段落和替换段落。
- 用户人工指定多个 badcase turn。
- 工具从本项目已有日志中重建这些 turn 的输入、状态、issue 和可见上下文。
- 工具复用指定版本的 `oreturn` 小说系统模块，重放同一 turn 的调用链。
- 工具生成新的 `04-output.json` 风格输出，并调用 judger 判断原 issue 是否被修复。

第一版不做完整端到端小说生成，不启动完整外部小说系统，也不重新跑一致性评测 coordinator。

## 前置条件

需要已有日志目录：

```text
logs/<branch-version>/run_logs/<run-id>/
logs/<branch-version>/consistency-review/<run-id>/
```

其中至少需要：

```text
run_logs/<run-id>/00-run-config.json
run_logs/<run-id>/turn-XX/01-summary.json
run_logs/<run-id>/turn-XX/03-story-state.json
run_logs/<run-id>/turn-XX/04-output.json
consistency-review/<run-id>/issues.json
consistency-review/<run-id>/visible-timeline.jsonl
```

如果存在下面的文件，工具会作为辅助上下文读取：

```text
root-cause-analysis/<run-id>/summary.json
```

还需要本地有小说系统源码：

```text
/Users/lidong/Projects/MemoraXAI/codebase/oreturn
```

正式 replay 时，工具会把这个路径当作 `oreturn` 源仓库，并自动创建或复用隔离 worktree，不会切换用户当前正在开发的 `oreturn` 分支。

## 准备 Replay Task

推荐只准备一个 YAML 任务文件，例如 `replay-task.yaml`。它把原来的 replay config 和 patch bundle 合在一起，避免同时维护两个互相引用的 JSON 文件。

```yaml
replayId: director-fix-2026-06-25

caseSet:
  logGroupDir: logs/a4a2cfc1e411-dev-orchestrator-opt-0624
  runId: runner-smoke-baseline-recent-5-2026-06-24T23-42-22.095Z
  turns: [2, 4, 17]
  repeats: 5

source:
  oreturnRepo: /Users/lidong/Projects/MemoraXAI/codebase/oreturn

models:
  replay:
    baseUrl: https://api.example.com/v1
    apiKeyEnv: REPLAY_API_KEY
    model: replay-model
    thinkingEnabled: false
  judge:
    useReplayModel: true

judging:
  passVerdicts: [fixed]

patchBundle:
  id: director-local-consistency-fix
  description: 修复某些 turn 中场景承接不稳定的问题
  patches:
    - id: director-rule-001
      originalFile: patches/director-rule-001.before.md
      replacementFile: patches/director-rule-001.after.md
```

推荐目录结构：

```text
replay-task.yaml
patches/
  director-rule-001.before.md
  director-rule-001.after.md
```

字段说明：

| 字段 | 说明 |
| --- | --- |
| `replayId` | 本次复测的唯一名字，会成为输出目录名。 |
| `caseSet.logGroupDir` | badcase 所在的 `logs/<branch-version>` 目录。 |
| `caseSet.runId` | 原始小说运行日志 run id。 |
| `caseSet.turns` | 人工指定的 badcase turn 列表。 |
| `caseSet.repeats` | 可选。每个 badcase turn 重复 replay 的次数。不填默认为 `1`。 |
| `source.oreturnRepo` | 本地 `oreturn` 小说系统源码路径。工具会从这里创建隔离 replay worktree。 |
| `source.versionPolicy` | 可选。当前只支持 `require-matching-worktree`，不填会默认使用它。 |
| `source.oreturnCommit` | 可选。只有日志无法提供 source commit 时才作为兜底；如果日志也有 commit，则必须与日志一致。 |
| `source.allowDirtyEngine` | 可选。设为 `true` 时允许隔离 replay worktree 有未提交修改。默认不允许。 |
| `models.replay` | replay 调用小说系统时使用的大模型配置。`provider` 不填时默认为 `openai-compatible`。 |
| `models.judge` | judger 判断修复结果时使用的大模型配置。设为 `useReplayModel: true` 可直接复用 replay 模型配置。 |
| `judging.passVerdicts` | 可选。哪些 judger verdict 算通过。默认只有 `fixed` 算通过。 |
| `patchBundle.id` | 本次 patch bundle 的名字。 |
| `patchBundle.patches` | 本次要应用的一组精确 patch。第一版建议一个 bundle 对多个 badcase turn。 |
| `judgeMode` | 可选。设为 `fake` 时不调用真实 judge 模型，直接返回 `uncertain`。 |

## 准备 Patch 文件

大段 prompt 不建议直接写进 YAML 字符串。推荐每个 patch 准备两个 Markdown 文件：

```text
patches/director-rule-001.before.md
patches/director-rule-001.after.md
```

`before.md` 放需要替换的完整原始 prompt 段落，`after.md` 放修改后的完整 prompt 段落。工具会按文件内容做精确文本替换。

patch 写法：

```yaml
patchBundle:
  id: director-local-consistency-fix
  patches:
    - id: director-rule-001
      originalFile: patches/director-rule-001.before.md
      replacementFile: patches/director-rule-001.after.md
```

如果 patch 很短，也可以直接内联文本：

```yaml
patchBundle:
  id: director-local-consistency-fix
  patches:
    - id: director-rule-001
      originalText: |
        这里填写需要替换的完整原始 prompt 段落
      replacementText: |
        这里填写修改后的完整 prompt 段落
```

可选地，可以给 `originalFile` 增加 hash 校验，避免误改 before 文件后自己没发现：

```yaml
patchBundle:
  id: director-local-consistency-fix
  patches:
    - id: director-rule-001
      originalFile: patches/director-rule-001.before.md
      replacementFile: patches/director-rule-001.after.md
      originalHash: sha256:<before-file-hash>
```

规则：

- `originalFile` / `originalText` 必须是足够长、足够精准的原始文本段落。
- `replacementFile` / `replacementText` 可以为空字符串，表示删除该段落。
- 同一个 patch 不能同时填写 `originalText` 和 `originalFile`，也不能同时填写 `replacementText` 和 `replacementFile`。
- 一个 patch 在一个 case 的完整同 turn 调用链中必须精确命中一次。
- 如果没有命中，该 case 失败。
- 如果命中多次，该 case 失败，需要把 `originalText` 写得更长更精准。
- 如果多个 patch 互相重叠，或者前一个 patch 的替换结果制造/移除了另一个 patch 的命中，也会失败。

## 旧版 JSON 配置兼容

工具仍然兼容原来的两文件模式：

```text
replay-config.json
patch-bundle.json
```

如果传入的 `--config` 文件里包含 `patchBundlePath`，工具会按旧逻辑读取外部 `patch-bundle.json`。但后续推荐使用 `replay-task.yaml`。

## 版本锁规则

正式 replay 前，工具会解析 badcase 对应的 `oreturn` commit。

解析优先级：

1. `run_logs/<run-id>/00-run-config.json` 中的 source commit 字段。
2. `logs/<branch-version>` 目录名开头的 commit。
3. replay config 中的 `source.oreturnCommit`，仅在日志没有 commit 时兜底。

然后工具会：

- 检查 `source.oreturnRepo` 是否是 git worktree。
- 检查该 repo 是否存在目标 commit。
- 在本项目下创建或复用隔离 worktree：

```text
.worktrees/prompt-patch-replay/oreturn-<sourceCommit>/
```

- 检查隔离 worktree 的 HEAD 是否匹配目标 commit。
- 检查隔离 worktree 是否干净，除非设置了 `source.allowDirtyEngine: true`。

正式 replay 会在隔离 worktree 中运行，不会改变用户主 `oreturn` 目录的当前分支。

如果源仓库没有目标 commit，会报错。此时需要先在主 `oreturn` 仓库拉取对应提交或分支：

```bash
cd /Users/lidong/Projects/MemoraXAI/codebase/oreturn
git fetch --all
```

如果隔离 worktree 已存在但 HEAD 不匹配，说明该目录被人工改动或复用异常。可以删除对应 `.worktrees/prompt-patch-replay/oreturn-<sourceCommit>/` 后重跑，让工具重新创建。

## 先做 Context-Only 检查

建议先运行 dry run，只重建上下文，不调用模型：

```bash
node scripts/prompt-patch-replay.mjs \
  --config /path/to/replay-task.yaml \
  --dry-run-context-only
```

这个命令会检查：

- replay task 是否合法。
- patch bundle 是否合法。
- 是否能读取 `00-run-config.json`。
- 是否能解析 source commit。
- 是否能为每个 turn 找到对应 issue。
- 是否能读取 `01-summary.json`、`03-story-state.json`、`04-output.json`、`visible-timeline.jsonl`。

context-only 输出也会写入结果目录，但不会产生新的 `new-04-output.json`，也不会调用 judger。

## 正式运行 Replay

设置模型 API key 后运行：

```bash
REPLAY_API_KEY=... JUDGE_API_KEY=... \
  node scripts/prompt-patch-replay.mjs \
  --config /path/to/replay-task.yaml
```

如果 replay 和 judge 使用同一个模型服务，也可以让两个配置引用同一个环境变量：

```yaml
models:
  replay:
    baseUrl: https://api.example.com/v1
    apiKeyEnv: LLM_API_KEY
    model: replay-model
  judge:
    baseUrl: https://api.example.com/v1
    apiKeyEnv: LLM_API_KEY
    model: judge-model
```

如果 judge 和 replay 完全使用同一套配置，可以写得更短：

```yaml
models:
  replay:
    baseUrl: https://api.example.com/v1
    apiKeyEnv: LLM_API_KEY
    model: replay-model
  judge:
    useReplayModel: true
```

## 多次 Replay 与通过率

由于大模型输出存在随机性，可以让每个 badcase turn 重复运行 k 次：

```yaml
caseSet:
  turns: [5, 8, 10]
  repeats: 5
```

每一次都会完整执行：

```text
Director -> Narrator -> Choice -> new-04-output.json -> Judger
```

默认通过率口径：

- 单个 issue 通过：该 issue 的 judger `verdict` 是 `fixed`。
- 单次 run 通过：该 turn 下所有 issue 都通过。
- turn 通过率：通过 run 数 / `repeats`。
- issue 通过率：该 issue 在 k 次中通过的比例。
- 总体通过率：所有 turn-run 中通过的比例。

如果希望把 `improved` 也算作通过，可以配置：

```yaml
judging:
  passVerdicts: [fixed, improved]
```

## 输出目录

结果会写到：

```text
logs/<branch-version>/prompt-patch-replay/<replay-id>/
```

顶层文件：

| 文件 | 说明 |
| --- | --- |
| `replay-config.json` | 规范化后的 replay config。 |
| `patch-bundle.json` | 解析文件引用后的 patch bundle 副本，包含最终参与替换的 `originalText` / `replacementText`。 |
| `resolved-source-version.json` | source commit、实际 replay engine commit、patch bundle hash 等追溯信息。 |
| `summary.json` | 机器可读汇总。 |
| `summary.md` | 人工阅读汇总。 |

每个 turn 的输出：

```text
cases/turn-XXX/
```

当 `repeats: 1` 时，输出保持单次目录结构：

常见文件：

| 文件 | 说明 |
| --- | --- |
| `turn-replay-context.json` | 从日志重建出的 turn 输入、story state、原始输出、issue、可见上下文等。 |
| `replay-input.json` | 传给 oreturn runner 的最小输入包。 |
| `new-04-output.json` | replay 后生成的新玩家可见输出。 |
| `llm-calls.json` | 本次 replay 的 LLM 调用记录，包括 stage、prompt/messages、patch 应用信息。 |
| `patch-application.json` | patch 命中的 stage、call kind、field path 和 hash。 |
| `replay-writes.json` | replay 过程中产生的写入记录。 |
| `replay-events.json` | oreturn strategy 事件记录。 |
| `replay-error.json` | replay 失败时的错误信息。成功时通常不存在。 |

当 `repeats` 大于 `1` 时，每个 turn 会拆成多次 run：

```text
cases/turn-XXX/
  turn-replay-context.json
  aggregate-summary.json
  runs/
    run-001/
      replay-input.json
      new-04-output.json
      llm-calls.json
      patch-application.json
      replay-writes.json
      replay-events.json
      issues/
        <issue-id>/
          judge-input.json
          judge-result.json
          report.md
    run-002/
    run-003/
```

`aggregate-summary.json` 会记录该 turn 的：

- `repeats`
- `passedRuns`
- `passRate`
- 每个 issue 的 `passedRuns` 和 `passRate`
- 每次 run 的 verdict 和输出目录

每个 issue 的 judge 输出：

```text
cases/turn-XXX/issues/<issue-id>/
```

| 文件 | 说明 |
| --- | --- |
| `judge-input.json` | 传给 judger 的 issue、原始输出、新输出、上下文。 |
| `judge-result.json` | judger 的结构化判定。 |
| `report.md` | 单个 issue 的人工阅读报告。 |

## Judger 判定结果

`judge-result.json` 的 `verdict` 只允许以下值：

| verdict | 含义 |
| --- | --- |
| `fixed` | 原问题已修复。 |
| `improved` | 有改善，但仍有残留问题。 |
| `unchanged` | 基本没有改善。 |
| `regressed` | 变差或引入更明显问题。 |
| `uncertain` | 信息不足或无法判断。 |

summary 会统计这些 verdict 的数量。

当配置了 `repeats` 后，`summary.json` / `summary.md` 还会包含：

| 字段 | 说明 |
| --- | --- |
| `repeatCount` | 每个 turn 的重复运行次数。 |
| `runCount` | 实际 run 总数。 |
| `passedRuns` | 通过的 run 数。 |
| `failedRuns` | replay 或 judge 失败的 run 数。 |
| `overallPassRate` | 总体通过率。 |
| `cases[].passRate` | 单个 turn 的通过率。 |
| `cases[].issues[].passRate` | 单个 issue 的通过率。 |

## 常见错误

### patch not found

含义：某个 patch 在该 case 的完整调用链中没有命中。

处理：

- 检查 `originalText` 是否来自当前版本 assemble 后的 prompt。
- 如果使用 `originalFile`，检查 before 文件内容是否和目标 prompt 完全一致，包括换行、空格和标点。
- 检查是否选错了 badcase 日志版本。
- 检查 patch 是否只适用于部分 case。如果只适用于部分 case，应拆成不同 patch bundle 分开跑。

### multiple matches

含义：同一个 patch 原始文本在某个 case 中出现多次。

处理：

- 把 `originalText` 扩展为更长的上下文段落。
- 不建议使用过短的句子、规则标题或常见模板片段。

### already applied

含义：同一个 patch 已经在前面的 call 中应用过，后续 call 又出现了同一原文。

处理：

- 使用更长的原文片段，使它只定位到目标 stage。
- 检查是否真的应该用同一个 patch 覆盖多个位置；第一版不支持一个 patch 多处替换。

### source commit 不存在或 managed worktree commit 不匹配

含义：本地 `oreturn` 源仓库没有 badcase 日志要求的 commit，或隔离 replay worktree 已存在但不在正确 commit。

处理：

```bash
cd /Users/lidong/Projects/MemoraXAI/codebase/oreturn
git fetch --all
```

如果是隔离 worktree 状态异常，可以删除：

```bash
rm -rf .worktrees/prompt-patch-replay/oreturn-<source-commit>
```

然后重新运行 replay，工具会重新创建。

### missing env

含义：配置中的 `apiKeyEnv` 对应环境变量没有设置。

处理：

```bash
export REPLAY_API_KEY=...
export JUDGE_API_KEY=...
```

或在命令前临时传入：

```bash
REPLAY_API_KEY=... JUDGE_API_KEY=... node scripts/prompt-patch-replay.mjs --config /path/to/replay-task.yaml
```

## 推荐工作流

1. 从一致性评测结果中人工挑选 badcase turn，形成 `turns` 列表。
2. 编写 `replay-task.yaml`，填写 `caseSet`、`source`、`models` 和 `patchBundle`。
3. 把大段原始 prompt 和修改后 prompt 分别放进 `patches/*.before.md` / `patches/*.after.md`。
4. 运行 `--dry-run-context-only`，确认上下文可重建。
5. 确认本地 `oreturn` 仓库能找到日志对应 commit；无需切换主分支。
6. 设置 replay/judge 模型 API key。
7. 正式运行 replay。
8. 查看 `summary.md`。
9. 对需要细看的问题，打开 `cases/turn-XXX/issues/*/report.md`、`judge-input.json`、`new-04-output.json` 和 `llm-calls.json`。

## 当前限制

- 第一版只支持一个 patch bundle 对多个 badcase turn。
- 不支持多个 patch bundle 的横向对比；需要用户自行多次运行。
- 不重新生成 `05-runtime-after.json`。
- 不调用一致性评测 coordinator 生成新的 `consistency-review`。
- 不启动完整外部小说系统。
- 不调用真实长期记忆检索服务。
- 正式 replay 依赖本地 `oreturn` 仓库能访问目标 commit；实际执行使用项目内隔离 worktree。
