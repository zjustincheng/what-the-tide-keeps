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

## Play online

Every push to `main` builds the game and publishes it to GitHub Pages at **https://zjustincheng.github.io/what-the-tide-keeps/** (see `.github/workflows/pages.yml`). The build is served from that sub-path, which `vite.config.ts` sets when `GITHUB_PAGES` is set. Saves live in each browser, so progress does not move between computers.

## Movement

Walking into a wall you only clip by a few pixels slides you along it, so narrow bridges, boardwalks, and doorways don't need lining up exactly (`slideAroundCorners` in `src/scenes/AreaScene.ts`). Solid things on the map, like dark water, barricades, and people, count as walls for this too.

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

`npm test` runs rule tests and browser checks. The browser checks cover exploration, encounters, drag and button actions, turn locking, victory, defeat, memory loss, saves, and mobile controls. On machines without Google Chrome, install it or change the Playwright channel in `playwright.config.ts` to use an installed browser. Rule tests require Node.js 22.18+ or 24.

## Current milestone

Build the repeatable loop in miniature before adding the full story. The first playable milestone is a small Tiled map with a moving character, starting with the hero waking in the church. Add the feast opening after the loop works.

The first eight build steps are playable: church exploration, visible encounters, basic combat, a party of three, mana-based magic, death, memory in the world, and one region. Speak to the priest and inspect the ledger and basin. The church is safe ground: the first fights are out in the farmland, where enemies show their mana signatures and touching one starts a battle. (The automated tests open the game at `/?practice`, which puts a crop locust and a hooded exile in the church to fight.) The priest gives the farmland mission, and the south door opens onto the farmland. The artwork and dialogue are original placeholders.

In battle, command the chameleon and whichever companions have joined him (see **Companions**). Each living member acts once in any order; only then does the enemy act and each surviving companion regain 1 mana. Downed members cannot act, and the party only wipes when all three fall. Party members and enemies have health bars and condition descriptions; exact health and damage numbers remain hidden. Mana is numeric. Enemies target the living member with the most visible mana, preferring the bear in a tie.

Drag any member onto the locust to attack, or tap that member for self-support. Per-member action buttons offer keyboard and touch access. Chameleon guards himself. Bear can guard himself or protect another companion: drag him onto that ally, or choose a target with his **Protect** selector before using the **Protect** button. Vulture focuses to strengthen her next shot; focus does not stack. Guards last for one enemy turn. Bear also blocks attacks aimed at himself while protecting another companion.

Prototype tuning: ordinary fights last two or three rounds, and the boar about five. All numbers live in `src/rules/battle.ts`. Attacks are physical, so they cost no mana: the chameleon's tail lash, the bear's maul, the vulture's talons. Mana is for spells and spellcraft. Physical guarding and focusing are free, so an empty mana pool cannot stall the turn. Guarding stops physical damage; it is not a spell barrier. Spell barriers cost 5 mana and protect the selected ally until the end of the enemy turn, but only against studied spells. Physical blows pass through them. Enemy health scales with the size of the party: 45% for the chameleon alone, 65% with one companion, full strength with three.

Any fight but the boar can be run from with **Run**, at a price: half the coins you carry scatter behind you, and the enemy gets a free parting blow on whoever it's watching (the wound carries, though it never drops your last standing hero). The enemy stays where it was, and you get a moment's head start.

Victory removes an enemy until you rest or leave the area. Defeat wakes you at the cot (see below). Wounds and spent mana both carry from one fight into the next (see **Wounds and rest**). **Gather**, on every hero's card, spends that hero's action to draw back 3 mana, so a drained hero is never stuck. Supplies are not implemented yet, and recruitment and travel beyond the church are still ahead. Encounter progress resets on reload; studied spells and memories persist.

## Replies

People speak with a portrait in its own box above the text and their name on a tab beside it, as in Omori. Portraits are cut from each character's sprite and scaled up; objects and places show only a name. Many people can be answered. When a speaker finishes, the hero's possible replies appear under their last line; choose one with **1–4** or by clicking, and the conversation goes on from there. After an answer the same questions are offered again, the ones already asked in that conversation dimmed, with **Leave** to walk away; some replies end the conversation themselves. Talking to someone again in the same visit skips straight to the questions. **Escape** walks away at any time. Replies depend on what the hero still remembers and what has happened. While he remembers the feast he can tell the lamb he doesn't think he killed the king; once it is forgotten, that answer is gone and "I don't remember" takes its place. His name is lost before the game begins, so the bear can tell it to him, and it doesn't stay. The priest can also tend the hero's wounds.

## Music

The score is original and synthesised live in the browser with Web Audio, with no sound files: harp, plucked strings, flute, string pads, organ, bells, celesta, choir, bass, and drums, in a generated reverb hall. It aims for the spirit of the Frieren and Made in Abyss soundtracks (wistful folk-orchestral warmth, and something vast and uneasy underneath) without borrowing from them. Each place has its own theme, and themes crossfade as you move:

