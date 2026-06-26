# 一致性评测汇总

本次评测只跑一次 coordinator 和 batch reviewer。批次审阅会标注每条 issue 的 scope，聚合层再同时生成两种报告。

- 运行目录：/Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/58041ee23322-dev-orchestrator-opt-0624/run_logs/runner-smoke-baseline-recent-5-2026-06-26T07-28-39.161Z
- 总轮数：50
- 批次数：5

## visibleText 正文报告

- 第一次出现问题的轮次：9
- 出现问题的轮次数：12
- 问题总数：13
- 不确定问题轮次数：0
- 问题轮次：9, 10, 15, 19, 20, 21, 26, 36, 37, 40, 41, 50

## fullTurn 完整玩家体验报告

- 第一次出现问题的轮次：9
- 出现问题的轮次数：13
- 问题总数：16
- 问题 scope 分布：{"visibleText":13,"mixed":2,"choices":1}
- 不确定问题轮次数：0
- 问题轮次：9, 10, 15, 19, 20, 21, 26, 30, 36, 37, 40, 41, 50
