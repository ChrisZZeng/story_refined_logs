# issue-31-turn-68 Root Cause Report

## Problem
- issueIndex: `31`
- turn: `68`
- issueValidity: `valid`
- summary: 第68轮写卡尔“姿态和你离开时几乎一样”仍趴在靠垫上，但玩家离开小屋时的可见状态是卡尔在卡琳娜怀里；卡尔回到靠垫是在玩家离开后的等待期间才发生。

## Validity
问题成立但轻微。turn-65 明确玩家离开前卡琳娜抱着卡尔，卡尔从怀里探头；turn-67 才写玩家听到猫落地并看到“卡尔已经回到了靠垫上”。turn-68 的“和你离开时几乎一样”把当前靠垫姿态错误回写到离开时。

玩家可见证据：turn-65: “卡琳娜还抱着卡尔”“卡尔从卡琳娜怀里探出头来”；turn-67: “像猫从高处跳落到地板上”“卡尔已经回到了靠垫上”；turn-68: “卡尔还趴在那里，姿态和你离开时几乎一样”。

Caveats:
- turn-67 已经把卡尔放回靠垫，所以 turn-68 的当前姿态本身合理；错误集中在“离开时几乎一样”这个时间比较。

## Context Assessment
问题发生前状态：玩家在 turn-65 借故离开，把卡琳娜和卡尔留在屋内；当时卡尔在卡琳娜怀里。turn-67 等待后，玩家回到门前，听到猫落地，推门看到卡尔已经回到靠垫。turn-68 玩家走近查看卡尔状态。

Relevant facts:
- `present-clear` 玩家离开屋内时，卡尔在卡琳娜怀里而不是靠垫上。 artifacts: `visible-timeline.jsonl:turn-65`, `turn-68/06a-director-prompt.md`, `turn-68/06b-narrator-prompt.md`；该事实出现在最近几轮玩家经历中，虽然不是最后一轮。
- `present-clear` 玩家回来前，卡尔已经回到靠垫上。 artifacts: `visible-timeline.jsonl:turn-67`, `turn-68/06a-director-prompt.md`；turn-67 明确写“卡尔已经回到了靠垫上”，因此 turn-68 观察靠垫姿态是合理的。
- `present-clear` 本轮任务只需要观察卡尔当前状态，不需要比较离开时姿态。 artifacts: `turn-68/06-llm-calls.json call[0]`, `turn-68/04-output.json`；Director requiredContent 是描写卡尔状态细节；没有要求“和离开时一样”的时间比较。
- `absent` 结构化 curStates 没有保存卡尔具体姿态/位置随时间的状态槽。 artifacts: `turn-68/03-story-state.json`, `turn-68/05-runtime-after.json`；卡尔的姿态只能从最近正文长段中恢复，缺少显式 currentScene / lastSeenPose anchor。
- `present-ambiguous` turn-67 中有“想象着那只黑色母猫的尾巴在垫子边缘轻轻摆动”的心理画面。 artifacts: `turn-68/06a-director-prompt.md`；这是玩家想象，不是离开时事实，但容易与随后“卡尔已经回到了靠垫上”合并成连续姿态。

Competing pressures:
- Director actionHint 写“在靠垫上保持放松姿态”
- 最近一轮 turn-67 的当前状态确实是靠垫
- turn-65 的怀抱状态被夹在较长 prose 中
- Narrator 常用“还/和之前一样”制造温馨连续感

## Causal Chain
- firstDivergenceArtifact: `turn-68/06-llm-calls.json call[1] (Narrator streamText)，同内容进入 turn-68/04-output.json。`
- triggeringPressure: 本轮 Director 要求观察卡尔当前状态，并提示卡尔在靠垫上保持放松；最近 turn-67 也说卡尔已经回到靠垫上，使“还趴在那里”很自然。
- missingGuard: 系统没有显式区分“玩家离开时的最后可见姿态”和“玩家回来前/回来时的当前姿态”；也没有约束 Narrator 在使用“和你离开时一样”这类 temporal comparative 前必须核对对应时间点。
- mechanismStatement: 靠垫姿态作为当前事实被强 foreground，但离开时怀抱姿态只埋在较早 prose 中且没有结构化 pose anchor，Narrator 为连续感添加时间比较时优先采用当前姿态，导致离开时状态被错误重写。
- directCause: Narrator 在合理描写当前靠垫姿态时，额外生成了未受支持的“姿态和你离开时几乎一样”。
- propagation: 错误是 turn-68 的可见文本轻微连续性瑕疵；后续 turn-69/70 从卡尔在靠垫上的当前状态继续，未继续强调错误的离开时姿态。

Non-causes:
- 不是当前场景位置错误：卡尔回到靠垫在 turn-67 已经可见。
- 不是长期 detail-memory 缺失：需要的 turn-65/67 信息都在 recentTurns 中。
- 不是 Choice 绑定错误：玩家选择“看看卡尔状态”被正确执行。

## Root Cause
- label: `context-priority`
- family: `recent-context`
- secondaryFamilies: `agent-system`
- description: 最近上下文中同时存在“离开时在怀里”和“回来前已回靠垫”两个相邻姿态，但 prompt 没有把它们结构化为不同时间锚点；在 Director foreground 当前靠垫姿态后，Narrator 添加时间比较时没有被强制回查离开时事实，于是把当前状态错误投射回离开时。
- fixSurface: `current-scene entity pose/time-anchor schema`, `Narrator prompt 中对“仍然/还/和离开时一样”等连续性比较的核对规则`, `post-generation consistency lint：比较词涉及上一离场/入场时间点时回查最近 visibleText`

## Evidence
- playerVisible: turn-65 离开时卡尔在卡琳娜怀里；turn-67 等待后才回靠垫；turn-68 把靠垫姿态称作和离开时几乎一样。
- internalTrace: turn-68 Director 只要求观察当前状态，characterBeats 将卡尔 foreground 为靠垫上放松；Narrator 首次加入“和你离开时几乎一样”的时间比较。

## Recommended Fix Area
为当前场景中的角色姿态增加 lastSeenPose/atPlayerExit/currentPose 区分，并在 Narrator 生成时间比较短语时执行显式回查。

## Confidence
`high`