| Where | Theme |
| --- | --- |
| The church | Slow organ and bells, A minor |
| The fields | Harp arpeggios and a flute over strings, 3/4, D Dorian |
| Millbrook | A plucked folk tune, E minor |
| The border road and the burned farm | A drone, a distant choir, a harp note now and then |
| Inside buildings | A music-box lullaby, F major |
| Battle | A string ostinato over drums, A minor |
| The boar, the warden, the leech, the swarm-mother | Faster and darker, with choir, D Phrygian |
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

Doors lead inside four buildings, each a small room with people and things to look at:

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

Injuries and spent mana carry from one fight into the next. In battle a hero regains only 1 mana a round, less than an attack costs, so spells and attacks run the party dry over a few fights. A hero who falls in a won fight stays down until revived with smelling salts or rested. The top left of the map shows each hero's portrait, health, and mana as the next fight will find them, with a reminder to rest when anyone is hurt or drained. The small arrow on it, or **H**, shrinks it to just portraits with thin bars; the choice is remembered.

Rest to heal every wound and restore every hero's mana. Campfires cost coins for wood and a place by the fire (4 at the crossroads and the border road, 3 at the woods camp); the church cot and the priest are free: at the shepherd's fire ring by the crossroads, the abandoned camp in the woods, the carters' fire on the border road, or the cot in the church. As the guideline says, resting brings enemies back: the area starts over around the fire. Waking in the church after a wipe also heals the party. Wounds are saved with the rest of the story state.

## Side quests

None of these are marked. Someone mentions a problem and the player works out the rest.

