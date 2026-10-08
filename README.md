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

The first seven build steps are playable: church exploration, visible encounters, basic combat, a party of three, mana-based magic, death, and memory in the world. Speak to the priest and inspect the ledger and basin. Near the southeast wall, a crop locust shows a small mana signature. Touch it to enter battle. A hooded exile near the northeast wall provides a second encounter with suppressed mana and an unknown spell. The priest gives the farmland mission, and the south door opens onto the farm road. The artwork and dialogue are original placeholders.

In battle, command the chameleon, bear, and vulture. Each living member acts once in any order; only then does the enemy act and each surviving companion regain 3 mana. Downed members cannot act, and the party only wipes when all three fall. Party members and enemies have health bars and condition descriptions; exact health and damage numbers remain hidden. Mana is numeric. Enemies target the living member with the most visible mana, preferring the bear in a tie.

Drag any member onto the locust to attack, or tap that member for self-support. Per-member action buttons offer keyboard and touch access. Chameleon guards himself. Bear can guard himself or protect another companion: drag him onto that ally, or choose a target with his **Protect** selector before using the **Protect** button. Vulture focuses to strengthen her next shot; focus does not stack. Guards last for one enemy turn. Bear also blocks attacks aimed at himself while protecting another companion.

Prototype tuning: attacks cost 2 mana. Physical guarding and focusing are free, so an empty mana pool cannot stall the turn. Guarding stops physical damage; it is not a spell barrier. Spell barriers cost 5 mana and protect the selected ally until the end of the enemy turn, but only against studied spells. Physical blows pass through them. The party is a fixed combat-test roster; this does not implement or change the story's regional recruitment sequence.

Victory removes the locust until you use **Return to the cot**, which resets the encounter. Defeat wakes you at the cot (see below). Each new fight starts with full health and mana. Supplies are not implemented yet, and recruitment and travel beyond the church are still ahead. Encounter progress resets on reload; studied spells and memories persist.

## Magic and the shared grimoire

Open a companion's **Spellcraft** menu for these actions. Each spends that companion's turn:

- **Suppress (1 mana):** show at most 1 mana to enemies until attacking. The next attack reveals the pool and adds damage, with the chameleon receiving the largest bonus.
- **Barrier (5 mana):** protect the ally selected above the action buttons against studied spells for this enemy turn. It cannot stop unknown magic or physical attacks.
- **Analyze (2 mana):** study the exile's gathering spell before it strikes. It becomes named and blockable immediately.

The exile alternates staff attacks with a spell. Its two-turn countdown initially reads **???**. Surviving its cast also adds **Salt lance** to the grimoire, even if the target falls while another companion survives. A total wipe does not discover an unstudied spell. The exile reveals its hidden mana when casting.

The shared grimoire survives cot resets, defeats, and reloads in browser local storage (`tide-keeps.grimoire.v1`). If storage is unavailable, it remains usable for the current page session and the battle view reports that it cannot save. No other game state is saved yet.

These are prototype combat encounters in the church, not the final regional placement or recruitment story. Spellcraft options supplement the original attack/support controls while testing the rules.

## The farm road

The first part of build step 8 (one region): the farm road south of the church, between wheat fields and a hay yard. Crop pests show their full mana and only strike physically, as the guideline describes. Two crop locusts feed in a trampled clearing and on the road, and a grain weevil waits in the hay yard. The weevil jabs most turns and makes a heavy rolling charge every third round. A waymark and a scarecrow can be examined. The road south toward Millbrook ends at the edge of the prototype; the town comes next.

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
- `src/content/dialogue.ts` — dialogue lookup, with variants for forgotten memories.
- `src/content/church.ts`, `src/content/road.ts` — prototype dialogue for each area.
- `src/rules/battle.ts` — immutable, renderer-independent combat state and transitions.
- `src/rules/memory.ts` — memory loss and Hollow perks, independent of the renderer.
- `src/content/memories.ts` — memory names and what forgetting each costs.
- `src/storage/grimoire.ts` — versioned browser storage for studied spells.
- `src/storage/memory.ts` — versioned browser storage for lost memories and an unpaid wipe.
- `src/ui/BattleView.ts` — accessible combat view, drag input, and turn pacing.
- `src/ui/ResurrectionView.ts` — the wake screen where a memory is chosen.
- `public/maps/church.json` — editable Tiled JSON map with floor, furniture, and named interaction points.
- `public/assets/church-tiles.svg` — original placeholder tileset.
- `public/maps/farm-road.json`, `public/assets/farm-tiles.svg` — the farm road map and its placeholder tileset.
- `scripts/create-church.mjs`, `scripts/create-farm-road.mjs` — regenerate each map and tileset; running one replaces manual edits to that map.
- `tests/church.spec.ts` — browser checks.
- `tests/battle.spec.ts` — encounter and combat browser checks.
- `tests/road.spec.ts` — travel, the weevil, and waking after a wipe outside.
- `tests/death.spec.ts` — wipe, memory choice, and save browser checks.
- `tests/rules/battle.test.ts` — combat tests without a browser.
- `tests/rules/memory.test.ts` — memory and Hollow perk tests without a browser.
- `tests/rules/world.test.ts` — dialogue changes from forgotten memories.

Combat rules have no Phaser or DOM imports. Future party and memory rules should preserve that boundary, as specified in the design guideline.

Phaser's [tilemap documentation](https://docs.phaser.io/api-documentation/class/tilemaps-tilemap) describes the Tiled map loading used here.

## Open question

- What are each companion's memories?
