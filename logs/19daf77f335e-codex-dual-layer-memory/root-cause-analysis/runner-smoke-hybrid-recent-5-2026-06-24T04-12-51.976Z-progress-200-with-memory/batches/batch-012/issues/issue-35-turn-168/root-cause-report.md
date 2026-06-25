# issue-35-turn-168 root cause report

## Problem

- `issueIndex`: 35
- `turn`: 168
- `type`: `quality-regression`
- `scope`: `visibleText`
- `severity`: `low`
- 玩家可见问题：turn 168 的正文第二段在“像是已经把该说的话都留在了那间暖光”处直接结束，下一段转入“她的脚步声在旧砖墙之间轻轻碰撞”，导致句子语义没有闭合。

## Validity

`issueValidity`: `valid`

玩家可见证据足够确认问题成立：`visible-timeline.jsonl` 的 turn 168 可见正文中，第二段以“那间暖光”结尾，既没有补足处所词，也没有完成“留在……”的宾语结构；紧接着下一句改写脚步声，不能自然承接这个未完成的短语。该问题不依赖隐藏状态或剧本信息判断，属于玩家阅读时可以直接看到的残句/断句问题。

限制与 caveats：这是低严重度的表层质量退化，不改变剧情事实、角色关系或后续选择；无法从日志确定模型原本想补的具体词组，但可以确定当前玩家可见文本未闭合。

## Context Assessment

问题发生前，玩家实际看到的状态是：turn 166 卡琳娜确认“今晚没有其他安排了”“回去休息吧”；turn 167 玩家点头起身，卡琳娜开门并说“跟上”，玩家跟着她走入夜色；turn 168 玩家选择“跟上她的步伐，沉默地走着”。本轮应是从室内到旧砖墙窄巷、再到铁门前的安静过渡。

相关事实与约束：

| claim | availability | artifacts | notes |
| --- | --- | --- | --- |
| 玩家本轮选择是沉默跟随，不主动开口 | `present-clear` | `turn-168/01-summary.json`, `visible-timeline.jsonl` | 玩家输入明确为“跟上她的步伐，沉默地走着”。 |
| 导演安排要求本轮是纯过渡，描写步行、脚步声、夜风、远处庆典声，并到达铁门前 | `present-clear` | `turn-168/06b-narrator-prompt.md:1142`, `turn-168/06b-narrator-prompt.md:1168`, `turn-168/06b-narrator-prompt.md:1169` | 导演骨架清楚，没有要求复杂推理或信息揭露。 |
| 本轮约束“本轮纯过渡，无对话，无信息揭露” | `present-clear` | `turn-168/06b-narrator-prompt.md:1175` | 约束指向低复杂度、氛围型叙述。 |
| v3-html 协议要求文本放进 `<p>` 帧，长段落可拆分 | `present-clear` | `turn-168/06b-narrator-prompt.md:1204`, `turn-168/06b-narrator-prompt.md:1221` | 这是格式/解析约束，不等同于语义完整性检查。 |
| 语义句子闭合或残句检测 | `absent` | `turn-168/06b-narrator-prompt.md` | prompt 没有要求输出后自检每个 `<p>` 是否在语义上完整，也没有后处理修复痕迹。 |
| 近期文风中频繁使用“暖光”、长比喻、破折号式节奏 | `present-buried` | `turn-168/06b-narrator-prompt.md` 的最近几轮玩家经历 | 这是风格压力：鼓励慢铺、感官细节和长句，但不是残句的充分原因。 |

Competing pressures：慢铺与感官细节优先、近期反复出现的“暖光”意象、v3-html 分帧要求、纯过渡场景的低事件密度。它们共同增加了长句和诗性比喻的生成压力，但没有要求或合理化残句。

## Causal Chain

- L0 `symptom`：玩家可见正文出现“像是已经把该说的话都留在了那间暖光”这一未闭合短语，阅读时像缺少“里/之中/笼罩的房间里”等收尾。
- L1 `divergence`：最早偏离出现在 `turn-168/07-events.json:2755` 的 `worker-done` / `narrator` 输出；同一残句随后进入 `turn-168/04-output.json:2`、`normalizedContent.visibleText` 和 `visible-timeline.jsonl:168`。
- L2 `direct cause`：Narrator 在长句中生成了“像是已经把该说的话都留在了那间暖光”后直接闭合 `</p>`，把一个仍需处所补足的比喻当成了可结束的段落；因为 HTML 标签完整，后续标准化和选项生成没有把它视为异常。
- L3 `root mechanism`：`model-local-sentence-closure-slip`。在上下文与导演契约清楚的情况下，本地叙述生成的表层实现没有稳定保持中文句法/语义闭合；流水线只强约束 v3-html 结构，没有语义残句检测或自动 repair，因此局部闭合失败直接传播到玩家可见文本。

