# What the Tide Keeps: Design Guideline

Oct 7, 2026 · @Long

## Concept

A 2D open-world web RPG with turn-based combat, set in a medieval world of animals. You play a hero framed for regicide and sentenced to fight, die and be resurrected until nothing of him is left. Every death takes a memory, so the longer he struggles to clear his name, the less he remembers why.

Design pillars:

- Difficult and vague on purpose. Enemies hide their strength, spells are unknown until studied, and the game explains little.
- Death costs something real. A wipe never ends the game. It takes a memory and gives power back.
- Information wins fights. Reading mana and knowing a spell matter more than raw stats.
- Solo first. One player commands the party. Co-op comes later.

What each inspiration contributes:

| Source | What it gives the game |
| --- | --- |
| An Average Campaign | Difficulty, vagueness, in-jokes in the margins |
| Monster | A hero blamed for a crime he did not commit, hunted while he hunts the real culprit |
| Sentenced to Be a Hero | "Hero" as a punishment: convicts resurrected to fight again and again |
| Scissor Seven | A hero who does not fully know his own past |
| Beastars | A society split between carnivores and herbivores |
| Frieren | Magic built on mana reading, costly barriers and spell collecting |
| Pokémon | A top-down 2D world to explore, with gated regions |
| Angry Birds Epic | Commanding a small party with simple attack and support actions |

## Story

The hero saved the kingdom, was framed for murdering its rulers the same night, and is now serving a sentence that erases him a piece at a time.

1. The victory. The hero and his party of five defeat the kraken, a great threat from the sea.
2. The feast. The rulers of every nation gather to celebrate. The party gets drunk. None of them remember the night.
3. The frame. The rulers are found murdered and the party is blamed. Every nation is left leaderless at once.
4. The sentence. All five are sentenced to be heroes: sent to fight the kingdom's enemies and resurrected by the church each time they die.
5. The goal. The hero sets out to clear the party's name. Each death takes more of his memory, including the memory of that goal.

The forgotten past:

- Before he was a hero he was a young guard at the laboratory where the human was made.
- He saw a child in a cage, not an experiment, and let him go.
- The kingdom wiped his memory to bury the project and reassigned him. This part of his past was gone before the feast.
- The human remembers who freed him. The frame is personal: endless resurrection ensures the hero lives to see the world end.

The villain:

- The human. The only human in the world, made by the kingdom's own scientists in an experiment. He wants the world destroyed.
- His method. He does not conquer anything. Killing the rulers and pinning it on the heroes removes both the leadership and the one party strong enough to stop him.
- His organization. A secret group of animals that society cast out. He manipulates them into doing his work. Each regional boss is one of them, and each should be someone the player can pity.

Why he was made: the carnivore and herbivore nations could never agree on a ruler from either side, so their scholars tried to create a being that was neither predator nor prey. Humans existed only in myth. The result was judged a failure and caged.

His motive: revenge. He was made to be a ruler and then treated as a specimen, and he wants the world that did that erased. He is not building anything. His followers believe he is ending predator and prey; he is ending everything. The alchemists who made him are dead by his hand, and the laboratory is a ruin.

His plan removes the three things the peace rests on:

1. The rulers. Killed at the feast, leaving every nation leaderless and blaming the others.
2. The heroes. Removed by the frame.
3. The fish. The Covenant holds only because carnivores are fed from the sea. Ending that supply lets hunger do the rest.

Each lieutenant pulls one thread. The boar turns the farmland against the highlands and stops the grain. The hyena tells hungry carnivores the Covenant was never meant for them. The viper spoils the church's food stores. The cuckoo closes the mountain holds so messages stop moving between nations. The cuttlefish unites the sea and ends the fish trade.

The organization is based at sea. The kraken attacked because the land eats the sea; the human did not cause that grievance, he used it.

The lieutenants, one per region, each a dark counterpart to a party member, in order of encounter:

