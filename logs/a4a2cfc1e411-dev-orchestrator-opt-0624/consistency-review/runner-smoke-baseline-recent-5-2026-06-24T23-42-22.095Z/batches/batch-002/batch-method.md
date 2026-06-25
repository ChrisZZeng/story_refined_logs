# Batch 002 Review Method

本批次使用 `/Users/ethan/Documents/workspace/Novel/code/story_refined_logs/skills/consistency_evaluator/skills/batch_reviewer/SKILL.md` 和其中的 `references/review_guidelines.md` 作为规则来源。

读取方式：

1. 确认运行目录、玩家可见时间线、窗口范围、重点评估范围和输出目录。
2. 只读取 `visible-timeline.jsonl` 的 1-20 行，逐轮查看 `playerInput`、`preLlmEvents`、`visibleText` 和 `choices`。
3. 只把 11-20 中首次出现或继续造成玩家可见影响的问题计入本批次。
4. 1-10 仅作为冲突证据使用，尤其用于核对暗街入口冲突、相机状态、小贩身份和时间流逝。
5. 使用针对性搜索回查窗口内关键词，例如 `相机包`、`小贩`、`narrator`、`签收单` 和 `我脸`。没有通读完整运行正文。

判定原则：

- 只使用玩家可见证据，包括玩家输入、生成前事件、正文和选项。
- 合理新增细节不计为问题；否定或改写此前玩家可见事实时才计入。
- 同一问题在后续 turn 重复出现时，只在首次形成问题的位置计一条。
