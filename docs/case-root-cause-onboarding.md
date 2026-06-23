# Case Root Cause Onboarding

这份文档给需要接手一致性问题排查的新同事使用。它的目标不是教人复述评测报告里的标签，而是帮助他在 Codex 辅助下看懂具体 case，判断问题是否真实成立，找到最早偏离点，并沿着证据链追到真正导致问题出现的机制。

## 仓库和路径约定

这份文档默认有两个相邻仓库，但它们不是同等优先级。分析 case 时，默认先进入 `story_refined_logs` 看日志和评测结果；只有当日志证据已经指向某个系统机制，或者需要确认问题由哪段生产逻辑造成时，才回到 `oreturn` 查代码。

| 名称 | 默认位置 | 使用时机 | 用途 |
| --- | --- | --- | --- |
| `story_refined_logs` | `/Users/ethan/Documents/workspace/Novel/code/story_refined_logs` | 必需，默认入口。 | 日志和分析资料仓库。run logs、consistency review、root cause analysis 和相关 skills 都放在这里。仓库地址是 `https://github.com/ChrisZZeng/story_refined_logs`。 |
| `oreturn` | `/Users/ethan/Documents/workspace/Novel/code/oreturn` | 按需使用。 | 代码仓库。需要确认 prompt assembly、worker、storyline、state writeback 和 validator 等生产逻辑时看这里。 |

如果新同事本机路径不同，只需要把上面两个仓库根目录替换成自己的实际路径。下面出现的 `<story_refined_logs>` 都表示 `story_refined_logs` 的仓库根目录，不是 `oreturn/tmp` 里的临时目录。如果本机还没有 `story_refined_logs`，agent 可以先从 `https://github.com/ChrisZZeng/story_refined_logs` 拉取到和 `oreturn` 同级的位置，再继续分析。

文档中的相对路径也默认相对于 `story_refined_logs` 仓库根目录。例如：

- `logs/<branch-version>/run_logs/<run-id>/`
  等价于 `<story_refined_logs>/logs/<branch-version>/run_logs/<run-id>/`。
- `logs/<branch-version>/consistency-review/<run-id>/`
  等价于 `<story_refined_logs>/logs/<branch-version>/consistency-review/<run-id>/`。

这里的 `<branch-version>` 是一次代码版本或实验分支的日志分组名，例如 `2124ade90932-dev-orchestrator-membackend` 或 `f7f35a97874f-codex-hybrid-dual-layer-memory`。`<run-id>` 是单次 run 的目录名，例如 `runner-smoke-baseline-recent-5-2026-06-22T09-46-37.258Z`。

`story_refined_logs` 里常用目录的职责如下：

| 目录 | 作用 | 什么时候看 |
| --- | --- | --- |
| `logs/<branch-version>/run_logs/<run-id>/` | 单次 run 的原始执行日志，包括每轮输入、输出、prompt、worker 事件和状态写回。 | 查具体 case 的主入口。 |
| `logs/<branch-version>/consistency-review/<run-id>/` | consistency evaluator 的评测结果，包括玩家可见 timeline、issues、summary 和 batch plan。 | 先确认问题是否成立，并定位 issue。 |
| `logs/<branch-version>/run_logs/root-cause-analysis/<run-id>/` | root cause coordinator 和 subagent 生成的分析结果。 | 作为索引和参考，但不能直接替代人工复核。 |
| `skills/consistency_evaluator/` | 一致性评测 skill。 | 需要重新评测 run 时使用。 |
| `skills/consistency_root_cause/` | 批量根因分析 skill。 | 需要对 consistency review 批量生成 root cause 参考报告时使用。 |
| `skills/root_cause_tracer/` | 单条 issue 根因追踪 skill。 | 需要深挖某个具体 issue 时使用。 |
| `docs/` | 新同事说明、分析流程和协作约定。 | 接手任务前先看。 |

建议流程是：