| Lieutenant | Mirrors | Region | Why they were cast out | Boss rule |
| --- | --- | --- | --- | --- |
| Boar | Bear | Farmland | An omnivore among herbivores, accused of eating a neighbor's child. Nobody waited for proof. | Takes every hit aimed at its followers and grows stronger with each one |
| Hyena | Vulture | Highlands | A gravedigger who ate the dead during a famine. Nobody forgave it. | Gains power whenever anyone is downed, on either side |
| Viper | Poison dart frog | Rivers and marsh | A healer whose patients feared her venom. When one died, she was blamed. | The party starts poisoned, and healing cast during the fight can turn toxic |
| Cuckoo | Chameleon | Mountain holds | Raised in a noble family's nest as one of their own, then exposed as an impostor | Shows false mana and disguises itself as a party member |
| Cuttlefish | Mimic octopus | The ocean | Kin to the kraken. Stayed loyal to the sea when the octopus sided with the land. | Casts the party's own grimoire back at them |

The human waits on the island after the fifth. He is the hero's truest counterpart: both were used by the kingdom and then erased.

The laboratory is on an island, so the last stretch of the game is sailing back to the place the hero once guarded.

The church's substitute for meat is fish. Sea peoples were never counted as citizens, and the peace on land is paid for by the ocean.

Further details:

- The rulers were devoured. The frame condemns the party and tells every herbivore the Covenant has failed, on the night all the nations were watching.
- The inquisitor. A royal investigator, a herbivore, certain of the party's guilt. On the map he is a roaming enemy who cannot be beaten early and cannot follow the party to sea. With enough evidence he can be shown the truth, and in the good ending he is the one who clears the party's name.
- Resurrection feeds the human. The same alchemists built both. He was made empty and filled with memories taken from others. The church's resurrection is that same technique, still running, and nobody asked where the memories go. Every memory a hero loses is poured into his head. A few people in the church know the laboratory existed and helped bury it.

The church itself is sincere. The priest who resurrects the hero and hands out missions believes he is serving justice. The few who know about the laboratory are keeping a secret, not running a project; they are the ones who had the guard's memory wiped. Finding out who they are is a thread the player pulls between regions.

## Opening

The game opens on the feast, then cuts to the hero waking alone in the church many deaths later.

1. The feast. A short walkable scene in the capital's great hall, decorated with what is left of the kraken. The player talks to each companion and a few of the rulers. These conversations become the named memories chosen between later.
2. The cupbearer. A hooded servant keeps refilling the party's cups and can be spoken to. He is the human, which the player only learns much later.
3. Blackout. The screen blurs as the party drinks. The player wakes to bodies, blood and guards, and never sees what happened.
4. The sentence. A brief trial. The five are branded and condemned to be heroes, then split into separate penal units.
5. Many deaths later. The chameleon wakes in the church alone, with several memory slots already gone. He knows he was framed and little else.

The kraken fight is not part of the opening. It can return later as a recovered memory or as a playable prologue once combat is complete.

## World

The world is a fixed, top-down 2D map in the style of Pokémon: towns joined by routes, explored freely, with fights starting when the party touches an enemy.

- Persistent map. Towns, routes and people stay where they are across deaths.
- The church. After a wipe the party wakes at the church in the capital and walks back out.
- Regions. Each region is held by one of the human's lieutenants, in the role a gym plays.
- Gates. Some paths need a utility spell to pass, such as one that clears brambles or freezes a river. These come from collected grimoires.
- Missions. The kingdom sends the convict unit on assignments. Clearing the party's name happens between orders.
- Visible enemies. Enemies show on the map as mana signatures. The party can suppress its mana to slip past, and enemies can do the same to ambush.

Society follows Beastars: carnivores and herbivores share towns under an uneasy peace.

- Towns have herbivore districts, carnivore quarters and a black market that opens at night.
- People react to a character's species and to the convict brand.

The Covenant is the law the peace rests on: no citizen eats another. The church enforces it and supplies carnivores with a substitute. The church also controls resurrection and licenses grimoires, and its alchemists are the kingdom's scientists.

