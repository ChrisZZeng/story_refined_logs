# issue-11-turn-29 Root Cause Report

## Problem

issueIndex=11，turn=29，type=`space-time-break`，scope=`mixed`。玩家在第 29 轮正文中看到旧照片已经被夹回原页，书被合上并回到床头柜上；但同一轮选项仍允许“仔细观察照片正面”和“把照片小心夹回书里”，把已经收束的物件状态重新当作可直接操作状态。

## Validity

issueValidity: `valid`

该问题可以只用玩家可见证据确认。第 29 轮可见正文结尾写明“你把照片夹回原页，合上书”，并且“那本书安安静静地躺回床头柜上”。同一轮可见选项却包含“仔细观察照片正面，寻找更多细节”和“把照片小心夹回书里，关灯躺下休息”。前者默认照片仍可直接拿在手中观察，后者重复已经完成的夹回动作，因此造成轻微但真实的交互状态不一致。

需要说明的是，玩家下一轮选择后系统可以重新打开书并取出照片，但第 29 轮选项本身没有表达“重新翻开书取出照片”，所以不是合理省略。

## Context Assessment

问题发生前，玩家已经拿起床头柜上的平装书并获得卡琳娜许可阅读。第 29 轮正文实际完成了一个完整的检查动作：翻书，发现旧照片，阅读背面文字，然后把照片夹回原页、合上书并放回床头柜。

relevantFacts:

- claim: 第 29 轮末尾，照片已经夹回书里，书已经合上并回到床头柜。
  availability: `present-clear`
  artifacts: `turn-29/04-output.json`, `visible-timeline.jsonl`
  notes: 这是玩家可见正文的最终状态，也是 Choice 生成时应优先使用的状态。
- claim: Choice worker 收到了本轮正文全文，并被要求“先以本轮正文结尾为准”判断可选动作。
  availability: `present-clear`
  artifacts: `turn-29/06c-choice-prompt.md`
  notes: prompt 中明确列出第 29 轮正文结尾，且输出前再次确认同一判断流程。
- claim: 照片是本轮最醒目的新发现物。
  availability: `present-clear`
  artifacts: `turn-29/04-output.json`, `turn-29/07-events.json`
  notes: Director 的 `requiredContent` 允许“提及书页间夹着一张泛黄的旧照片或便签”，Narrator 将它写成正文核心发现。

competingPressures:

- 新照片是本轮最强的新互动钩子。
- 主角的角色特质包含观察取证，容易诱导“仔细观察照片”选项。
- Choice prompt 依赖模型从长正文末尾自行抽取当前 affordance，没有结构化的物件状态约束。

## Causal Chain

firstDivergenceArtifact: `turn-29/07-events.json` 中 `worker-done` / `choiceGenerator` 输出，以及落盘后的 `turn-29/04-output.json` `choices.options`。

triggeringPressure: 第 29 轮正文大篇幅描写照片正反面，Director 又把“旧照片或便签”作为可选发现内容，导致照片成为最显眼的后续互动对象。

missingGuard: Choice 链路只有自然语言规则要求“以本轮正文结尾为准”，没有把 Narrator 末尾产生的物件位置和可操作状态转成结构化 affordance，也没有生成后校验“选项是否重复已经完成的动作或假设物件仍在手中”。

mechanismStatement: 当本轮新发现物足够显眼，而当前物件状态只存在于正文末尾的自然语言中时，Choice generator 会把“照片值得继续探索”的语义强度误当作“照片仍可直接操作”的 affordance；缺少结构化选项状态校验使这个误绑定直接进入玩家可见选项。

directCause: Choice generator 对照片进行了错误的 `choice-action-binding`，没有把“需要重新打开书取出照片”作为动作前提。

propagation: 错误首先进入第 29 轮可见选项；第 30 轮玩家选择“仔细观察照片正面”后，Narrator 继续按照片在手的状态写出“你指尖托起那张泛黄的照片”，使选项错误传播到下一轮正文。

nonCauses:

- Director 不是第一偏离点；它没有要求选项保持照片在手。
- Narrator 的第 29 轮正文不是问题源头；它明确收束了照片和书的状态。
- story state 不是主要根因；问题发生在同轮正文到同轮选项的 handoff。

## Root Cause

rootCause.label: `choice-action-binding`

family: `agent-system`

secondaryFamilies: [`llm-self`]

L3 root mechanism 是 Choice 阶段的动作绑定没有结构化地继承 Narrator 末尾状态。系统把“本轮正文全文”和通用一致性规则交给 Choice worker，但没有显式传入“当前可直接操作对象”和“已完成动作”的短表，也没有对选项做 affordance 校验。因此模型在清楚看到结尾状态的情况下，仍被照片这个高显著新线索拉回未收束状态。

这不是简单的 `Choice` 组件名问题，而是“选项动作必须绑定当前交互状态”的契约缺口。只要一个物件在同轮内先被发现又被收起，同样的错误形状就可能复现。

## Evidence

playerVisible:

- `visible-timeline.jsonl` turn 29: 正文结尾为“你把照片夹回原页，合上书”和“那本书安安静静地躺回床头柜上”。
- `visible-timeline.jsonl` turn 29: 同轮选项包含“仔细观察照片正面，寻找更多细节”和“把照片小心夹回书里，关灯躺下休息”。
- `visible-timeline.jsonl` turn 30: 玩家选择后正文直接写“你指尖托起那张泛黄的照片”，显示错误 affordance 被下一轮采用。

internalTrace:

- `turn-29/04-output.json`: Narrator 正文已经收束照片与书，但 `choices.options` 仍输出矛盾选项。
- `turn-29/06c-choice-prompt.md`: Choice prompt 明确包含“本轮玩家已经看到的正文（最终判断依据，尤其结尾）”，并要求“先以本轮正文结尾为准”。
- `turn-29/07-events.json`: `choiceGenerator` 是第一处输出矛盾选项的 artifact。

## Recommended Fix Area

优先修复 Choice generation 的 affordance handoff 和 post-check。可以在 Narrator 输出后抽取或传入一个短的 `currentInteractionState`，至少包含当前手中物件、已收起物件、已完成动作和需要前置动作的物件；Choice 输出后再校验选项是否重复已完成动作，或是否省略必要前置动作。

## Confidence

confidence: `high`
