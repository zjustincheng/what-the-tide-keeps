# What the Tide Keeps

A 2D open-world web RPG with turn-based combat, set in a medieval world of animals. A hero framed for regicide is sentenced to fight, die, and be resurrected. Every death takes a memory.

It is a single-player game that runs entirely in the browser.

## Design

The [design guideline](docs/design-guideline.md) contains the story, world, combat and memory systems, regional progression, technology choices, and playable build order.

## Technical direction

- **Language:** TypeScript
- **Rendering:** Phaser
- **Maps:** Tiled
- **Saves:** Browser local storage
- **Game rules:** Plain TypeScript, independent of Phaser, so combat and memory systems can be tested without a browser.

## Play online

Every push to `main` builds the game and publishes it to GitHub Pages at **https://zjustincheng.github.io/what-the-tide-keeps/** (see `.github/workflows/pages.yml`). The build is served from that sub-path, which `vite.config.ts` sets when `GITHUB_PAGES` is set. Saves live in each browser, so progress does not move between computers.

## Movement

Walking into a wall you only clip by a few pixels slides you along it, so narrow bridges, boardwalks, and doorways don't need lining up exactly (`slideAroundCorners` in `src/scenes/area/traversal.ts`). Solid things on the map, like dark water, barricades, and people, count as walls for this too.


**Leaping (Shift, or Leap on a touch screen).** A hop the way you're facing: one tile on open ground, or over a gap up to two tiles wide onto the far side. Only some drops can be leapt, the narrow ones in places built for it; walls, and the wide water and chasms that guard the story, can't. Some ground is **loose**: it holds while you keep moving, cracks if you stop, and gives way under you a moment later (it comes back after a while). Leap short or stand too long, and you **fall**: back to where you last stood firm, 3 health down (a fall never takes the last of it). The rules are in `src/rules/leap.ts`, and a map test checks that leaping reaches every parkour reward and opens nothing else anywhere.

**Climbing.** Walls with handholds (ivy on stone, the ice of the frozen falls) are climbed side on, like the climbing event in Google's Champion Island: at the foot of one, press E, and the wall opens in a panel. Move hold to hold with the arrows or WASD (or the on-screen arrows), to the hold right next to you, above, below, or beside: there is no reaching across a gap. Every wall is one connected route of holds that wanders side to side, with spurs off it, some going nowhere. Every second or so a column glows: something is about to come down it, stones on the ivy, icicles on the ice. Get out of that column. A hit knocks you three rows down the wall; the third knocks you off, and you land at the foot, 3 health down. Reach the top row and you stand on the ledge above; from there, E climbs straight back down. Letting go (Escape) costs nothing. Every climb is a new wall, with its own route and its own pattern of falling stones; later faces drop things faster (`src/rules/climb.ts`, `src/ui/ClimbView.ts`).

**Every way out is marked** with a small gold arrow just in front of it, pointing the way through: left through a door in a west wall, down through a door in a south wall, off the edge of the map at a road's end. The direction is read from the walls around the exit (an exit can set it with `facing` where they don't make it plain). A way that is still barred, by a locked gate or a guard, is marked in grey, so you know it's there, and turns gold the moment it opens.
## Run locally

Requires Node.js 22.12+ (Node.js 24 recommended).

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. The bar above the map shows the place, the time, your coins, a **full screen** button (or press **F**), and a **settings** button (or press **Escape** on the map). Settings lists every control and holds **Equipment**, **Return to the cot**, and **Start over…**, which (after asking) erases all saved progress and begins a new game while keeping volume and display preferences. Move with **WASD** or **arrow keys**, and press **E** or **Space** near a person or object to interact. Continue dialogue with **E**, **Space**, **Enter**, or the on-screen button; **Escape** closes it. Touch controls appear on small screens and touch devices.

```sh
npm run build   # Type-check and build to dist/
npm run preview # Serve the production build locally
npm test        # Browser checks using an installed Google Chrome
npm run test:unit # Pure TypeScript combat and memory rule tests
```

`npm test` runs rule tests and browser checks. The browser checks play the real game in Chrome, region by region and feature by feature, from the first fight to the ending (see **Project layout**). Stop any running `npm run dev` first: Playwright reuses a server on port 5173, and source edits reload its pages mid-test. On machines without Google Chrome, install it or change the Playwright channel in `playwright.config.ts` to use an installed browser. Rule tests require Node.js 22.18+ or 24.

## The game today

The whole story is playable, from the church and farmland through the highlands, marsh, mountain holds, ocean, and island finale, with side roads, secrets, and optional fights in every region. The game opens with the hero waking in the church: speak to the priest and inspect the ledger and basin. The church is safe ground: the first fights are out in the farmland, where enemies show their mana signatures and touching one starts a battle. (The automated tests open the game at `/?practice`, which puts a crop locust and a hooded exile in the church to fight.) The priest gives the farmland mission, and the south door opens onto the farmland. Every region's map tiles have been redrawn, lit from the upper left.

## Battles

In battle, command the chameleon and whichever companions are fighting beside him (see **Companions**). Each living member acts once in any order; only then does the enemy act and each surviving companion regain 1 mana. Downed members cannot act, and the party only wipes when everyone fighting has fallen. Party members and enemies have health bars and condition descriptions; exact health and damage numbers remain hidden. Mana is numeric. Enemies target the living member with the most visible mana, preferring the bear in a tie.

Drag any member onto the enemy to attack, or tap that member for self-support. Per-member action buttons offer keyboard and touch access. Chameleon guards himself. Bear can guard himself or protect another companion: drag him onto that ally, or choose a target with his **Protect** selector before using the **Protect** button. Vulture focuses to strengthen her next shot; focus does not stack. Guards last for one enemy turn. Bear also blocks attacks aimed at himself while protecting another companion.

Tuning: ordinary fights last two or three rounds. Bosses are long on purpose, around ten rounds for a player who dodges some of the time, fewer for one who dodges well; most rise for a second stage partway through. All numbers live in `src/rules/battle.ts`. Attacks are physical, so they cost no mana: the chameleon's tail lash, the bear's maul, the vulture's talons. Mana is for spells and spellcraft. Physical guarding and focusing are free, so an empty mana pool cannot stall the turn. Guarding stops physical damage; it is not a spell barrier. Spell barriers cost 5 mana and protect the selected ally until the end of the enemy turn, but only against studied spells. Physical blows pass through them. Enemy health scales with the size of the party: 45% for the chameleon alone, 65% with one companion, full strength with three.

Any fight but the boar can be run from with **Run**, at a price: half the coins you carry scatter behind you, and the enemy gets a free parting blow on whoever it's watching (the wound carries, though it never drops your last standing hero). The enemy stays where it was, and you get a moment's head start.

Victory removes an enemy until you rest or leave the area. Defeat wakes you at the cot (see below). Wounds and spent mana both carry from one fight into the next (see **Wounds and rest**). **Gather**, on every hero's card, spends that hero's action to draw back 3 mana, so a drained hero is never stuck. Supplies are covered under **Coins, shops, and supplies**. Encounter progress resets on reload; studied spells and memories persist.

## Replies

People speak with a portrait in its own box above the text and their name on a tab beside it, as in Omori. Portraits are cut from each character's sprite and scaled up; objects and places show only a name. Many people can be answered. When a speaker finishes, the hero's possible replies appear under their last line; choose one with **1–4** or by clicking, and the conversation goes on from there. After an answer the same questions are offered again, the ones already asked in that conversation dimmed, with **Leave** to walk away; some replies end the conversation themselves. Talking to someone again in the same visit skips straight to the questions. **Escape** walks away at any time. Replies depend on what the hero still remembers and what has happened. While he remembers the feast he can tell the lamb he doesn't think he killed the king; once it is forgotten, that answer is gone and "I don't remember" takes its place. His name is lost before the game begins, so the bear can tell it to him, and it doesn't stay. The priest can also tend the hero's wounds.

## Music

The score is original and synthesised live in the browser with Web Audio, with no sound files: harp, plucked strings, flute, string pads, organ, bells, celesta, choir, bass, and drums, in a generated reverb hall. It aims for the spirit of the Frieren and Made in Abyss soundtracks (wistful folk-orchestral warmth, and something vast and uneasy underneath) without borrowing from them. Each place has its own theme, and themes crossfade as you move.

A place's theme is a short suite rather than one phrase on repeat: its first melody, a second section that moves somewhere else (often to the relative major, with another instrument taking the tune), and a stretch where the tune rests and only the ground of it plays, so most loop after a minute or more. Chords are voice-led, moving by the smallest steps instead of jumping between root positions (`src/audio/voicing.ts`), and the playing has a human feel: every note lands a few milliseconds early or late and a little louder or softer, differently on every pass, with the first beat of a bar leaning slightly (`src/audio/feel.ts`).

**Soundtracks**, on the title screen and in Settings, plays any theme on its own: every place, battle, and boss, with a search. It isn't offered while the inquisitor is hunting you, since it would silence the warning.

| Where | Theme |
| --- | --- |
| The church | Slow organ and bells, A minor |
| The fields | Harp arpeggios and a flute over strings, 3/4, D Dorian |
| Millbrook | A plucked folk tune, E minor |
| The downs | One flute over a drone, like someone whistling with nobody to hear, 3/4, A Mixolydian |
| The border road, the burned farm, the fen, the weir, the abbey, the upper tiers | A drone, a distant choir, a harp note now and then |
| The barrow, the ossuary, the apothecary, the cellars | Low choir clusters and a slow bell, C minor |
| The highlands | Cold strings, a sparse plucked line, a lonely flute, G minor |
| The fort town and the old border fort | A far-off snare and a bugle line nobody answers, E minor |
| The capital: the square, the harbour, the feast hall | A slow organ procession under cold bells, D minor |
| The marsh | A low choir, celesta drips, a harp turning between two chords, B Phrygian |
| The mountain holds | A harp turning high and quick, a flute above it, 3/4, F Lydian |
| The Talon Ring | War drums and a fanfare on staccato strings, G minor |
| The open sea, the pens, the kraken's grave | A bass rising and falling like a swell, choir far off, A minor |
| Wrecktown | A tired sea shanty, 3/4, D Dorian |
| The cuttlefish's reef, the drowned fleet, the spars | A drone, and celesta rising like bubbles, B Locrian |
| Inside buildings | A music-box lullaby, F major |
| Battle | A string ostinato over drums, A minor |
| Each lieutenant, guardian, and named foe, and the kraken | Its own theme: the boar's is "The farm they burned", the hyena's "A table for the dead", and so on (`src/audio/bossThemes.ts`) |
| Waking after a wipe | Choir and bells, C Lydian |

Sound effects are synthesised the same way and have their own volume:

