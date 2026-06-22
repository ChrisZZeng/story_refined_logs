# Issue 004 Turn 9 Root Cause Report

## Problem

Turn 8 已经写过帕兹“咬口腔内侧的软肉”，用疼痛打断闪回并重新看清三名黑帮。Turn 9 开头又几乎原句写了一遍同一动作，使即时场景像回退了一小步。

## Validity

`issueValidity`: `valid`

玩家可见证据成立。Turn 8 末尾写：“你用力咬了一下口腔内侧的软肉，疼痛像一根针，把那个画面扎破了。你重新看清了眼前的三个人。”Turn 9 开头又写：“你用力咬了一下口腔内侧的软肉——疼痛像一根针，把那个画面扎破了。”这不是单纯承接“平复呼吸”，而是重复了上一轮已经完成的具体恢复动作。

保留 caveat：玩家输入“平复呼吸”确实需要继续表现身体恢复；问题只在于重演了已完成动作，而不是写恢复本身。

## Context Assessment

问题前玩家实际看到的状态是：三名黑帮逼近，帕兹闪回战场，随后已经通过咬口腔内侧让画面破裂，并重新看清眼前三个人。Turn 9 应该从这个状态之后继续，让帕兹平复呼吸、假装示弱、观察对方反应。

相关事实：

- `present-clear`: 咬口腔内侧、打断闪回、重新看清三人已经在 Turn 8 完成。证据在 `visible-timeline.jsonl`、`turn-08/04-output.json` 和 `turn-09/06b-narrator-prompt.md`。
- `present-clear`: Turn 9 的玩家意图是平复呼吸、假装示弱、观察反应。证据在 `turn-09/06a-director-prompt.md` 和 `turn-09/06b-narrator-prompt.md`。
- `present-clear`: Director 没有要求重复“咬口腔内侧”。证据在 `turn-09/06b-narrator-prompt.md` 第 404-423 行和 `turn-09/07-events.json`。
- `absent`: Narrator handoff 没有 continuation cursor，也没有标记上一轮尾部动作已经 consumed。

竞争压力是：玩家输入“平复呼吸”与 Turn 8 的应激尾句紧密相关，recentTurns 又把那段尾句完整放在 prompt 里，使它成为高显著的开场桥。

## Causal Chain

最早偏离出现在 `turn-09/04-output.json` 的 Narrator 输出。Director 输出只要求示弱台词和黑帮错愕，没有要求重复上一轮动作。Narrator 却把 Turn 8 尾句作为 Turn 9 第一帧重演。

缺失的防线是续写边界。系统没有告诉 Narrator：“从已经咬痛自己并重新看清三人之后开始”。一般的“顺着已有内容推进”不足以防止模型把上一轮尾句复述成过渡。

机制说明：recent visible tail 被完整放入 Narrator 上下文，但 handoff 缺少已消费动作边界，模型用上一轮尾句作为本轮恢复动作的桥，导致同一即时动作几乎原句重演。

非主因：

- 不是 fixed beat 要求重复；固定台词和 Director requiredContent 都没有这句。
- 不是 recent context 缺失；恰恰是 recent tail 存在但没有被标记为已完成。

## Root Cause

`rootCause.label`: `continuation-boundary`

`family`: `agent-system`

`secondaryFamilies`: `recent-context`

根因是 Narrator handoff 缺少明确的 continuation cursor / alreadyDone 边界。模型收到了完整上一轮尾段和“平复呼吸”的玩家意图，却没有收到“这一步已经发生，只能写后续”的硬约束。

## Evidence

玩家可见证据：Turn 8 和 Turn 9 连续出现几乎相同的“咬口腔内侧”“疼痛像一根针，把那个画面扎破了”。

内部链路证据：`turn-09/06b-narrator-prompt.md` 第 335-365 行包含 Turn 8 尾段；第 404-423 行的 Director 输出没有重复动作，只要求示弱台词和黑帮错愕；`turn-09/07-events.json` 显示重复来自 Narrator 首帧。

## Recommended Fix Area

在 Narrator handoff 中加入 `continuationCursor` 或 `alreadyDone` 列表。即时连续场景中，Director 应显式说明 start-after 状态；生成后用上一轮尾句与本轮首句做近重复校验。

## Confidence

`high`
