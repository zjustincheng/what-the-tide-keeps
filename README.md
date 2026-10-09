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

- **Walking:** soft footsteps.
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

Any hero can carry any grimoire, which is how the guideline's "the grimoire is the class" begins: giving the bear the primer makes him the healer. Damage spells follow the same targeting as attacks, so the boar still shields his followers from them. Which hero carries which grimoire is saved in `tide-keeps.books.v1`. These carried grimoires are separate from the shared grimoire of studied enemy spells.

## Dodging

Enemy blows can be dodged with timing, never luck. When a blow is about to land, a ring closes on the companion it targets and a **Dodge** bar appears at the bottom of the screen. Press **Space** (or **Enter**, or tap **Dodge**) as the ring meets the inner circle:

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

As in the story, the chameleon sets out alone; his companions are scattered across the regions and must be found. So far only the **bear** can join. He is chained to the millstone west of the stream, and the miller answers only to a writ. The reeve in Millbrook will sign one once the pests are cleared from his fields: the locust in the wheat and the weevil in the hay yard. He also hands it over, pests or no pests, once the boar is beaten, and he'll sell it for 60 coins. Asking him "About the bear." tells you exactly which pests are left. Show the writ to the miller and the bear joins for good. Breaking the chain at night, the guideline's third way, needs nighttime, which isn't built yet. The vulture, the frog, and the octopus wait in regions still to come. The equipment screen and battles show only the heroes who have joined.

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

The sluice gate above the mill holds the fen back. Open it and the water drops enough to uncover a causeway to the sunken chapel, where **the drowned** still holds the bell rope: it tolls an undodgeable, guard-piercing blow every third round and tries to pull someone under. Beyond it is the **Drowned psalter**, which teaches **Undertow**, the hardest-hitting spell so far (seven keys in three seconds). Opening the sluice slows the mill wheel, and the miller notices.

Crop pests show their full mana and only strike physically, as the guideline describes. The weevil jabs most turns and makes a heavy rolling charge every third round.

Millbrook is a prosperous herbivore market town. The reeve, the innkeeper, a stallholder, a lamb, and the fishmonger live on the west side and around the market square. The carnivore quarter lies east, behind a wall whose gate locks from the herbivore side. Townsfolk react to the hero's species and his brand: the stallholder triples his prices, the inn turns him away, and the notice board still shows his face. The fishmonger's barrel and the shuttered stall behind the tannery are left unexplained. Money, shops, camping, and the night market are not implemented yet, so those beats are dialogue for now.

South of Millbrook, the border road is blocked by a wall of brambles. The lamb in the market square lost her bell in the locust field; it lies in the trampled clearing in the locust field, where it can be grabbed by slipping past the locust or after a fight. Bring it to her and she teaches **Bramble's leave**, a favor spell written into the grimoire. Speak it at the hedge and the brambles draw back. Beyond them, loaded grain carts sit turned around while a highland carter and a farmland guard wait for each other to move first. Further south, one of the boar's hooded followers waits on the road with veiled mana and an unknown spell.

The road ends at the boar's burned farm, where he waits between his followers, a badger and a rat, both standing armed with cudgels. Every hit aimed at a follower lands on the boar instead, at half strength, and adds fury. Fury raises his damage, and that extra damage drives through guards. Clearing the followers first wipes the party; fighting him directly while the bear guards wins. A notice on the gatepost tells his story. Once he is beaten he stays beaten: his followers mention a stranger with no fur who sat with them and listened, a cup from the feast lies where he stood, and the reeve, the inn, the carter, and the guard all change what they say.

Nothing marks the quest. A carried item is lost on a wipe and returns to where it was found. The opened hedge and learned spells persist, saved in `tide-keeps.world.v1` and the grimoire.

Every fight is optional except the boar. Leaving an area and coming back respawns its enemies. A wipe anywhere wakes the party at the church cot, and **Return to the cot** works from any area.

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
