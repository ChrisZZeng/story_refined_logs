# 一致性评测汇总

本次评测只跑一次 coordinator 和 batch reviewer。批次审阅会标注每条 issue 的 scope，聚合层再同时生成两种报告。

- 运行目录：/Users/wqy/Code/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory
- 总轮数：200
- 批次数：20

## visibleText 正文报告

- 第一次出现问题的轮次：9
- 出现问题的轮次数：20
- 问题总数：22
- 不确定问题轮次数：0
- 问题轮次：9, 21, 25, 28, 31, 36, 45, 46, 50, 53, 54, 64, 65, 71, 72, 89, 90, 99, 120, 168

## fullTurn 完整玩家体验报告

- 第一次出现问题的轮次：5
- 出现问题的轮次数：33
- 问题总数：35
- 问题 scope 分布：{"choices":7,"visibleText":22,"mixed":6}
- 不确定问题轮次数：0
- 问题轮次：5, 9, 21, 24, 25, 28, 30, 31, 36, 45, 46, 47, 50, 53, 54, 56, 64, 65, 69, 70, 71, 72, 79, 80, 89, 90, 92, 99, 109, 110, 113, 120, 168
