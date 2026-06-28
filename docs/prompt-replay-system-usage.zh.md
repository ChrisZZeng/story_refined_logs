# Prompt Replay System 使用教程

本文说明如何使用 Prompt Replay System 对小说生成 badcase 做 prompt 修改、复测和人工 review。

这里的 Replay System 包含两层：

- `Prompt Replay Workbench`：本地浏览器工作台，用来查看 badcase、编辑 prompt、运行 replay、查看新输出和 judge 结果。
- `Prompt Patch Replay`：底层 CLI / service，用一个 patch bundle 在多个 badcase turn 上重放小说系统调用链。

日常调 prompt 建议优先使用 Workbench；需要自动化、批处理或排查底层问题时再直接使用 CLI。

## 适用场景

这个系统适合回答这类问题：

- 某个 prompt 改动能不能修掉已有 badcase？
- 同一个改动在多个 turn 上是否稳定？
- 一个改动重复跑多次后，通过率是否足够高？
- 修改后生成的新玩家可见文本是什么，judger 为什么判定 fixed / unchanged？
- patch 是否真的应用到了目标 prompt，而不是没命中或命中了错误位置？

它不做完整端到端小说重新生成，也不会重新跑 consistency review coordinator。它会从已有日志中重建指定 badcase turn 的输入、story state、可见上下文和 issue，然后在匹配版本的 `oreturn` 小说系统代码上重放该 turn。

## 前置条件

需要已经有一组原始运行日志和一致性 review 结果：

```text
logs/<branch-version>/
  run_logs/<run-id>/
    00-run-config.json
    turn-XX/
      01-summary.json
      03-story-state.json
      04-output.json
      06-llm-calls.json
  consistency-review/<run-id>/
    issues.json
    visible-timeline.jsonl
```

正式 replay 还需要本地有 `oreturn` 源码仓库，例如：

```text
/Users/lidong/Projects/MemoraXAI/codebase/oreturn
```

Replay System 会根据原始日志解析出当时使用的 `oreturn` commit，并在本仓库下创建隔离 worktree：

```text
.worktrees/prompt-patch-replay/oreturn-<sourceCommit>/
```

它不会切换你的主 `oreturn` 工作目录。

## 推荐工作流

1. 从 consistency review 里选出要验证的 badcase turns。
2. 启动 Workbench。
3. 在 Configure 页填写日志、turns、repeats、模型和 `oreturn` 路径。
4. 在上方查看每个 badcase 的 issue、原始输出、replay 输出和 judge。
5. 在下方选择 prompt source，修改 Draft。
6. 点击 Run，等待 replay 和 judge 完成。
7. 用左侧进度面板检查每个 turn / run 的状态。
8. 切换上方 `Replay` / `Judge` 查看修复后的输出和判定原因。
9. 根据结果继续改 prompt，或把有效改动整理成正式 patch / commit。

## 启动 Workbench

最简单的启动方式：

```bash
node scripts/prompt-replay-workbench.mjs
```

它会启动一个本地 server，并打印地址：

```text
Prompt Replay Workbench: http://127.0.0.1:<port>
```

如果已经准备好 `replay-task.yaml`，可以直接加载：

```bash
node scripts/prompt-replay-workbench.mjs \
  --config /path/to/replay-task.yaml
```

也可以指定端口：

```bash
node scripts/prompt-replay-workbench.mjs \
  --config /path/to/replay-task.yaml \
  --port 57321
```

Workbench 默认会读取：

```text
scripts/prompt-replay-workbench/default-prompt-sources.yaml
```

如果需要自定义可编辑 prompt source，可以传：

```bash
node scripts/prompt-replay-workbench.mjs \
  --config /path/to/replay-task.yaml \
  --prompt-sources /path/to/prompt-sources.yaml
```

## Configure 页怎么填

Workbench 的 Configure 页会生成一个临时 task snapshot，写到：