Insects are the wild animals of this world, not citizens. They are what a chameleon or a frog eats without breaking the Covenant, and they serve as the common early enemies.

| Region | Who lives there | Character |
| --- | --- | --- |
| Farmland | Herbivores | Wealthy and numerous |
| Highlands | Carnivores | Militarized and distrusted |
| Mountain holds | Birds | Remote |
| Rivers and marsh | River and marsh peoples | Between land and sea |
| The capital | Everyone | Main port and seat of the church |
| The ocean | Sea peoples, pirates, exiles | Lawless |

The ocean sits in the middle of the map and is the one place the Covenant and the church do not reach.

- Predation is legal there.
- Pirate crews, smugglers, shark clans and whale pods hold territory under their own codes.
- Smugglers from the sea supply the black markets on land.
- Grimoires the church banned or never catalogued can be found there.
- Open water holds the hardest free-roaming enemies, and depth hides mana.
- Crossing starts with ferries between ports and later opens up with a travel spell.

The outcasts the human recruits are Covenant-breakers, hybrids, venomous species, scavengers and omnivores, who belong to neither side. The human is an omnivore too.

Memory loss shows on the map. A forgotten town loses its name, fog returns over a region, and a friend the hero no longer remembers speaks to him as a stranger.

The world worsens as the human's plan advances. Towns that are tense early have shuttered herbivore districts and open hunting at night later on. Defeating a lieutenant stops one thread of the plan and stabilizes that region.

## Exploration

Play moves in a loop from the church out into a region and back again on death.

1. The church gives the unit a mission in a region.
2. The party travels the route, choosing which enemies to fight and which to sneak past.
3. In town the party shops, gathers rumors, rests and sets anchors.
4. The party pushes toward the region's lieutenant.
5. On a wipe the party wakes at the church, forgets something and heads back out.

Outside battle:

- Sneaking. Suppressing mana on the map lets the party pass patrols. Stronger enemies can sense it anyway.
- Favor spells. Villagers trade small everyday spells for help. Most seem useless; a few open gates or matter in one specific fight.
- Camps. Rest points for healing, setting anchors and studying unknown spells. Resting brings enemies back.
- Day and night. Night opens black markets and changes which enemies are out.

## Combat

The player commands three characters against a group of enemies, with controls borrowed from Angry Birds Epic and rules borrowed from Frieren's magic. There are no hit rolls; the uncertainty comes from hidden mana and unknown spells.

A round:

1. Player side. Each of the three characters acts once, in any order the player chooses.
2. Enemy side. Each enemy acts once.

Each character has two actions:

- Attack. Drag the character onto an enemy to cast their offensive spell.
- Support. Drag the character onto an ally, or tap them, to cast their support spell. Barriers live here.

The rules that make it Frieren:

| Rule | How it works |
| --- | --- |
| Mana is visible | Each character has a mana pool that enemies can see and react to. Enemy mana is visible to the player too. |
| Suppression | A character can hide part of their mana at a cost, then reveal it for one strong turn. Enemies can do the same. |
| Costly barriers | A barrier costs far more mana than an attack, so the party cannot block everything. |
| Unknown spells | An enemy spell the party has not studied cannot be blocked. It shows as "???" with a countdown. |
| Analysis | Surviving or studying a spell adds it to the grimoire. From then on the game shows its name and it can be blocked. |

Starting numbers, to be tuned: each character has about 10 mana and regains 3 per round. An attack costs 2 and a barrier costs 5.

Enemies target whoever shows the most mana. This makes suppression the tanking system: the bear shows everything to draw attacks, while the chameleon hides, is ignored, then reveals for bonus damage.

There are two kinds of damage:

- Spells are stopped by barriers.
- Physical attacks pass through barriers and are stopped by guarding.

Enemies signal which is coming. Mana is always shown, since reading it is the game. Exact health and damage numbers are hidden and described in words such as "wounded" or "barely standing".

Presentation update: show health bars for party members and enemies alongside those condition descriptions. Keep exact health and damage numbers hidden.

