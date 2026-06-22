# Review Guidelines Used

This batch used the narrative consistency reviewer skill and its guideline reference.

The review considered only player-visible evidence:

- prior player inputs;
- player-visible `preLlmEvents`;
- generated `visibleText`;
- generated `choices`.

Hidden script facts, internal state, private director intent, and unshown runtime fields were not used as evidence.

The window range 11-30 supplied context. Only turns 21-30 were counted for this batch.

Each issue records:

- turn number;
- `scope`;
- issue type;
- severity;
- current evidence;
- conflicting evidence;
- source;
- reason.

The allowed scopes were `visibleText`, `choices`, `preLlmEvents`, and `mixed`. Source labels followed the skill convention: `player-input`, `model-output`, `mixed`, or `uncertain`.