```text
.workbench-tasks/<replay-id>-manual.yaml
```

同时会把最近一次 Configure 表单保存到本地缓存：

```text
.workbench-tasks/latest-manual-setup.json
```

下次直接启动 Workbench 时会默认恢复这份配置。这个缓存会包含页面里直接填写的 API key；如果不希望继续保留，可以删除该文件。

关键字段：

| 字段 | 说明 |
| --- | --- |
| `Replay ID` | 本次 replay 的名字。后续输出目录会使用这个名字。 |
| `Log Group Dir` | badcase 所在的 `logs/<branch-version>` 目录。 |
| `Run ID` | 原始运行的 run id。 |
| `Turns` | 要复测的 badcase turn，例如 `4,5,9`。 |
| `Repeats` | 每个 turn 重复跑几次。快速 sanity check 可用 `1`，稳定性验证建议 `3` 或更多。 |
| `Oreturn Repo` | 本地 `oreturn` 源码路径。 |
| `Version Policy` | 当前使用 `require-matching-worktree`。 |
| `Replay Model` | 重放小说系统时使用的模型。 |
| `Judge Model` | 判断 issue 是否修复时使用的模型。 |

API key 可以直接填在页面里。Workbench 不会把直接填写的 key 写进 task snapshot YAML；运行 replay 时会临时放进进程环境变量：

```text
WORKBENCH_REPLAY_API_KEY
WORKBENCH_JUDGE_API_KEY
```

如果选择使用环境变量，则需要在启动 Workbench 前先 export：

```bash
export REPLAY_API_KEY=...
export JUDGE_API_KEY=...
node scripts/prompt-replay-workbench.mjs
```

## 主界面结构

主界面分成上下两块。

上方是 badcase review 区：

- 左侧 `CASE CONTEXT`：turn 切换和 replay 进度。
- 中间内容区：查看 issue、原始输出、replay 输出、judge 结果。

下方是 prompt 编辑区：

- 左侧 prompt source 列表：可编辑和只读 prompt。
- 中间 Original / Draft：对比原文和草稿。
- 右侧 Diff 或 Result：查看差异、运行状态和结果摘要。

### 上方 tabs

每个 badcase turn 里有四个视图：

| Tab | 用途 |
| --- | --- |
| `Issue` | 查看该 turn 的问题单、相关证据轮次、玩家可见上下文和原始输出。 |
| `Original` | 单独查看当前问题轮次的原始输出。 |
| `Replay` | replay 完成后查看修复后的新输出。 |
| `Judge` | 查看 judge 对每个 issue 的 verdict 和原因。 |

`Replay` 和 `Judge` 依赖 replay 产物。刚启动或尚未运行时可能为空；Run 完成后会按当前 turn / run 自动读取。

### 左侧进度面板

点击 Run 后，左侧会显示类似：

```text
Running 2 prompt edits across 3 turns x 1 repeats
0/3 runs completed | Waiting for replay and judge artifacts
```

完成后会显示整体通过率和每个 turn 的结果：

```text
Completed: 66.67% pass rate
2/3 runs passed | 3 judgments

Turn 4: completed (0.00%)
  Run 1 unchanged

Turn 5: completed (100.00%)
  Run 1 fixed
```

这个面板用于快速判断：

- 哪些 turn 还没跑完。
- 哪些 run failed。
- 哪些 issue 是 fixed / improved / unchanged / regressed / uncertain。
- 多 repeats 时每个 turn 的通过率是多少。

### 切换 turn 和加载 prompt 的区别

上方 `Turn 4 / Turn 5 / Turn 9` 用来切换 badcase review 结果。

它只影响上方看的 issue、original、replay、judge，不会自动替换下方正在编辑的 prompt draft。这样你可以在有 dirty draft 时自由查看其他 turn 的 replay 结果。

当 review turn 和 prompt turn 不一致时，下方会显示：

```text
Reviewing Turn 5; editing prompts for Turn 4
```

