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

The first three build steps are playable: church exploration, a visible encounter, and a one-on-one fight. Speak to the priest and inspect the ledger and basin. Near the southeast wall, a crop locust shows a small mana signature. Touch it to enter battle. The south door still marks the edge of the prototype. The artwork and dialogue are original placeholders.

In battle, drag the chameleon onto the locust to attack, or tap the chameleon to guard. The **Attack** and **Support** buttons offer the same actions with keyboard and touch access. Each action is followed by an enemy turn, then 3 mana regenerates. Read the physical attack tell: guard against its heavy leap. Exact health and damage remain hidden; mana is numeric.

Prototype tuning: the thorn attack costs 2 mana, and the guarding support action costs 5. Guarding blocks physical damage for that enemy turn; it is not a spell barrier. Guard cost is provisional, since the guideline specifies barrier cost but leaves guard cost open. Spell barriers arrive with the later magic milestone.

Victory removes the locust until you use **Return to the cot**, which resets the encounter. Defeat returns you to the cot and permits another attempt. Each new fight starts with full health and mana. These are temporary prototype reset rules; memory loss, Hollow perks, supplies, and persistent saves are not implemented yet. Party combat, suppression, unknown spells, and travel beyond the church are also still ahead. Progress resets on reload.

## Project layout

- `src/scenes/ChurchScene.ts` — Phaser exploration, collision, and input.
- `src/content/church.ts` — prototype dialogue.
- `src/rules/battle.ts` — immutable, renderer-independent combat state and transitions.
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
