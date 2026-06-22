# skills

本目录用于存放评估流程相关 skills。当前 `consistency_evaluator` 包含 coordinator 和 batch reviewer，用于读取 `logs/<branch+version>/run_logs/<run-id>` 中的文件化运行日志并生成一致性评测结果。`consistency_root_cause` 包含 coordinator 和 issue tracer，用于对一致性评测输出中的每条 issue 做根因分析并聚合机制分布。