如果你确实想把下方 prompt source 切到当前 review turn，点击：

```text
Load Turn 5 prompts
```

如果当前 Draft 有未运行的修改，这个按钮会先弹确认，避免误丢改动。

## 如何编辑 prompt

左侧 prompt source 分两类：

- `EDITABLE`：可以修改并参与 replay 的 prompt。
- `VIEW ONLY`：只读参考，不能直接生成 patch。

常见可编辑来源包括：

- `Director / System`
- `Director / player_input`
- `Narrator / System`
- `Narrator / player_input`
- `Choice / System`

编辑流程：

1. 在左侧点一个 `Edit` prompt source。
2. 在中间 Draft 文本框里修改。
3. 右侧 Diff 会显示新增和删除内容。
4. 顶部状态会从 `Clean` / `Editable` 变成 `Dirty`。
5. 修改一个或多个 prompt 后，点击右上角 `Run`。

Workbench 会把 dirty prompt source 转成 patch bundle。对于从 `06-llm-calls.json` 读取到的 observed prompt，patch 默认是 field patch，不要求修改后的文本在未来 replay 里继续包含相同原文。

Scope 规则：

| 来源 | 默认作用范围 |
| --- | --- |
| `system` 字段 | 应用于所有 badcase turns。 |
| 以 `<player_input>` 开头的 message | 应用于所有 badcase turns，但保留每个 turn 自己的 `<player_input>` 内容。 |
| 其他 turn-specific material | 只应用到当前 source turn。 |

这能避免把 Turn 4 的玩家输入误带到 Turn 5，同时仍允许你修改稳定规则、输出协议和通用约束。

## 运行 replay

点击 `Run` 后，Workbench 会做这些事：

1. 收集所有 dirty prompt source。
2. 生成一个临时 replay task：

```text
.workbench-tasks/<replay-id>-workbench-<timestamp>.yaml
```

3. 把 UI 修改转成 patch bundle。
4. 调用底层 `runPromptPatchReplay`。
5. 写出 replay 产物。
6. 读取 `summary.json`，刷新左侧进度和上方 Replay / Judge tabs。

如果没有 dirty prompt，会提示：

```text
No prompt edits. Edit the Draft prompt first, then click Run.
```

## 查看结果

结果目录固定在：

```text
logs/<branch-version>/prompt-patch-replay/<replay-id>/
```

Workbench run 生成的 replay id 会带时间戳：

```text
<base-replay-id>-workbench-2026-06-27T03-14-40-713Z
```

关键文件：

| 文件 | 说明 |
| --- | --- |
| `summary.md` | 人工阅读汇总。 |
| `summary.json` | 机器可读汇总，Workbench 主要读它。 |
| `patch-bundle.json` | 本次真正执行的 prompt patch。 |
| `resolved-source-version.json` | 使用的 source commit、managed worktree、patch hash。 |
| `cases/turn-XXX/turn-replay-context.json` | 从原始日志重建出的输入和上下文。 |
| `cases/turn-XXX/new-04-output.json` | replay 后的新玩家可见输出。 |
| `cases/turn-XXX/llm-calls.json` | replay 中的 LLM calls 和 patch 应用记录。 |
| `cases/turn-XXX/issues/<issue-id>/judge-result.json` | 单个 issue 的 judge 结构化结果。 |
| `cases/turn-XXX/issues/<issue-id>/report.md` | 单个 issue 的人工阅读报告。 |

当 `repeats > 1` 时，每个 turn 下会有多次 run：

```text
cases/turn-005/
  aggregate-summary.json
  runs/
    run-001/
    run-002/
    run-003/
```

Workbench 的 Replay / Judge tab 会根据当前选择的 run 读取：

```text
GET /api/replay/:replayId/cases/:turn/runs/:runIndex
```

## Judge verdict 怎么读

judger 的 verdict 只有这几类：

