# Problem

issueIndex=14, turn=42, type=`fact-conflict`, scope=`visibleText`。玩家可见正文在同一轮内先让德索洛说明女儿被凯旋门欺骗、抵抗后被割舌，随后又让德索洛说“我女儿受伤是假的”，中间还出现“我再也不能唱歌了”的 pronoun drift。核心求助动机从真实伤害变成虚假伤害，破坏了玩家对事件性质的理解。

# Validity

`issueValidity`: `valid`。

只看玩家可见证据，turn 41 已经铺垫德索洛说“我女儿……他们把她——”。turn 42 前半段继续说“他们骗了她”“她信了”“她的舌头被割了”，这是清晰的女儿受害叙述；同一轮后半段却说“我女儿受伤是假的”，并接着说“但她是我的女儿。她什么都没做错”。这不是普通揭露或反转，因为文本没有给出“假伤是骗局的一部分”之类可理解桥接，反而同时保留真实受害与伤害为假的两套事实。

“我再也不能唱歌了”也有效。前一句主语是“她的舌头”，按上下文应是“她再也不能唱歌了”；可见文本主动提示“他说的是‘我’，不是‘她’”，但没有建立德索洛代入女儿声音的修辞规则，因此更像 pronoun 漂移。

# Context Assessment

问题发生前，玩家实际看到的是：帕兹已经在卡琳娜公寓内，卡琳娜站在门内控制门口，德索洛站在门外来求助。turn 41 可见正文将德索洛来意明确成“我女儿……他们把她——”，玩家选择的是“点明德索洛作为父亲的急迫与可怜，以及他疏远‘家人’的矛盾”。

相关事实：

- 德索洛来意是为女儿受害寻求公道：`present-clear`。证据见 `visible-timeline.jsonl` turn 41、turn 42，以及 `turn-42/06a-director-prompt.md` 中角色资料“德索洛为找出伤害女儿的凶手而来”。
- 女儿被欺骗、抵抗、舌头被割：`present-clear`。证据见 `turn-42/06a-director-prompt.md`、`turn-42/06b-narrator-prompt.md` 角色资料，以及 Director output 的 `requiredContent` “德索洛说出女儿被割舌等具体细节”。
- “他女儿受伤是假的”：`contradicted`。同一句来自德索洛角色资料的“在剧情中的作用”段落，位置靠近同一角色卡末尾，被表达为“卡琳娜对此的讽刺”，但与同卡前文、recent visible text、Director output 都冲突。
- 本轮必须完成“尊严换公道”交易：`present-clear`。证据见 `turn-42/03-story-state.json` currentStoryline 与 Director output。

竞争压力包括：角色卡中的冲突性作者注记、当前 storyline 要求完成固定交易、玩家输入要求点明父亲矛盾、Director 需要快速推进完整交易节点。

# Causal Chain

`firstDivergenceArtifact`: `turn-42/06b-narrator-prompt.md` 到 Narrator 输出，也就是 `turn-42/06-llm-calls.json[1].text`。

Director 输出本身没有要求“受伤是假的”。它把本轮安排为“德索洛详细描述女儿受害的经过”，并把 requiredContent 写成“德索洛说出女儿被割舌等具体细节”。偏离发生在 Narrator 执行时：Narrator prompt 同时包含 Director 的受害事实和角色卡末尾的冲突注记“卡琳娜对此的讽刺：‘他女儿受伤是假的。他真正想要的，是有人替他对付凯旋门。’”。该注记没有被标记为废弃、隐喻、作者评论或低优先级，也没有被 Director handoff 显式排除。

触发压力是：角色资料中相互冲突的两段事实被同等放入 prompt，且“受伤是假的”是短句、引号化、靠近角色卡总结区，容易被当作可直接转写的剧情事实。

缺失防线是：prompt assembly 没有在角色卡、recent visible text、current storyline 和 Director output 之间做冲突仲裁；Narrator handoff 也没有把“女儿确实受害，不能写成假伤”作为 must-not constraint。

失败运动是：Narrator 先遵循 Director 写出割舌受害，再吸收角色卡末尾的冲突注记，把它错误转成德索洛本人承认“我女儿受伤是假的”，并把“她再也不能当歌手”漂成“我再也不能唱歌了”。错误被写入 `turn-42/04-output.json` visibleText 和 currentStoryline write，turn 43 又继续围绕“德索洛和他女儿的事情”展开。

非主因：

- 不是 evaluator 首次制造问题；可见文本本身冲突。
- 不是长期 memory 缺失；所需事实在同一 prompt 中存在。
- 不是单纯 Director 错误；Director output 对受害事实是清楚的，冲突压力来自 Narrator prompt 中未仲裁的角色资料。

# Root Cause

`rootCause.label`: `context-priority`。

`family`: `agent-system`。secondary family 为 `llm-self`，因为 Narrator 对 pronoun 的局部漂移放大了问题，但主因是系统把冲突上下文交给生成阶段而未提供优先级和禁止项。

L3 root mechanism：角色资料中的剧情真相、作者评价和当前可见事实没有分层；当角色卡末尾的短句与 recent visible text/Director requiredContent 冲突时，prompt 只给了泛化的“如有冲突，优先相信最近几轮正文和当前故事线约束”，没有把冲突检测成结构化约束，也没有在 handoff 中禁止 Narrator 复用冲突短句。于是模型在同一轮同时执行了两套互斥事实。

# Evidence

玩家可见证据：

- `visible-timeline.jsonl` turn 41：德索洛说“我女儿……他们把她——”。
- `visible-timeline.jsonl` turn 42：先写“她的舌头被割了”，又写“我女儿受伤是假的”。

内部链路证据：

- `turn-42/06a-director-prompt.md` 和 `turn-42/06b-narrator-prompt.md` 角色资料同时包含“她的舌头被割下来了！她再也不能当歌手了！”和“他女儿受伤是假的”。
- `turn-42/06-llm-calls.json[0].object.requiredContent` 要求“德索洛说出女儿被割舌等具体细节”。
- `turn-42/06-llm-calls.json[1].text` 首次输出“我再也不能唱歌了”和“我女儿受伤是假的”。
- `turn-42/04-output.json` 将该文本写入玩家可见正文。

# Recommended Fix Area

优先修复 `character-card/context assembly` 与 `Director -> Narrator handoff`。角色卡需要区分可见事实、作者注记、讽刺判断和待揭示真相；prompt assembly 应检测同一实体同一事件的互斥断言，并把 recent visible text + Director requiredContent 转成 Narrator 的显式 `mustKeep` / `mustNotContradict`。同时可以加一个生成后 validator，检查同轮内“严重伤害事实”和“受伤是假的”这类互斥命题。

# Confidence

`high`。
