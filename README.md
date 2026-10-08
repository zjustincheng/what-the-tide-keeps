# What the Tide Keeps

A 2D open-world web RPG with turn-based combat, set in a medieval world of animals. A hero framed for regicide is sentenced to fight, die, and be resurrected. Every death takes a memory.

The first version is a solo game that runs entirely in the browser.

## Design

The [design guideline](docs/design-guideline.md) contains the story, world, combat and memory systems, regional progression, technology choices, and playable build order.

## Technical direction

- **Language:** TypeScript
- **Rendering:** Phaser
- **Maps:** Tiled
- **Saves:** Browser local storage
- **Game rules:** Plain TypeScript, independent of Phaser, so combat and memory systems can be tested without a browser and moved to a server for future co-op.

## Run locally

Requires Node.js 22.12+ (Node.js 24 recommended).

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. Move with **WASD** or **arrow keys**, and press **E** or **Space** near a person or object to interact. Continue dialogue with **E**, **Space**, **Enter**, or the on-screen button; **Escape** closes it. Touch controls appear on small screens and touch devices.

```sh
npm run build   # Type-check and build to dist/
npm run preview # Serve the production build locally
npm test        # Browser checks using an installed Google Chrome
npm run test:unit # Pure TypeScript combat and memory rule tests
```

`npm test` runs rule tests and browser checks. The browser checks cover exploration, encounters, drag and button actions, turn locking, victory, defeat, memory loss, saves, and mobile controls. On machines without Google Chrome, install it or change the Playwright channel in `playwright.config.ts` to use an installed browser. Rule tests require Node.js 22.18+ or 24.

## Current milestone

Build the repeatable loop in miniature before adding the full story. The first playable milestone is a small Tiled map with a moving character, starting with the hero waking in the church. Add the feast opening after the loop works.

The first eight build steps are playable: church exploration, visible encounters, basic combat, a party of three, mana-based magic, death, memory in the world, and one region. Speak to the priest and inspect the ledger and basin. Near the southeast wall, a crop locust shows a small mana signature. Touch it to enter battle. A hooded exile near the northeast wall provides a second encounter with suppressed mana and an unknown spell. The priest gives the farmland mission, and the south door opens onto the farm road. The artwork and dialogue are original placeholders.

In battle, command the chameleon, bear, and vulture. Each living member acts once in any order; only then does the enemy act and each surviving companion regain 3 mana. Downed members cannot act, and the party only wipes when all three fall. Party members and enemies have health bars and condition descriptions; exact health and damage numbers remain hidden. Mana is numeric. Enemies target the living member with the most visible mana, preferring the bear in a tie.

Drag any member onto the locust to attack, or tap that member for self-support. Per-member action buttons offer keyboard and touch access. Chameleon guards himself. Bear can guard himself or protect another companion: drag him onto that ally, or choose a target with his **Protect** selector before using the **Protect** button. Vulture focuses to strengthen her next shot; focus does not stack. Guards last for one enemy turn. Bear also blocks attacks aimed at himself while protecting another companion.

Prototype tuning: ordinary fights last two or three rounds, and the boar about five. All numbers live in `src/rules/battle.ts`. Attacks cost 2 mana. Physical guarding and focusing are free, so an empty mana pool cannot stall the turn. Guarding stops physical damage; it is not a spell barrier. Spell barriers cost 5 mana and protect the selected ally until the end of the enemy turn, but only against studied spells. Physical blows pass through them. The party is a fixed combat-test roster; this does not implement or change the story's regional recruitment sequence.

Victory removes the locust until you use **Return to the cot**, which resets the encounter. Defeat wakes you at the cot (see below). Each new fight starts with full health and mana. Supplies are not implemented yet, and recruitment and travel beyond the church are still ahead. Encounter progress resets on reload; studied spells and memories persist.

## Dodging

Enemy blows can be dodged with timing, never luck. When a blow is about to land, a ring closes on the companion it targets and a **Dodge** bar appears at the bottom of the screen. Press **Space** (or **Enter**, or tap **Dodge**) as the ring meets the inner circle:

