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
npm run test:unit # Pure TypeScript combat rule tests
```

`npm test` runs rule tests and browser checks. The browser checks cover exploration, encounters, drag and button actions, turn locking, victory, defeat, and mobile controls. On machines without Google Chrome, install it or change the Playwright channel in `playwright.config.ts` to use an installed browser. Rule tests require Node.js 22.18+ or 24.

## Current milestone

Build the repeatable loop in miniature before adding the full story. The first playable milestone is a small Tiled map with a moving character, starting with the hero waking in the church. Add the feast opening after the loop works.

The first five build steps are playable: church exploration, visible encounters, basic combat, a party of three, and mana-based magic. Speak to the priest and inspect the ledger and basin. Near the southeast wall, a crop locust shows a small mana signature. Touch it to enter battle. A hooded exile near the northeast wall provides a second encounter with suppressed mana and an unknown spell. The south door still marks the edge of the prototype. The artwork and dialogue are original placeholders.

In battle, command the chameleon, bear, and vulture. Each living member acts once in any order; only then does the locust act and each surviving companion regain 3 mana. Downed members cannot act, and the party only wipes when all three fall. Party members and enemies have health bars and condition descriptions; exact health and damage numbers remain hidden. Mana is numeric. Enemies target the living member with the most visible mana, preferring the bear in a tie.

Drag any member onto the locust to attack, or tap that member for self-support. Per-member action buttons offer keyboard and touch access. Chameleon guards himself. Bear can guard himself or protect another companion: drag him onto that ally, or choose a target with his **Protect** selector before using the **Protect** button. Vulture focuses to strengthen her next shot; focus does not stack. Guards last for one enemy turn. Bear also blocks attacks aimed at himself while protecting another companion.

Prototype tuning: attacks cost 2 mana. Physical guarding and focusing are free, so an empty mana pool cannot stall the turn. Guarding stops physical damage; it is not a spell barrier. Spell barriers cost 5 mana and protect the selected ally until the end of the enemy turn, but only against studied spells. Physical blows pass through them. The party is a fixed combat-test roster; this does not implement or change the story's regional recruitment sequence.

Victory removes the locust until you use **Return to the cot**, which resets the encounter. Defeat returns you to the cot and permits another attempt. Each new fight starts with full health and mana. These are temporary prototype reset rules; memory loss, Hollow perks, supplies, and persistent saves are not implemented yet. Recruitment and travel beyond the church are also still ahead. Encounter progress resets on reload; only studied spells persist.

## Magic and the shared grimoire

Open a companion's **Spellcraft** menu for these actions. Each spends that companion's turn:

- **Suppress (1 mana):** show at most 1 mana to enemies until attacking. The next attack reveals the pool and adds damage, with the chameleon receiving the largest bonus.
- **Barrier (5 mana):** protect the ally selected above the action buttons against studied spells for this enemy turn. It cannot stop unknown magic or physical attacks.
- **Analyze (2 mana):** study the exile's gathering spell before it strikes. It becomes named and blockable immediately.

The exile alternates staff attacks with a spell. Its two-turn countdown initially reads **???**. Surviving its cast also adds **Salt lance** to the grimoire, even if the target falls while another companion survives. A total wipe does not discover an unstudied spell. The exile reveals its hidden mana when casting.

The shared grimoire survives cot resets, defeats, and reloads in browser local storage (`tide-keeps.grimoire.v1`). If storage is unavailable, it remains usable for the current page session and the battle view reports that it cannot save. No other game state is saved yet.

These are prototype combat encounters in the church, not the final regional placement or recruitment story. Spellcraft options supplement the original attack/support controls while testing the rules.

## Project layout

- `src/scenes/ChurchScene.ts` — Phaser exploration, collision, and input.
- `src/content/church.ts` — prototype dialogue.
- `src/rules/battle.ts` — immutable, renderer-independent combat state and transitions.
- `src/storage/grimoire.ts` — versioned browser storage for studied spells.
- `src/ui/BattleView.ts` — accessible combat view, drag input, and turn pacing.
- `public/maps/church.json` — editable Tiled JSON map with floor, furniture, and named interaction points.
- `public/assets/church-tiles.svg` — original placeholder tileset.
- `scripts/create-church.mjs` — regenerates the starter map and tileset; running it replaces manual map edits.
- `tests/church.spec.ts` — browser checks.
- `tests/battle.spec.ts` — encounter and combat browser checks.
- `tests/rules/battle.test.ts` — combat tests without a browser.

Combat rules have no Phaser or DOM imports. Future party and memory rules should preserve that boundary, as specified in the design guideline.

Phaser's [tilemap documentation](https://docs.phaser.io/api-documentation/class/tilemaps-tilemap) describes the Tiled map loading used here.

## Open question

- What are each companion's memories?