A shared meter fills as the party fights. When full, it can be spent on one character's strongest technique. For the hero this is a technique from his forgotten past.

A character at zero health is downed. If all three are downed, the party wipes and wakes at the church.

## Party and classes

The party is the five heroes who were sentenced together; three fight at a time and two wait in reserve.

| Member | Role | Mechanic | Why society distrusts them |
| --- | --- | --- | --- |
| Chameleon (the hero) | Assassin | Best at suppressing mana; strikes hardest from concealment | A reptile who hides what he is |
| Mimic octopus | Copier | Casts enemy spells the party has analyzed into the grimoire | A sea person, and a traitor to the sea for fighting the kraken |
| Vulture | Spellcaster and marksman | Long-range damage; gains from fallen enemies | A scavenger |
| Bear | Tank | Highest health; guards an ally and takes hits for them | An omnivore, mistrusted by herbivores |
| Poison dart frog | Healer and poisoner | One toxin, two doses: small heals allies, large poisons enemies | Poisonous |

All five belong to the kinds of animals the human recruits, which is why the kingdom found the charge easy to believe.

The party is scattered at the start. Each companion is found in the region of their counterpart lieutenant, so that fight is personal for whoever just joined.

| Member | Region | Where to find them | Their state |
| --- | --- | --- | --- |
| Chameleon | The capital | Wakes in the church | Several memories already gone |
| Bear | Farmland | Chained to a mill outside the first town, used as forced labor by herbivores who fear him | Has died least. Remembers the hero and teaches the reminder mechanic |
| Vulture | Highlands | On an old battlefield below a border fort, assigned to clear the dead | Has died most. Does not know the hero and must be won over |
| Poison dart frog | Rivers and marsh | In a church plague hospice, healing under guard | Remembers the party but no longer believes they were framed |
| Mimic octopus | The ocean | Hiding in disguise among the sea's outlaws, hunted for the kraken | Beyond the church's reach, so has barely died. Remembers almost everything |

This gives one character in the capital, two after the farmland, three after the highlands, and reserves from the marsh onward. The mountain holds add no companion; the cuckoo there is the hero's own counterpart.

- Species is the body. It sets health, physical strength and how society treats the character. It never changes.
- The grimoire is the class. The grimoire a character carries sets their offensive and support spells. Swapping grimoires between fights changes their role, as hats do in Angry Birds Epic.
- Magic is the equalizer. Spells do not depend on size, which is why a herbivore can stand beside a carnivore in a fight.
- Reserve members still matter. Their memories count outside battle, and they can be swapped in between fights.

In solo play the other four heroes are companions the player commands. Each has their own memory track, so a companion can forget the hero or stop believing the party was framed. Each companion slot is a seat a second player can take when co-op is added.

## Memory

Every wipe takes one memory from each character and gives a Hollow perk in return, so a struggling party grows stronger in combat while drifting away from the good ending.

| | What it is | What it does |
| --- | --- | --- |
| Memory | A named piece of the character's past, about ten each | Unlocks dialogue, evidence, readable events and routes toward clearing the party's name |
| Hollow perk | What replaces a lost memory | Raw combat power: more mana, more damage |

On resurrection the player chooses which memory is taken. Each memory is tied to something concrete, such as a spell school or a way to talk down an enemy, so the choice has a cost the player can see.

A wipe at sea costs two memories, not one. The church has no reach there and the bodies have to be recovered.

The hero's ten memories:

| Memory | What forgetting it costs |
| --- | --- |
| The feast | He stops being sure the party was framed |
| The trial | He no longer knows why he is branded and cannot argue his innocence |
| The kraken | He loses his technique for the shared meter |
| The bear | The bear's reminders stop working on him |
| The vulture | The vulture's reminders stop working on him |
| The poison dart frog | The frog's reminders stop working on him |
| The mimic octopus | The octopus's reminders stop working on him |
| His training | He loses the bonus damage when revealing hidden mana |
| His home | A safe house and the people in it treat him as a stranger |
| His name | Everyone calls him "hero" and the game stops showing his name |

