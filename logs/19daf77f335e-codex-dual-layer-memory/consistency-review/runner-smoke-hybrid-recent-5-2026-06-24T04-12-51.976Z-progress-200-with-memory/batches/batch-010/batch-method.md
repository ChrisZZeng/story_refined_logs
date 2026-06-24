# Batch 010 审阅方法

- 使用 skill：`/Users/wqy/Code/story_refined_logs/skills/consistency_evaluator/skills/batch_reviewer/SKILL.md`
- 运行目录：`/Users/wqy/Code/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory`
- 玩家可见时间线：`/Users/wqy/Code/story_refined_logs/logs/19daf77f335e-codex-dual-layer-memory/consistency-review/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/visible-timeline.jsonl`
- 窗口范围：81-100
- 重点评估范围：91-100

## 读取方式

1. 读取 skill 主说明和 `references/review_guidelines.md`，确认只用玩家可见证据。
2. 从 `visible-timeline.jsonl` 抽取第 81-100 行，逐轮审阅 `playerInput`、`preLlmEvents`、`visibleText` 和 `choices`。
3. 确认 81-100 窗口内所有 `preLlmEvents` 均为空数组。
4. 对疑似长程连续性问题，只用玩家可见时间线做关键词回查；未通读完整运行正文，未使用隐藏状态、剧本私有字段或未来 turn 作为冲突证据。
5. 81-90 只作为上下文和冲突证据；问题统计只包含 91-100。

## 判定口径

- 明确重复已经完成的对话或场景，按 `repeated-scene` 计。
- 只因玩家选择“继续沉默/继续坐着”而自然延长氛围，不单独计为问题；但若后续正文几乎逐段复刻上一轮并重复同一事件，则计为问题。
- 存在合理隐喻解释的轻微张力不计入 issue，也不计入 uncertain。
