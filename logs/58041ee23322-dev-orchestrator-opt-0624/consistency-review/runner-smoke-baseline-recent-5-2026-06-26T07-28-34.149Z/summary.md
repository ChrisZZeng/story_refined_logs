# 一致性评测汇总

本次评测只跑一次 coordinator 和 batch reviewer。批次审阅会标注每条 issue 的 scope，聚合层再同时生成两种报告。

- 运行目录：/Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/58041ee23322-dev-orchestrator-opt-0624/run_logs/runner-smoke-baseline-recent-5-2026-06-26T07-28-34.149Z
- 总轮数：50
- 批次数：5

## visibleText 正文报告

- 第一次出现问题的轮次：4
- 出现问题的轮次数：15
- 问题总数：20
- 不确定问题轮次数：0
- 问题轮次：4, 5, 9, 10, 12, 13, 20, 21, 25, 26, 28, 31, 37, 43, 47

## fullTurn 完整玩家体验报告

- 第一次出现问题的轮次：4
- 出现问题的轮次数：19
- 问题总数：25
- 问题 scope 分布：{"visibleText":20,"choices":4,"mixed":1}
- 不确定问题轮次数：0
- 问题轮次：4, 5, 9, 10, 12, 13, 20, 21, 24, 25, 26, 28, 31, 36, 37, 42, 43, 45, 47
