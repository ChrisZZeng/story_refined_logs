# Consistency Root Cause Summary

## Overview

| metric | value |
| --- | --- |
| issues | 86 |
| completed | 86 |
| valid | 82 |
| questionable | 4 |
| invalid | 0 |
| missing | 0 |

## Valid Root Cause Mechanisms

| label | family | count | score | issues |
| --- | --- | --- | --- | --- |
| choice-action-binding | agent-system | 20 | 40.25 | #2/T3, #6/T9, #8/T14, #10/T19, #11/T20, #22/T33, #23/T34, #32/T70, #37/T86, #51/T123, #52/T125, #58/T132, #59/T134, #64/T147, #66/T150, #67/T157, #69/T159, #73/T161, #74/T162, #79/T180 |
| storyline-lifecycle | agent-system | 7 | 27.00 | #9/T16, #17/T26, #18/T27, #19/T28, #21/T31, #43/T106, #48/T118 |
| context-priority | agent-system | 10 | 15.50 | #5/T8, #31/T68, #36/T84, #42/T97, #44/T108, #50/T120, #55/T129, #57/T131, #62/T139, #77/T167 |
| current-scene-anchor | agent-system | 9 | 12.75 | #4/T5, #13/T22, #16/T24, #34/T76, #46/T115, #47/T117, #56/T130, #70/T160, #81/T186 |
| memory-persistence | detail-memory | 7 | 12.50 | #45/T110, #54/T128, #63/T146, #65/T149, #71/T160, #72/T160, #75/T163 |
| state-writeback | agent-system | 5 | 10.75 | #12/T21, #33/T72, #61/T139, #76/T166, #78/T171 |
| model-local | llm-self | 6 | 5.75 | #25/T45, #29/T58, #30/T63, #35/T78, #80/T183, #84/T198 |
| alias-pronoun-contract | agent-system | 1 | 3.00 | #1/T1 |
| fixed-beat-consumption | agent-system | 1 | 3.00 | #7/T10 |
| hidden-referent-pronoun-contract | agent-system | 1 | 3.00 | #28/T57 |
| object-transfer-continuity | agent-system | 1 | 3.00 | #38/T87 |
| object-affordance-contract | agent-system | 1 | 3.00 | #53/T128 |
| state-summary-negative-fact-loss | detail-memory | 1 | 3.00 | #82/T188 |
| handoff-contract | agent-system | 1 | 3.00 | #85/T198 |
| scene-fact-persistence-gap | detail-memory | 1 | 2.25 | #24/T41 |
| object-affordance-continuity | agent-system | 2 | 1.75 | #40/T93, #41/T94 |
| location-transition-bridge | agent-system | 1 | 1.00 | #14/T23 |
| choice-affordance-state-gating | agent-system | 1 | 1.00 | #15/T24 |
| temporal-anchor-contract | agent-system | 1 | 1.00 | #26/T48 |
| speaker-pronoun-alignment | llm-self | 1 | 1.00 | #27/T54 |
| object-state-handoff | agent-system | 1 | 0.75 | #3/T5 |
| current-scene-posture-anchor | recent-context | 1 | 0.75 | #39/T90 |
| current-object-anchor | agent-system | 1 | 0.75 | #60/T136 |
| unsupported-detail-inference | llm-self | 1 | 0.75 | #86/T200 |

## Missing Or Invalid Results

missingResults: 0

invalidResults: 0
