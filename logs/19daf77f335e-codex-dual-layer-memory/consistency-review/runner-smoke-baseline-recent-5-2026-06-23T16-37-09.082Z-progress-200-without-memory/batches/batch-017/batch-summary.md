# Batch 017 Summary

- 运行目录：`/Users/wanghaha/code/oreturn-owlet-hybrid-dual-layer-memory/tmp/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200`
- 玩家可见时间线：`/Users/wanghaha/code/oreturn-owlet-hybrid-dual-layer-memory/tmp/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200/consistency-review/visible-timeline.jsonl`
- 窗口范围：151-170
- 重点评估范围：161-170
- 已评估 turn 数：10
- 问题数：5
- 不一致 turn 数：5
- 首个不一致 turn：161
- 不确定 turn 数：0

## 问题概览

1. Turn 161，`choices`，`fact-conflict`，low：胶卷相机选项允许“检查刚拍照片是否满意”，与胶卷相机和银盐显影规则冲突。
2. Turn 162，`mixed`，`space-time-break`，medium：玩家原本已在屋内窗边/门边等待，却被选项和正文无承接地写成“回到屋里”“推开木门，跨进屋内”。
3. Turn 163，`visibleText`，`fact-conflict`，medium：银铃铛从此前轻摇会响、还影响窗雾，变成无论怎么动作都不会响，缺少可见解释。
4. Turn 166，`visibleText`，`fact-conflict`，low：相机上一轮在胸前/膝头，本轮检查包时无承接地变为在相机包最上层。
5. Turn 167，`visibleText`，`space-time-break`，low：晨光位置从已经越过灰烬槽、爬向炉口上缘，回退为再次从窗沿向壁炉并停在灰烬槽边缘。

## 备注

- 151-160 仅作为上下文和冲突证据使用，未计入本批次统计。
- 161-170 的 `preLlmEvents` 均为空，未发现该 scope 的问题。
