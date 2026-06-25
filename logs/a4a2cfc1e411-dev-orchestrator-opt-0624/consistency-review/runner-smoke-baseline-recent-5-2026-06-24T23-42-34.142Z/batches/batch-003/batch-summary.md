# Batch 003 Consistency Review

## Scope

- Run directory: `/Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/a4a2cfc1e411-dev-orchestrator-opt-0624/run_logs/runner-smoke-baseline-recent-5-2026-06-24T23-42-34.142Z`
- Timeline: `/Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/a4a2cfc1e411-dev-orchestrator-opt-0624/consistency-review/runner-smoke-baseline-recent-5-2026-06-24T23-42-34.142Z/visible-timeline.jsonl`
- Window range: 11-30
- Evaluated range: 21-30
- Reviewed player-visible fields: `visibleText`, `choices`, and `preLlmEvents`

Only issues whose current manifestation is in turns 21-30 were counted. Turns 11-20 and targeted keyword lookups in the visible timeline were used only as context or conflict evidence. I did not read the full run logs.

## Result

- Evaluated turns: 10
- Issue count: 9
- Inconsistent turns: 7
- First inconsistent turn: 21
- Uncertain turns: 0
- `preLlmEvents`: all evaluated turns had empty `preLlmEvents`, so no `preLlmEvents` issues were found.

## Issues

| Turn | Scope | Type | Severity | Summary |
|---:|---|---|---|---|
| 21 | visibleText | identity-drift | medium | 帕兹的回答被标成卡琳娜对帕兹发言。 |
| 22 | visibleText | identity-drift | medium | 帕兹的「认识。但我不想谈这个。」再次被标成卡琳娜发言。 |
| 23 | choices | unsupported-jump | medium | 选项突然建立帕兹腰间有一件“还在原位”的武器。 |
| 24 | choices | fact-conflict | medium | 运输线任务在选项中从凯旋门漂移成骷髅会。 |
| 27 | visibleText | fact-conflict | low | 地下室光源被写成从高窗方向渗来的台灯光。 |
| 27 | visibleText | space-time-break | low | 黑猫在高窗上，但尾尖被写成固定在地面上。 |
| 29 | choices | unsupported-jump | medium | 选项要求帕兹评价德索洛和卡琳娜未建立的家庭关系和多年疏远。 |
| 30 | mixed | unsupported-jump | medium | 未支撑的“家人”和“多年疏远”判断被玩家输入、正文和选项共同固定。 |
| 30 | visibleText | space-time-break | low | 黑猫从墙角无承接地回到高窗。 |

## Notes

The main pattern is not a single catastrophic break, but several local continuity slips: dialogue speaker labels, option text introducing unsupported player knowledge or equipment, and small spatial/object-state errors after the safehouse transition. The most player-impacting issues are the unsupported weapon option and the unsupported relationship framing around 德索洛 and 卡琳娜, because both can steer the player into choices based on facts they have not actually learned.