- **Perfect** (within 90 ms; 60 ms for heavy, telegraphed blows such as a leap or charge): no damage.
- **Graze** (within 200 ms): half damage.
- **Too soon, too slow, or no press**: the full blow. A press cannot be retried, so mashing does not work.

Each blow in a turn, including each of the boar's followers, is its own dodge. Blows already stopped by a guard or barrier skip the prompt. A spell the party has not studied cannot be dodged. The timing windows live in `DODGE` in `src/rules/battle.ts`.

## Magic and the shared grimoire

Open a companion's **Spellcraft** menu for these actions. Each spends that companion's turn:

- **Suppress (1 mana):** show at most 1 mana to enemies until attacking. The next attack reveals the pool and adds damage, with the chameleon receiving the largest bonus.
- **Barrier (5 mana):** protect the ally selected above the action buttons against studied spells for this enemy turn. It cannot stop unknown magic or physical attacks.
- **Analyze (2 mana):** study the exile's gathering spell before it strikes. It becomes named and blockable immediately.

The exile alternates staff attacks with a spell. Its two-turn countdown initially reads **???**. Surviving its cast also adds **Salt lance** to the grimoire, even if the target falls while another companion survives. A total wipe does not discover an unstudied spell. The exile reveals its hidden mana when casting.

The shared grimoire survives cot resets, defeats, and reloads in browser local storage (`tide-keeps.grimoire.v1`). If storage is unavailable, it remains usable for the current page session and the battle view reports that it cannot save. Memories and story progress are saved separately (see below).

These are prototype combat encounters in the church, not the final regional placement or recruitment story. Spellcraft options supplement the original attack/support controls while testing the rules.

## The farmland

The first part of build step 8 (one region): the farm road south of the church, between wheat fields and a hay yard. Crop pests show their full mana and only strike physically, as the guideline describes. Two crop locusts feed in a trampled clearing and on the road, and a grain weevil waits in the hay yard. The weevil jabs most turns and makes a heavy rolling charge every third round. A waymark and a scarecrow can be examined. The road continues south to Millbrook.

Millbrook is a prosperous herbivore market town. The reeve, the innkeeper, a stallholder, a lamb, and the fishmonger live on the west side and around the market square. The carnivore quarter lies east, behind a wall whose gate locks from the herbivore side. Townsfolk react to the hero's species and his brand: the stallholder triples his prices, the inn turns him away, and the notice board still shows his face. The fishmonger's barrel and the shuttered stall behind the tannery are left unexplained. Money, shops, camping, and the night market are not implemented yet, so those beats are dialogue for now.

South of Millbrook, the border road is blocked by a wall of brambles. The lamb in the market square lost her bell in the locust field; it lies in the trampled clearing on the farm road, where it can be grabbed by slipping past the locust or after a fight. Bring it to her and she teaches **Bramble's leave**, a favor spell written into the grimoire. Speak it at the hedge and the brambles draw back. Beyond them, loaded grain carts sit turned around while a highland carter and a farmland guard wait for each other to move first. Further south, one of the boar's hooded followers waits on the road with veiled mana and an unknown spell.

The road ends at the boar's burned farm, where he waits between his followers, a badger and a rat. Every hit aimed at a follower lands on the boar instead, at half strength, and adds fury. Fury raises his damage, and that extra damage drives through guards. Clearing the followers first wipes the party; fighting him directly while the bear guards wins. A notice on the gatepost tells his story. Once he is beaten he stays beaten: his followers speak of "the one with no fur, who listened", a cup from the feast lies where he stood, and the reeve, the inn, the carter, and the guard all change what they say.

Nothing marks the quest. A carried item is lost on a wipe and returns to where it was found. The opened hedge and learned spells persist, saved in `tide-keeps.world.v1` and the grimoire.

Leaving an area and coming back respawns its enemies. A wipe anywhere wakes the party at the church cot, and **Return to the cot** works from any area.

## Death and memory

