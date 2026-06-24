# Review Guidelines Used

Source skill: `skills/consistency_evaluator/skills/batch_reviewer/SKILL.md`

Key rules applied in this batch:

- Only player-visible evidence counts: `visibleText`, `choices`, `preLlmEvents`, and player input.
- Window range is context only. Only the eval range counts toward batch issues.
- Every issue must include `scope`: `visibleText`, `choices`, `preLlmEvents`, or `mixed`.
- Issue types are limited to the skill taxonomy, such as `fact-conflict`, `identity-drift`, `space-time-break`, `user-input-ignored`, `event-negated`, `unsupported-jump`, `repeated-scene`, `language-drift`, `protocol-break`, `quality-regression`, or `other`.
- Severity is `low`, `medium`, or `high`.
- If evidence is insufficient, mark the turn or issue as uncertain rather than guessing.
- Do not use hidden story state, script state, or director intent as判错 evidence unless it is already player-visible.
