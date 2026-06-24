# Batch 005 Summary

- Window: 31-50
- Evaluated turns: 41-50
- Evaluated turn count: 10
- Issue count: 3
- Inconsistent turns: 41, 45, 48
- First inconsistent turn: 41
- Uncertain turns: none
- `preLlmEvents`: all empty in this window

## Issues

1. Turn 41, `visibleText`, `fact-conflict`, medium: the dinner is described as “德索洛的宴会” and the narration imports “康纳派人来”, while earlier visible context identifies Connor as the dinner host and does not show Connor sending anyone for Karina.
2. Turn 45, `visibleText`, `fact-conflict`, low: Carl's habitual wording changes immediately after turn 44 from “你本来就没有变过。你只是需要记住它。” to an exclusive “你今天在想什么”.
3. Turn 48, `visibleText`, `space-time-break`, low: the same Carl-origin memory is described as both “第一次见面之后的第二天” and “就任申诉人的第一天”, after turns 46-47 place the first meeting on the first night and the “你坐得够稳了” line at daybreak.

No `choices` or `preLlmEvents` issue was strong enough to count in this batch.
