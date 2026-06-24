# Batch 001 Consistency Review

## Scope

- Run directory: `/Users/wanghaha/code/oreturn-owlet-hybrid-dual-layer-memory/tmp/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200`
- Timeline: `/Users/wanghaha/code/oreturn-owlet-hybrid-dual-layer-memory/tmp/runner-smoke-baseline-recent-5-2026-06-23T16-37-09.082Z-progress-200/consistency-review/visible-timeline.jsonl`
- Window range: turns 1-10
- Evaluated range: turns 1-10
- Evaluated player-visible fields: `visibleText`, `choices`, `preLlmEvents`

`preLlmEvents` was empty for all evaluated turns. Issues below are counted only inside turns 1-10.

## Method

I reviewed the player-visible timeline entries for turns 1-10 in order, using only player input, generated-before-output events, visible narrative text, and visible choices as evidence. I checked local continuity across each turn and short-range continuity against earlier visible turns in the same window. No hidden script state, private runtime state, or full run body was used as evidence.

## Window Timeline

- Turn 1:帕兹 wakes from a battlefield nightmare during New Sicily's festival, meets Karina and a vendor, shows Mint's photo, and is warned about the mafia-run city.
- Turn 2:帕兹 asks the vendor about Karina and learns she is the Dark Street petitioner who arbitrates disputes.
- Turn 3:帕兹 asks more about Karina's location and is directed toward Dark Street.
- Turn 4:帕兹 heads to Dark Street and is blocked by three men demanding his camera.
- Turn 5:帕兹 hands over the camera and film, Karina intervenes, the men leave, and she leads him through an iron door.
- Turn 6:Inside Karina's room, she explains the local danger and says Mint had been active in New Sicily.
- Turn 7:帕兹 asks what Mint was looking for; Karina asks for his reason for coming as the price of information.
- Turn 8:帕兹 explains Mint was his battlefield companion; Karina says Mint was investigating Skull Society-related records and lists.
- Turn 9:帕兹 proposes a trust/information exchange; Karina asks him to prove his connection to Mint, then the door knocks.
- Turn 10:帕兹 quietly asks whether Karina has a guest; Karina tells him to stay quiet and unlocks the door.

## Findings

- Evaluated turns: 10
- Issue count: 7
- Inconsistent turns: 1, 3, 5, 8, 9, 10
- First inconsistent turn: 1
- Uncertain turns: none

Main issue categories:

- `identity-drift`: 1
- `quality-regression`: 1
- `fact-conflict`: 2
- `space-time-break`: 2
- `user-input-ignored`: 1

The most noticeable problems are the vendor's pronoun drift in turn 1, Karina's changed account of whether she had contact with Mint by turn 8, and the turn 10 time rewind that relocates the knock before several events that already happened in turn 9.