| Verdict | 含义 |
| --- | --- |
| `fixed` | 原问题已修复。 |
| `improved` | 有改善，但仍有残留问题。 |
| `unchanged` | 基本没有改善。 |
| `regressed` | 变差或引入更明显问题。 |
| `uncertain` | 信息不足或无法判断。 |

默认只有 `fixed` 算通过。如果希望把 `improved` 也算通过，可以在 replay task 里配置：

```yaml
judging:
  passVerdicts: [fixed, improved]
```

快速 sanity check 时，重点看：

- overall pass rate 是否上升。
- 目标 issue 是否 fixed。
- 是否引入 regressed。
- 新输出是否肉眼可接受。
- patch 是否命中预期 stage / field。

## 直接使用 CLI

如果不需要 UI，可以直接写 `replay-task.yaml` 后运行 CLI。

示例：

```yaml
replayId: director-fix-2026-06-27

caseSet:
  logGroupDir: logs/58041ee23322-dev-orchestrator-opt-0624
  runId: runner-smoke-baseline-recent-5-2026-06-26T07-28-34.149Z
  turns: [4, 5, 9]
  repeats: 3

source:
  oreturnRepo: /Users/lidong/Projects/MemoraXAI/codebase/oreturn
  versionPolicy: require-matching-worktree

models:
  replay:
    baseUrl: https://api.example.com/v1
    apiKeyEnv: REPLAY_API_KEY
    model: replay-model
  judge:
    useReplayModel: true

judging:
  passVerdicts: [fixed]

patchBundle:
  id: director-fix-patches
  patches:
    - id: director-rule-001
      originalFile: patches/director-rule-001.before.md
      replacementFile: patches/director-rule-001.after.md
```

先做 context-only 检查，不调用模型：

```bash
node scripts/prompt-patch-replay.mjs \
  --config /path/to/replay-task.yaml \
  --dry-run-context-only
```

正式运行：

```bash
REPLAY_API_KEY=... JUDGE_API_KEY=... \
  node scripts/prompt-patch-replay.mjs \
  --config /path/to/replay-task.yaml
```

CLI 适合：

- 已经有稳定 patch 文件，想批量跑。
- 想在 CI 或脚本中跑 replay。
- 想最小化 UI 干扰，直接检查产物。

## Patch 类型

底层支持两类 patch。

### text patch

传统精确文本替换：

```yaml
patchBundle:
  id: text-patches
  patches:
    - id: director-rule-001
      originalText: |
        原始 prompt 段落
      replacementText: |
        修改后的 prompt 段落
```

规则：

- `originalText` 必须在完整调用链中精确命中一次。
- 不命中会失败。
- 命中多次会失败。
- 多个 patch 互相重叠也可能失败。

### field patch

Workbench 主要生成 field patch：

```yaml
patchBundle:
  id: workbench-patches
  patches:
    - id: turn-004.director.system
      matchMode: field
      sourceTurn: 4
      stage: director
      callKind: generateObject
      fieldPath: system
      originalText: |
        原始 system prompt
      replacementText: |
        修改后 system prompt
```

field patch 通过 `stage + callKind + fieldPath` 定位目标字段，适合 observed prompt。它仍会保留 `originalText`，用于审计和 hash，但应用时直接替换目标字段。

可选字段：

| 字段 | 说明 |
| --- | --- |
| `turn` | 只应用到某个 replay turn。 |
| `sourceTurn` | 记录这个 patch 来源于哪个 badcase turn，主要用于追溯。 |
| `stage` | 例如 `director`、`narrator`、`choice`。 |
| `callKind` | 例如 `generateObject`、`streamText`、`generateText`。 |
| `fieldPath` | 例如 `system`、`prompt`、`messages[4].content`。 |
| `preserveTags` | 替换时保留当前 replay turn 的指定 XML tag 块，例如 `player_input`。 |

`preserveTags` 示例：