1. 先在 `story_refined_logs` 的 consistency review 里找到 issue，并用 `visible-timeline.jsonl` 和对应 turn 的 `04-output.json` 判断它是否真是玩家可见问题。
2. 再回到同一个 run 的 `turn-XX/` 日志，查看 `01-summary.json`、`02-script-state.json`、`03-story-state.json`、`05-runtime-after.json` 和 `06*-prompt.md`，还原事发前状态和 worker 输入输出。
3. 如果已有 root cause analysis，就把它当索引使用，优先打开单条 `root-cause-report.md`，但仍要用原始日志验证它的判断。
4. 只有当需要解释“为什么系统会这样组装信息”或“是哪段生产逻辑导致了当前 artifact”时，再打开 `oreturn`，用日志里出现的字段名去搜索对应代码。
5. 最终结论要同时说明日志证据和代码证据。如果没有查代码，也要明确写成“只基于日志判断，尚未确认生产逻辑”。

## 适用场景

适用于下面这类任务：

- 已经有一次 run 的日志目录，例如 `<story_refined_logs>/logs/<branch-version>/run_logs/<run-id>/`。
- 已经有 consistency review，例如 `<story_refined_logs>/logs/<branch-version>/consistency-review/<run-id>/`。
- 已经有或即将生成 root cause analysis，例如 `<story_refined_logs>/logs/<branch-version>/run_logs/root-cause-analysis/<run-id>/`。
- 需要人工复核若干个 issue 的真实根因，并决定下一步优化什么。

不适用于直接批量相信 `rootCause.label` 的场景。聚合报告和 HTML 总览只能作为索引，不能替代人工对具体剧情、prompt 和 output 的判断。

## 最小背景包

给新同事分配几个 case 之前，最好同时给他这些信息。

| 信息 | 为什么需要 |
| --- | --- |
| 日志仓库路径 | 默认工作入口。新同事先在这里看 run logs、consistency review 和 root cause analysis。 |
| run id 和 run 目录 | 用来查看原始 turn 日志、模型调用、输出和状态写回。 |
| consistency review 目录 | 用来查看玩家可见时间线和评测出的 issue 列表。 |
| root cause analysis 目录 | 用来查看已有 subagent 分析、聚合表和原始单条报告。 |
| 需要复核的 issue id | 明确边界，避免新同事从整组问题里发散。 |
| 本次希望回答的问题 | 例如“确认问题是否成立”，或者“判断最早偏离点发生在日志链路的哪一层”。 |
| 运行配置 | 至少包括模型、recentTurns、选择模式、是否启用 memory backend。配置差异会改变问题表现。 |
| 代码仓库路径和代码版本 | 建议提供，但不是验证 case 的第一入口。只有需要确认生产逻辑或追溯机制来源时才使用。 |

可以直接把下面这段作为 case handoff 模板：

```text
日志仓库：
<story_refined_logs repo path，例如 /Users/ethan/Documents/workspace/Novel/code/story_refined_logs>

run 日志：
<story_refined_logs>/logs/<branch-version>/run_logs/<run-id>

consistency review：
<story_refined_logs>/logs/<branch-version>/consistency-review/<run-id>

root cause analysis：
<story_refined_logs>/logs/<branch-version>/run_logs/root-cause-analysis/<run-id>

代码仓库（按需，用于确认生产逻辑）：
<oreturn repo path，例如 /Users/ethan/Documents/workspace/Novel/code/oreturn>

代码版本（建议填写，便于后续追代码）：
<branch / commit，例如 main / 2124ade9>

请重点看：
- issue #<n> / turn <t>
- issue #<n> / turn <t>

本次希望判断：
<要确认的具体问题，例如问题是否成立、最早偏离点在哪里、需要继续查哪类机制>
```

## 系统链路心智模型

一次 turn 大致可以按下面的顺序理解：

1. 系统读取上一轮输出、玩家选择、脚本状态、故事状态和运行时状态。
2. `storyline` 和相关状态被组装成当前轮的规划上下文。
3. `Director` 做剧情层面的安排，给出本轮应推进什么、必须包含什么、不能违背什么。
4. `Narrator` 根据玩家输入、最近可见文本、Director 指导和状态信息生成玩家可见正文。
5. `Choice` 根据当前正文、候选动作和上下文生成下一轮玩家可见选项。
6. 最终内容和状态写入 `04-output.json`、`05-runtime-after.json`，并成为下一轮输入。

要特别注意职责边界：

- `Director` 应该负责大面剧情指导、节奏、人物秘密、固定演出和约束提醒。它不直接写最终正文。
- `Narrator` 是玩家可见正文的最后防线。即使 Director 给得不够好，Narrator 仍然需要遵守最近可见事实和当前场景状态。
- `Choice` 只能给玩家当前有理由选择的行动。它不能把内部剧情计划、未引介角色姓名或未出现物件直接暴露成按钮。
- `state`、`storyline` 和 `runtime-after` 是上游事实来源。它们可能给对，也可能给错，还可能给了过期或已消费的信息。