Three further slots are blank when the game begins and were not taken by any death: the laboratory, the child and the open door. These are what the alchemists erased. They cannot be lost, only found, in pieces, on the way to the island.

The key memories for the good ending are the feast, at least one companion, and the laboratory once recovered.

Ways to hold on:

- Anchors. At a rest stop a memory can be written down or tied to a keepsake. It survives the next death. Slots are limited.
- Companions. A companion who still holds a memory the hero lost can remind him, restoring it until the next wipe.
- The grimoire. Studied enemy spells are kept in a shared book, not in anyone's head, so they are never forgotten.

Supplies and money gathered since the last death are lost on a wipe. Memories, anchors, Hollow perks, keepsakes, the grimoire and opened shortcuts persist.

Endings depend on how much is left:

| Memory state | Ending |
| --- | --- |
| Key memories intact | Good: the hero refuses the human, takes back what the party lost, and the inquisitor clears their name |
| Key memories lost | Bad: he reaches the human no longer knowing why he came, and the human, who holds everything he forgot, takes him in |

Because anchors and companions can restore memories, the good ending is never permanently locked.

## Side quests and keepsakes

Side quests are unmarked, easy to miss and reward keepsakes: equipment that changes how a character plays, in the manner of Hollow Knight's charms.

Keepsakes:

- Each character has a limited number of keepsake slots, separate from anchor slots.
- Each keepsake changes how its holder plays, often with a drawback.
- Keepsakes survive a wipe. A few powerful ones are fragile and break on a wipe.

| Example keepsake | Holder | Effect | Drawback |
| --- | --- | --- | --- |
| Cracked mirror | Chameleon | His reveal hits harder | Cannot be healed while hidden |
| Miller's chain | Bear | Guards two allies at once | Loses his attack that round |
| Hospice bell | Poison dart frog | Healing also removes poison | Enemies see her mana rise before she casts |

How side quests work:

- No markers and no checklist. Someone mentions a problem and the player works out the rest.
- The world remembers when the hero does not. A quest stays open if he forgets who gave it. He finds the item in his bag and does not know who it is for.
- Some can fail. A letter carried through the highlands is lost if the party wipes.

| Quest | What it asks | Reward |
| --- | --- | --- |
| Free the caught | Release sea people held in market stalls across the land | A sea elder rewards the party by how many are freed |
| The old masters | Find three retired fighters | Each teaches a technique for the shared meter |
| The smuggler's chain | A string of black-market errands | A grimoire the church banned |
| Companion quests | One personal story per party member | That member's best keepsake |
| A victim's family | Help a relative of a murdered ruler | Evidence toward the good ending |

The five companion-quest keepsakes are the only items that tie equipment to memory. Each grants an ability and permanently holds one memory of that companion. The bear's is a broken link of the mill chain: it improves his guard, and the hero can never again forget who the bear is.

## Region 1: The farmland

The farmland is the first region and teaches every core system once: mana reading, a reunion, a gate, an unknown spell, a first death and a lieutenant. Names are placeholders.

The mission: the church sends the hero to find out why grain has stopped reaching the highlands.

1. The farm road. Enemies are giant crop pests such as locusts and weevils. They do not hide mana and use only physical attacks.
2. The town. A prosperous herbivore market town. Shops overcharge the branded reptile and the inn turns him away, which teaches camping.
3. The mill. The bear is chained to the millstone. He knows the hero at once and reminds him of something small, which teaches the reminder mechanic.
4. The hedge. A wall of brambles blocks the border road. A favor spell that makes thorns let go opens it. This is the first gate.
5. The first unknown spell. Past the hedge the boar's followers appear: outcast omnivores who cast real spells and hide their mana. One casts a spell shown only as "???" that will very likely wipe the party. On the return it has a name and can be blocked.
6. The border road. Grain carts sit turned around. Highland drivers and farmland guards are close to blows, and nobody knows who gave the order.
7. The boar. He waits in the burned shell of his own farm.

