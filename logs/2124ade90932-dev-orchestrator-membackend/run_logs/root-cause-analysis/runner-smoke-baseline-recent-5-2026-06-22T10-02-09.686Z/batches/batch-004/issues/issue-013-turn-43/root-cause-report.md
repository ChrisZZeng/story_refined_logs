# issue-13-turn-43 Root Cause Report

## Problem

issueIndex=13，turn=43，type=`quality-regression`，scope=`visibleText`。第 40 到第 43 轮连续对话反复使用卡琳娜沉默、搪瓷杯、凉茶、指尖画圆、晨光与灰尘等动作包装。第 43 轮再次以近似结构输出，使阅读体验出现机械重复。

## Validity

issueValidity: `valid`

该问题可以由玩家可见时间线确认。第 41 轮已经写“卡琳娜没有立刻回答”“右手食指在搪瓷杯壁上停住”“杯子里剩下的半截茶水”“指尖重新开始画那个圆”。第 42 轮继续写手指停在杯壁、半截凉茶、沉默很久、重新喝一口、指尖回到杯沿画圆。第 43 轮又写“卡琳娜没有立刻回答”“右手食指在搪瓷杯壁上停住”“半截已经凉透的茶水”“重新回到杯沿上，开始画那个圆”。这已经超过角色动作母题的自然复现，形成明显模板化。

可见层 caveat 是：卡琳娜此时确实在回避敏感问题，沉默和杯子动作可以合理出现；问题不在单个动作，而在多轮缺少变体和推进。

## Context Assessment

问题发生前，玩家持续追问敏特、真相和卡琳娜知道的信息。剧情约束要求卡琳娜不直接揭示具体答案，并维持审视/试探阶段。这个场景天然容易使用沉默和细微动作来表现回避，但第 40-43 轮已经连续消耗同一组动作。

relevantFacts:

- claim: 最近几轮已经重复使用杯子、凉茶、沉默和画圆动作。
  availability: `present-clear`
  artifacts: `visible-timeline.jsonl`, `turn-43/06a-director-prompt.md`, `turn-43/06b-narrator-prompt.md`
  notes: turn-43 prompt 的最近几轮经历完整展示了重复素材。
- claim: Director 在第 43 轮仍给出“先沉默”“慢铺，强调沉默和细微动作”的安排。
  availability: `present-clear`
  artifacts: `turn-43/04-output.json`, `turn-43/07-events.json`
  notes: `characterBeats.actionHint` 与 `pacing` 继续强化已重复的表现方式。
- claim: prompt 有“不要重复”的通用规则，但没有可执行的近期动作去重约束。
  availability: `present-buried`
  artifacts: `turn-43/06a-director-prompt.md`, `turn-43/06b-narrator-prompt.md`
  notes: “检查上文是不是写过内容，不要重复”在长设定中存在，但低于当前 Director 的具体动作提示和 pacing。

competingPressures:

- 信息控制要求卡琳娜不能直接回答，迫使文本用回避和停顿填充。
- 当前关系阶段要求审视/试探，强化沉默、视线和手部小动作。
- slow pacing 指令鼓励拉长环境和动作描写。
- 缺少“本轮必须换动作母题或推进场面”的强约束。

## Causal Chain

firstDivergenceArtifact: `turn-43/07-events.json` 中 `worker-done` / `director` 的 plotPoint，随后由 `narrator` 扩写。

triggeringPressure: 当前剧情不能揭示具体答案，Director 以“先沉默，然后含糊回应”处理玩家追问，并指定“慢铺，强调沉默和细微动作”。这些都是安全但已被连续使用的回避模板。

missingGuard: 系统没有近期动作母题的去重/冷却机制，也没有让 Director 在重复风险高时选择新的非揭示性推进方式，例如移位、结束对话、引入不同环境动作或更短回答。通用“不要重复”没有被转成可执行的 constraint。

mechanismStatement: 当信息控制把剧情锁在“不能回答但要继续对话”的窄通道里，Director 反复选择沉默加细微动作作为安全承接；缺少最近动作母题去重和替代表现约束，使 Narrator 继续复用杯子、凉茶、画圆和晨光模板，最终造成玩家可见的机械重复。

directCause: Director 在第 43 轮继续给出与前几轮同构的沉默/细微动作 beat，Narrator 又沿用最近上下文里的具体杯子动作。

propagation: 第 43 轮正文重复后，Choice 继续给出追问或看窗外的选项，使这个慢铺对话循环仍有继续风险。

nonCauses:

- 不是某个单独词句错误；问题来自跨轮动作母题重复。
- 不是固定剧本要求必须反复喝茶或画圆；这些动作是生成层选择的表现手段。
- 不是玩家输入本身无效；玩家在追问一个自然的敏感问题。

## Root Cause

rootCause.label: `anti-repetition-contract-gap`

family: `agent-system`

secondaryFamilies: [`recent-context`, `llm-self`]

L3 root mechanism 是缺少可执行的近期动作母题反重复契约。系统虽然把最近几轮重复文本放进 prompt，也有通用“不要重复”原则，但 Director/Narrator 没有收到结构化的“这些动作母题已连续使用，必须冷却或变体化”的约束。信息控制和慢铺风格把生成压向安全停顿，模型就复用最邻近、最符合角色边界的杯子和沉默动作。

这不是简单说 `Narrator` 文笔重复，也不是停在 `recent-context`；具体机制是“近期重复素材被看见但没有被转化为禁止/冷却约束，反而作为可模仿模板继续提供给下游”。

## Evidence

playerVisible:

- `visible-timeline.jsonl` turn 41: 手指停在搪瓷杯壁、半截茶水、沉默很久、指尖画圆。
- `visible-timeline.jsonl` turn 42: 手指停在杯壁、半截凉透茶水、沉默很久、喝茶后继续画圆。
- `visible-timeline.jsonl` turn 43: 再次出现没有立刻回答、搪瓷杯壁、半截凉透茶水、喝茶、画圆。

internalTrace:

- `turn-43/06a-director-prompt.md`: 最近几轮经历中重复内容 present-clear，同时存在通用“不要重复”规则。
- `turn-43/04-output.json`: Director 输出 `actionHint` 为“先沉默，然后说出模棱两可的回答，观察主角反应”，`pacing` 为“慢铺，强调沉默和细微动作”。
- `turn-43/07-events.json`: Narrator 按同一动作模板扩写出玩家可见重复。

## Recommended Fix Area

优先修复 Director/Narrator 的 recent motif tracking。可以在 prompt assembly 中抽取最近 N 轮已使用的动作母题和环境母题，形成 `avoidRecentMotifs` 或 `cooldownMotifs`，并要求 Director 在信息不能揭示时选择新的非信息推进手段。Narrator 侧需要把“慢铺”与“重复冷却”同时作为硬约束，而不是只靠通用文风提醒。

## Confidence

confidence: `high`