```yaml
patchBundle:
  id: slot-aware-patches
  patches:
    - id: director-player-input-rules
      matchMode: field
      stage: director
      callKind: generateObject
      fieldPath: messages[4].content
      preserveTags: [player_input]
      originalText: |
        <player_input>Turn 4 的玩家输入</player_input>
        旧规则
      replacementText: |
        <player_input>Turn 4 的玩家输入</player_input>
        新规则
```

运行 Turn 5 时，系统会保留 Turn 5 自己的 `<player_input>...</player_input>`，只替换规则部分。

## 常见问题

### 为什么切 Turn 时弹“会丢弃 prompt 修改”？

现在上方 badcase turn 切换已经和下方 prompt 加载拆开。

正常点击 `Turn 5` 只切换 review 内容，不会丢 Draft。只有点击 `Load Turn 5 prompts` 才会加载该 turn 的 prompt source；如果当前 Draft 是 dirty，会弹确认。

### 为什么 Run 后 pass rate 不是 100%？

可能原因：

- 改动只修复了部分 badcase。
- 同一个 turn 多 repeats 里有随机失败。
- judge 判定为 `improved`，但当前 `passVerdicts` 只接受 `fixed`。
- patch 没有命中预期 prompt。
- 新输出修复了原问题，但引入了 regressed。

处理方式：

- 打开 `Judge` tab 看 verdict 和 reason。
- 打开 `Replay` tab 肉眼看新输出。
- 查看 `llm-calls.json` / `patch-application.json` 确认 patch 命中位置。
- 必要时增大 `repeats`。

### 为什么 Prompt Sources 显示 unavailable？

Workbench 为了版本一致性，只从 resolved managed worktree 读取源码 prompt，不直接读主 `oreturn` 目录。如果无法解析 source commit、目标 commit 不存在或 managed worktree 不可用，就可能显示 unavailable。

先确认：

```bash
cd /Users/lidong/Projects/MemoraXAI/codebase/oreturn
git fetch --all
```

然后重新启动 Workbench 或刷新页面。

### 为什么 patch not found？

对于 text patch，说明 `originalText` 没有在 replay 调用链里精确出现。

常见原因：

- before 文件不是从同一版本 prompt 复制的。
- 空格、换行或标点不一致。
- 选错了 badcase 日志版本。
- prompt 在运行时被组装后和源文件片段不完全一致。

Workbench 生成的 observed field patch 能降低这类问题，因为它直接来自原始 `06-llm-calls.json`。

### 什么时候用 Workbench，什么时候用 CLI？

用 Workbench：

- 还在探索 prompt 改法。
- 需要边看 issue / 输出 / judge 边改。
- 需要人工比较修复后的 bubble / narrative。
- 希望快速 sanity check patch apply 是否生效。

用 CLI：

- patch 已经整理成文件。
- 要批量跑一组固定 turns。
- 要在脚本或 CI 里跑。
- 要复现 Workbench 生成的 `.workbench-tasks/*.yaml`。

## 推荐检查清单

每次认为一个 prompt 修改有效前，至少确认：

- `Run` 完成，没有 pending / failed run。
- 目标 turn 的 `Judge` verdict 是 `fixed`，或符合当前 `passVerdicts`。
- `Replay` 新输出肉眼合理，没有明显风格或格式退化。
- 左侧进度没有隐藏的 regressed / unchanged case。
- 多 turn 时，每个 turn 的输出都看过一遍，不只看 overall pass rate。
- 如果改了 player_input 附近 prompt，确认没有把某个 turn 的具体玩家输入带到其他 turn。
- 结果目录下 `patch-bundle.json` 和预期修改一致。

## 关联文档

- `docs/prompt-patch-replay-usage.zh.md`：底层 Prompt Patch Replay CLI 的详细说明。
- `docs/prompt-patch-replay.md`：英文简版说明。
- `scripts/prompt-replay-workbench/default-prompt-sources.yaml`：默认可读 prompt source 配置。
