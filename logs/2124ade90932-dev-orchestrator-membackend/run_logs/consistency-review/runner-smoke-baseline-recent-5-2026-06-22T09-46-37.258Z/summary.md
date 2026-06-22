# 一致性评测汇总

本次评测只跑一次 coordinator 和 batch reviewer。批次审阅会标注每条 issue 的 scope，聚合层再同时生成两种报告。

- 运行目录：/home/chris/Project_Intern/1_memorax/1_story_memory/workspace/1_evaluation_suite/story_refined_logs/logs/2124ade90932-dev-orchestrator-membackend/run_logs/runner-smoke-baseline-recent-5-2026-06-22T09-46-37.258Z
- 总轮数：50
- 批次数：5

## visibleText 正文报告

- 第一次出现问题的轮次：8
- 出现问题的轮次数：11
- 问题总数：14
- 不确定问题轮次数：0
- 问题轮次：8, 9, 13, 15, 16, 27, 36, 37, 42, 45, 49

## fullTurn 完整玩家体验报告

- 第一次出现问题的轮次：7
- 出现问题的轮次数：16
- 问题总数：21
- 问题 scope 分布：{"choices":3,"visibleText":14,"mixed":4}
- 不确定问题轮次数：0
- 问题轮次：7, 8, 9, 13, 15, 16, 27, 28, 36, 37, 41, 42, 45, 46, 48, 49
