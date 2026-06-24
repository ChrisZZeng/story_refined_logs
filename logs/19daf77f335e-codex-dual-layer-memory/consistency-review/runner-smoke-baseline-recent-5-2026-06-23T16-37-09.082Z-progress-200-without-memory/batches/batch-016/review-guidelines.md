# Review Guidelines Used

This batch was reviewed with the narrative-consistency batch reviewer skill. The review used only player-visible evidence: player input, `preLlmEvents`, `visibleText`, and `choices`.

Only turns in the focused evaluation range count toward batch statistics. Earlier turns in the window and targeted keyword lookups in the visible timeline may be used as conflict evidence, but issues outside the focused range are not counted here.

Each issue is labeled with:

- `scope`: `visibleText`, `choices`, `preLlmEvents`, or `mixed`
- `type`: one of the skill's consistency/quality categories, such as `fact-conflict`, `space-time-break`, `user-input-ignored`, `unsupported-jump`, or `quality-regression`
- `severity`: `low`, `medium`, or `high`
- `source`: `player-input`, `model-output`, `mixed`, or `uncertain`

Reasonable new details were not treated as issues unless they contradicted or disrupted previously visible facts, item states, locations, interaction state, or player action continuity.