根因分析时不要把 “Director 写错了”“Narrator 写错了”“Choice 写错了” 当成最终答案。这些通常只是直接原因。还要继续问：为什么它会写错，是信息没给到、信息冲突、优先级错、状态没写回、固定剧情未消费，还是缺少后置校验。

## 日志文件速查

### run 顶层文件

| 文件 | 用途 |
| --- | --- |
| `00-run-config.json` | 查看模型、轮数、recentTurns、选择模式等运行配置。 |
| `summary.json` | run 级概览。 |
| `eval-messages.json` / `eval-messages.jsonl` | 评测或运行消息记录。 |
| `background-errors.json` | 后台错误。排查异常时先看。 |
| `memorax-requests.json` | 记忆请求汇总。如果怀疑 memory 相关问题，可以参考。 |

### 单轮 turn 文件

每一轮通常位于 `turn-XX/` 下。

| 文件 | 优先怎么看 |
| --- | --- |
| `01-summary.json` | 轮次摘要、玩家输入和简要状态。先用来定位当前轮发生了什么。 |
| `02-script-state.json` | 脚本、beat、剧情阶段和完成状态等。怀疑上游规划或脚本状态问题时重点看。 |
| `03-story-state.json` | 当前故事状态、候选动作、约束和 storyline 呈现。怀疑 Director/Choice 输入有问题时重点看。 |
| `04-output.json` | 最终玩家可见正文和选项。验证问题落地时重点看。 |
| `05-runtime-after.json` | 本轮后写回的运行时状态。排查状态是否被正确消费、完成或持久化时重点看。 |
| `06-llm-calls.json` | LLM 调用输入输出结构。需要看 Director/Narrator/Choice 的真实返回时用。 |
| `06a-director-prompt.md` | Director 看到的 prompt。判断它是否拿到了正确约束。 |
| `06b-narrator-prompt.md` | Narrator 看到的 prompt。判断它是否有足够信息守住一致性。 |
| `06c-choice-prompt.md` | Choice 看到的 prompt。判断选项是否有玩家可见依据。 |
| `07-events.json` | worker 事件流。可用来确认各 worker 的产物和顺序。 |
| `08-memorax-requests.json` | 单轮记忆请求。排查记忆检索时参考。 |
| `09-eval-messages.json` | 单轮评测消息。通常不是根因分析主入口。 |

### consistency review 输出

| 文件 | 用途 |
| --- | --- |
| `visible-timeline.jsonl` | 玩家实际看到的时间线。所有问题都先用它确认是否成立。 |
| `issues.json` | 全量 issue。包含 visibleText、full-turn、mixed 等不同 scope。 |
| `issues-visible-text.json` | 仅玩家可见正文相关的 issue。 |
| `summary.md` / `summary.json` | 评测总览。适合快速找严重问题，但不能直接当根因。 |
| `summary-visible-text.*` | 可见正文维度汇总。 |
| `summary-full-turn.*` | 完整 turn 维度汇总。 |
| `batch-plan.json` | consistency evaluator 的批次划分。 |

### root cause analysis 输出

| 文件 | 用途 |
| --- | --- |
| `summary.md` / `summary.json` | root cause 聚合结果。适合看分布和缺失结果。 |
| `root-cause-table.md` | 每条 issue 的根因表。适合快速索引。 |
| `mechanism-clusters.md` | 按 root cause label 聚类。只做初筛，不要直接当结论。 |
| `fix-priority.md` | 修复优先级建议。需要结合具体 case 人工复核。 |
| `root-cause-summary.html` | 中文阅读索引页。适合浏览，不适合替代 case 分析。 |
| `batches/<batch-id>/task.md` | subagent 的原始任务。复核 subagent 是否按要求做事时看。 |
| `batches/<batch-id>/issues/<issue-id>/root-cause-report.md` | 单条 issue 的详细报告。人工复核的主入口之一。 |
| `batches/<batch-id>/issues/<issue-id>/root-cause-result.json` | 单条 issue 的结构化结果。适合机器提取，但需要人工判断质量。 |
| `batches/<batch-id>/issues/<issue-id>/trace.md` | 证据包摘要。适合快速看到引用过哪些 artifact。 |
| `batches/<batch-id>/issues/<issue-id>/trace-packet.json` | 结构化证据包。需要自动抽取时用。 |