People in town:

- A rabbit reeve who runs the town and wants the unrest gone.
- A child who is not afraid of the hero and gives the first favor-spell quest.
- A fishmonger keeping something alive in a barrel: the first "free the caught" encounter, left unexplained.
- A night stall behind the tannery selling what it should not.

Freeing the bear:

| Way | Cost |
| --- | --- |
| Earn the writ | Clear pests from the reeve's fields |
| Buy the writ | A price that is steep this early |
| Break the chain at night | The town turns hostile |

The boar's story: the child he was accused of eating wandered off and was found alive weeks later. By then the town had burned him out, and nobody apologized.

The boar's fight: he takes every hit aimed at his followers and grows stronger from it. Clearing the followers first is the trap. The answer is to leave them alone and fight him directly.

Afterward the grain moves again and the town thaws slightly. Among the boar's things is a cup from the feast, and his followers speak of "the one with no fur, who listened."

## Region 2: The highlands

The highlands introduce a reunion that has to be earned, anchors, enemies that hide their mana, and the inquisitor.

The mission: bodies are going missing from an old battlefield below a border fort, and the church sends the unit to put down "the grave-eaters".

1. The pass. Deserters and raiders suppress their mana, so signatures on the map flicker out before an ambush.
2. The fort town. A carnivore garrison town where the social order flips. Nobody stares at a reptile or a bear; the frightened ones are the herbivore merchants behind their own wall. Lines form for a shrinking fish ration. The town wakes at night, and the black market is large and sells real meat.
3. The battlefield. The vulture's sentence is clearing the dead. She does not know the hero and attacks him as a grave thief, in a duel the player only needs to survive.
4. The note. Before she forgot, the vulture hid a note in her own handwriting in the fort: trust the chameleon. Finding it and bringing it to her wins her back and teaches anchors.
5. The ravine. A broken bridge that no spell opens. The vulture flies across and lowers it. Some gates need a companion.
6. The lesson fight. An enemy pair attacks with a spell and a physical blow in the same round, so the party must guard and raise a barrier together for the first time.
7. The hyena. She waits in an ossuary under a ruined abbey.

The hyena's story: during a famine she was the gravedigger and ate the dead to stay alive and feed others. She broke no law and was exiled anyway.

The hyena's fight: she grows stronger whenever anyone falls, on either side, and raises her fallen followers to do it again. The answer is to put a barrier on a fallen body so she cannot feed on it.

Afterward:

- She says the fish rations were cut before any unrest began. A ledger in her den proves the church knew, which is the first thread toward the inner circle.
- She met the cupbearer: "He ate at my table. He eats anything. Like me."
- The vulture notices the kingdom punished her with the same work it exiled the hyena for.
- On the way out a mana signature far larger than anything so far appears on the road. The inquisitor has found the trail.

## Region 3: The marsh

The marsh introduces a companion who joins without trusting the hero, status effects, a fourth party member, and a fight where healing is the mistake.

The mission: a sickness is spreading through the river towns and the church's food stores are spoiling. The unit is sent to guard the hospice and find the cause.

1. The causeway. Boardwalks over dark water. Swamp insects, leeches and mosquitoes poison and bleed. Fog shortens how far mana can be seen.
2. The river town. A stilt town where land and sea trade meet. Barrels of fish come upriver to be smoked and sent inland. People are sick and afraid, and the town is rounding up anyone venomous or poisonous. A second, larger "free the caught" stall is here.
3. The hospice. The frog heals under guard. She remembers the party but has lost the feast, and no longer believes they were framed.
4. The channel. Deep water blocks the way. A ferryman trades a favor spell that makes still water firm enough to walk on.
5. The lesson fight. An unknown spell sours healing, so the frog's cure hurts whoever receives it. Once analyzed, the player can see it coming and hold healing back.
6. The storehouse. The church's ruined food stores. In the cellar, sealed crates are marked for shipment to "the lighthouse". Nobody in town knows of one.
7. The viper. She waits in a flooded apothecary.

