# 一致性评测汇总

本次评测只跑一次 coordinator 和 batch reviewer。批次审阅会标注每条 issue 的 scope，聚合层再同时生成两种报告。

- 运行目录：/Users/ethan/Documents/workspace/Novel/code/story_refined_logs/logs/08ced2b5a658-dev-orchestrator-opt-0624/run_logs/runner-smoke-baseline-recent-5-2026-06-25T15-11-25.586Z
- 总轮数：44
- 批次数：5

## visibleText 正文报告

- 第一次出现问题的轮次：6
- 出现问题的轮次数：15
- 问题总数：19
- 不确定问题轮次数：0
- 问题轮次：6, 7, 10, 12, 15, 16, 18, 22, 24, 34, 36, 37, 39, 42, 43

## fullTurn 完整玩家体验报告

- 第一次出现问题的轮次：6
- 出现问题的轮次数：17
- 问题总数：25
- 问题 scope 分布：{"visibleText":19,"mixed":4,"choices":2}
- 不确定问题轮次数：1
- 问题轮次：6, 7, 9, 10, 12, 15, 16, 18, 20, 22, 24, 34, 36, 37, 39, 42, 43
