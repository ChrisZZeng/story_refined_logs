# Problem

issueIndex=7，turn=19，type=`quality-regression`，scope=`visibleText`。

玩家可见正文中有一句：“他没有追问规矩是什么——他显然是知道的，只是不想在提起她面前——在一个陌生提她面前——再经历一次那个过程。”这里的“在提起她面前”和“在一个陌生提她面前”明显不通，疑似把“在她面前”与“在一个陌生人面前”混成了残缺误词。它不改变主线事实，但会打断阅读理解，所以该低严重度 issue 成立。

# Validity

`issueValidity`: `valid`

只看玩家可见证据即可确认问题。turn 19 的句子内部语法和指代都不完整，无法用角色口误或叙事风格合理解释。它不是隐藏信息误判，也不是评测把正常互动改写当成错误。

# Context Assessment

问题发生前，玩家看到 turn 18 已完成称呼、同意调查和规矩提醒。turn 19 继续让德索洛在规矩压力下羞愧退场，但其中一个解释性旁白句出现局部文本损坏。

Relevant facts:

- claim: turn 19 的目标是继续处理德索洛与卡琳娜的交易场面。availability: `present-clear`。artifacts: `turn-19/03-story-state.json`, `turn-19/06a-director-prompt.md`。notes: 场景、角色和压力都清楚。
- claim: 该问题只涉及一句局部中文质量，不依赖剧情事实。availability: `not-needed`。artifacts: `turn-19/04-output.json`, `turn-19/06-llm-calls.json`。notes: Director 的剧情安排没有要求这句残缺表达。
- claim: 正文生成前没有会造成该误词的 runtime event。availability: `absent`。artifacts: `turn-19/07-events.json`, `turn-19/05-runtime-after.json`。notes: events 只显示 worker 流程，runtime-after 没有改写这句文本。

Competing pressures:

- turn 19 prompt 很长，且包含固定剧情、最近几轮正文和角色资料，局部句子需要在“他、她、陌生人、规矩、尊严”之间维持指代清晰。
- Narrator 同时要执行固定演出、HTML 标注、慢节奏氛围和交易法则，不只是做语言润色。

# Causal Chain

First divergence artifact: `turn-19/06-llm-calls.json[1].text`，随后原样进入 `turn-19/04-output.json` 的 `narrative` 与 `visibleText`。

Triggering pressure: Narrator 在一段长篇交易场面中解释德索洛不愿再次低头的心理，需要同时处理“卡琳娜”“主角这个陌生人”“提起规矩/她”的多重指代。

Missing guard: 生成后没有文本质量 sanity check 或自动修复步骤来捕获明显的中文残缺、误词和重复片段。Director/Choice/runtime 也没有承担逐句语言 QA。

Mechanism statement: 在长 prompt 和多指代句式压力下，Narrator 局部生成了混杂短语；由于缺少面向可见正文的语言质量校验，该 malformed sentence 被直接提交给玩家。

Direct cause: Narrator 的局部语言生成失误。

Propagation: `06-llm-calls.json[1].text` 的错误句子进入 `04-output.json`，再进入 visible timeline。后续 runtime-after 只保存状态，没有修复文本。

Non-causes:

- 不是 Choice 生成问题；选项在这条 issue 中无关。
- 不是 story state 事实缺失；事实清楚，坏的是一句局部表达。
- 不是评测误判；玩家可见文本本身确实残缺。

# Root Cause

`rootCause.label`: `model-local`

`family`: `llm-self`

这是局部生成质量失败：上下文和剧情目标足以生成通顺句子，但模型在复杂长句中把“在她面前”和“在一个陌生人面前”类短语混成残句。系统没有后置文本质量防线，所以局部 malformed output 直接变成玩家可见正文。

`fixSurface`:

- Narrator 输出后的中文文本质量检查与轻量修复。
- 可见正文提交前的 malformed sentence detector。
- 对长句解释性旁白增加“短句优先、避免多重指代套叠”的 narrator style guard。

# Evidence

Player-visible evidence:

- `visible-timeline.jsonl` turn 19: “他显然是知道的，只是不想在提起她面前——在一个陌生提她面前——再经历一次那个过程。”

Internal trace:

- `turn-19/06-llm-calls.json[1].text` 已包含同一句错误。
- `turn-19/04-output.json` 将该文本原样写入 `narrative` 和 `visibleText`。
- `turn-19/07-events.json` 显示错误由 narrator worker 输出后提交，没有后续修复事件。

# Recommended Fix Area

优先补 Narrator 后处理 QA：在提交 `turnContent.visibleText` 前检测明显中文残缺、错别词串和不可解析指代短语，必要时触发一次局部修复，而不是重跑整轮剧情。

# Confidence

`medium`

证据能明确定位到 Narrator 局部输出，但无法从日志进一步证明模型内部为何选中该残句；因此根因定位到 `model-local` 与缺少后置 QA，置信度为 medium。