- **The shepherd's strays.** A ram in the south meadow lost three sheep to the locusts: one on the path into the dark woods, one in the orchard, one by the hay yard. Call each home, then return to him for 15 coins and the **Wool charm** keepsake (5 more health; shows 1 more mana).
- **Free the caught.** The fishmonger will sell his barrel for 25 coins. Inside is a young squid, a child of the sea. Tip the barrel into the mill stream south of the bridge. This is the first of the guideline's "free the caught" encounters; the sea elder who rewards them comes with the ocean.
- **The swarm-mother.** The notice board posts a 25-coin bounty, paid by the reeve. She nests in a hollow deep in the dark woods with two nymphs. The nymphs can be killed, but every third round her brood call raises them again, so the fight rewards striking her hard and fast. Killing her does not end the fight: her nymphs fight on until they are dead too, though with her gone, nothing raises them again. (The boar's followers are different: they yield the moment he falls.) She stays dead once beaten.

## Coins, shops, and supplies

Defeated enemies leave coins: 4 for a locust, 5 for a weevil, 10 for a hooded follower, 12 for the swarm-mother, 15 for the Shrine warden, 10 for the Mire leech, 30 for the boar. Coins are shown at the top right of the game frame. As the guideline says, coins and supplies gathered since the last death are lost on a wipe.

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

Each hero has an **agility** that widens or narrows their dodge windows: the vulture is quick (125%), the chameleon ordinary, the bear slow (80%). Keepsakes can change it: the Tide shell helps, the Iron collar hinders. The base windows are a little tighter than before.

- **Perfect** (within 90 ms; 60 ms for heavy, telegraphed blows such as a leap or charge): no damage.
- **Graze** (within 200 ms): half damage.
- **Too soon, too slow, or no press**: the full blow. A press cannot be retried, so mashing does not work.

Stronger enemies leave less room: the boar's Tusk charge and a studied Salt lance give only about 40–45 ms for a perfect dodge and 110–120 ms to graze, and the leech's Latch is tighter than a pest's bite. Some blows cannot be dodged at all, and their warnings say so: the weevil's Rolling charge, the leech's Coil, and the warden's Judgement. For those, guard or raise a barrier ahead of time.

Each blow in a turn, including each of the boar's followers, is its own dodge. Blows already stopped by a guard or barrier skip the prompt. A spell the party has not studied cannot be dodged. The timing windows live in `DODGE` in `src/rules/battle.ts`.

## Magic and the shared grimoire

Open a companion's **Spellcraft** menu for these actions. Each spends that companion's turn:

- **Suppress (1 mana):** show at most 1 mana to enemies until attacking. The next attack reveals the pool and adds damage, with the chameleon receiving the largest bonus.
- **Barrier (5 mana):** protect the ally selected above the action buttons against studied spells for this enemy turn. It cannot stop unknown magic or physical attacks.
- **Analyze (2 mana):** study the exile's gathering spell before it strikes. It becomes named and blockable immediately.

The exile alternates staff attacks with a spell. Its two-turn countdown initially reads **???**. Surviving its cast also adds **Salt lance** to the grimoire, even if the target falls while another companion survives. A total wipe does not discover an unstudied spell. The exile reveals its hidden mana when casting.

The shared grimoire survives cot resets, defeats, and reloads in browser local storage (`tide-keeps.grimoire.v1`). If storage is unavailable, it remains usable for the current page session and the battle view reports that it cannot save. Memories and story progress are saved separately (see below).

These are prototype combat encounters in the church, not the final regional placement or recruitment story. Spellcraft options supplement the original attack/support controls while testing the rules.

## Companions

As in the story, the chameleon sets out alone; his companions are scattered across the regions and must be found. The **bear** is chained to the millstone west of the stream, and the miller answers only to a writ. The reeve in Millbrook will sign one once the pests are cleared from his fields: the locust in the wheat and the weevil in the hay yard. He also hands it over, pests or no pests, once the boar is beaten, and he'll sell it for 60 coins. Asking him "About the bear." tells you exactly which pests are left. Show the writ to the miller and the bear joins for good. The vulture joins in the highlands and the **frog** in the marsh; the octopus waits in a region still to come. The equipment screen and battles show only the heroes who have joined. **Three fight at a time**: once the frog has joined, one companion waits out fights. The newest waits by default; on the equipment screen (Tab), each companion's **Fights / Waits** button sends them to the bench and brings the waiting one back. The hero always fights.

## The farmland

South of the church lies the open farmland, a scrolling map about four screens across with no set route. A waymark at the crossroads points the way:

- **West, over the stream:** the mill, where the bear is chained to the millstone and the miller keeps the key. The bear still remembers the hero. Freeing him comes with companions in build step 9.
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

Crop pests show their full mana and only strike physically, as the guideline describes. The weevil jabs most turns and makes a heavy rolling charge every third round.

Millbrook is a prosperous herbivore market town. The reeve, the innkeeper, a stallholder, a lamb, and the fishmonger live on the west side and around the market square. The carnivore quarter lies east, behind a wall whose gate locks from the herbivore side. Townsfolk react to the hero's species and his brand: the stallholder triples his prices, the inn turns him away, and the notice board still shows his face. The fishmonger's barrel and the shuttered stall behind the tannery are left unexplained. Money, shops, camping, and the night market are not implemented yet, so those beats are dialogue for now.

South of Millbrook, the border road is blocked by a wall of brambles. The lamb in the market square lost her bell in the locust field; it lies in the trampled clearing in the locust field, where it can be grabbed by slipping past the locust or after a fight. Bring it to her and she teaches **Bramble's leave**, a favor spell written into the grimoire. Speak it at the hedge and the brambles draw back. Beyond them, loaded grain carts sit turned around while a highland carter and a farmland guard wait for each other to move first. Further south, one of the boar's hooded followers waits on the road with veiled mana and an unknown spell.

Before the boar can be fought, the hero has to earn the right to face him. At the south end of the border road his **sister**, a sow, keeps a barricade of charred beams across the lane, and she won't let anyone from Millbrook past until they know what happened. Two things have to be found out:

- **The burn order**, in the records at the reeve's hall: the reeve signed it "on suspicion of the miller's kid," and nothing records the kid coming home. Afterwards the clerk and the reeve will both talk about it, and the reeve points you to the sister.
- **The kid himself**, alive, up on the downs with the old ram's flock. Ask him whether the boar ever hurt him: he says the boar gave him bread through the fence, and that the reeve tore the page out.

Tell the sister both, and she drags the beams aside. At the farm the boar is sitting in the ashes of his doorway and **talks before he fights**: about the kid, why he stopped the grain, and the man with no fur who listened. The fight starts when you tell him "Then we fight."

The road ends at the boar's burned farm, where he waits between his followers, a badger and a rat, both standing armed with cudgels. Every hit aimed at a follower lands on the boar instead, at half strength, and adds fury. Fury raises his damage, and that extra damage drives through guards. Clearing the followers first wipes the party; fighting him directly while the bear guards wins. A notice on the gatepost tells his story. Once he is beaten he stays beaten: his followers mention a stranger with no fur who sat with them and listened, a cup from the feast lies where he stood, and the reeve, the inn, the carter, and the guard all change what they say.

Nothing marks the quest. A carried item is lost on a wipe and returns to where it was found. The opened hedge and learned spells persist, saved in `tide-keeps.world.v1` and the grimoire.

Every boss has a **second stage**. The first time a boss is brought down, it doesn't stay down: the fight stops for a short scene, told line by line over the boss's art (the boar's badger begging him to stay down, the hyena explaining that nobody down here stays dead). Then it gets back up with half its health (the warden with less, the hyena with a little less) and fights on as something worse: the battle title changes, SECOND STAGE shows above it, the boss burns redder and moves faster, and it roars. The second time it falls, it stays down (`STAGES` in `src/rules/battle.ts`):

- **The boar, cornered:** gains fury and charges every round.
- **The warden, unbound:** both votives flare up again, and Judgement falls every other round.
- **The mire leech, shedding:** sheds its skin and heals, bites harder, and coils every other round.
- **The swarm-mother, airborne:** her brood rises again and she dives at you, fast.
- **The pack leader, howling:** the fallen hounds get up, and he rushes with the whole pack every other round.
- **The drowned, the bell freed:** swings the bell itself every other round, harder than the toll.
- **The hyena, not laughing:** eats her own standing dead on the spot, then feeds every round there is a body and lunges every other round.

Ordinary enemies notice the hero when he comes close and come after him, a little slower than he walks; they give up and go back if he gets far enough away (`CHASE` in `src/scenes/AreaScene.ts`). Bosses and guardians hold their ground. Ambushers hide their mana: besides the highland raiders, the downs hounds, the battlefield's raised dead, and a weevil in the dark woods strike first if they reach you unseen. People breathe and turn to look at the hero as he passes, enemies bob and face him, and in battle every fighter breathes, heroes hop when they act, and anyone hit flinches.

Every fight is optional except the boar. Leaving an area and coming back respawns its enemies. A wipe anywhere wakes the party at the church cot, and **Return to the cot** works from any area.

## The highlands

Once the boar is dead the priest has new orders: bodies are going missing from the old battlefield below the highland fort, and the church wants the "grave-eaters" put down. On the border road, the track east past the guard climbs to the pass. Until the carts move, the guard turns you back.

- **The high pass.** Switchbacks up through rock bands and snow. **Highland raiders** hide their mana: their signatures show from a distance but flicker out as you come near, and touching one then is an **ambush**, so the fight opens on the enemy's turn. A courier lies dead on a scree ledge with a sealed letter for the fort's quartermaster. It's a carried item, so a wipe loses it and it goes back to the body. There is a fire partway up (4 coins).
- **The fort town.** A carnivore garrison, where the social order flips: nobody stares at a reptile or a bear, and the frightened ones are the herbivore merchants behind their own wall. A goat sells through the bars at the board price, and a weasel in the alley runs the black market, buying fish and selling salts and firepots at fair prices. Families queue for a fish ration that shrinks every week. Delivering the courier's letter shows the church cut the ration before any unrest, and pays 15 coins. The garrison fire costs 4.
- **The barracks.** Under the long bunk built for wings, the vulture hid a note in her own hand: TRUST THE CHAMELEON.
- **The battlefield.** The vulture clears the dead. She doesn't know the hero and attacks him as a grave thief: a duel you only need to **survive for three rounds**, because she cannot be brought down. After that she'll talk but won't trust you. Bring her the note and she joins, as the third party member. Come to her already carrying the note and she stops before attacking, and there is no fight. The **raised dead** wander the graves, and drag marks lead to a ravine whose bridge is raised on the far side. No spell opens it; ask the vulture and she flies over and drops it.
- **The ruined abbey.** Two deserters hold the gate, a hexer and a brute. In the same round the hexer casts Salt lance and the brute swings a heavy pick, so the party has to guard against one and raise a barrier against the other. The hexer's spell can be analyzed like the exile's. A memorial to the winter of no bread stands outside, and the Famine spoon (a keepsake: shows 3 less mana, but 3 less health) is hidden behind the altar.
- **The ossuary key.** The stair is locked behind an iron grate. The abbey's last monk has the key, but won't give it up while three of the hyena's dead lie in his yard. Bury them (with the vulture along, she does it properly), and he hands it over. He also tells you he ate what she brought that winter, and preached against her after.
- **The ossuary.** The hyena **talks first**: why she keeps the dead from the ground while the fish ration shrinks, and the monk's part in it. The fight starts when you tell her the church sent you. She keeps the dead of the famine in its niches, and she is the hardest fight so far. She attacks with two ghouls and raises them every third round. **Anyone falling**, on either side, makes her stronger, as the guideline says. Every other round she **feeds on a fallen body**, healing and growing stronger still. Her laughing lunge is very fast and drives through most of a guard. A fallen hero is safe only under a barrier, which can now be cast on the fallen, and she will eat her own downed ghouls, which she then can't raise again. Beaten, she tells you why she was exiled, that the man with no fur ate at her table, and that her ledger proves the church cut the fish first. The vulture notices the kingdom punished her with the same work it exiled the hyena for.
- **Afterwards.** On the pass, a signature far larger than anything so far waits by the road: the inquisitor. He cannot be beaten yet. Run.

### The old border fort

Through the fort town's north gate, a ruined keep the town was built to feed, held now by deserters. Wolves hunt the snow outside. The archive in the west wing keeps the border war's rolls (the farmland's dead with names, the highland dead with numbers) and one newer roll, in a church hand, recording how long the garrison takes to grow angry each time the fish is cut. Its last entry: SUFFICIENT. The **deserter captain** holds the inner yard with his lieutenant: his volleys come three at a time and can't be blocked, and he executes the fallen through any guard. Behind him, at the top of the tower, is the garrison's **signal lantern**.

The ossuary is dark now: the monk gives you the key, but tells you not to go down without a real light. The stair opens only with the key and the lantern.

The fort's **smith** tempers keepsakes, once each, for 30 coins: a tempered keepsake's benefits grow by half (rounded up) and its drawbacks stay the same (`keepsakeMods` in `src/rules/gear.ts`).

Some fights come in **waves**: the raider camp on the drove road and the raider on the high switchback each send a second raider when the first falls.

### The rookery road

From a gap above the old border fort's west wall, the couriers' road climbs toward the mountain holds, past frozen falls, to a black gate painted BY ORDER OF THE HOUSE. **Harriers** hold the road now; their stoop can't be guarded, only dodged, and one comes in two waves. The raven courier in the fort town asks you to carry her last letter up and slide it under the gate (it's the only copy; lost if you fall). In the falls, her sister is frozen mid-flight with an unsigned order sealed in a cuckoo's egg. Bring it back to the raven for the **Raven's quill** (vulture: much easier dodges, +1 damage, −3 health).

People you already know have darker things to say if you ask: the priest (once you're back from the boar), the reeve, the miller, the innkeeper, the sergeant, the quartermaster, and the lynx in the bread line.

### Anchors

The vulture's note teaches **anchors**. Once she has joined, every rest at a fire, bed, or cot offers to **write a memory down**. A written memory can't be chosen when the next wipe takes something; after that death it has to be written again. There is one slot. Anchors are saved with the memories in `tide-keeps.memory.v1`.

## Orders

Beating a region's lieutenant (the boar, the hyena, the viper) finishes the church's orders there. The brand on the hero's wrist goes warm, and you can **go back to the priest** at once for the next orders, or stay and walk the region a while. The priest always has them waiting.

## The marsh

Once the hyena is dead, the priest sends the party downriver: a sickness in the river towns, and the church's stores spoiling at Wickmere. The **crane at the weir** ferries you down ("Take the ferry downriver"); until then she turns you back.

- **The causeway.** Boardwalks over black water, in **fog**: enemies see you from less far off, and you can't see their mana until you are close. Mosquitoes poison; water scorpions wait under the boards. An old coypu eats only what he catches and hasn't been sick once. Off the main walk, the **reed-bed queen** guards her eggs: her blood cloud poisons through any guard, she drinks what she bites, and she hatches more of her brood.
- **Wickmere.** A stilt town where the river meets the tide. The magistrate has caged everyone venomous (pay the newt's "fine" to free her); the smokehouse otter notices the church barrels come upriver already resealed; a widow says her husband was sick after supper, not after a cough. The herbalist sells **antivenom**. There is a waystone, a fire, and fishing under the decks.
- **The ferryman.** Kill the reed-bed queen and he teaches you **Still the water**, an old river word that makes the channel firm enough to walk on.
- **The far bank.** The church storehouse, roof fallen in. The viper's **apprentice**, a toad who believed her, casts **Souring**. Under his apron is a vial of milked venom and a dropper the size of the holes in every sack. Three crates nobody spoiled are sealed and marked FOR THE LIGHTHOUSE.
- **The hospice.** The **frog** heals under guard behind a grate. She remembers the party but not the feast, and no longer believes you were framed. Show her the vial and she comes to stop a poisoner: not for you.
- **The flooded apothecary.** Only with the frog. The **viper**, a healer whose patient died of a fever and who was blamed and drowned for it, talks before she fights. Everyone starts **poisoned** in her shop, and her Souring turns healing into harm. Brought down once, she sheds her skin and the air goes bitter. Beaten, she lies in the water and still talks: the man with no fur was the only one who ever asked what really happened. She leaves the **Viper's fang** (frog: dart hits 3 harder, 3 less health); afterwards the hospice sister gives you her **handbell** (6 more health, shows 2 more mana).

**Poison** bites at the end of every enemy turn (2 health) and counts down. A poisoned blow only poisons if it lands: a perfect dodge keeps it out. Heals draw it out; antivenom draws it out without healing. **Souring** is a spell: for two turns after it lands, every heal (spells, supplies, the frog's dose) burns for as much as it would have mended. Like other spells it is hidden until studied. **The frog** fights with one toxin in two doses: her **dart** poisons the enemy (3 a round for 3 rounds), and her **Dose** mends the ally chosen on her card by 6 and draws out their poison. Her grimoire, the **Hospice litany**, teaches **Bitter tonic** (5 health to everyone, and the poison out of them).

## The capital

The church has a side door in its west wall, out into the capital. Nobody fights here; it's a place for listening.

- **The church square.** A bronze statue of the five heroes with every face chiselled off, the chameleon's first. A fountain of salt water piped up from the harbour. The hall of the Long Table, chained shut by the regency. The alchemists' wing behind a gate whose church seal is renewed every week. A crier reading the regency council's proclamations, a child selling broadsheets about the feast murders, a lamplighter who saw the alchemists' gate opened the night of the feast, an old doe whose son held the doors, a church guard who keeps an eye on you, and a licensed apothecary who charges the branded double.
- **The harbour**, down the steps. The wall rebuilt where the kraken came over, its ribs still in the water, and one of its arms nailed along the quay. The last shrine, where the fish come ashore, with an answer carved on its sea side. Fishing off the pier. A gull fishwife keeps a crab woman in a market tank: buy her for 20 coins and let her go, and she leaves you the **Tide shell** (a keepsake: 5 more health, shows 1 less mana, hits 1 softer). The old turtle harbourmaster remembers the kraken and the church's ships that sail past the headland and come back empty. A seal dockhand, and a dismissed steward of the feast hall: buy him a drink and he tells you about the hooded cupbearer nobody hired, and gives you the hall's staff key.
- **The hall of the Long Table.** The feast was never cleared. The long table with its stains, the rulers' chairs over scrubbed stone, the five stools at the far end, the cupbearer's sideboard with a gilded cup beneath it (the twin of the one at the boar's farm), and the kraken's arms still hanging from the rafters. What you see of your own seat depends on whether you still remember the feast. An old cleaner saw the cupbearer climb down from one of the alchemists' carts that afternoon, the first carts through that gate in twenty years.

## A connected world

The regions are joined in more than one place, and some links only open from the far side, so the world folds back on itself:

- **The weir**, up the path north from the fen's meadow, is the otters' country. The church fishery's goose warden has caged the otter's brother for poaching eels his family has taken for a hundred years. Pay the warden 15 coins, or bring the bear to lean on his hut, and open the cage. The old otter gives you the **Weir hook** (a keepsake: hits 2 harder, shows 1 more mana) and shows you the smugglers' stair. Her kit remembers the man with no fur asking how many fish the church takes. A mink smuggler will give you a crate to carry to the weasel in the fort's alley, a two-region errand worth 20 coins; it's lost if you die on the way. The eel weir can be fished, and marsh lights and one of Wetherby's drowned guard the banks.
- **The high tarn**, up the smugglers' stair, is a frozen lake under the pass. Cut fishing holds **mountain char**, the most valuable fish, found nowhere else. The trapper's partner lies under the ice; bring him her ring and he gives you the **Frost ring** (the vulture's keepsake: 7 more health, hits 1 softer). Hounds and a raider hunt on the ice. A rope ladder climbs to the middle of the pass, but it can only be let down from the pass side.
- **The drove road** runs from the downs, east up the chalk, to the battlefield's south gate. A wolf drover takes herbivores' sheep up to the carnivores' fort for them, and remembers a man with no fur carrying a sack toward the abbey. Raiders camp in a ring of boulders with a stash of stolen coin. The gate at the top is barred from the battlefield side: lift the bar from there and the road opens both ways.

## The old roads and the bestiary

- **Waystones.** Standing stones carved with roads that go nowhere stand at the crossroads, in Millbrook, on the downs, at the weir, in the fort town, and in the capital's square. They sleep until the hero knows the old roads: the pilgrim asks for a stone from the last shrine (on the harbour quay, where her walk ends), and when you bring her one she teaches you. After that, touching a stone wakes it (its carving lights up), and from any woken stone you can walk the old road to any other (`src/rules/waystones.ts`).
- **The bestiary (B, or Bestiary in Settings).** Every kind of enemy you have fought, with what it is, the moves you have seen it make, how many times you have beaten it, and whether you have studied its spell. Kept in `tide-keeps.bestiary.v1`, on paper, so it survives every death.

## Day and night

The day turns on its own while you explore, as in Don't Starve: a full day is eight minutes of walking about, and the clock stops in conversations, menus, and fights. A dial in the top bar shows where you are in it: day (half the dial), then dusk, then night, with the name of the hour beside it. Dusk dims the world; at nightfall **"Night falls"** shows and the world changes around you: the night market opens, the stall shutters, and **every ordinary enemy hunts unseen**, like an ambusher, and sees further. Fires and the night market's lantern are the warm lights, and the hero has a little light of his own. Dawn undoes it all. Fires, beds, and cots let you **rest**, which heals the party but skips no time: you have to live through the night. Dying wakes you at the church at dawn.

The time is saved with the world (`clock`, 0 to 1 from dawn, and `night`, in `tide-keeps.world.v1`; rules in `src/rules/clock.ts`). It is kept in memory as it turns and written with the game's ordinary saves, at nightfall and dawn, and when you leave an area, never on a timer of its own.

- **The night market.** After dark, a pine marten opens the shuttered stall behind Millbrook's tannery: a Night cloak (+20% dodge timing, shows 1 less mana, 3 less health), a Smuggled blade (hits 3 harder, shows 2 more mana), the **Banned hymnal** (a grimoire teaching Hush, a quick, cheap snare), and smelling salts at the fair price.
- **Gear in shops.** By day the fort's goat sells a Garrison buckler (7 more health; hits softer and dodges harder), and the capital's apothecary a Saint's medal (4 more health, shows less mana; hiding costs more). Bought gear is kept for good, like found keepsakes.

## Besides fighting

- **Hiding your mana (Q, or Hide on a touch screen).** As the guideline describes, the party can suppress its mana to slip past. Holding it down costs every hero a point of mana every few seconds; when the hero runs dry, his mana shows again, and he can't hide with none. While hidden, the hero walks slower and silently, ordinary enemies don't notice him until he's almost on them, and ambushers can't vanish before he sees them. Walk into an enemy while hidden and it loses its first move. A badge over the map shows when your mana is hidden.
- **Foraging.** Wild thyme, field mushrooms, and hedge berries grow around the farmland, the downs, the fen, the weir, the pass, the tarn, and the drove road. Pick them with E; they grow back after you rest. Like fish, they're lost on a wipe.
- **Cooking.** A campfire now asks whether to cook or sleep (a bed or the church cot still just sleeps). Cooking turns fish and forage into supplies: smoked fish (1 fish), **fish stew** (2 fish and thyme, heals 18), **herb salve** (2 thyme and a mushroom, revives with 14), and **trail cake** (2 berries, heals 7). Rules are in `src/rules/cooking.ts`.
- **The journal (J, or Journal in Settings).** Every answer someone gives when you ask them something is written down, grouped by who said it and where. It's paper, so it survives every death, and it's kept in `tide-keeps.journal.v1`.
- **Bones.** A dice game you can bet on: 5 coins with the carter in Millbrook's inn, 10 with the old wolf in the fort. Throw three dice, choose which to throw again once, then the house throws. Three of a kind beats a pair beats a plain total (`src/rules/dice.ts`).

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

The hero begins with eight of his ten memories; his home and his name were lost before the game starts. A party wipe wakes him at the cot, where he must choose one held memory to forget before he can move. Each memory shows what forgetting it costs and the Hollow perk that replaces it:

- **+2 mana** for the chameleon. A larger pool also shows more mana, so enemies target him more often.
- **+1 damage** on every chameleon attack.

Forgetting **His training** also reduces his reveal bonus from +4 to the +2 every companion gets. Forgetting **The feast** changes what the priest says and what the tidal basin evokes, and forgetting **The trial** changes the resurrection ledger. Because his name is already lost, the game never shows it. The other memory costs are shown but take effect in later build steps. When no memories remain, a wipe takes nothing. Only the hero loses memories for now; companion memories are still an open design question. Perks from the two memories lost before the game are already part of his starting stats.

Memories are saved in browser local storage (`tide-keeps.memory.v1`). A wipe is saved before the choice is shown, so reloading the page brings the choice back instead of skipping it. The footer shows how many memories remain.

## Project layout

- `src/scenes/AreaScene.ts` — Phaser exploration, collision, input, encounters, and travel, shared by every area.
- `src/scenes/areas.ts` — each area's map, people, enemies, exits, and decoration.
- `src/content/dialogue.ts` — dialogue types: variants and replies by memory, items, flags, or spells, and their effects.
- `src/content/church.ts`, `fields.ts`, `town.ts`, `border.ts`, `farm.ts`, `interiors.ts` — prototype dialogue for each area.
- `src/scenes/sprites.ts` — generated placeholder sprites for the hero and townsfolk.
- `src/rules/battle.ts` — immutable, renderer-independent combat state and transitions.
- `src/rules/memory.ts` — memory loss and Hollow perks, independent of the renderer.
- `src/rules/economy.ts` — coins, prices, supplies, and bounties.
- `src/rules/fishing.ts` — fish, spots, the sweeping marker, and landing a catch.
- `src/rules/spells.ts` — grimoires, their spells, and sequence checking.
- `src/rules/gear.ts` — keepsakes, slots, and what they change in battle.
- `src/rules/world.ts` — story flags, carried items, favor spells, and which dialogue variant applies.
- `src/content/memories.ts` — memory names and what forgetting each costs.
- `src/storage/grimoire.ts` — versioned browser storage for studied spells.
- `src/storage/memory.ts` — versioned browser storage for lost memories and an unpaid wipe.
- `src/storage/world.ts` — versioned browser storage for story flags, carried items, and found keepsakes.
- `src/storage/gear.ts` — versioned browser storage for equipped keepsakes.
- `src/storage/books.ts` — versioned browser storage for which grimoire each hero carries.
- `src/ui/BattleView.ts` — accessible combat view, drag input, and turn pacing.
- `src/ui/ResurrectionView.ts` — the wake screen where a memory is chosen.
- `src/ui/EquipmentView.ts` — the equipment screen.
- `src/ui/ShopView.ts` — a shopkeeper's wares.
- `src/ui/FishingView.ts` — the fishing screen.
- `src/content/shops.ts` — what each shop sells.
- `src/audio/themes.ts` — the compositions, as notes on beats.
- `src/audio/music.ts` — the synthesised instruments, reverb, scheduler, and crossfades.
- `src/audio/effects.ts` — the synthesised sound effects.
- `src/storage/settings.ts` — volumes, mute, and how the party display is shown.
- `scripts/create-capital.mjs` — the city tileset, the church square, and the harbour.
- `src/content/capital.ts` — what is said and found in the capital.
- `scripts/create-highlands.mjs` — the highland and fort tilesets, and the pass, fort town, battlefield, abbey, and ossuary.
- `src/content/highlands.ts` — everything said and found in the highlands.
- `src/ui/AnchorView.ts` — writing a memory down at a fire.
- `scripts/create-downs.mjs`, `scripts/create-fen.mjs` — the downs and barrow, and the fen.
- `src/content/downs.ts`, `src/content/fen.ts` — what is said and found there.
- `src/storage/progress.ts` — erasing a playthrough to start over.
- `src/ui/fullscreen.ts` — the full screen button and the F key.
- `src/ui/SettingsView.ts` — the controls list and menu actions.
- `public/maps/church.json` — editable Tiled JSON map with floor, furniture, and named interaction points.
- `public/assets/church-tiles.svg` — original placeholder tileset.
- `public/maps/farmland.json`, `town.json`, `border-road.json`, `boar-farm.json`, and the interiors `inn.json`, `hall.json`, `tannery.json`, `mill-inside.json` — the farmland maps, with placeholder tilesets in `public/assets/`.
- `scripts/create-*.mjs` — regenerate each map and tileset; running one replaces manual edits to that map.
- `tests/church.spec.ts` — browser checks.
- `tests/battle.spec.ts` — encounter and combat browser checks.
- `tests/road.spec.ts` — the open fields, scrolling, routes between places, and waking after a wipe outside.
- `tests/quest.spec.ts` — the lamb's bell, the favor spell, and the hedge gate.
- `tests/boar.spec.ts` — the boar's rule, his defeat, and its aftermath.
- `tests/death.spec.ts` — wipe, memory choice, and save browser checks.
- `tests/rules/battle.test.ts` — combat tests without a browser.
- `tests/rules/memory.test.ts` — memory and Hollow perk tests without a browser.
- `tests/equipment.spec.ts` — finding, equipping, and fighting with a keepsake.
- `tests/rules/gear.test.ts` — slots, restrictions, and keepsake effects.
- `tests/shop.spec.ts` — buying, using supplies, earning coins, and buying the writ.
- `tests/rules/economy.test.ts` — prices, the thaw, wipes, and supply effects.
- `tests/fishing.spec.ts` — landing, scaring off, and selling a catch.
- `tests/rules/fishing.test.ts` — the marker, the zone, bites, and the catch's value.
- `tests/elites.spec.ts` — the guardians of the Covenant token and the yoke peg.
- `tests/rules/elites.test.ts` — the warden's ward and the leech's drain.
- `tests/buildings.spec.ts` — entering the hall, tannery, and mill.
- `tests/music.spec.ts` — themes per place and battle, muting, volume, and levels.
- `tests/rules/themes.test.ts` — every theme fits its loop and range.
- `tests/waystones.spec.ts` and `tests/rules/waystones.test.ts` — the pilgrim's stone, waking waystones, and travelling between them.
- `tests/capital.spec.ts` — the capital: the square, the harbour, the steward's key, the crab, and the feast hall.
- `tests/pastimes.spec.ts` and `tests/rules/pastimes.test.ts` — foraging and cooking, hiding your mana, the journal, and bones.
- `tests/lore.spec.ts` and `tests/rules/lore.test.ts` — the keepers of lore and what they know.
- `tests/connected.spec.ts` and `tests/rules/connected.test.ts` — the weir, the tarn, the drove road, and their shortcuts.
- `tests/preboss.spec.ts` and `tests/rules/preboss.test.ts` — what has to be done before the boar and the hyena, and their conversations.
- `tests/alive.spec.ts` — enemies chasing and giving up, and fighters reacting in battle.
- `tests/highlands.spec.ts` — the pass and its ambushes, the courier's letter, the vulture's duel and note, the bridge, anchors, the deserters, the hyena, and the inquisitor.
- `tests/rules/highlands.test.ts` — ambushes, the survival duel, the paired spell and blow, the hyena's feeding, and anchors.
- `tests/footsteps.spec.ts` — which surface the hero is standing on.
- `tests/regions.spec.ts` — reaching the downs, the barrow, and the fen, their quests, and the new enemies.
- `tests/rules/regions.test.ts` — feeding the hounds, the pack rush, the otter, and the sluice.
- `tests/running.spec.ts` — running away, campfire costs, the way into the woods, and the death count.
- `tests/rules/consequences2.test.ts` — fleeing, the ledger, and the reeve's letter.
- `tests/consequences.spec.ts` — sparing or reporting the boar's followers, and a paid bed.
- `tests/rules/consequences.test.ts` — every consequential reply and what it changes.
- `tests/sidequests.spec.ts` — the strays, the barrel, and the swarm-mother's bounty.
- `tests/rules/quests.test.ts` — the brood call and each quest's dialogue and rewards.
- `tests/spells.spec.ts` — casting, fizzling, phone keys, and swapping grimoires.
- `tests/rules/spells.test.ts` — spell effects, fizzles, and carrying grimoires.
- `tests/dodge.spec.ts` — dodge timing in the browser.
- `tests/rules/dodge.test.ts` — dodge grading and the stepwise enemy turn.
- `tests/rules/boar.test.ts` — the boar's shielding, fury, and both strategies.
- `tests/companions.spec.ts` — the solo start and freeing the bear, from a fresh game.
- `tests/rules/companions.test.ts` — the roster, party scaling, and the writ.
- `tests/full-party.json` — the save most browser checks start from, with the bear and vulture already in the party.
- `tests/replies.spec.ts` — choosing replies, replies lost with a memory, and the priest's care.
- `tests/wounds.spec.ts` — wounds carried between fights and healed at a campfire.
- `tests/rules/wounds.test.ts` — wounds, the fallen, and rest.
- `tests/rules/world.test.ts` — dialogue variants, replies, and the favor-spell quest.

Combat rules have no Phaser or DOM imports. Future party and memory rules should preserve that boundary, as specified in the design guideline.

Phaser's [tilemap documentation](https://docs.phaser.io/api-documentation/class/tilemaps-tilemap) describes the Tiled map loading used here.

## Open question

- What are each companion's memories?
