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
```

The browser tests cover movement, wall and furniture collisions, dialogue, and mobile controls. On machines without Google Chrome, install it or change the Playwright channel in `playwright.config.ts` to use an installed browser.

## Current milestone

Build the repeatable loop in miniature before adding the full story. The first playable milestone is a small Tiled map with a moving character, starting with the hero waking in the church. Add the feast opening after the loop works.

The first milestone is playable: walk through the church, speak to the priest, and inspect the resurrection ledger and tidal basin. Walls and furniture block movement. The south door marks the edge of the prototype. The artwork and dialogue are original placeholders for this first build.

Combat, encounters, memory loss, saves, and travel beyond the church are not implemented yet. Progress resets on reload.

## Project layout

- `src/scenes/ChurchScene.ts` — Phaser exploration, collision, and input.
- `src/content/church.ts` — prototype dialogue.
- `public/maps/church.json` — editable Tiled JSON map with floor, furniture, and named interaction points.
- `public/assets/church-tiles.svg` — original placeholder tileset.
- `scripts/create-church.mjs` — regenerates the starter map and tileset; running it replaces manual map edits.
- `tests/church.spec.ts` — browser checks.

Future combat and memory rules belong in plain TypeScript modules without Phaser imports, as specified in the design guideline.

Phaser's [tilemap documentation](https://docs.phaser.io/api-documentation/class/tilemaps-tilemap) describes the Tiled map loading used here.

## Open question

- What are each companion's memories?