The hero begins with eight of his ten memories; his home and his name were lost before the game starts. A party wipe wakes him at the cot, where he must choose one held memory to forget before he can move. Each memory shows what forgetting it costs and the Hollow perk that replaces it:

- **+2 mana** for the chameleon. A larger pool also shows more mana, so enemies target him more often.
- **+1 damage** on every chameleon attack.

Forgetting **His training** also reduces his reveal bonus from +4 to the +2 every companion gets. Forgetting **The feast** changes what the priest says and what the tidal basin evokes, and forgetting **The trial** changes the resurrection ledger. Because his name is already lost, the game never shows it. The other memory costs are shown but take effect in later build steps. When no memories remain, a wipe takes nothing. Only the hero loses memories for now; companion memories are still an open design question. Perks from the two memories lost before the game are already part of his starting stats.

Memories are saved in browser local storage (`tide-keeps.memory.v1`). A wipe is saved before the choice is shown, so reloading the page brings the choice back instead of skipping it. The footer shows how many memories remain.

## Project layout

- `src/scenes/AreaScene.ts` — Phaser exploration, collision, input, encounters, and travel, shared by every area.
- `src/scenes/areas.ts` — each area's map, people, enemies, exits, and decoration.
- `src/content/dialogue.ts` — dialogue types: variants by memory, items, flags, or spells, and their effects.
- `src/content/church.ts`, `road.ts`, `town.ts`, `border.ts`, `farm.ts` — prototype dialogue for each area.
- `src/scenes/sprites.ts` — generated placeholder sprites for the hero and townsfolk.
- `src/rules/battle.ts` — immutable, renderer-independent combat state and transitions.
- `src/rules/memory.ts` — memory loss and Hollow perks, independent of the renderer.
- `src/rules/world.ts` — story flags, carried items, favor spells, and which dialogue variant applies.
- `src/content/memories.ts` — memory names and what forgetting each costs.
- `src/storage/grimoire.ts` — versioned browser storage for studied spells.
- `src/storage/memory.ts` — versioned browser storage for lost memories and an unpaid wipe.
- `src/storage/world.ts` — versioned browser storage for story flags and carried items.
- `src/ui/BattleView.ts` — accessible combat view, drag input, and turn pacing.
- `src/ui/ResurrectionView.ts` — the wake screen where a memory is chosen.
- `public/maps/church.json` — editable Tiled JSON map with floor, furniture, and named interaction points.
- `public/assets/church-tiles.svg` — original placeholder tileset.
- `public/maps/farm-road.json`, `town.json`, `border-road.json`, `boar-farm.json` — the farmland maps, with placeholder tilesets in `public/assets/`.
- `scripts/create-*.mjs` — regenerate each map and tileset; running one replaces manual edits to that map.
- `tests/church.spec.ts` — browser checks.
- `tests/battle.spec.ts` — encounter and combat browser checks.
- `tests/road.spec.ts` — travel, the weevil, Millbrook, and waking after a wipe outside.
- `tests/quest.spec.ts` — the lamb's bell, the favor spell, and the hedge gate.
- `tests/boar.spec.ts` — the boar's rule, his defeat, and its aftermath.
- `tests/death.spec.ts` — wipe, memory choice, and save browser checks.
- `tests/rules/battle.test.ts` — combat tests without a browser.
- `tests/rules/memory.test.ts` — memory and Hollow perk tests without a browser.
- `tests/dodge.spec.ts` — dodge timing in the browser.
- `tests/rules/dodge.test.ts` — dodge grading and the stepwise enemy turn.
- `tests/rules/boar.test.ts` — the boar's shielding, fury, and both strategies.
- `tests/rules/world.test.ts` — dialogue variants and the favor-spell quest.

Combat rules have no Phaser or DOM imports. Future party and memory rules should preserve that boundary, as specified in the design guideline.

Phaser's [tilemap documentation](https://docs.phaser.io/api-documentation/class/tilemaps-tilemap) describes the Tiled map loading used here.

## Open question

- What are each companion's memories?
