# Batch 013 Summary

- 运行目录：`/Users/wanghaha/code/oreturn-owlet-hybrid-dual-layer-memory/tmp/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200`
- 玩家可见时间线：`consistency-review/visible-timeline.jsonl`
- 窗口范围：111-130
- 重点评估范围：121-130
- 审阅轮数：10
- issue 数：6
- 首个不一致轮次：123
- 不一致轮次：123, 125, 128, 129, 130
- uncertain 轮次：无

## 主要发现

1. turn 123 和 turn 125 的选项把 Nikon FM2 胶片相机写成可直接翻看照片的设备，和此前“Tri-X/HP5 胶卷”及 turn 120 的银盐成像描述冲突。
2. turn 128 的正文在装有胶卷的 FM2 上按快门、打开后背并仍声称计数只到两次，把胶片相机状态处理成了不符合已建立设定的可检查设备。
3. turn 128 将备用胶卷从“三卷 Tri-X + 一盒 HP5”无承接地改成“五卷”单独密封胶卷。
4. turn 129 将一直贴胸口、此前反复写成温热的银色铃铛改成“冰凉”的触感。
5. turn 130 在玩家已经于 turn 129 站到门外台阶后，又从屋内握门把、开门、迈出门槛，形成空间位置回退。

## Scope 覆盖

- `visibleText`：4 条
- `choices`：2 条
- `preLlmEvents`：0 条；121-130 均为空
- `mixed`：0 条