Winning the frog: she will treat the hero's wounds but will not join him. What changes her mind is being shown the sickness is poison, not plague. She comes to stop a poisoner, not for him, and will not remind him of anything until she trusts him again. With four members the player now chooses who fights and who waits.

The viper's story: she was a healer whose patients feared her venom. When one died, nobody asked how.

The viper's fight: the party starts poisoned and healing may turn toxic. The answer is to stop healing and race the poison, with the frog fighting as a poisoner for the first time.

Afterward:

- The viper says the man with no fur was the only one who ever asked what really happened to her patient.
- The frog has watched a healer be blamed for a death she did not cause, and starts to wonder about the feast.
- The lighthouse crates point toward the sea.

## Region 4: The mountain holds

No companion joins in the mountain holds, so the region belongs to the hero. It introduces mana that lies, a solo stretch, the first recovered memory, and the inquisitor face to face.

The mission: the messenger birds have stopped flying and the holds have shut their gates, so no nation can talk to another. The unit is sent to reopen the routes.

1. The climb. Cliff paths and wind. Mana on the map can no longer be trusted: some signatures are decoys, and some small ones hide something large.
2. The hold. A city built up a cliff face and ranked by height, where everything depends on bloodline. The party are ground-dwellers, and the vulture, as a scavenger, is barred from the upper tiers. The rookery is closed "by order of the house".
3. The ascent. Only the chameleon can reach the upper tiers. He goes up alone through the noble house in a stealth section, hiding his mana past the guards.
4. The lesson fight. An enemy shows weak mana and is not weak. The tell: real mana drops when a spell is cast, and a false display never moves.
5. The archive. The birds kept copies of everything they carried. One is an old order transferring a young guard away from "the project" and instructing that he not be told why. Reading it fills part of the first blank memory, the laboratory.
6. The inquisitor. He corners the hero in the archive, reads the order over his shoulder, and for the first time does not attack: "I will look into this. Then I will come for you."
7. The cuckoo. He has been wearing the lord's face.

The cuckoo's story: he was raised in this house as a son, loved until they learned what he was, and thrown out.

The cuckoo's fight: he shows false mana and takes the shape of one of the party. One of the three characters the player commands is him, and orders given to him are quietly betrayed. He is found by the lesson just learned: his mana does not move. Striking the wrong one hurts a friend.

He knows the hero: "He remembers you. He told me you opened a door."

Afterward:

- The rookery opens and messages fly again.
- Among years of undelivered letters is one to the hero from the octopus: it is at sea, and it warns him not to die out there.
- A courier has seen a lighthouse on an island that is on no chart.

## Region 5: The ocean

The ocean changes the rules: no missions, no church, free travel, and every wipe costs two memories.

Getting there: the church has no business at sea and orders the unit home. Going anyway is the hero's first act of desertion. His handler, who has seen the ledger, looks the other way.

1. The crossing. A smuggler's ferry at night, to fixed ports only. Depth hides mana, so enemies show on the map only when they surface. Shark clans and pirate crews each hold their own water.
2. The outlaw port. A floating town lashed together from wrecks. Nobody looks at the brand. It has the best shops in the game and grimoires the church banned.
3. The octopus. It is in port in disguise, and the player has probably already spoken to it. The tell: one stranger calls the hero by his name.
4. Open water. Once it joins, the octopus teaches the party to ride the currents and the sea becomes free to explore.
5. What the sea shows. Fishing fleets from the land and the pens where the catch is kept. The smoked rations the player has used to heal since the farmland were this. The elder who rewards "free the caught" is here, and the number released decides how the sea receives the party.
6. The kraken's grave. The kraken was not a monster. It rose after a mass netting, as the sea's defender.
7. The lesson fight. Enemies who have studied the party open with spells from its own grimoire.
8. The cuttlefish. Kin to the kraken, it has united the sea to end the fish trade.

