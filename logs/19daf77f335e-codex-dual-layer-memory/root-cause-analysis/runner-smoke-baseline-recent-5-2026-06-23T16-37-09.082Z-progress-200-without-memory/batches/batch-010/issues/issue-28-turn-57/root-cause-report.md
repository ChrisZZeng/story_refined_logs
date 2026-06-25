# issue-28-turn-57

## Problem
第 57 轮把卡琳娜所说的“那个人”写成“他/他说/他那种人”，并在选项中直接写“『他』——是卡尔吗？”。此前玩家可见文本已稳定把卡尔称作“她”，第 59 轮又确认“那个人”是卡尔并恢复“她”。

## Validity
issueValidity: valid

单看第 57 轮正文，“那个人”仍可能是未揭示男性对象；但同轮选项已经把“他”和卡尔显式绑定。玩家此前在第 44、46 轮看到“卡尔……她会说”“她出现在暗街的那一天”“她只是甩了甩尾巴”，第 59 轮又看到“……是卡尔”“她教会了我很多事”。因此这是玩家可见的身份/称谓漂移，不依赖隐藏信息。

## Context Assessment
问题前的实际状态：第 56 轮卡琳娜说自己有一句欠下的话，但“不太确定——那句话是写给谁的”。第 57 轮玩家追问含义。当前剧情需要卡琳娜部分坦白但不点名对象，同时保持玩家已知的卡尔称谓一致。

相关事实：
- `present-clear`: 卡尔在玩家可见文本中稳定为“她”；见 `visible-timeline.jsonl` turn 44、46、59。
- `present-clear`: 内部角色卡也写卡尔是“黑色短毛母猫，声音像年长的女性”；见 `turn-57/03-story-state.json`、`turn-57/06b-narrator-prompt.md`。
- `over-constraining`: Director 要求“不揭示卡琳娜指向的具体对象”“不提前暴露卡琳娜与康纳或卡尔的深层关系”；见 `turn-57/04-output.json plotPoint`。
- `contradicted`: Narrator 正文使用“对他说过/他对我/他那种人”；见 `turn-57/04-output.json narrative`。
- `contradicted`: Choice 输出“『他』——是卡尔吗？”；见 `turn-57/04-output.json choices`。

Competing pressures: 悬疑保密要求强；候选对象同时包含康纳与卡尔；中文“某个人/那个人”容易被模型默认男性化；Choice generator 以本轮正文为最终依据复用“他”。

## Causal Chain
firstDivergenceArtifact: `turn-57/06-llm-calls.json` call 1 / `turn-57/04-output.json` narrative。

Director 的保密目标合理，但 handoff 只说“不点名/保持模糊”，没有说明隐藏对象应使用什么表面称谓。Narrator 因此把“那个人”默认男性化为“他”。Choice generator 又以正文为依据，在选项中写出“『他』——是卡尔吗？”，把错误代词与已知女性代词实体显式绑定。

Propagation: 错误从正文传播到同轮选项。第 58 轮没有继续使用“他”，第 59 轮确认对象为卡尔并恢复“她”，使第 57 轮的漂移被后续可见文本坐实。

Non-causes: 不是卡尔称谓事实缺失；不是单纯 Choice 问题；不是隐藏信息倒推。

## Root Cause
rootCause.label: hidden-referent-pronoun-contract

family: agent-system

secondaryFamilies: recent-context

根因机制：秘密边界要求隐藏对象，Director handoff 只规定“不揭示具体对象”，但没有提供 `referentPronounPolicy` 或 `allowedSurfaceRefs`；在候选包含卡尔这种已知女性代词实体时，Narrator 默认用“他”，Choice 又复用并绑定到卡尔，造成玩家可见称谓连续性漂移。

## Evidence
- Player-visible: `visible-timeline.jsonl` turn 44、46、57、59。
- Internal trace: `turn-57/06b-narrator-prompt.md` lines around Director output 要求“不揭示具体对象/康纳或卡尔”；`turn-57/03-story-state.json` 角色卡写卡尔为“黑色短毛母猫”；`turn-57/06-llm-calls.json` call 1 生成“他”；`turn-57/04-output.json choices` 生成“『他』——是卡尔吗？”。

## Recommended Fix Area
为 hidden referent 增加 handoff contract：Director 输出称谓策略，Narrator 只能使用允许的表面称谓，Choice 对选项中的代词与已知 entity pronoun 做一致性检查。

## Confidence
high