- **Walking:** footsteps that change with the ground: grass, dirt and chalk paths, stone floors and cobbles, wooden bridges, boardwalks and floorboards, water and mud, the woods' leaf litter, and straw. Each area names its usual ground and the floor tiles that differ (`ground` and `surfaces` in `src/scenes/areas.ts`).
- **Talking:** people blip as each line appears, each voice at its own pitch. Objects and places just click, and so does choosing a reply.
- **Doors and rewards:** doors creak, finding something chimes, coins clink, and resting crackles like a fire.
- **Fishing:** a whoosh on the cast, a plop on a bite, then a splash, or a splash and a chime for a catch.
- **Battle:**
  - Each hero's attack sounds different: the tail lash cracks, the maul thuds, the talons rake.
  - A blow that lands thuds, a guard or barrier clanks, a dodge whooshes, and a graze scrapes.
  - Typing a spell ticks, casting shimmers, and a fizzle sputters. Healing, barriers, and gathering have their own tones.
  - A short cue marks victory or defeat.

Browsers only allow sound after the player presses or clicks something, so sound starts then. **M**, or the **♪** button in the top bar, mutes the music; the button is struck through while it's muted. Settings hold separate music and effects volume sliders. All of it is remembered in `tide-keeps.settings.v1`. The compositions are data in `src/audio/themes.ts` (notes, beats, instruments) and the instruments are in `src/audio/music.ts`, so a theme can be rewritten without touching the synthesis.

## Tone

The world is drained and cold. Each area's map has a colour grade (desaturated and darkened, with a vignette), set per area in `src/scenes/areas.ts`; the church keeps a little candlelight warmth. Battle and portrait art is toned to match. The fields carry signs of how this society treats appetite: a gibbet at the crossroads marked COVENANT-BREAKER, the bones of another branded convict in the swarm-mother's hollow, stocks in Millbrook's square, and crows over everything.

The writing is deliberately plain. People talk about what is in front of them: the reeve about his carts, the shepherd about his sheep, the fox about the nightly count. The larger story surfaces only where the guideline puts it, and quietly.

## Buildings

In and around Millbrook, doors lead inside four buildings, each a small room with people and things to look at:

- **The reeve's hall** in Millbrook: a clerk writing to the church for a better convict, and the town's records, which hold the order that burned the boar out.
- **The inn**: barred while the innkeeper stands in the doorway. Pay her 12 coins, or come back once the boar is beaten, and the bed by the west wall is yours to rest in. Inside, a carter will trade what he knows about the ford for a drink, and a rabbit by the fire talks about the watch.
- **The tannery** in the carnivore quarter: the tanner, the vats, and a back door bolted from outside, toward the shuttered stall.
- **The mill**, entered from the fields: the gears off the wheel, sacks of church flour, and the miller's ledger.

When several things are in reach, the prompt offers the nearest one.

## Choices with consequences

Some replies change the world, and the game remembers them:

- **The boar's followers.** After the boar falls, the badger can be told to go before the reeve's watch comes, or told he is being taken to the reeve. Sparing them sends both away; the badger tells you where the boar kept something, a box under the third fence post holding the **Boar's tusk** keepsake (attacks hit 3 harder; 3 less health). Reporting them pays 20 coins at the reeve, and the gibbet at the crossroads has a badger in it from then on.
- **A bed at the inn.** With 12 coins, the innkeeper lets you past her into the inn, where the bed heals wounds and restores mana. Once the boar is beaten, the room is offered freely.
- **Leaning on the stallholder.** Once the bear has joined, asking her to lower her prices gets you twice the board price instead of three times.
- **The nightly count.** Standing in the carnivore quarter's line with the fox earns a firepot and a word for the night market to come.
- **The fishmonger.** Telling him you freed his squid ends his trade with you for good.
- **The heron** will tell you what happened to her mother.
- **The reeve's letter.** The brand is the church's to lift, and the reeve says so. Once his carts are moving again, his grudging thanks comes with a letter of good conduct: Millbrook treats you as a citizen, with board prices at the stall, the inn open, and your face scratched off the wanted poster.

The priest keeps count: asked how many times you have died, he reads the ledger, which starts at forty-one and adds one for every time the party falls.

## Wounds and rest

Injuries and spent mana carry from one fight into the next. In battle a hero regains only 1 mana a round, less than an attack costs, so spells and attacks run the party dry over a few fights. A hero who goes down can be brought back **during the fight** with smelling salts. One still down when the fight ends (won, or run from) has **fallen**: no campfire, bed, or tending raises them, they can't fight or be sent to fight, and the party screen shows them greyed out. **Only the priest can raise the fallen**: 40 coins each, or, from a party that can't pay, a memory, which the tide chooses the same way it does at a death. A wipe wakes everyone at the cot, the fallen included, at the usual price (`fell` and `RAISE_PRICE` in `src/rules/world.ts`). The top left of the map shows each hero's portrait, health, and mana as the next fight will find them, with a reminder to rest when anyone is hurt or drained. The small arrow on it, or **H**, shrinks it to just portraits with thin bars; the choice is remembered.

Rest to heal every wound and restore every hero's mana. Campfires cost coins for wood and a place by the fire (4 at the crossroads and the border road, 3 at the woods camp); the church cot and the priest are free: at the shepherd's fire ring by the crossroads, the abandoned camp in the woods, the carters' fire on the border road, or the cot in the church. As the guideline says, resting brings enemies back: the area starts over around the fire. Waking in the church after a wipe also heals the party. Wounds are saved with the rest of the story state.

## Side quests

None of these are marked. Someone mentions a problem and the player works out the rest.

