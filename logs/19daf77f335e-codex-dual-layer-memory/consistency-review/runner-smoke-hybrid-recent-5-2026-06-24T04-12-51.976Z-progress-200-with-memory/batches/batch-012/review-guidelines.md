# Review Guidelines Used

This batch used the rules from:

`/Users/wqy/Code/story_refined_logs/skills/consistency_evaluator/skills/batch_reviewer/SKILL.md`

and:

`/Users/wqy/Code/story_refined_logs/skills/consistency_evaluator/skills/batch_reviewer/references/review_guidelines.md`

Key applied rules:

- Use only player-visible evidence: player input, pre-LLM visible events, generated visible text, and generated choices.
- Review complete visible turns, including `visibleText`, `choices`, and `preLlmEvents`.
- Count only issues visible in the evaluated range, turns 111-120.
- Use window context and targeted earlier timeline lookup only as conflict evidence.
- Do not use hidden state, script facts, or internal runtime data.
- Mark each issue with `scope`, `type`, `severity`, `source`, current evidence, conflicting evidence, and reason.