Propagation：

1. `director` 输出清楚安排了“沉默跟随、旧砖墙窄巷、到达铁门”的过渡，没有产生残句。
2. `narrator` 的流式正文首次写出残句，并且在该段后继续生成后续段落，说明不是最终输出末尾截断，而是段内局部漏补/误闭合。
3. `04-output.json` 将该正文写入 `narrative`、`rawHtml`、`visibleText`。
4. `choiceGenerator` 基于已经包含残句的正文生成选项，但没有修复可见正文；`visible-timeline.jsonl` 记录了同一残句。
5. 后续 turn 169 没有把残句作为剧情事实延续；传播范围主要是 turn 168 的玩家可见阅读质量。

Non-causes：

- 不是 `Director` 的剧情安排错误：导演安排与玩家选择一致，且没有要求未完成句。
- 不是 `choice-action-binding`：玩家选择“沉默跟随”被保留。
- 不是 `memory-persistence` 或 `context-priority`：该问题不依赖任何缺失事实或跨轮记忆。
- 不是输出尾部截断：残句之后还有多个完整段落、卡琳娜台词和结尾描述。

## Root Cause

```json
{
  "label": "model-local-sentence-closure-slip",
  "family": "llm-self",
  "secondaryFamilies": ["agent-system"],
  "description": "在慢铺、感官细节优先和近期‘暖光’意象反复出现的风格压力下，Narrator 把一个仍需补足处所的中文比喻短语直接闭合成 `<p>` 段落；系统只校验/要求 v3-html 结构，没有语义残句检测或 repair，导致局部表层生成失误直接进入玩家可见正文。",
  "fixSurface": [
    "Narrator post-generation semantic linter",
    "visibleText sentence-closure repair pass",
    "v3-html paragraph-level quality gate"
  ]
}
```

## Evidence

玩家可见证据：

- `logs/19daf77f335e-codex-dual-layer-memory/consistency-review/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/visible-timeline.jsonl:168`：turn 168 的 `visibleText` 中，“像是已经把该说的话都留在了那间暖光”后直接换到“她的脚步声……”。
- `logs/19daf77f335e-codex-dual-layer-memory/consistency-review/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/issues.json:799`：评测器指出同一句在玩家可见文本里断在半截。

内部链路证据：

- `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-168/07-events.json:10`：`director` 完成的 `plotPoint` 是沉默跟随与过渡。
- `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-168/06b-narrator-prompt.md:1142`：传给 Narrator 的导演结果明确本轮摘要、角色行动和约束。
- `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-168/06b-narrator-prompt.md:1221`：v3-html 解析规则强调 `<p>` 包裹和标签结构，但未要求语义残句自检。
- `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-168/07-events.json:2755`：`narrator` 的最终 worker 输出已经包含该残句。
- `logs/19daf77f335e-codex-dual-layer-memory/run_logs/runner-smoke-hybrid-recent-5-2026-06-24T04-12-51.976Z-progress-200-with-memory/turn-168/04-output.json:2`：同一残句进入最终 `narrative`。

## Recommended Fix Area

优先增加可见正文提交前的 paragraph-level 质量门：对 `narrator` 输出先从 v3-html 提取 `visibleText`，检测明显的中文未闭合结构（如段尾停在“在/把/向/像是/那间暖光”等未完成介宾或宾语短语、段尾无标点且下一段换话题），命中后触发轻量 repair 或要求 Narrator 重写对应段落。该修复比改剧情提示更直接，因为本 issue 的上下文与导演契约已经清楚，缺的是表层文本闭合保障。

## Confidence

`confidence`: `high`

证据链从玩家可见文本、Narrator 原始输出到最终 `04-output.json` 完全一致；同时可排除剧情规划、选择绑定、记忆缺失和尾部截断。唯一不确定的是模型原本意图补出的具体词语，但不影响 root mechanism 判断。