- **The shepherd's strays.** A ram in the south meadow lost three sheep to the locusts: one on the path into the dark woods, one in the orchard, one by the hay yard. Call each home, then return to him for 15 coins and the **Wool charm** keepsake (5 more health; shows 1 more mana).
- **Free the caught.** The fishmonger will sell his barrel for 25 coins. Inside is a young squid, a child of the sea. Tip the barrel into the mill stream south of the bridge. This is the first of the guideline's "free the caught" encounters; the sea elder in the fleet's pens counts it toward her reward (see **The ocean**).
- **The swarm-mother.** The notice board posts a 25-coin bounty, paid by the reeve. She nests in a hollow deep in the dark woods with two nymphs. The nymphs can be killed, but every third round her brood call raises them again, so the fight rewards striking her hard and fast. Killing her does not end the fight: her nymphs fight on until they are dead too, though with her gone, nothing raises them again. (The boar's followers are different: they yield the moment he falls.) She stays dead once beaten.

## Coins, shops, and supplies

Defeated enemies leave coins, from 4 for a locust to 60 for the cuttlefish; lieutenants and guardians pay the most (`BOUNTY` in `src/rules/economy.ts`). Coins are shown at the top right of the game frame. As the guideline says, coins and supplies gathered since the last death are lost on a wipe.

The stallholder in Millbrook's market square sells supplies at three times the citizen's price because of the brand, and at twice the price once the boar is beaten and the town thaws:

| Supply | Price (thawed) | Use in battle |
| --- | --- | --- |
| Smoked fish | 9 (6) | One standing ally recovers 10 health |
| Smelling salts | 15 (10) | A fallen ally gets back up with 8 health |
| Firepot | 12 (8) | 10 damage to one enemy, aimed like an attack |

In battle, supplies appear in a **Supplies** menu on each hero's card, and using one is that hero's action. Food goes to the ally chosen on the card. The reeve will also sell the bear's writ for 60 coins, the guideline's second way to free him.

## Fishing

Fish at the pond in the meadow or from the mill stream's east bank near the locust field. Cast, wait for a bite, and reel (**Space**, **Enter**, or tap **Reel**) as the sweeping marker crosses the gold zone. Reeling before the bite scares the fish off, and a hooked fish slips free after four seconds. A bobber on the water bobs while you wait and jerks under on a bite; a landed fish leaps clear of the water, and one that gets away leaves only a splash. Bigger fish leave a narrower zone and a faster marker:

| Fish | Sells for | Pond | Stream |
| --- | --- | --- | --- |
| Minnow | 2 | 60% | 20% |
| Perch | 3 | 35% | 50% |
| River eel | 6 | 5% | 30% |

The fishmonger in Millbrook buys the whole catch. Like coins, fish are lost on a wipe.

## Equipment

Press **Tab** while on the map, or choose **Equipment** in settings, to open the equipment screen; **Escape** or **Done** closes it. Each hero carries a grimoire (see below) and holds two keepsakes, found by exploring off the roads. Keepsakes are kept through every death, and most come with a drawback:

| Keepsake | Where | Holder | Effect | Drawback |
| --- | --- | --- | --- | --- |
| Cracked mirror | The abandoned camp in the woods | Chameleon | Reveal hits 3 harder | Hiding costs 2 mana |
| Crow's feather | The last row of the orchard | Vulture | Attacks hit 3 harder | 4 less health |
| Covenant token | Behind the old shrine, guarded by the Shrine warden | Anyone | 6 more health | Shows 2 more mana, drawing attacks |
| Wool charm | The shepherd, for his strays | Anyone | 5 more health | Shows 1 more mana |
| Boar's tusk | Under a fence post at the burned farm, if the boar's followers are spared | Anyone | Attacks hit 3 harder | 3 less health |
| Yoke peg | The reeds below the ford, guarded by the Mire leech | Bear | 8 more health | Attacks hit 2 softer |

Two keepsakes are guarded, and their caches appear only once the guardian is dead:

- **The Shrine warden** stands where the shrine's offerings lie. While either of its two votive candles burns, attacks on the warden break on the candlelight, so the votives must be snuffed first. Every fourth round it relights them, and every third round its Judgement drives half its force through any guard.
- **The Mire leech** lies in the ford. Every blow it lands heals it by the damage it dealt, so dodging and guarding starve it as much as they spare the party. Every third round it coils and strikes hard.

Both are beyond the chameleon alone; with the bear they are hard but winnable, and each stays dead once beaten.

**Fragile keepsakes** are the strongest things money buys, and anyone can wear them, but one worn in a fight the party loses breaks: it is gone, tempering and all, and the wake screen says what broke. One left in the pack, or worn by someone who waited the fight out, is safe. The shop that sold it will sell another (`fragile` and `shatter` in `src/rules/gear.ts`).

| Fragile keepsake | Where | Price | Effect |
| --- | --- | --- | --- |
| A blown-glass bead | The night market, Millbrook | 40 | Attacks hit 4 harder, and 4 more health |
| An eggshell charm | The magpie, in the holds | 55 | Dodges come much easier (+30% timing), and shows 2 less mana |
| A dried sea-star | The chandler, Wrecktown | 65 | 10 more health, and attacks hit 2 harder |

Equipping a keepsake another hero holds moves it. The screen previews each hero's health, mana, and damage as the next fight will build them. Found keepsakes and grimoires are saved in `tide-keeps.world.v1` and equipped ones in `tide-keeps.gear.v1`.

## Grimoires and sequence spells

Each hero carries one grimoire, chosen on the equipment screen, which sets their spell. In battle the spell is its own button under the hero's attack and support. Casting shows a random sequence of the keys **1–4**; type it (or tap the on-screen keys) before the timer empties. One wrong key, or running out of time, fizzles the spell: the turn and the mana are still spent. Stronger spells are longer.

| Grimoire | Where | Spell | Cost | Keys / time | Effect |
| --- | --- | --- | --- | --- | --- |
| Thornwork | Chameleon's own | Thorn volley | 4 | 5 in 3s | 12 damage to one enemy |
| Riverstone | Bear's own | Stone ward | 4 | 4 in 2.6s | Every standing hero guards against physical blows this enemy turn |
| Windward | Vulture's own | Gale quill | 5 | 6 in 3.2s | 16 damage to one enemy |
| Pond-keeper's primer | The heron by the pond | Still water | 4 | 5 in 3s | Every standing hero recovers 8 health |
| Hedge-witch's primer | The burned farmhouse | Bramble snare | 5 | 6 in 3.2s | The main enemy loses its next move; followers still act |

Spells have consequences inside a fight. After casting, a grimoire needs time to settle: damage spells can't be cast again the very next round, and Stone ward, Still water, and Bramble snare wait two rounds. The spell button shows when it's ready. Casting also floods the caster's mana into view for the enemy turn (+8 to the mana enemies see), so the enemy turns on the caster unless someone guards them; casting ends hiding. A fizzle triggers the cooldown and the flare too.

A companion's own grimoire can't be lent to anyone before they join, and a companion who joins takes theirs back from whoever was carrying it. Any hero can carry any grimoire, which is how the guideline's "the grimoire is the class" begins: giving the bear the primer makes him the healer. Damage spells follow the same targeting as attacks, so the boar still shields his followers from them. Which hero carries which grimoire is saved in `tide-keeps.books.v1`. These carried grimoires are separate from the shared grimoire of studied enemy spells.

## Studying spells

Every caster has its own spell: the exile and the deserter hexer cast Salt lance, the warden Judgement, the drowned the Drowning toll, the marsh lights Marsh-fire, and the inquisitor Verdict. Until a spell is studied, by analyzing it (Spellcraft, 2 mana) or by surviving it once, its name shows as ???, it can't be dodged, and no barrier stops it. Studied spells are kept in the grimoire for good.

## Story presentation

The opening, companion reunions, archive fragment, island laboratory, kraken’s grave, and human encounter have illustrated scenes. Each lieutenant has an entrance scene, and resurrection has a short memory-loss sequence. **Continue** reveals the current sentence first, then advances; **Escape** or **Skip scene** returns control immediately. Scenes pause exploration and never select a story choice for the player.

**Settings → Revisit memories** replays unlocked scenes without changing progress. Existing saves can replay memories associated with their completed story flags; the opening is always available. Viewed scenes are remembered in `tide-keeps.scenes.v1`, cleared by **Start over…**. Scene data lives in `src/presentation/stories.ts`, with layered SVG sets, camera drift, and sound cues. New motion effects respect the system’s reduced-motion preference.

Regions have arrival titles, drifting motes, and coastal mist. Battle arenas use illustrated backgrounds, hit sparks, healing and mana effects, persistent barrier shells, and an incoming-target highlight. The enemy stays visible while scrolling through actions. Battle instructions can be expanded when needed. New synthesized sounds include bells, glass, chains, surf, heartbeats, and memory cues, using the existing effects volume control.

## Animation in battle

Heroes lunge at the enemy when they attack and glow when they cast; the struck enemy shows a slash, a spell's burst, or a firepot's flash, and flinches. Enemies lunge as their blows land. A boss's rising scene types out line by line, shows each speaker as themselves, and jolts on spoken lines.

## Guard, barrier, and the pressure of a fight

- **Guard** stops physical blows. The chameleon guards himself; the bear's Protect guards whichever ally is chosen on his card; the vulture's Focus makes her next attack hit harder instead.
- **Barrier** (under Spellcraft) stops spells, but only spells you have studied, by analyzing them or by surviving them once. It does nothing against physical blows.
- Some blows partly drive through a guard (piercing), some **can't be blocked by anything** and must be dodged, and some **land several times**, each dodged on its own. Bosses' signature moves are built from these: the boar's Trample, the warden's Censer storm, the leech's Thrash, the swarm-mother's double Dive, the pack leader's Savage, the drowned's Bell swing, the hyena's Frenzy, and the inquisitor's Verdict.
- **Don't take too long.** A bar under the enemy's intent drains during your turn. When it runs out, the enemy takes a free swing (a guard still holds it), and the bar starts again.

## Dodging

Enemy blows can be dodged with timing, never luck. When a blow is about to land, a ring closes on the companion it targets and a **Dodge** bar appears at the bottom of the screen. Press **Space** (or **Enter**, or tap **Dodge**) as the ring meets the inner circle:

Blows ask for different kinds of dodge (`dodgeKind` in `src/rules/battle.ts`):
- **Ring:** every physical blow. Press Space or tap as the ring around the hero closes. Heavy blows leave a narrower perfect window.
- **Keys:** spells you have studied. Type the three keys shown before the spell lands.
- **Bar:** draining blows, like the leech's latch and the raised dead's gnaw. A marker sweeps a bar; stop it in the gold, as when reeling a fish.

Each hero has an **agility** that widens or narrows their dodge windows: the vulture is quickest (125%), then the octopus (115%) and the frog (110%), the chameleon ordinary, the bear slow (80%). Keepsakes can change it: many add or take away a few percent of dodge timing.

- **Perfect** (within 75 ms; 50 ms for heavy blows of 10 damage or more): no damage.
- **Graze** (within 170 ms): half damage.
- **Too soon, too slow, or no press**: the full blow. A press cannot be retried, so mashing does not work.

Stronger enemies leave less room: the boar's Tusk charge and a studied Salt lance give only about 40–45 ms for a perfect dodge and 110–120 ms to graze, Marsh-fire 35 ms, and the leech's Latch is tighter than a pest's bite.

Bosses also keep their own time, so a dodge can't be learned once and repeated (`lead`, `feint`, and `tempo` on a move in `src/rules/battle.ts`). A charge that is telegraphed closes its ring slowly; a quick strike closes it fast. A **feint** stops the ring dead part-way, shaking in place, then closes it at the usual pace, to catch anyone pressing on the usual beat (the boar's Trample, the hyena's Rend, the cuckoo's Borrowed blade). Some bosses' combos come on an uneven rhythm, each hit with its own timing. Some blows cannot be dodged at all, and their warnings say so: the weevil's Rolling charge, the leech's Coil, and the warden's Judgement. For those, guard or raise a barrier ahead of time.

Each blow in a turn, including each of the boar's followers, is its own dodge. Blows already stopped by a guard or barrier skip the prompt. A spell the party has not studied cannot be dodged. The timing windows live in `DODGE` in `src/rules/battle.ts`.

### The old masters

Three fighters who stopped, one in each of three regions, can each teach a way of dodging. Nothing marks them; each one mentions the next. What they teach is kept like the grimoire, through every death (`Technique` in `src/rules/battle.ts`, `src/content/masters.ts`).

| Master | Where | Teaches once | Technique |
| --- | --- | --- | --- |
| An old wolf, who fought the border war | The fort town | The deserter captain is dead: he taught him | **Riposte:** a perfect dodge of a physical blow strikes the main enemy back for 3. Never the last blow, never through the warden's candles, never at a cuckoo hiding in the party |
| An old hare marine, who stood on the harbour wall | The Millbrook inn | You still remember the kraken: "It only works if you know what it was for" | **Footing:** the graze window is a quarter wider; the perfect window is unchanged |
| A shark with one fin cut short, out of the clan pits | Wrecktown | The shark enforcer, his sister's boy, is dead | **Second breath:** a perfect dodge gives the dodger back a point of mana |

## Magic and the shared grimoire

Open a companion's **Spellcraft** menu for these actions. Each spends that companion's turn:

- **Suppress (1 mana):** show at most 1 mana to enemies until attacking. The next attack reveals the pool and adds damage, with the chameleon receiving the largest bonus.
- **Barrier (5 mana):** protect the ally selected above the action buttons against studied spells for this enemy turn. It cannot stop unknown magic or physical attacks.
- **Analyze (2 mana):** study an enemy's gathering spell before it strikes. It becomes named and blockable immediately.

The exile alternates staff attacks with a spell. Its two-turn countdown initially reads **???**. Surviving its cast also adds **Salt lance** to the grimoire, even if the target falls while another companion survives. A total wipe does not discover an unstudied spell. The exile reveals its hidden mana when casting.

The shared grimoire survives cot resets, defeats, and reloads in browser local storage (`tide-keeps.grimoire.v1`). If storage is unavailable, it remains usable for the current page session and the battle view reports that it cannot save. Memories and story progress are saved separately (see below).

## Companions

As in the story, the chameleon sets out alone; his companions are scattered across the regions and must be found. The **bear** is chained to the millstone west of the stream, and the miller answers only to a writ. The reeve in Millbrook will sign one once the pests are cleared from his fields: the locust in the wheat and the weevil in the hay yard. He also hands it over, pests or no pests, once the boar is beaten, and he'll sell it for 60 coins. Asking him "About the bear." tells you exactly which pests are left. Show the writ to the miller and the bear joins for good. The **vulture** joins in the highlands, the **frog** in the marsh, and the **octopus** at sea. The equipment screen and battles show only the heroes who have joined. **Who fights** (press **P**, or choose it in Settings): any three who have joined, the hero included. Anyone can be sent to wait, so you can go in with fewer; once four are with you, the newest waits by default, and bringing a waiting hero back sends the newest fighter to wait in their place. Someone always fights. Against a region's lieutenant the hero always fights whatever you chose, taking the newest fighter's place. Whoever waits keeps their wounds.

**Matchups.** Every enemy is some of: **armoured, flying, caster, insect, dead** (shown under its name in battle, and in the bestiary). Each hero's own blow fares differently against them: the **bear**'s maul hits armour half again as hard and only half-reaches flyers; the **vulture**'s talons are the reverse; the **chameleon** strikes casters half again as hard; the **frog**'s poison is double in insects and does nothing to the dead. Attack buttons say *strong* or *weak* for the enemy in front of you. Spells, supplies, and followers ignore all of it: magic is the equaliser. Simulated, the right three against the armoured deserter captain win almost every time without dodging; three without the bear win 2% of the time, or about three in four with some dodging (`TRAITS` and `MATCHUPS` in `src/rules/battle.ts`).

