# Root Cause Report: issue-20-turn-28

## Problem
turn 27 写卡琳娜把手从口袋里抽出来并交叉抱在胸前；turn 28 开头又写她双手插在棉衣口袋里，并说“她没有再从口袋里抽出手来”。该处有轻微姿态桥接风险。

## Validity
issueValidity: `questionable`

该 issue 不足以判定为硬性矛盾。支持风险的玩家可见证据是：turn 27 明确写“她把手从口袋里抽出来，交叉抱在胸前”，turn 28 又写“双手插在棉衣口袋里”和“没有再从口袋里抽出手来”。但人物在回合间或开口前把手重新插回口袋是合理小动作；“没有再”更自然地可读作从 turn 28 当前口袋姿态开始没有再次抽手，而不是否认 turn 27 曾经抽过手。评测摘要把它概括成 “never took her hands out” 有语义范围扩大的风险。

## Context Assessment
- `present-clear`: turn 27 的最后明确姿态是从口袋抽手、交叉抱臂；该句也出现在 `turn-28/06b-narrator-prompt.md` 的最近几轮玩家经历中。
- `present-clear`: turn 28 当前输出写成双手插在口袋里。
- `present-ambiguous`: 两轮之间存在玩家输入和新的回应节奏，可能发生未逐字描写的小动作。
- `present-ambiguous`: “没有再”可以限定在当前 turn 的动作链内，不必跨回合否认 turn 27。

Competing pressures: turn 26 已使用“手插口袋”的姿态 motif；turn 27 的 pose 信息在 raw recent text 中清楚存在但不是结构化 pose state；叙事压缩常省略微小动作桥接；评测器可能把桥接不足当成事实冲突。

## Causal Chain
若只看生成链路，turn 28 Narrator 在 `turn-28/06-llm-calls.json` call-2 复用了“手插口袋”姿态，并省略了“重新插回口袋”的桥接。若看评测链路，第一处真正不可靠的 artifact 是 evaluator 对 turn 28 文本的解释：它把“没有再”扩大为跨回合的“从未抽手”。

由于玩家可见证据允许合理解释，本报告不对该 issue 做 valid rootCause 分类。该问题最多说明姿态 bridge 可改进，而不是已确认的系统一致性失败。

## Root Cause
无。`issueValidity=questionable`，不分类 `rootCause.label` 或 `family`。

## Evidence
- Player-visible: turn 27 明确手从口袋抽出并抱臂；turn 28 写手在口袋里、没有再抽出。该对照显示桥接不足，但不排除隐含的重新插手动作。
- Internal trace: `turn-28/06b-narrator-prompt.md` 已包含 turn 27 姿态；`turn-28/06-llm-calls.json` call-2 生成了口袋姿态。内部证据只说明生成存在轻微省略，不足以把 issue 升级为 valid。

## Recommended Fix Area
优先改进 consistency evaluator 对中文“再/从未”语义范围和 minor pose bridge 的判定；可选地在 Narrator 前注入 recent pose state，要求角色姿态改变时补一个短动作桥。

## Confidence
`medium`