## 人工分析流程

### 第一步：先验证问题是否真的成立

只看玩家可见证据，不要先看 hidden state。

建议打开：

- `visible-timeline.jsonl`
- 当前 turn 的 `04-output.json`
- 前一两轮和后一轮的 `04-output.json`

需要回答：

- 玩家实际看到了什么？
- issue 描述的冲突、重复、跳跃或选项问题是否真的存在？
- 如果它依赖隐藏信息才成立，那它不能作为玩家可见一致性问题直接判定。
- 如果它只是轻微文风问题，严重度是否应该降级？

这是防止误判的最重要一步。不要倒过来拿角色卡、storyline 或未来剧情去证明玩家可见文本错了。

### 第二步：还原问题发生前的故事状态

确认问题成立之后，再看内部 artifact。

建议打开：

- 当前 turn 的 `01-summary.json`
- 当前 turn 和前一轮的 `02-script-state.json`
- 当前 turn 和前一轮的 `03-story-state.json`
- 当前 turn 和前一轮的 `05-runtime-after.json`

需要回答：

- 当前场景在哪里？
- 玩家和关键 NPC 的位置、姿态、关系和已知信息是什么？
- 当前 active beat 是什么？哪些 beat 已完成？
- 当前 storyline 有没有固定演出、约束、候选动作或隐藏信息？
- 这些信息是明确给了、没给、给错了，还是给了但埋得很深？

### 第三步：追最早偏离点

不要从最终正文直接跳到“模型错了”。要沿链路往前追。

如果问题出在剧情安排或固定演出，重点看：

- `03-story-state.json` 中的 `currentStoryline`、`constraints`、`candidateActions`。
- `02-script-state.json` 中 active beat、completed beat 和固定剧情内容。
- `06a-director-prompt.md` 中这些内容如何呈现给 Director。
- `06-llm-calls.json` 或 `07-events.json` 中 Director 的真实 output。

如果问题出在正文，重点看：

- `06b-narrator-prompt.md` 中 Narrator 是否拿到了最近可见文本、当前场景锚点、Director requiredContent 和 must-not 约束。
- `06-llm-calls.json` 中 Narrator 的 output。
- `04-output.json` 中最终落地的 `turnContent`。

如果问题出在选项，重点看：

- `03-story-state.json` 中 `candidateActions` 或选项候选来源。
- `06c-choice-prompt.md` 中 Choice 是否被要求只使用玩家可见事实。
- `07-events.json` 中 Choice worker 的 output。
- `04-output.json` 中最终显示的 choices。

如果问题跨轮重复或回退，重点看：

- 前一轮 `04-output.json` 的尾部。
- 当前轮 `06a-director-prompt.md` 和 `06b-narrator-prompt.md` 中 recent turns 是否包含前一轮正文。
- `05-runtime-after.json` 中是否写回了完成状态、当前位置、当前姿态或其他会影响后续承接的事实。

### 第四步：区分直接原因和根本原因

直接原因回答“哪一步写出了错误”。根本原因回答“为什么系统允许它写出错误”。

可以用下面这种方式表达，但不要套用具体措辞：

- 直接原因：某个 worker 在当前 turn 生成了与玩家可见上下文不一致的内容。
- 根本原因：上游输入、状态写回、职责约束或后置校验没有阻止这个错误进入最终输出。

继续追问这些问题：

- 正确信息有没有出现在 prompt 里？
- 如果出现了，它是否足够显著，还是被冲突信息压过？
- 是否有互相矛盾的状态、角色卡、storyline 或 requiredContent？
- 是否缺少当前场景锚点，例如位置、姿态、时间、已完成动作？
- 是否缺少可见知识门控，导致隐藏信息提前进入正文或选项？
- 是否缺少后置 validator，导致明显格式、重复或事实冲突直接落地？

### 第五步：顺藤摸瓜追到机制来源

不要在还没找到原因时给处理方案。第五步要做的是把“为什么”和“是什么导致的”追清楚，直到能指出问题是从哪个 artifact、哪次状态变化、哪段 prompt 输入、哪个 worker output 或哪类生产逻辑进入链路的。

可以按下面的问题继续追：

