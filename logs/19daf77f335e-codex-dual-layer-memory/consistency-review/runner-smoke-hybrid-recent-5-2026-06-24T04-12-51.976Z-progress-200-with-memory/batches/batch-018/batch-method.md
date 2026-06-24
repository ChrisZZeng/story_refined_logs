# Batch Method

I read the player-visible timeline from `visible-timeline.jsonl` and extracted turns 161-180 as the review window.

Turns 161-170 were treated as context only. Turns 171-180 were the only turns counted in the batch result.

I checked each evaluated turn across `visibleText`, `choices`, and `preLlmEvents`, with long-range continuity reviewed only against player-visible evidence.
