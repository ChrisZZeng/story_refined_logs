# Root Cause Report: issue-57-turn-131

## Problem
- issueIndex: 57
- turn: 131
- problemSummary: 门口石板在 turn 130 和 turn 131 开头被写成干透、没有水汽，但 turn 131 末尾又写成晨露微湿并留下足迹。

## Validity
- issueValidity: valid
- verdictReason: 该问题成立。玩家可见文本在同一连续场景中给出了互斥的石板表面状态：先确认没有水汽，随后又需要微湿表面来承载足迹。
- playerVisibleSupport: turn 130 写“昨夜雨水的痕迹已经彻底干透”；turn 131 开头写“干燥的石面和鞋底之间没有水汽”；turn 131 末尾写“足迹还浅浅地留在晨露微湿的石面上”。
- caveats:
  - 冲突只影响局部环境细节，不改变主线行动；如果解释为不同石板区域，文本本身没有给出这种区分。

## Context Assessment
- actualStateBeforeIssue: 主角已经站在卡尔小屋门外，门已锁好，石板路在晨光下被明确写成干透，只剩颜色较深的旧雨痕；本轮玩家只是想在门口附近走几步活动腿脚并继续等待。
- relevantFacts:
  - claim: 门口石板路面当前是干燥的，没有水汽。
    availability: present-clear
    artifacts: visible-timeline.jsonl, turn-131/06b-narrator-prompt.md, turn-131/04-output.json
    notes: turn 130 是最近一轮可见事实；turn 131 输出内部也先写“干燥的石面和鞋底之间没有水汽”。
  - claim: 旧雨只留下深色印迹，不等于可留下湿足迹的表面水分。
    availability: present-clear
    artifacts: turn-130/04-output.json, turn-131/06b-narrator-prompt.md
    notes: 近期上下文把雨后痕迹从潮湿水痕逐步更新为干透后的颜色痕迹。
  - claim: Prompt 中仍保留较早的潮湿氛围和“潮湿石板路的土腥味”等环境描写。
    availability: contradicted
    artifacts: turn-131/06b-narrator-prompt.md, turn-131/03-story-state.json
    notes: 这些是氛围或旧状态，和最新干燥事实并列出现，容易拉动感官描写。
  - claim: 当前场景没有结构化 surfaceState 锚点来声明“路面干燥”。
    availability: absent
    artifacts: turn-131/03-story-state.json, turn-131/06b-narrator-prompt.md
    notes: 干燥事实只在长段 recentTurns prose 中出现；Director 输出没有把它转成 Narrator 必须遵守的约束。
- competingPressures:
  - Narrator 需要慢铺感官细节
  - 早晨/旧雨/潮湿气味的氛围词仍在上下文中
  - Director 只要求走动和确认安静，没有约束石板湿度
  - 通用一致性规则存在但不指向本轮物理状态

## Causal Chain
- firstDivergenceArtifact: turn-131/04-output.json narrative（同样可见于 turn-131/06-llm-calls.json narrator text）
- triggeringPressure: Narrator prompt 中较早的湿痕、潮湿气味、晨光感官描写与“走路后留下足迹”的常见细节模板并存，且本轮要求慢铺环境细节。
- missingGuard: 没有显式 current-scene surfaceState 或 hard constraint 告诉 Narrator：门口石板已干，不能写晨露微湿、湿足迹；通用“优先相信最近几轮”规则没有被转成可执行检查。
- mechanismStatement: 在感官细节生成时，旧雨/晨露氛围被当成可用物理状态，而最新“干燥无水汽”只埋在长 recent prose 中，缺少 surfaceState 优先级锚点，导致 Narrator 同轮先写干燥再写湿足迹。
- directCause: Narrator 在补充足迹细节时无依据地把石面恢复为“晨露微湿”。
- propagation: 错误直接进入 turnContent 和 visibleText；后续 turn 132 又继承了“晨露微湿的石面”足迹表述，加重局部状态混乱。
- nonCauses:
  - Director 没有直接要求写湿足迹
  - 不是长程 meta-memory 遗忘，冲突事实就在最近上下文内
  - 不是隐藏设定导致的差异

## Root Cause
- label: context-priority
- family: agent-system
- secondaryFamilies: recent-context
- description: 当前物理状态只作为长篇 recentTurns 文本存在，而较早潮湿氛围和感官写作压力同样保留；系统缺少 surfaceState 优先级锚点和同轮物理冲突校验，使 Narrator 可以把已干的石板重新写成晨露微湿。
- fixSurface:
  - Narrator prompt context assembly
  - current scene physical-state schema
  - post-generation consistency check for local physical states

## Evidence
- playerVisible: turn 130/131 的玩家可见文本已经足以确认冲突：干透、没有水汽 vs 晨露微湿并留下足迹。
- internalTrace: turn-131 Director 只要求门口走动和确认安静；turn-131 Narrator prompt 同时包含最新干燥事实和旧潮湿氛围；错误首次出现在 Narrator 输出。

## Recommended Fix Area
给当前场景加入结构化 surfaceState/currentPhysicalFacts，并在 Narrator 前后检查同一物体或表面状态是否被互斥改写。

## Confidence
medium