- 错误第一次出现在哪个 artifact？它之前的输入是否已经带着这个错误？
- 如果输入里已经有错误，这个错误来自上一轮输出、脚本状态、故事状态、运行时状态，还是玩家选择记录？
- 如果输入里没有错误，是哪个 worker 在 output 中首次引入了错误？
- 这个 worker 当时看到了哪些相互冲突、缺失、过期或优先级不清的信息？
- 本轮结束后，错误是否被写回状态，并继续影响后续轮次？
- 如果需要看代码，日志里的字段名、prompt 段落或状态路径对应到哪段生产逻辑？

结论要写成可追溯的因果链，而不是动作清单。例如：“问题在 A artifact 首次出现；A 的错误来自 B 字段；B 字段由 C 逻辑生成；C 当时没有区分 D 和 E 两类信息。”如果只能追到某一步，就停在那里，并说明还缺什么证据，不要补一个看起来合理的处理方案。

## 根因分类只作为辅助

可以用下面这些大类帮助沟通，但不要把它们当成最终答案。

| 大类 | 判断问题 |
| --- | --- |
| `agent-system` | 输入拼装、worker handoff、storyline 生命周期、choice 绑定或 validator 缺失是否导致了错误？ |
| `recent-context` | 最近几轮的当前场景、姿态、时间、节奏是否没有被维持？ |
| `detail-memory` | 物件、服装、地点陈设、照片背景这类细节是否没有持久化？ |
| `meta-memory` | 角色关系、世界观设定、重大已发生事件是否跨较长窗口丢失？ |
| `llm-self` | 上下文已经足够清楚，但模型在局部措辞、代词或句法上自己写坏了吗？ |

同一个 label 下的 case 也可能来自完全不同的因果链。label 只能提示排查方向，不能替代对具体 artifact 的判断。真正有价值的是说明问题如何从最早偏离点一步步传播到玩家可见输出。

## Codex 辅助方式

Codex 适合做这些事：

- 快速定位某个 issue 对应的 turn 文件。
- 从 `visible-timeline.jsonl` 抽取前后几轮玩家可见文本。
- 对照 `Director`、`Narrator`、`Choice` 的 prompt 和 output。
- 找出候选动作、requiredContent、constraints、completed beat、runtime-after 的变化。
- 生成对照表和初步假设。
- 必要时在代码仓库中用 `rg` 搜索相关字段的生产逻辑，例如 `candidateActions`、`requiredContent`、`completedBeatIds`、`selectedFromPreviousTurn`。

Codex 不应该替人做这些判断：

- 只凭 root cause 聚合报告决定问题来源。
- 只凭隐藏信息判定玩家可见文本错误。
- 把 issue type 当成根因。
- 把 “Director 错了” 或 “Narrator 幻觉了” 当成终点。
- 没看实际 prompt/output 就从代码 diff 推断原因。

## 推荐给 Codex 的 case 分析 prompt

```text
请帮我分析这个一致性 issue 的真实根因，但不要直接相信已有 rootCause.label。

日志仓库：
<story_refined_logs repo path，例如 /Users/ethan/Documents/workspace/Novel/code/story_refined_logs>

run 目录：
<story_refined_logs>/logs/<branch-version>/run_logs/<run-id>

consistency review 目录：
<story_refined_logs>/logs/<branch-version>/consistency-review/<run-id>

root cause analysis 目录：
<story_refined_logs>/logs/<branch-version>/run_logs/root-cause-analysis/<run-id>

代码仓库（按需使用；如果本次只复核 case 是否成立，可以先不看）：
<oreturn repo path，例如 /Users/ethan/Documents/workspace/Novel/code/oreturn>

代码版本（如果需要追代码，请使用日志对应的 branch / commit）：
<branch / commit，例如 main / 2124ade9>

请分析：
- issueIndex=<n>
- turn=<t>

要求：
1. 先只用 visible-timeline 和玩家可见 output 判断这个 issue 是否成立。
2. 再还原 issue 发生前的当前场景、玩家/NPC 状态、已知信息和 active beat。
3. 对照 Director prompt/output、Narrator prompt/output、Choice prompt/output、story-state、runtime-after。
4. 找最早偏离点，并区分直接原因和根本原因。
5. 说明问题是如何从最早偏离点传播到最终输出的，重点回答“为什么会发生”和“是什么导致的”。
6. 如果日志证据已经指向系统机制，再打开代码仓库，用 rg 搜索相关字段，并说明代码证据和日志证据如何对应。
7. 输出中文报告，保留必要的英文字段名和文件路径。
```