The octopus's story: it is hunted and ashamed, having fought its own kin for a kingdom that then condemned it. It remembers the feast best of anyone, including one detail: the cupbearer had hands with no fur and no claws.

The cuttlefish's fight: it casts the party's grimoire back at them, starting with the last spell used. The answer is to feed it the worst spells. The small favor spells that seemed useless are what the party wants it copying.

Afterward: this thread cannot be neatly undone. The fish trade does not resume. The octopus brokers a truce on other terms, since the human's new world has no place for the sea either. The sea has always known where the island is, because it is where the land's secrets wash up.

## Region 6: The island

The island is the ending: a ruined laboratory, the last blank memories, and the human.

1. The shore. A lighthouse on an island no chart shows, its beach covered in what the tide left. There are no enemies.
2. The ruin. The laboratory has been abandoned for years and the alchemists are long dead. Their own records show what they did to him. The player understands the human by walking through where he was made.
3. The cells. One small cage and one door. The last two blank memories return as a scene the player controls: as the young guard, the player opens the door.
4. The human. He is not hostile. He thanks the hero for the door and offers him a seat.

The choice to refuse exists only if the hero still has his key memories. If they are gone, the option is not on the screen. He sits, the human fills his cup as he did at the feast, and that is the bad ending.

The final fight, if he refuses:

- Nothing to read. A human has no mana, so the skill the whole game taught does not work on him.
- He fights with what the party lost. Every memory the party gave up is a spell he can cast.
- Taking them back. Each memory the party recovers from him returns to its owner and removes that spell from him. It also removes the Hollow perk that replaced it.

The fight runs backward from the rest of the game: the party grows weaker and more itself as he grows weaker and more alone.

The good ending:

- The hero spares him. He opened the door for a child once, and with the human beaten in front of him he chooses mercy a second time, now knowing what he freed and what was done to it.
- The inquisitor arrives, having followed the transfer order and the lighthouse crates. He is the one the nations will believe.
- The sentence is lifted and the resurrections stop, which also ends what was still being done to the human. For the first time nothing more is poured into his head.
- The truth about the fish comes out, so the old Covenant cannot resume. It has to be rewritten with the sea in it.

The last image: by morning the human is gone. The cell is empty, the door is open, and the game gives no answer about where he went.

## Tech

The first version is a solo web game that runs entirely in the browser, with no server.

| Part | Choice | Why |
| --- | --- | --- |
| Language | TypeScript | One language for the client now and a server later |
| Rendering | Phaser | Built for 2D tile maps, sprites, cameras and input |
| Maps | Tiled | Free editor; Phaser loads its exports directly |
| Saves | Browser local storage | Enough for one player's memories, anchors and grimoire |

One structural rule: keep the game rules (mana, spells, memory loss) in a plain TypeScript module with no Phaser code. The battle screen calls into it, it can be tested without a browser, and it moves to a server largely unchanged when co-op is added.

For co-op later: a Node server with WebSockets that owns fights and saves, and a small database in place of local storage.

## Build order

Build the full loop in miniature first, then add content; each step should be playable before the next begins.

1. Walk. One small Tiled map and a character that moves on it.
2. Encounter. One visible enemy; touching it opens a battle screen.
3. Basic fight. One hero against one enemy with attack and support actions and a mana pool.
4. Party of three. Three characters acting in any order, then the enemy side.
5. Frieren rules. Visible mana, suppression, costly barriers, one unknown spell that can be analyzed into the grimoire.
6. Death. Wipe, wake at the church, choose a memory to lose, gain a Hollow perk. Save it.
7. Memory in the world. One forgotten memory changes something visible: a town name, a line of dialogue.
8. One region. A town with districts, a route, a gate that needs a utility spell, and one lieutenant boss.
9. Anchors and companions. Rest stops, reminders, and the two reserve members.
10. Decide scope. Only after one region is fun, choose how many regions the game has.

The first build starts with the hero waking in the church, because that is where the repeatable loop begins. The feast is added in front of it once the loop works.

## Open questions

- [ ] What are each companion's memories?