## Companion quests

Each companion has one quest of their own, as the guideline asks: nothing marks it. Once the lieutenant of their region is dead, and as long as they haven't fallen, they wait where they were kept and ask to go back. Each reads what was written about them there, and then chooses: someone answers for it, or they simply leave. Either way they end by giving the hero something of theirs, and it **holds his memory of them for good**: the tide can never take it, worn or not, and it uses no anchor. Each keepsake also changes what that companion does in a fight, and fits only them (`src/content/bearQuest.ts`, `src/content/companionQuests.ts`).

| Companion | Where | What was written | Answer for it, or leave | Keepsake |
| --- | --- | --- | --- | --- |
| Bear | The millstone | The miller's labour book: CONVICT, unable to stand, a full day's flour charged anyway, and a request for another convict | The reeve signs no more chained labour at the mill, or the bear hangs the key on the empty chain and goes | **Broken mill-chain link:** Protect guards the whole party (3 mana and his action) |
| Vulture | The battlefield's graves | The garrison chaplain's roll: returned to duty sixty-one times, what she had forgotten each time, and REASSIGNED: THE FIELD under every one | He reads it all out at evening roll and writes SENTENCE SERVED, or she cuts her page out to bury it | **The tally stone:** when her blow fells an enemy she takes back 3 mana and 3 health; hits 1 harder; shows 1 more mana |
| Frog | The hospice grate | The ward book's dose column: VENOMOUS HEALER IN ATTENDANCE beside every death, initialled by the magistrate, who filled Wickmere's cages with it | The magistrate reads it to her on the decks and writes the real cause across his round-up order, or she locks her empty grate and hangs the key outside | **The glass dropper:** her dose mends twice as much; 3 more health; her dart hits 1 softer |
| Octopus | Under the kraken's ribs | The sea elder's count: a black knot for each of the five on the harbour wall, and nothing for why the kraken rose | It ties the church's net onto the count for every pod to read, or cuts its own knot out and leaves the sea's count | **A knot of church net:** Mimic costs 2 mana instead of 4; 4 more health; shows 2 more mana |

Each ending plays as an illustrated scene, with a memory from before the feast in the middle of it (`bearChain`, `vultureStone`, `frogDropper`, `octopusKnot` in `src/presentation/stories.ts`), and can be watched again from **Revisit memories**. The journal's leads say where each one is waiting, and the ending remembers which quests were finished. The companions' standing points are added to the maps by `scripts/add-quest-points.mjs`, which can be run again safely, like `add-secrets.mjs`.

## The farmland

South of the church lies the open farmland, a scrolling map about four screens across with no set route. A waymark at the crossroads points the way:

- **West, over the stream:** the mill, where the bear is chained to the millstone and the miller keeps the key. The bear still remembers the hero (see **Companions** for freeing him).
- **Southwest:** dark woods with an abandoned camp. A fallen oak blocks the path from the track, and dark water fills the ford around the Mire leech, so the only way in is through it.
- **The locust field:** a trampled clearing where a locust feeds and something glints.
- **The meadow:** a pond with a heron who fishes for herself.
- **The south meadow:** a shepherd missing three sheep.
- **East:** an apple orchard with a grain weevil among the rows, a fenced hay yard with another, and an old Covenant shrine in a ring of standing stones, watched by a hooded follower of the boar.
- **South:** the high road to Millbrook. **East along the track:** a second waymark where the field track bends south to skirt the town and join the border road north of the brambles. Past it, the track climbs onto the downs.
- **North, up the stream:** a path along the east bank leads into the fen.

### The downs

Open chalk pasture east of the fields. An old ram has lost three lambs this month to a hound pack that dens in the broken watchtower to the north, and he'll pay fifteen coins for the leader. The **Pack leader** fights with two hounds; every third round he rushes with the whole pack, an undodgeable blow that grows with every hound still standing, so thin the pack first. Lone **starved hounds** roam the gorse with a fast lunge.

Under the barrow to the south, the leader's mate is nursing pups. She takes the lambs so she can feed them. Bring her **three fish** and the family leaves over the border that night: no fight, a few grave coins from her, and only five grudging coins from the ram. Kill the leader instead and the barrow is empty when you come back. Either way the pack is gone and the **Iron collar** under the tower stair can be taken (a bear keepsake: hits 2 harder and 4 more health, but shows 3 more mana). There is also a dew pond to fish, a fold fire to rest at for 3 coins, grave goods in the barrow, a cairn, and a running wolf cut into the chalk that somebody keeps scouring clean.

### The fen

Upstream of the mill, the water spreads over the drowned hamlet of Wetherby; the roofs still stand in it. **Marsh lights** hang over the water with a very fast flare. An otter poaches eels from a camp on a hummock and sells them to the fishmonger at his back door. Promise not to tell and she parts the reeds to her eel run, the best eel fishing in the game. Report her and the reeve pays ten coins, but the camp is empty when the watch arrives.

The sluice gate above the mill holds the fen back. Open it and the water drops enough to uncover a causeway, three tiles wide, from the middle island's boardwalk to the sunken chapel, where **the drowned** still holds the bell rope: it tolls an undodgeable, guard-piercing blow every third round and tries to pull someone under. Beyond it is the **Drowned psalter**, which teaches **Undertow**, the hardest-hitting spell so far (seven keys in three seconds). Opening the sluice slows the mill wheel, and the miller notices.

### Millbrook, the border road, and the boar

Millbrook is a prosperous herbivore market town. The reeve, the innkeeper, a stallholder, a lamb, and the fishmonger live on the west side and around the market square. The carnivore quarter lies east, behind a wall whose gate locks from the herbivore side. Townsfolk react to the hero's species and his brand: the stallholder triples his prices, the inn turns him away, and the notice board still shows his face. Nobody explains the fishmonger's barrel or the shuttered stall behind the tannery (see **Side quests** and **The night market**).

South of Millbrook, the border road is blocked by a wall of brambles. The lamb in the market square lost her bell in the locust field; it lies in the trampled clearing in the locust field, where it can be grabbed by slipping past the locust or after a fight. Bring it to her and she teaches **Bramble's leave**, a favor spell written into the grimoire. Speak it at the hedge and the brambles draw back. Beyond them, loaded grain carts sit turned around while a highland carter and a farmland guard wait for each other to move first. Further south, one of the boar's hooded followers waits on the road with veiled mana and an unknown spell.

Before the boar can be fought, the hero has to earn the right to face him. At the south end of the border road his **sister**, a sow, keeps a barricade of charred beams across the lane, and she won't let anyone from Millbrook past until they know what happened. Two things have to be found out:

- **The burn order**, in the records at the reeve's hall: the reeve signed it "on suspicion of the miller's kid," and nothing records the kid coming home. Afterwards the clerk and the reeve will both talk about it, and the reeve points you to the sister.
- **The kid himself**, alive, up on the downs with the old ram's flock. Ask him whether the boar ever hurt him: he says the boar gave him bread through the fence, and that the reeve tore the page out.

Tell the sister both, and she drags the beams aside. At the farm the boar is sitting in the ashes of his doorway and **talks before he fights**: about the kid, why he stopped the grain, and the man with no fur who listened. The fight starts when you tell him "Then we fight."

The road ends at the boar's burned farm, where he waits between his followers, a badger and a rat, both standing armed with cudgels. Every hit aimed at a follower lands on the boar instead, at half strength, and adds fury. Fury raises his damage, and that extra damage drives through guards. Clearing the followers first wipes the party; fighting him directly while the bear guards wins. A notice on the gatepost tells his story. Once he is beaten he stays beaten: his followers mention a stranger with no fur who sat with them and listened, a cup from the feast lies where he stood, and the reeve, the inn, the carter, and the guard all change what they say.

Nothing marks the quest. A carried item is lost on a wipe and returns to where it was found. The opened hedge and learned spells persist, saved in `tide-keeps.world.v1` and the grimoire.

## Enemies and bosses

Crop pests show their full mana and only strike physically, as the guideline describes. The weevil jabs most turns and makes a heavy rolling charge every third round.