## 代码逻辑排查入口

当日志证据指向某个系统机制，或者需要确认某个 artifact 是怎么生成的，才需要回到 `oreturn` 代码仓库确认生产逻辑。不要一开始就看代码，也不要只看代码。先确定 case 的偏离点，再搜对应字段。

常用搜索词：

```bash
rg "candidateActions|selectedFromPreviousTurn|requiredContent|currentStoryline|completedBeatIds|constraints" /Users/ethan/Documents/workspace/Novel/code/oreturn
rg "director|narrator|choice|prompt" /Users/ethan/Documents/workspace/Novel/code/oreturn/packages
rg "recentTurns|runtime-after|story-state|script-state" /Users/ethan/Documents/workspace/Novel/code/oreturn
```

如果偏离点像是上游规划数据或生命周期状态，优先搜：

```bash
rg "currentStoryline|requiredContent|constraints|completedBeatIds|activeBeat" /Users/ethan/Documents/workspace/Novel/code/oreturn
```

如果偏离点像是玩家输入、候选动作或选项绑定，优先搜：

```bash
rg "candidateActions|choice|selectedFromPreviousTurn|actionId" /Users/ethan/Documents/workspace/Novel/code/oreturn
```

如果偏离点像是最近上下文、当前场景或运行时状态承接，优先搜：

```bash
rg "currentScene|scene|position|runtime|recentTurns" /Users/ethan/Documents/workspace/Novel/code/oreturn
```

这些搜索只负责定位代码入口。最终判断仍然要和具体日志 artifact 对上。

## 常见误区

1. **从隐藏信息倒推问题。** 如果玩家看不到某个事实，就不能用它直接判玩家可见文本错。
2. **过度相信聚合 label。** 聚合适合找高频方向，不适合替代单 case 判断。
3. **只从 diff 找原因。** diff 能提示可能性，但真正原因要从问题表现和日志链路反推。
4. **把直接原因当根因。** “Narrator 写错”通常还要继续追为什么它会写错。
5. **忽略玩家行动入口。** 有些问题不是正文自发出错，而是上一轮玩家输入、候选动作或选项绑定把系统带进了错误状态。
6. **忽略规划数据的生命周期。** 上游计划如果没有表达当前阶段、完成状态或过期状态，后续 worker 会继续按旧信息行动。
7. **忽略当前轮终态。** 连续场景里，位置、姿态、时间、持有物和交互对象等终态经常决定下一轮是否能承接。
8. **把 prompt 当唯一解法。** 有些问题需要结构化状态、schema 分层、可见性门控或 validator，不是加一句提示词就能稳住。

## 单个 case 的交付模板

分析完一个 issue 后，建议用这个格式交付。

```markdown
## Issue #<n> / Turn <t>

### 问题是否成立

结论：valid / questionable / invalid

玩家可见证据：
- <引用 visible-timeline 或 04-output 的简短描述>

### 事发前状态

- 当前场景：
- 玩家行动：
- 关键 NPC 状态：
- 已知事实：
- active beat / completed beat：

### 最早偏离点

- artifact：
- 偏离内容：
- 为什么这是最早偏离：

### 直接原因

<哪一步生成或传递了错误>

### 根本原因

<系统为什么允许这个错误发生。必须比 Director/Narrator/Choice 更深一层。>

### 因果链

- 最早偏离点：
- 直接来源：
- 继续向后传播的路径：
- 如果已经查代码，对应生产逻辑：
- 如果还没查到，需要补充的证据：

### 不应该归因为什么

- <排除项 1>
- <排除项 2>
```

## Review 标准

一份 case 分析至少要满足这些条件，才值得进入后续优化讨论：

- 明确区分了玩家可见证据和隐藏内部证据。
- 指出了具体 artifact，而不是只描述感觉。
- 找到了最早偏离点，而不是只看最终 output。
- 区分了直接原因和根本原因。
- 说明了问题如何从最早偏离点传播到最终输出，而不是直接给处理方案。
- 说明了为什么不是其他更明显但错误的归因。

如果做不到这些，这份分析只能作为线索，不应该直接变成优化任务。
