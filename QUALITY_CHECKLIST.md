# Game quality checklist

Focus first on the playable loop from the church through the farmland, the boar, and resurrection. Bring later regions up to the same standard afterward.

## Reliability and clarity

- [x] Add collision to town crowds; verify hidden characters, queue movements, and area revisits.
- [x] Sort characters by their position on the ground; keep shadows beneath them.
- [x] Keep idle animation separate from collision and cancel stale disappearance animations.
- [x] Explain combat actions, mana costs, and targets through short labels and optional details.
- [x] Use the chosen ally when enabling support; allow barriers on fallen companions.
- [x] Verify church → fields → town → wipe → church, including memory persistence after reload.
- [x] Prevent mobile party cards collapsing; keep the enemy warning visible without covering hero portraits.
- [x] Verify brambles and the sister’s lane block walking and jumping until properly unlocked.
- [x] Verify the lamb’s favor and lane unlock after reload, and the earned bear reunion after resurrection.
- [x] Confirm solid-prop collision fixes preserve a legitimate gorge jump.
- [ ] Walk every first-region route and check doors, gates, corners, jumps, and NPC spacing.
- [x] Reserve full cutscene text space before typing; add safe back navigation and clear text-reveal controls.
- [x] Verify mobile and reduced-motion reading, save-safe replays, and the covered kraken-to-feast handoff.
- [x] Ground the opening octopus on the harbor pier.
- [ ] Audit every first-region cutscene for grounded characters, clean framing, and readable transitions.
- [ ] Verify every first-region quest across saving, reloading, dying, and revisiting.
- [ ] Test both ending paths, including meeting the human before finding the laboratory memory.

## Combat feel

- [x] Clearly distinguish blocked, guarded, grazed, poisoned, and failed actions in visual feedback.
- [x] Show spell dodge progress, add touch number keys, and explain wrong keys, late matches, and timeouts.
- [ ] Review dodge prompts and spell input timing for readable, fair failures.
- [ ] Give each hero distinct attack, support, hit, and downed animations.
- [ ] Make physical and magical attack cues easy to distinguish.
- [x] Review the boar's phase transition and aftermath as one paced sequence.
- [x] Give the boar grounded phase staging, a visible return from his flashback, and an open grain road afterward.
- [x] Verify the boar's mobile phase framing and skippable scenes without extra combat actions.
- [ ] Check that boss rules can be understood through observation.
- [ ] Make repeated boss attempts quick to resume, with skippable scenes.
- [ ] Balance the first-region fights around learning spells and managing mana.

## Story and consequence

- [ ] Polish companion reunions and conversations after deaths and discoveries.
- [ ] Check visible effects of forgotten memories on names, dialogue, and relationships.
- [ ] Connect evidence discoveries into a mystery the player can follow.
- [ ] Give each defeated boss a specific, revealing flashback.
- [ ] Review the finale's resolution of the heroes, church, human, and sea.

## Presentation and pacing

- [ ] Unify sprite scale, outlines, pixel density, and animation style.
- [ ] Check crowds, stalls, scenery, and routes for readable spacing.
- [ ] Give regions distinct palettes, lighting, and ambient sound.
- [ ] Match cutscene backgrounds to the location and moment.
- [ ] Balance sound levels and smooth music transitions.
- [ ] Review the opening without shortcuts for confusing or slow moments.
- [ ] Reduce repeat travel through earned shortcuts.
- [x] Improve equipment, anchor, and memory comparisons with actual tempered values and visible tradeoffs.
- [x] Let a companion reminder be written down in the same camp visit and explain the Hollow bonus returned.
- [x] Protect a written last memory for one death, consume the page, and preserve permanent keepsake bonds.
- [x] Keep location titles behind menus and show whose keepsake is equipped.
- [ ] Check journal usefulness without adding quest markers.
- [ ] Verify small screens, keyboard navigation, readable text, and reduced motion.
- [ ] Complete full playthroughs of both endings and resolve the resulting issues.

### Scenery and late memory repairs

- [x] Give added stalls, wagons, racks, barrels, benches, tables, and signposts solid ground footprints.
- [x] Sort raised scenery by its feet and rebuild collision safely when story state changes.
- [x] Match the town stall and wagons to their surrounding timber; keep the wagon parked clear of traffic.
- [x] Rebuild the cuckoo’s account with household, register, expulsion, recruitment, and aftermath scenes.
- [x] Keep late memories in their actual locations, with an open cell and a shore for the octopus.
- [x] Keep cutscene actors grounded across screen sizes and mobile reading controls accessible.

### Battle pacing

- [x] Shorten routine enemy pauses and animate each follower’s own strike.
- [x] Give boss attacks a windup, heavier impact sound, and restrained scenery shake.
- [x] Keep reaction windows unchanged and put the ring beside the fixed dodge button.
- [x] Warn when unknown spells cannot be dodged and clear previous prompt artwork.
- [x] Let bosses settle after phase scenes before accepting another action.
- [x] Cancel delayed impacts and prompt animation when combat closes.
- [x] Check the farmland favor gate, barricade, bear reunion, resurrection, and boar sequence after pacing changes.