Every boss has a **second stage**. The first time a boss is brought down, it doesn't stay down: the fight stops for a short scene, told line by line over the boss's art (the boar's badger begging him to stay down, the hyena explaining that nobody down here stays dead). Then it gets back up with half its health (the warden with less, the hyena with a little less) and fights on as something worse: the battle title changes, SECOND STAGE shows above it, the boss burns redder and moves faster, and it roars. The second time it falls, it stays down (`STAGES` in `src/rules/battle.ts`):

- **The boar, cornered:** gains fury and charges every round.
- **The warden, unbound:** both votives flare up again, and Judgement falls every other round.
- **The mire leech, shedding:** sheds its skin and heals, bites harder, and coils every other round.
- **The swarm-mother, airborne:** her brood rises again and she dives at you, fast.
- **The pack leader, howling:** the fallen hounds get up, and he rushes with the whole pack every other round.
- **The drowned, the bell freed:** swings the bell itself every other round, harder than the toll.
- **The hyena, not laughing:** eats her own standing dead on the spot, then feeds every round there is a body and lunges every other round.

The viper, the cuckoo, and the cuttlefish rise again too, as described with their regions. The human's second stage comes when he is brought down once: a stolen memory returns, and one of his borrowed spells goes quiet.

Ordinary enemies notice the hero when he comes close and come after him, a little slower than he walks; they give up and go back if he gets far enough away (`CHASE` in `src/scenes/area/foes.ts`). Bosses and guardians hold their ground. Ambushers hide their mana: besides the highland raiders, the downs hounds, the battlefield's raised dead, and a weevil in the dark woods strike first if they reach you unseen. People breathe and turn to look at the hero as he passes, enemies bob and face him, and in battle every fighter breathes, heroes hop when they act, and anyone hit flinches.

Every fight is optional except the boar. Leaving an area and coming back respawns its enemies. A wipe anywhere wakes the party at the church cot, and **Return to the cot** works from any area.

## The highlands

Once the boar is dead the priest has new orders: bodies are going missing from the old battlefield below the highland fort, and the church wants the "grave-eaters" put down. On the border road, the track east past the guard climbs to the pass. Until the carts move, the guard turns you back.

- **The high pass.** Switchbacks up through rock bands and snow. **Highland raiders** hide their mana: their signatures show from a distance but flicker out as you come near, and touching one then is an **ambush**, so the fight opens on the enemy's turn. A courier lies dead on a scree ledge with a sealed letter for the fort's quartermaster. It's a carried item, so a wipe loses it and it goes back to the body. There is a fire partway up (4 coins).
- **Fellgarth, the fort town.** A carnivore garrison, where the social order flips: nobody stares at a reptile or a bear, and the frightened ones are the herbivore merchants behind their own wall. A goat sells through the bars at the board price, and a weasel in the alley runs the black market, buying fish and selling salts and firepots at fair prices. Families queue for a fish ration that shrinks every week. Delivering the courier's letter shows the church cut the ration before any unrest, and pays 15 coins. The garrison fire costs 4.
- **The barracks.** Under the long bunk built for wings, the vulture hid a note in her own hand: TRUST THE CHAMELEON.
- **The battlefield.** The vulture clears the dead. She doesn't know the hero and attacks him as a grave thief: a duel you only need to **survive for three rounds**, because she cannot be brought down. After that she'll talk but won't trust you. Bring her the note and she joins, as the third party member. Come to her already carrying the note and she stops before attacking, and there is no fight. The **raised dead** wander the graves, and drag marks lead to a ravine whose bridge is raised on the far side. No spell opens it; ask the vulture and she flies over and drops it.
- **The ruined abbey.** Two deserters hold the gate, a hexer and a brute. In the same round the hexer casts Salt lance and the brute swings a heavy pick, so the party has to guard against one and raise a barrier against the other. The hexer's spell can be analyzed like the exile's. A memorial to the winter of no bread stands outside, and the Famine spoon (a keepsake: shows 3 less mana, but 3 less health) is hidden behind the altar.
- **The ossuary key.** The stair is locked behind an iron grate. The abbey's last monk has the key, but won't give it up while three of the hyena's dead lie in his yard. Bury them (with the vulture along, she does it properly), and he hands it over. He also tells you he ate what she brought that winter, and preached against her after.
- **The ossuary.** The hyena **talks first**: why she keeps the dead from the ground while the fish ration shrinks, and the monk's part in it. The fight starts when you tell her the church sent you. She keeps the dead of the famine in its niches, and she is the hardest fight so far. She attacks with two ghouls and raises them every third round. **Anyone falling**, on either side, makes her stronger, as the guideline says. Every other round she **feeds on a fallen body**, healing and growing stronger still. Her laughing lunge is very fast and drives through most of a guard. A fallen hero is safe only under a barrier, which can now be cast on the fallen, and she will eat her own downed ghouls, which she then can't raise again. Beaten, she tells you why she was exiled, that the man with no fur ate at her table, and that her ledger proves the church cut the fish first. The vulture notices the kingdom punished her with the same work it exiled the hyena for.
- **Afterwards.** On the pass, a signature far larger than anything so far waits by the road: the inquisitor. He cannot be beaten yet. Run.

**The inquisitor's hunt.** From the hyena's death until you speak with him in the holds' archive, he can pick up your trail anywhere on land: about one chance in twenty for each minute you spend exploring. A bar warns **Spotted**, and you have five seconds to get moving. Then he comes after you for 45 seconds, under his own theme, following you through doors and between areas. If he reaches you, you fight him. Stay ahead until the time runs out and he loses you for at least five minutes. Menus and hidden tabs don't count toward any of it, and he never follows you to sea or to the island (`src/rules/pursuit.ts`, `src/scenes/area/hunt.ts`, saved in `tide-keeps.pursuit.v1`).

### The old border fort

Through the fort town's north gate, a ruined keep the town was built to feed, held now by deserters. Wolves hunt the snow outside. The archive in the west wing keeps the border war's rolls (the farmland's dead with names, the highland dead with numbers) and one newer roll, in a church hand, recording how long the garrison takes to grow angry each time the fish is cut. Its last entry: SUFFICIENT. The **deserter captain** holds the inner yard with his lieutenant: his volleys come three at a time and can't be blocked, and he executes the fallen through any guard. Behind him, at the top of the tower, is the garrison's **signal lantern**.

The ossuary is dark now: the monk gives you the key, but tells you not to go down without a real light. The stair opens only with the key and the lantern.

The fort's **smith** tempers keepsakes, once each, for 30 coins: a tempered keepsake's benefits grow by half (rounded up) and its drawbacks stay the same (`keepsakeMods` in `src/rules/gear.ts`).

Some enemies bring **company** that fights beside them from the first round: the raider camp on the drove road, the raider on the high switchback, and a harrier on the rookery road each come in pairs. The leader falling isn't enough; every one of them has to go down. On the map, a signature shows how many are coming (`◇ 3 ×2`).

### The rookery road

From a gap above the old border fort's west wall, the couriers' road climbs toward the mountain holds, past frozen falls, to a black gate painted BY ORDER OF THE HOUSE, chained, with the house's seal on it. Once the church sends you there (after the viper), it stands open. **Harriers** hold the road now; their stoop can't be guarded, only dodged, and one comes in two waves. The raven courier in the fort town asks you to carry her last letter up and slide it under the gate (it's the only copy; lost if you fall). In the falls, her sister is frozen mid-flight with an unsigned order sealed in a cuckoo's egg. Bring it back to the raven for the **Raven's quill** (vulture: much easier dodges, +1 damage, −3 health).

People you already know have darker things to say if you ask: the priest (once you're back from the boar), the reeve, the miller, the innkeeper, the sergeant, the quartermaster, and the lynx in the bread line.

### Writing down, and reminders

The vulture's note teaches the hero to **write things down**. Once she has joined, every rest at a fire, bed, or cot opens **By the fire**:

- **Write one memory down.** The tide can't take it at the next death. After that death it has to be written again. There is one slot, so the question at every fire is which loss you can least afford: the kraken's dodging before a hard fight, a companion before a long trip, the feast before the end.
- **Ask a friend to remind you.** A companion who has joined, and whom the hero still remembers, can remind him of one thing he has lost (not his home or name). It is his again, perk and all, **until his next death**, when the tide takes it back as well as whatever it chooses. **Write a reminded memory down** and it stays his for good. Forget a companion and they can't remind you of anything; the frog won't remind you of anything until the viper is dead and she trusts you again.

- **Putting it back together.** A friend's reminder isn't handed over: they tell it in four pieces, out of order, and the hero puts them back in the order it happened (`src/ui/PieceView.ts`, rules in `src/rules/piecing.ts`, the pieces and each friend's voice in `src/content/piecing.ts`). Wrong is never a failure: the friend corrects him, the pieces he had right stay with a tick, and the rest come back. Each memory is always told in the same scrambled order, and *Just tell me* hands it over whole.
- **Telling a friend.** Giving a companion back the feast, the kraken, or who you are works the other way round: they ask two things only someone who was there would know (what the rulers swore, how many the vulture buried, the octopus's knot), and the hero picks the true answer from three (`src/ui/GiveView.ts`, questions in `ASKING` in `src/content/piecing.ts`). A wrong answer is struck through and gets a look, not a penalty. *Just tell them* skips the questions.
- **Places that stir what he lost.** Arriving somewhere tied to a memory he no longer holds (the feast hall, the harbour wall, the battlefield, the hospice) gives a line he can't place, once a session: "Sixty-one. The number comes to you here, and won't leave."

Anchors and reminders are saved with the memories in `tide-keeps.memory.v1`.

## Orders

The **journal** (J) opens with the church's current **orders**: the region's aim, in the priest's words, and the next thing that would move it on (where to go, or who to ask). Below them are your open **leads**: what you are carrying and who it is for, and promises still to keep. Both are worked out from where the story stands (`src/rules/orders.ts`).

Beating a region's lieutenant (the boar, the hyena, the viper, the cuckoo, the cuttlefish) finishes the church's orders there. The brand on the hero's wrist goes warm, and you can **go back to the priest** at once for the next orders, or stay and walk the region a while. The priest always has them waiting.

## The marsh

Once the hyena is dead, the priest sends the party downriver: a sickness in the river towns, and the church's stores spoiling at Wickmere. The **crane at the weir** ferries you down ("Take the ferry downriver"); until then she turns you back.

- **The causeway.** Boardwalks over black water, in **fog**: enemies see you from less far off, and you can't see their mana until you are close. Mosquitoes poison; water scorpions wait under the boards. An old coypu eats only what he catches and hasn't been sick once. Off the main walk, the **reed-bed queen** guards her eggs: her blood cloud poisons through any guard, she drinks what she bites, and she hatches more of her brood.
- **Wickmere.** A stilt town where the river meets the tide. The **tidal road** runs south from its decks down the estuary to the capital's harbour; it is under water at night. From the harbour end, a church marine lets you up only once the church has sent you downriver. The magistrate has caged everyone venomous (pay the newt's "fine" to free her); the smokehouse otter notices the church barrels come upriver already resealed; a widow says her husband was sick after supper, not after a cough. The herbalist sells **antivenom**. There is a waystone, a fire, and fishing under the decks.
- **The ferryman.** Kill the reed-bed queen and he teaches you **Still the water**, an old river word that makes the channel firm enough to walk on.
- **The far bank.** The church storehouse, roof fallen in. The viper's **apprentice**, a toad who believed her, casts **Souring**. Under his apron is a vial of milked venom and a dropper the size of the holes in every sack. Three crates nobody spoiled are sealed and marked FOR THE LIGHTHOUSE.
- **The hospice.** The **frog** heals under guard behind a grate. She remembers the party but not the feast, and no longer believes you were framed. Show her the vial and she comes to stop a poisoner: not for you.
- **The flooded apothecary.** Only with the frog. The **viper**, a healer whose patient died of a fever and who was blamed and drowned for it, talks before she fights. Everyone starts **poisoned** in her shop, and her Souring turns healing into harm. Brought down once, she sheds her skin and the air goes bitter. Beaten, she lies in the water and still talks: the man with no fur was the only one who ever asked what really happened. She leaves the **Viper's fang** (frog: dart hits 3 harder, 3 less health); afterwards the hospice sister gives you her **handbell** (6 more health, shows 2 more mana).

Off the marsh's roads:

- **The pens**, east along the far bank. Where the magistrate's "moved somewhere they can't do harm" goes: church cages on stilts over the flats, and a ledger with columns for VENOMOUS, FIT FOR WORK, and SHIPPED (to the lighthouse). There is no column for returned. The **pen-warder**, a snapping turtle, holds the keys: he is armoured, so bring the bear. Open every cage, the newt's eight-year-old brother among them, and the adder gives you her **Adder's coil** (frog: 5 more health, +10% dodge timing, shows 1 more mana).
- **The smugglers' creek**, down a walk south of the causeway's mudbank. A seal in oilskins sells unstamped sea goods (the only Smuggled blade outside the night market), and tells you about the church's boats that go out to the lighthouse every new moon, low in the water, and come back high. A marsh light and a scorpion; a fire; eels in the creek.

**Poison** bites at the end of every enemy turn (2 health) and counts down. A poisoned blow only poisons if it lands: a perfect dodge keeps it out. Heals draw it out; antivenom draws it out without healing. **Souring** is a spell: for two turns after it lands, every heal (spells, supplies, the frog's dose) burns for as much as it would have mended. Like other spells it is hidden until studied. **The frog** fights with one toxin in two doses: her **dart** poisons the enemy (3 a round for 3 rounds), and her **Dose** mends the ally chosen on her card by 6 and draws out their poison. Her grimoire, the **Hospice litany**, teaches **Bitter tonic** (5 health to everyone, and the poison out of them).

## The mountain holds

After the viper, the priest sends you to reopen the messenger routes: the birds have stopped flying and the holds have shut their gate. The **holds' gate** at the top of the rookery road now opens for the church's convicts. No companion joins here; this region is the hero's.

- **The climb.** Switchbacks up a cliff face in the wind, where **mana lies**: some big signatures are decoys (humming charms that come apart when you walk into them), and a crack in the rock showing ◇ 1 holds a **crag spider** the size of a cart. Cliff hornets poison.
- **Scarrow, the hold.** A city up a cliff face, ranked by height: the ground-dwellers' tier at the bottom (sparrows, porters, a fire), the market tier above (a magpie's shop, an out-of-work pigeon courier, a wren whose son stopped writing, the chained **rookery**), and the house's **great stair**, shut by a goshawk who won't let ground-dwellers, least of all a scavenger, any higher. The waystone is on the market tier.
- **The lesson fight.** The **house duellist** guards the old climbers' path. His mana reads 2 and never moves, even when he casts Talon hex: real mana drops when a spell is cast, and a false display never does. He leaves the **Liar's charm** (shows 4 less mana, hits 1 softer).
- **The upper tiers.** Only the hero climbs the cliff, **alone**. Falcon sentries stand on the noble house's terraces with their sight drawn on the ground; one who sees you with your mana showing throws you down to the hold. **Hide your mana (Q)** past them, and mind how much you have. Somewhere up here is the **stair lever** that lets the others up, a gallery with one chick painted out of a family portrait, and the archive.
- **The archive.** Copies of every letter the rookeries carried. An old church order transfers a young guard away from "the island project": *he is not to be told why*. The name is yours, and you **remember the laboratory**: a long white room, a child with no fur in a cage, and the keys in your hand. (The memory line under the map now reads "one found: the laboratory".) A copy of a letter to the feast hall's steward says the house would send its own hooded cupbearer. Then the **inquisitor** is behind you, reading over your shoulder, and for the first time he doesn't attack: "I will look into this. Then I will come for you."
- **The lord's hall.** The lord's mana reads 3 and never moves. He is the **cuckoo**, raised as the house's son and thrown out when they saw the eggshell. In the fight he **slips into the party**, wearing whichever companion shows the most mana: everyone else's mana is shaken loose, his doesn't move, orders given to that companion are quietly betrayed, and a knife comes from inside the party every round. Press the red **Strike** button on the card of the one whose mana never moved (the first ready hero, the hero first, does the striking) to throw him out of the shape (a heavy blow to him), but strike the wrong one and you hurt a friend. Brought down once, he gets up wearing no one's face.

Off the holds' roads:

- **The cellars**, through a door in the west wall of the lord's hall. The **real lord** is chained in a cell, fed carefully by the cuckoo. Once the cuckoo is dead you can **open the door** (he gives you the **house signet**: the hero's reveal hits 2 harder, 2 less health) or **leave him** there. In the next cell is the **wren's son**, who saw the lord's face come off; send him home, and his mother on the market tier gives you the **Wren's feather** (vulture: hits 2 harder, shows 1 more mana). The house's store is full: it has been eating all year while the ground tier hasn't. Cave crickets leap in the dark.
- **The old eyrie**, up from the rope-bridge pillar on the climb. An old eagle, the holds' first courier, keeps the oldest letters (one, from before the Covenant: *I am so hungry. Are you?*) and remembers flying the church's monthly supplies to *a white house on a rock* past the coast: food, medicine, and cages. His **lost flight** froze in a storm and still flies: dead and flying, so poison does nothing and the vulture's talons are strong, and their whiteout can't be guarded. Put them down for the **Courier's bell** (+15% dodge timing, shows 2 more mana).

Afterwards the rookery opens and letters fly again. Among a year of undelivered mail is a letter to you from the octopus, at sea; and a swift has seen a lighthouse on an island that is on no chart, with ships going out to it full of fish.

## The ocean

After the cuckoo, the church has no orders past the coast: going to sea is the hero's first act of desertion, and the priest looks the other way. **The seal at the smugglers' creek** takes passengers out, **by night only** ("Take me out to sea"). At sea the rules change:

- **Dying at sea costs two memories.** The church can't fetch you back cleanly; the wake-up screen shows both.
- **Depth hides mana.** In the open water, enemies show on the map only when they come up to breathe, then sink again.

The places:

- **Wrecktown**, a port of wrecks lashed together, where nobody looks at the brand. A gull runs the port; a seal fishes only what the port eats; a pirate won't follow the church's boats to the light. **The chandler** sells the **Riptide codex** (Riptide: 22 damage, the strongest spell a hero can carry) and other things the church banned. A **hooded sailor** at the rail calls you by a name you don't remember, and you know it's yours: it's **the octopus**, hiding from a shark clan's bounty hunter at the next rail. Deal with the **shark enforcer** (armoured: bring the bear), and the octopus joins. It remembers the feast best of anyone: the cupbearer had hands with no fur and no claws.
- **The octopus** fights as the copier. Its **Mimic** throws back the last spell written into the grimoire, at its full power, for 4 mana: study a caster's spell and the octopus can hit with it. Its grapple is strong against armour and can't reach flyers; its grimoire, **Tide tables**, teaches **Ink cloud**, a quick snare. It teaches the party to **ride the currents**, which opens the open water.
- **The open water**, past Wrecktown's last hulk: currents between reefs and rocks, barracuda that strike from under the swell, lantern jellies whose drift can't be dodged, and in a wreck to the north-east the **mirror eel**, the lesson fight: it opens with the party's own strongest spell, backwards, and nobody can dodge their own spell coming the wrong way.
- **The fleet's pens** (south-west): the land's catch kept alive in church nets, fish and not only fish. The salt barrels are stamped SMOKED FISH, WICKMERE: the same rations you have healed with since the farmland. **Cut the nets.** **The elder**, an old seal, keeps count of everyone the land has taken and let go: if you've freed the squid or the harbour crab, opened cages on the land (the pens, the otters' brother, the newt), and cut these nets, she gives you **the elder's pearl** (8 more health, shows 2 more mana), and the cuttlefish will tell you where the island is.
- **The kraken's grave** (south-east), a sandbar of ribs as tall as houses. Under them the sand is full of church net, wrapped round the kraken's arms: it didn't rise to attack the land; it came up tangled, after the nets took a whole reef in one night. The octopus won't look while you take its **tooth** (octopus: grapple hits 4 harder, 4 less health).
- **The cuttlefish's reef** (north, once you've seen the grave). Kin to the kraken, uniting the sea to end the fish trade. It **throws back the last spell you cast**: a damage spell comes back at you at full power, a heal heals it, a ward wards it, a snare costs a hero their next move. Feed it the small spells and fight with your hands. Brought down once, it rises in no colour at all and throws back every turn. Afterwards the octopus brokers a truce, not the old one, and the sea tells you where the island is: south, past the charts, where the light is.

## The island

After the cuttlefish, follow the current south to the island. The shore, works, ruined laboratory (the white house), and lighthouse are quiet; the human waits in the lamp room. Read the works' daybook to learn what the church has been rendering into rations, and open the cages. In the laboratory, the records explain the resurrection basin and the hero's erased past. The human is not hostile: he offers the hero a place beside him.

The human's invitation becomes a choice only if the hero still remembers the feast, at least one companion, and the door he opened as a guard. Without those memories, he sits beside the human, who holds what he has forgotten. With them, he refuses and the human fights using the party's lost memories as spells. Defeating him gives those memories back; the hero's choice to spare him opens the good ending. The inquisitor brings the evidence that clears the party's name, the resurrections stop, and the old Covenant must make room for the sea. The ocean route back north remains open from the island landing.

## The capital

The church has a side door in its west wall, out into the capital, Covenhithe. Nobody fights here; it's a place for listening.

- **The church square.** A bronze statue of the five heroes with every face chiselled off, the chameleon's first. A fountain of salt water piped up from the harbour. The hall of the Long Table, chained shut by the regency. The alchemists' wing behind a gate whose church seal is renewed every week. A crier reading the regency council's proclamations, a child selling broadsheets about the feast murders, a lamplighter who saw the alchemists' gate opened the night of the feast, an old doe whose son held the doors, a church guard who keeps an eye on you, and a licensed apothecary who charges the branded double.
- **The harbour**, down the steps. The wall rebuilt where the kraken came over, its ribs still in the water, and one of its arms nailed along the quay. The last shrine, where the fish come ashore, with an answer carved on its sea side. Fishing off the pier. A gull fishwife keeps a crab woman in a market tank: buy her for 20 coins and let her go, and she leaves you the **Tide shell** (a keepsake: 5 more health, shows 1 less mana, hits 1 softer). The old turtle harbourmaster remembers the kraken and the church's ships that sail past the headland and come back empty. A seal dockhand, and a dismissed steward of the feast hall: buy him a drink and he tells you about the hooded cupbearer nobody hired, and gives you the hall's staff key.
- **The hall of the Long Table.** The feast was never cleared. The long table with its stains, the rulers' chairs over scrubbed stone, the five stools at the far end, the cupbearer's sideboard with a gilded cup beneath it (the twin of the one at the boar's farm), and the kraken's arms still hanging from the rafters. What you see of your own seat depends on whether you still remember the feast. An old cleaner saw the cupbearer climb down from one of the alchemists' carts that afternoon, the first carts through that gate in twenty years.

## A connected world

The regions are joined in more than one place, and some links only open from the far side, so the world folds back on itself:

- **The weir**, up the path north from the fen's meadow, is the otters' country. The church fishery's goose warden has caged the otter's brother for poaching eels his family has taken for a hundred years. Pay the warden 15 coins, or bring the bear to lean on his hut, and open the cage. The old otter gives you the **Weir hook** (a keepsake: hits 2 harder, shows 1 more mana) and shows you the smugglers' stair. Her kit remembers the man with no fur asking how many fish the church takes. A mink smuggler will give you a crate to carry to the weasel in the fort's alley, a two-region errand worth 20 coins; it's lost if you die on the way. The eel weir can be fished, and marsh lights and one of Wetherby's drowned guard the banks.
- **The high tarn**, up the smugglers' stair, is a frozen lake under the pass. Cut fishing holds **mountain char**, the most valuable fish, found nowhere else. The trapper's partner lies under the ice; bring him her ring and he gives you the **Frost ring** (the vulture's keepsake: 7 more health, hits 1 softer). Hounds and a raider hunt on the ice. A rope ladder climbs to the middle of the pass, but it can only be let down from the pass side.
- **The drove road** runs from the downs, east up the chalk, to the battlefield's south gate. A wolf drover takes herbivores' sheep up to the carnivores' fort for them, and remembers a man with no fur carrying a sack toward the abbey. Raiders camp in a ring of boulders with a stash of stolen coin. The gate at the top is barred from the battlefield side: lift the bar from there and the road opens both ways.

## Off the roads

Seven places nobody is sent to, one or two in every region (`src/content/outskirts.ts`). Each has someone in it, something to find, and something the church would rather nobody saw.

- **The orchard**, down the sunken lane at the south edge of the downs. An old hare keeps a dead family's apple trees alive, and has grafted a branch for each of them onto a stake. A heap of weevils in the old tree: a big one and three small, all at once. Kill it and she gives you the **grafting knife** (chameleon: reveal hits 3 harder, shows 1 more mana).
- **The quarry**, west off the border road. Branded convicts on one chain, cutting stone stamped FOR THE LIGHT. Kill the overseer (an exile, with two of his men beside him) and the mole will let you break the chain. The old cutter gives you his **wedge** (bear: hits 3 harder, dodging 10% harder).
- **The shieling**, east off the drove road. The shepherds' summer huts, snowed in, and a sheepdog still keeping the flock for shepherds taken in the levy. You can tell her they aren't coming back. The **shepherds' horn** is in the hut (4 more health, +8% dodge timing, shows 2 more mana). Harriers and hounds hunt there.
- **The lanes**, east of the harbour. Tenements, the church's soup line (a name in the book before every bowl), and a pump with the church's lock on it. A rat's son went down the yard's grate for free water and hasn't come up. She gives you the bar to lift it.
- **The cistern**, under the lanes. The city's water, a valve the church shuts in "dry years", and three dead standing in the water together. Put them down, and bring the boy up. His mother gives you his **tin cup** (shows 2 less mana, 2 less health).
- **The peat cuttings**, south of the far bank. A vole cuts peat for the capital, and leaves where they lie the bodies the bog gives back. The oldest is three hundred years old and wears your brand. In his hand is the **old brand-iron** (hits 2 harder, 4 more health, shows 3 more mana).
- **The drowned fleet**, out on the current east of the open water. Three church boats scuttled together on the way back from the light. A hermit crab lives in a marine's helmet. The manifest reads PASSENGERS FOR THE LIGHT, 14. RETURNING: —. The **drowned bell** is in the hold (octopus: 6 more health, hits 1 harder, dodging 10% harder).

### Places you leap to

Four places reached only by leaping, Hollow Knight style: gaps, single pillars to land on, and bridges of loose ground to cross without stopping.

- **The gorge**, east off the high pass. Islands of rock over the drop; a crack, a wider crack, a ledge of loose stone, and a lone pillar to the last ledge, where a marten courier died taking the short way to the holds. Her satchel holds **climber's chalk** (+15% dodge timing, 2 less health) and a letter that never reached the house. A shelf below has a carving from before the Covenant.
- **The old spires**, west off the climb. The tops of the old rookery towers standing out of the drop; slate bridges that slide away underfoot, two lone pillars, and at the far tower the oldest nest in the holds, with the **falconer's hood** (vulture: +20% dodge timing, shows 1 less mana, hits 1 softer). Undelivered post on the couriers' perch.
- **The sunken rows**, up the old alley north of Wickmere. The first town, drowned when the church cut the river a new course; rooftops over deep water, rotten boards, and the belfry with the parish register, which shows who owned the ground before the flood, and a **reed charm** (frog: 4 more health, +10% dodge timing, shows 1 more mana).
- **The spars**, east of the drowned fleet. A fourth church boat, the *Charity*, went down further out than the others, and her decks and hulls stand out of deep water: open sea to leap, a run of loose spars that go under anyone who stops, a lone masthead, and the crow's nest, where her lookout lashed himself to the mast and watched the light the whole way down. His **lookout's glass** (chameleon: +10% dodge timing, reveal hits 2 harder, shows 2 more mana). The hermit crab at the fleet knows there were four.

### Places you climb to

- **The old watchtower** on the downs, climbed from the inside once the pack has gone from its foot: four faces of ivy between ledges where the floors used to be, each faster with falling stones than the last, to the watch's hearth at the top. The **watch's flint** (hits 2 harder, -5% dodge timing) is in a niche, and from the top you can see the whole farmland, and far out past the capital, a light that turns.
- **The frozen falls**, east off the rookery road: three faces of ice to climb, with icicles coming down them, a crack to leap, and loose ice to the hollow behind the falls, where couriers waited out storms. A courier's **ice pick** (bear: hits 2 harder, 3 more health, shows 1 more mana) is with the old picks.

### Behind false walls

One room in each land region is hidden behind a wall that only looks solid (`src/content/secrets.ts`, `src/scenes/area/hollows.ts`). The only tell is a thin crack along the face that opens onto the map. Walk into it and the wall crumbles, and stays open. Each holds something the church buried, and a little to keep going on.

- **The robbers' tunnel**, in the west end of the barrow mound on the downs. Someone dug in from the side and stopped: CHURCH GOT THERE FIRST. Coins and smelling salts.
- **A cleft in the rock**, in the outcrop at the top of the high pass. A deserter's hide: a levy notice with the name torn off, a letter that stops. A trail cake.
- **A room with no door**, in a Wickmere house, through the alcove in its front. Sealed from outside, QUARANTINE. BY ORDER. Antivenom.
- **Inside the wall**, the hold's tower wall. Where the messengers waited out the winter, with the letters the holds never sent, all to the light. A salve.
- **A door nobody uses**, in the tenement row on the east side of the lanes. The soup line's second ledger, with a price beside every name. A firepot.

The rooms are cut into the maps by `scripts/add-secrets.mjs`, which patches the map JSON in place and can be run again safely; run it after any `create-` script.

## The old roads and the bestiary

- **Waystones.** Standing stones carved with roads that go nowhere stand at the crossroads, in Millbrook, on the downs, at the weir, in the fort town, and in the capital's square. They sleep until the hero knows the old roads: the pilgrim asks for a stone from the last shrine (on the harbour quay, where her walk ends), and when you bring her one she teaches you. After that, touching a stone wakes it (its carving lights up), and from any woken stone you can walk the old road to any other (`src/rules/waystones.ts`).
- **The bestiary (B, or Bestiary in Settings).** Every kind of enemy you have fought, with what it is, the moves you have seen it make, how many times you have beaten it, and whether you have studied its spell. Kept in `tide-keeps.bestiary.v1`, on paper, so it survives every death.

## Day and night

The day turns on its own while you explore, as in Don't Starve: a full day is eight minutes of walking about, and the clock stops in conversations, menus, and fights. A dial in the top bar shows where you are in it: day (half the dial), then dusk, then night, with the name of the hour beside it. Dusk dims the world; at nightfall **"Night falls"** shows and the world changes around you: the night market opens, the stall shutters, and **every ordinary enemy hunts unseen**, like an ambusher, and sees further. Fires and the night market's lantern are the warm lights, and the hero has a little light of his own. Dawn undoes it all. Fires, beds, and cots let you **rest**, which heals the party but skips no time: you have to live through the night. Dying wakes you at the church at dawn.

The time is saved with the world (`clock`, 0 to 1 from dawn, and `night`, in `tide-keeps.world.v1`; rules in `src/rules/clock.ts`). It is kept in memory as it turns and written with the game's ordinary saves, at nightfall and dawn, and when you leave an area, never on a timer of its own.

- **The night market.** After dark, a pine marten opens the shuttered stall behind Millbrook's tannery: a Night cloak (+20% dodge timing, shows 1 less mana, 3 less health), a Smuggled blade (hits 3 harder, shows 2 more mana), the **Banned hymnal** (a grimoire teaching Hush, a quick, cheap snare), and smelling salts at the fair price. Ask her "Show me what you have" to open the stall. If you stood in the fox's count, the fox's word ("The salt cut") gets you a parcel of sea-salted fish the church never stamped.
- **Gear in shops.** By day the fort's goat sells a Garrison buckler (7 more health; hits softer and dodges harder), and the capital's apothecary a Saint's medal (4 more health, shows less mana; hiding costs more). Bought gear is kept for good, like found keepsakes.

## Besides fighting

- **Hiding your mana (Q, or Hide on a touch screen).** As the guideline describes, the party can suppress its mana to slip past. Holding it down costs every hero a point of mana every few seconds; when the hero runs dry, his mana shows again, and he can't hide with none. While hidden, the hero walks slower and silently, ordinary enemies don't notice him until he's almost on them, and ambushers can't vanish before he sees them. Walk into an enemy while hidden and it loses its first move. A badge over the map shows when your mana is hidden.
- **Foraging.** Wild thyme, field mushrooms, and hedge berries grow around the farmland, the downs, the fen, the weir, the pass, the tarn, and the drove road. Pick them with E; they grow back after you rest. Like fish, they're lost on a wipe.
- **Cooking.** A campfire asks whether to cook or sleep (a bed or the church cot still just sleeps). Cooking turns fish and forage into supplies: smoked fish (1 fish), **fish stew** (2 fish and thyme, heals 18), **herb salve** (2 thyme and a mushroom, revives with 14), and **trail cake** (2 berries, heals 7). Rules are in `src/rules/cooking.ts`.
- **The journal (J, or Journal in Settings).** Every answer someone gives when you ask them something is written down, grouped by who said it and where. It's paper, so it survives every death, and it's kept in `tide-keeps.journal.v1`.
- **Bones.** A dice game you can bet on: 5 coins with the carter in Millbrook's inn, 10 with the old wolf in the fort. Throw three dice, choose which to throw again once, then the house throws. Three of a kind beats a pair beats a plain total (`src/rules/dice.ts`).


### Games in every region

- **The Talon Ring** (the mountain holds): a fighting pit through the east wall of the hold's market tier, where ground-dwellers fight for the houses. **Going in costs 20 coins**, and then it's **all four bouts straight through**: each one sends the next in as soon as it's won, with no rest, no talking and no healing between, so wounds and spent mana carry from bout to bout. The bouts: two hornets at once (15 coins), a crag spider out of a crate (25), the kestrel brothers, two duellists with lying charms, together (35), and **the champion**, a shrike who hangs the losers on his thorns (60 coins, and the first time the **Champion's torc**: hits 3 harder, shows 3 more mana). Every bout won pays as you go. **Nobody dies in the ring**: lose or **Yield** and the ringmaster calls it; the party walks out hurt (never below 1 health) with whatever it won before, and can pay to go in again. A jay taking bets says to bring the vulture for the champion (`src/rules/ring.ts`).
- **The shell game** (Wickmere): a mink on the decks hides a pebble under one of three shells and shuffles. Watch it, then click a shell or press 1, 2, or 3. 5 coins, or 15 for faster hands.
- **Arm-wrestling** (the fort's barracks): a garrison wolf, 10 coins. Press Space (or tap Push) as fast as you can to drive the marker to your side; he pushes back steadily, and surges without warning. After twenty seconds, whoever is ahead wins.
- **Hide and seek** (Millbrook): a kid by the well needs someone to be it. Three children hide around town, one of them somewhere they aren't allowed to go. Once the game is on you can spot them, small and in shadow, if you look; found, they run home. Find all three, Pip in particular, for a cake and a few coins.

## The world, as people tell it

Some people carry the world's history rather than the plot. Each has several things to ask about (`src/content/lore.ts`):

- **A novice** tending the salt basin in the church: the Covenant and the Long Table, the salt-water basin and the coastal saying "the tide keeps what it takes," why only the condemned are raised, and the alchemists who built the rite.
- **A pilgrim** waiting by the field track until the old shrine is safe, then sitting at it once the warden is dead: the Hunger Wars, why the peace is really fish, what the shrine's oath meant, and the last shrine where the fish come ashore.
- **A seal fish-carter** camped at the crossroads fire beside his cart: why the sea peoples are not citizens, the sea's own laws (pirate articles, shark blood-debts, whale grudges), and why the kraken attacked.
- **A hedgehog beekeeper** among her hives in the orchard: why insects are not people under the Covenant, and why the pests grew so large.
- **A stork scribe** at a licensing lectern outside the reeve's hall: why grimoires are licensed (a spell doesn't care how big you are), mana and why hiding it is suspicious, and the hedge-witches.
- **An old hare marine** sharing a table with the carter in the inn: the night the kraken came over the harbour wall, the feast, and who rules now that every ruler is dead.
- **A crow** perched on the cairn on the downs: the nursery rhyme of the nations, the mountain holds and their closed rookeries, and the oldest song, from before mana.
- **A crane ferrywoman** at the boat landing on the weir: the river towns on stilts, the sickness and the round-ups of the venomous, and crates sealed for a lighthouse no chart shows.
- **The garrison chaplain** at his field altar by the barracks, **a raven courier** by the notice board, and **a wolf schoolmistress** teaching two cubs in the square: what resurrection costs and where it goes, the carnivores' faith, the holds' unsigned order and their archive of every letter ever sent, the catechism, and the winter of no bread as the children's grandparents tell it.

## Death and memory

The hero begins with eight of his ten memories; his home and his name were lost before the game starts. **Each time the party wipes, the tide takes one memory, and you don't choose which.** It takes one of the memories he still holds that isn't written down, by a roll fixed to that death (reloading gives the same answer). The wake-up screen shows what was taken, what losing it costs, and the Hollow perk that fills its place:

- **+2 mana** for the chameleon. A larger pool also shows more mana, so enemies target him more often.
- **+2 damage** on every chameleon attack.

What each memory is worth:

| Memory | Losing it |
| --- | --- |
| The feast | He stops being sure the party was framed: the priest, the basin, and some replies change or vanish |
| The trial | He no longer knows why he is branded and can't argue his innocence |
| The kraken | **Everyone's dodge timing gets 10% tighter**: the party's technique from the kraken fight is gone |
| The bear, the vulture, the frog, the octopus | **That companion can't remind him of anything** (see below) |
| His training | His attacks out of hiding hit 2 softer |

### What the companions remember

Each companion has four memories, and every wipe takes one from each companion who was in the fight, chosen by the tide like the hero's (`src/rules/companionMemory.ts`). Each memory gone gives them 3 more health, the Hollow trade.

| Memory | Forgetting it |
| --- | --- |
| You, who the chameleon is | You're a stranger to them, and they can't remind you of anything |
| The feast | They no longer believe the party was framed |
| The kraken | Their own dodging is 10% tighter |
| Their craft: the bear's line, the vulture's eye, the frog's measures, the octopus's copying | Their attacks hit 2 softer |

They start where the story finds them: the bear and the octopus remember everything; the vulture, who has died most, doesn't know you, the feast, or the kraken; the frog has lost the feast. At a fire you can **remind a friend** of something they lost, if you still hold it yourself (the feast, the kraken, or who you are, if you remember them); it lasts until the party next falls. Nobody can give back a craft. A finished companion quest holds the bond both ways: their keepsake keeps their memory of you, for good. The wake screen shows what each one lost, and **Who fights** shows what each still remembers. They talk like it, too (`src/rules/companionTalk.ts`): one who has lost you sits by the fire with a stranger, one who has lost the feast asks you to say again that you didn't do it, and one who has lost the kraken or their craft reaches for it and finds nothing. Only what the tide took counts: the vulture's and the frog's own talks already begin where the story finds them. At a fire, a friend who doesn't know you says so, and that you can remind them who you are.

When no memories remain, a wipe takes nothing. Memories are saved in browser local storage (`tide-keeps.memory.v1`). A wipe is saved before the screen is shown, so reloading brings it back instead of skipping it. The footer shows how many memories remain (and the laboratory, once found).

## Tiles

The tilesets are drawn in code by the `scripts/create-*.mjs` scripts, with shared helpers in `scripts/tile-kit.mjs`: every tile gets a fine **grain** of light and dark pixels so no surface is flat; **stairs** are drawn as flights of lit treads over shadowed risers; rock, cliffs, chasms, and boulders are lit from above. Each region's main ground (grass, turf, heather, snow, cobbles, flagstones, planks, decks) has **variants** (tufts, clover, flowers, pebbles, drifts, cracked slabs, worn boards) scattered over the maps by position, the same every run, so open ground doesn't read as a grid. Variants keep the footstep sound of the tile they replace. A unit test checks that every map uses only tiles its sheet actually draws. Most maps have been edited by hand since their script made them, so redraw a tileset with `TILES_ONLY=1 node scripts/create-<region>.mjs`: it rewrites the tiles and leaves the map alone. The farmland and Millbrook are drawn lit from the upper left, with round canopies, stones and tiles that each have a lit edge and a shadow, and `ellipse` in `scripts/tile-kit.mjs` for anything round. `scripts/tile-art.mjs` holds the shared pieces: lit trees, turf, water that never stripes, coursed stone, boulders, and planks. In the highlands, the borders of snowdrifts and of the frozen tarn come from `scripts/drift-edges.mjs`, one tile for every way a cell can sit among its eight neighbours, so a drift's edge is one continuous line; pines, boulders, cairns, and dead trees there have no ground of their own and stand on whatever is under them. `node scripts/fix-drift-edges.mjs` puts both on the maps, touching only those cells, and is safe to run again.

## Project layout

- `src/main.ts`: starts the game, the title screen, and the top bar.
- `src/rules/`: the game's rules as plain TypeScript, with no Phaser or DOM imports.
  - `battle.ts`: enemies, moves, matchups, second stages, dodge timing, and the turn.
  - `memory.ts`, `world.ts`: memories and Hollow perks, and story flags, carried items, and dialogue conditions.
  - `economy.ts`, `gear.ts`, `spells.ts`, `cooking.ts`, `fishing.ts`: coins, supplies, keepsakes, grimoires, cooking, and fishing.
  - `leap.ts`, `climb.ts`, `clock.ts`, `pursuit.ts`, `waystones.ts`: leaping, climbing, day and night, the inquisitor's hunt, and the old roads.
  - `orders.ts`, `ending.ts`: the journal's orders and leads, and the endings.
  - `ring.ts`, `dice.ts`: the Talon Ring and bones.
  - `millbrook.ts`, `highlandLife.ts`, `holdsLife.ts`, `marshLife.ts`, `oceanLife.ts`: how each region's towns and camp talk change as the story moves.
- `src/content/`: what people say and what is found, one file per region or theme (`dialogue.ts` defines the format). `outskirts.ts` holds the places off the roads, `secrets.ts` the rooms behind false walls, `lore.ts` the keepers of history, `shops.ts` every shop's wares, and `memories.ts` what each memory is worth.
- `src/scenes/`: Phaser exploration.
  - `areas.ts`: every area's map, music, colour grade, people, enemies, and exits.
  - `AreaScene.ts`: the scene shared by every area. It hands the work to helpers in `area/`: `traversal.ts` (walking, leaping, climbing, footing), `foes.ts` (enemies on the map and chasing), `battles.ts`, `dialogue.ts`, `aftermath.ts` (what a conversation sets off), `exits.ts`, `dayNight.ts`, `hunt.ts`, `hollows.ts` (false walls), `townLife.ts`, and `panels.ts` (shops and menus).
  - `sprites.ts`: the hero and townsfolk, drawn in code.
- `src/ui/`: the HTML screens over the map: battle, equipment, party, journal, bestiary, memories, settings, shop, fishing, cooking, climbing, the games, the wake screen, and the ending.
- `src/presentation/`: illustrated story scenes (`stories.ts`, `bossScenes.ts`, `tableau.ts`), battle effects and pacing, scenery, and how town life is staged.
- `src/audio/`: `themes.ts` and `bossThemes.ts` (the compositions, as notes on beats), `voicing.ts` (voice leading) and `feel.ts` (human timing), `music.ts` (the synthesised instruments, reverb, and crossfades), and `effects.ts` (sound effects). `src/ui/SoundtrackView.ts` is the soundtrack player.
- `src/storage/`: versioned local-storage saves, one file per kind (`tide-keeps.*.v1`), and `progress.ts` for starting over.
- `public/maps/`: Tiled JSON maps, one per area, with named points for people, things, and exits. `public/assets/` holds the tilesets and art.
- `scripts/create-*.mjs`: regenerate each region's maps and tileset (shared helpers in `tile-kit.mjs`). Running one replaces manual edits to its maps, so run `add-secrets.mjs` after it.
- `tests/*.spec.ts`: browser checks with Playwright, one file per feature or region. Most start from `tests/full-party.json`, with the bear and vulture already in the party; `fixtures.ts` marks the one-time story scenes as seen. `route.spec.ts` plays the whole story at the level of its rules, from the church to the good ending, and simulates every fight on the way for a player who never dodges, one who half-dodges, and one who dodges perfectly.
- `tests/rules/*.test.ts`: rule tests without a browser, including `maps.test.ts` (every map's tiles, points, and leap reach). `play.ts` is a simple simulated player that the battle tests use to play out rounds.

Combat rules have no Phaser or DOM imports. Future party and memory rules should preserve that boundary, as specified in the design guideline.

Phaser's [tilemap documentation](https://docs.phaser.io/api-documentation/class/tilemaps-tilemap) describes the Tiled map loading used here.

