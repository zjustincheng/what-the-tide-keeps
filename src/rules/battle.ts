// Pure game rules: no Phaser, DOM, timers, or random state.
// Rule modules import each other with .ts extensions so Node can run their tests directly.
import type { Hollow } from './memory';
import { mods, NO_MODS } from './gear.ts';
import type { Gear, KeepsakeId, Mods } from './gear';
import { BOOKS, SPELLS, STARTING_BOOKS } from './spells.ts';
import type { Books, SpellId } from './spells';
import { NO_SUPPLIES, SUPPLIES } from './economy.ts';
import type { Supplies, SupplyId } from './economy';
import type { Drained, Wounds } from './world';
export type MemberId = 'chameleon' | 'bear' | 'vulture' | 'frog';
// unmask: strike an ally, in case they are not who they seem.
export type Action = 'attack' | 'support' | 'suppress' | 'barrier' | 'analyze' | 'gather' | 'unmask';
export type Encounter = 'locust' | 'acolyte' | 'weevil' | 'boar' | 'swarm' | 'warden' | 'leech' | 'hound' | 'pack' | 'wisp' | 'drowned'
  | 'raider' | 'ghoul' | 'vulture' | 'pair' | 'hyena' | 'inquisitor' | 'captain' | 'harrier'
  | 'mosquito' | 'scorpion' | 'brood' | 'apprentice' | 'viper'
  | 'hornet' | 'spider' | 'duellist' | 'cuckoo' | 'warder' | 'cricket' | 'flight';
export const SPELL = 'Salt lance';
// What an enemy is, which decides whose blows it fears. Spells ignore all of it: magic is the equaliser.
export type Trait = 'armoured' | 'flying' | 'caster' | 'insect' | 'dead';
export const TRAITS: Record<Encounter, readonly Trait[]> = {
  locust: ['insect'], weevil: ['insect', 'armoured'], acolyte: ['caster'], boar: ['armoured'], swarm: ['insect', 'flying'], warden: ['caster'],
  leech: [], hound: [], pack: [], wisp: ['flying', 'dead'], drowned: ['dead'], raider: [], ghoul: ['dead'], vulture: ['flying'], pair: ['caster'],
  hyena: [], inquisitor: ['caster'], captain: ['armoured'], harrier: ['flying'], mosquito: ['insect', 'flying'], scorpion: ['insect', 'armoured'],
  brood: ['insect', 'flying'], apprentice: ['caster'], viper: ['caster'], hornet: ['insect', 'flying'], spider: ['insect'], duellist: ['caster', 'flying'], cuckoo: ['caster', 'flying'],
  warder: ['armoured'], cricket: ['insect'], flight: ['dead', 'flying'],
};
// How each hero's own blow fares against each kind: the bear's maul breaks armour and can't reach what flies;
// the vulture's talons take things out of the air and skid off plate; the chameleon strikes casters as they gather.
export const MATCHUPS: Record<MemberId, Partial<Record<Trait, number>>> = {
  bear: { armoured: 1.5, flying: 0.5 }, vulture: { flying: 1.5, armoured: 0.5 }, chameleon: { caster: 1.5 }, frog: {},
};
// The frog's poison: double in an insect, nothing at all in the dead.
export const VENOM: Partial<Record<Trait, number>> = { insect: 2, dead: 0 };
export function matchup(member: MemberId, encounter: Encounter): number {
  return TRAITS[encounter].reduce((total, trait) => total * (MATCHUPS[member][trait] ?? 1), 1);
}
export function venom(encounter: Encounter): number {
  return TRAITS[encounter].reduce((total, trait) => total * (VENOM[trait] ?? 1), 1);
}

// Mana that lies: these show a fixed number, whatever they really hold. A false display never moves, even when they cast.
export const FALSE_MANA: Partial<Record<Encounter, number>> = { spider: 1, duellist: 2, cuckoo: 3 };
// How hard unmasking the cuckoo hits him.
export const UNMASK = 18;
// The marsh's spell: it does little harm itself, but for a while afterward every heal burns instead.
export const SOURING = 'Souring';
// Each caster's spell. Until a spell is studied (analyzed, or survived once) its name is hidden, it can't be dodged,
// and no barrier stops it. Once studied, it can be seen coming, dodged, and barred.
export const ENEMY_SPELLS: Partial<Record<Encounter, string>> = {
  acolyte: SPELL, pair: SPELL, warden: 'Judgement', drowned: 'Drowning toll', wisp: 'Marsh-fire', inquisitor: 'Verdict',
  apprentice: SOURING, viper: SOURING, duellist: 'Talon hex', cuckoo: 'Talon hex',
};
export const STUDIABLE: readonly string[] = [...new Set(Object.values(ENEMY_SPELLS))];
export type Phase = 'player' | 'enemy' | 'victory' | 'defeat' | 'fled';
export type Fighter = Readonly<{ health: number; maxHealth: number; mana: number; maxMana: number }>;
// A follower the hyena has fed on is gone for good: it cannot be raised again.
export type Follower = Fighter & Readonly<{ name: string; eaten?: boolean }>;
// Who an attack is aimed at: 0 is the main enemy, 1 and up are its followers.
export type Foe = number;
// revive: the move raises fallen followers instead of striking. drain: the attacker heals by what it deals.
// window: this blow's dodge timing, tighter for stronger enemies. undodgeable: only a guard or barrier answers it.
// feed: the hyena feeds on a fallen body instead of striking, unless a barrier covers it.
// hits: the move lands this many times, each dodged on its own. unblockable: no guard or barrier stops it.
// spell: for a spell, which one it is. poison: rounds of poison a blow leaves, if it lands at all.
// sour: a spell that turns the party's healing to harm for a while once cast.
// dodge: how this blow is dodged, when it differs from what dodgeKind would choose.
type Move = { name: string; type: 'physical' | 'spell'; spell?: string; dodge?: DodgeKind; damage: number; piercing?: number; revive?: boolean; drain?: boolean; feed?: boolean; hits?: number; unblockable?: boolean;
  poison?: number; sour?: true;
  window?: { perfect: number; graze: number }; undodgeable?: boolean };
export type Member = Fighter & Readonly<{
  id: MemberId;
  acted: boolean;
  guardingFor: MemberId | null;
  focused: boolean;
  suppressed: boolean;
  barrier: boolean;
  // What equipped keepsakes change for this member.
  gear: Mods;
  // The spell taught by the grimoire this member carries.
  spell: SpellId | null;
  // Rounds until this member can cast again.
  cooldown: number;
  // A member who just cast shows a flood of mana until the enemy has moved.
  flaring: boolean;
  // Rounds of poison left: it bites at the end of every enemy turn.
  poison: number;
}>;
export type Battle = Readonly<{
  round: number;
  encounter: Encounter;
  studied: readonly string[];
  hollow: Hollow;
  enemyRevealed: boolean;
  phase: Phase;
  party: readonly Member[];
  enemy: Fighter;
  followers: readonly Follower[];
  // Strength the boar gains from hits taken for his followers. It drives through guards.
  fury: number;
  // How many enemy blows have landed this enemy turn.
  step: number;
  // A snared main enemy loses its next move.
  snared: boolean;
  // Bosses change once they are down to half health.
  stage: 1 | 2;
  // Which wave of the fight this is, and how many there are.
  wave: number; waves: number;
  // Supplies brought into the fight; whatever is left goes back into the pack.
  supplies: Supplies;
  // Rounds of the frog's poison left in the main enemy.
  enemyPoison: number;
  // The cuckoo, hiding in the party as one of them: whose shape he wears, and the mana that shape shows, which never moves.
  impostor: { as: MemberId; shown: number } | null;
  // While soured, every heal burns for as much as it would have mended.
  soured: number;
  log: readonly string[];
}>;
export type Dodge = 'perfect' | 'graze' | 'miss';
// How a blow is dodged. ring: press as a ring closes. target: click a circle somewhere on screen as it closes.
// keys: type a short sequence before a spell lands. bar: stop a sweeping marker in the zone, like reeling a fish.
export type DodgeKind = 'ring' | 'keys' | 'bar';
export function dodgeKind(move: Pick<Move, 'dodge' | 'type' | 'drain' | 'hits' | 'damage'>): DodgeKind {
  if (move.dodge) return move.dodge;
  if (move.type === 'spell') return 'keys';
  if (move.drain) return 'bar';
  return 'ring';
}

export const MEMBERS = {
  // Attacks are physical and cost nothing; mana is for spells and spellcraft.
  // agility scales every dodge window: the vulture is quick, the bear is not.
  chameleon: { name: 'Chameleon', attack: 'Tail lash', support: 'Guard', damage: 7, agility: 1 },
  bear: { name: 'Bear', attack: 'Maul', support: 'Protect', damage: 5, agility: 0.8 },
  vulture: { name: 'Vulture', attack: 'Talons', support: 'Focus', damage: 9, agility: 1.25 },
  // One toxin, two doses: a small one mends an ally, a large one poisons the enemy.
  frog: { name: 'Frog', attack: 'Toxin dart', support: 'Dose', damage: 4, agility: 1.1 },
} as const;
// Crop pests hide nothing and only strike physically; the exile veils its mana and casts.
export const ENEMIES = {
  locust: { name: 'Crop locust', short: 'locust', health: 46, mana: 2, veiled: false,
    opening: 'A crop locust, fat on stolen grain, turns to face you.' },
  acolyte: { name: 'Hooded exile', short: 'exile', health: 56, mana: 12, veiled: true,
    opening: 'The hooded exile shows almost no mana. A spell gathers behind the veil.' },
  weevil: { name: 'Grain weevil', short: 'weevil', health: 54, mana: 3, veiled: false,
    opening: 'A grain weevil the size of a handcart shoulders out of the wheat.' },
  boar: { name: 'The boar', short: 'boar', health: 72, mana: 6, veiled: false,
    opening: 'The boar rises from the ashes of his own hearth. His followers close in at his flanks. "Not them," he says. "Me."' },
  // Guardians of keepsakes worth having.
  warden: { name: 'Shrine warden', short: 'warden', health: 70, mana: 14, veiled: false,
    opening: 'The warden turns from the shrine. Two votive candles flare up at its sides. Blows will slide off it while they burn.' },
  leech: { name: 'Mire leech', short: 'leech', health: 116, mana: 3, veiled: false,
    opening: 'The ford heaves. Something long and black comes up out of the silt.' },
  swarm: { name: 'Swarm-mother', short: 'swarm-mother', health: 84, mana: 4, veiled: false,
    opening: 'Something the size of a cart unfolds in the dark between the trees. Her brood drops from the branches around her.' },
  // The downs: hounds gone hungry since the Covenant closed the commons to them.
  hound: { name: 'Starved hound', short: 'hound', health: 52, mana: 2, veiled: false,
    opening: 'A hound comes out of the gorse with its ribs showing. It does not bark.' },
  pack: { name: 'Pack leader', short: 'pack leader', health: 100, mana: 4, veiled: false,
    opening: 'The leader steps out of the broken tower. Two of his pack come round behind you.' },
  // The fen, over the drowned hamlet.
  wisp: { name: 'Marsh light', short: 'light', health: 34, mana: 8, veiled: false,
    opening: 'A pale light hangs over the water, the height of a lantern held by someone short. Nobody is holding it.' },
  drowned: { name: 'The drowned', short: 'drowned', health: 118, mana: 5, veiled: false,
    opening: 'Something in a rotted cassock stands up out of the chapel water. The bell rope is still in its hands.' },
  // The highlands: raiders who hide their mana, the dead who will not stay buried, and the people who make them rise.
  raider: { name: 'Highland raider', short: 'raider', health: 64, mana: 6, veiled: true,
    opening: 'There was nothing on the road a moment ago. Now a raider is standing in it, and the blade is already moving.' },
  ghoul: { name: 'Raised dead', short: 'dead', health: 56, mana: 0, veiled: false,
    opening: 'Something that was buried here gets up. It is still wearing a garrison coat.' },
  vulture: { name: 'The vulture', short: 'vulture', health: 60, mana: 10, veiled: false,
    opening: 'A vulture in a gravedigger\'s sash drops from the dead tree. "Grave thief," she says, and does not wait for an answer. You only need to live through this.' },
  pair: { name: 'Deserter hexer', short: 'hexer', health: 54, mana: 14, veiled: false,
    opening: 'Two deserters step out of the abbey gate: a hexer with ink on his hands, and a brute with a pick. They have done this together before.' },
  hyena: { name: 'The hyena', short: 'hyena', health: 130, mana: 8, veiled: false,
    opening: 'The hyena looks up from the bones. "Nobody comes down here to pray." Behind her, the dead she keeps get up.' },
  captain: { name: 'Deserter captain', short: 'captain', health: 124, mana: 8, veiled: true,
    opening: 'A wolf in a garrison coat with the badges cut off stands up from the inner yard\'s fire. "Nobody\'s coming for that lantern. Nobody\'s coming for us." His lieutenant draws.' },
  // The rookery road: hawks who rob the couriers' road from the air.
  harrier: { name: 'Harrier', short: 'harrier', health: 58, mana: 6, veiled: false,
    opening: 'A harrier drops out of the wind with its talons open. It has been living off this road a long time.' },
  // The marsh: insects that poison and seize, the viper's apprentice, and the viper.
  mosquito: { name: 'Marsh mosquito', short: 'mosquito', health: 56, mana: 2, veiled: false,
    opening: 'A mosquito the size of a dog comes out of the fog, whining. Its needle is already wet.' },
  scorpion: { name: 'Water scorpion', short: 'scorpion', health: 64, mana: 3, veiled: false,
    opening: 'The black water bulges. A water scorpion pulls itself up onto the boards, forelegs open.' },
  brood: { name: 'The reed-bed queen', short: 'queen', health: 96, mana: 4, veiled: false,
    opening: 'The reeds are full of eggs, and the eggs are hatching. Their mother turns her needle toward you.' },
  apprentice: { name: 'The apprentice', short: 'apprentice', health: 88, mana: 14, veiled: true,
    opening: 'A toad in an apothecary\'s apron straightens up among the spoiled sacks. "You shouldn\'t be down here. Nobody gets well down here."' },
  viper: { name: 'The viper', short: 'viper', health: 118, mana: 14, veiled: false,
    opening: 'The viper uncoils from the counter of the flooded apothecary. "You came in already sick. Everyone does."' },
  // The mountain holds: insects of the cliffs, the house's duellist, and the cuckoo.
  hornet: { name: 'Cliff hornet', short: 'hornet', health: 58, mana: 3, veiled: false,
    opening: 'A hornet the length of your arm comes down out of the wind, and hangs there, deciding.' },
  spider: { name: 'Crag spider', short: 'spider', health: 92, mana: 12, veiled: false,
    opening: 'The little signature was a lie. What unfolds from the crack in the rock is the size of a cart.' },
  duellist: { name: 'House duellist', short: 'duellist', health: 80, mana: 16, veiled: false,
    opening: 'A kestrel in the house\'s colours steps out from the gate. His mana reads almost nothing. He draws as if that didn\'t matter.' },
  cuckoo: { name: 'The lord of the house', short: 'cuckoo', health: 126, mana: 18, veiled: false,
    opening: 'The lord of the house rises from his chair. Then he stops pretending, and the lord\'s face slides off him like water. A cuckoo. "He told me you opened a door, once."' },
  // Off the main roads: the church's pen-warder, crickets in the house's cellars, and the couriers who froze on the peak.
  warder: { name: 'The pen-warder', short: 'warder', health: 124, mana: 4, veiled: false,
    opening: 'A snapping turtle in a church tabard heaves up off the gatehouse step, the pens\' keys on a chain round his neck. "Fit for work, or not. Which are you?"' },
  cricket: { name: 'Cave cricket', short: 'cricket', health: 48, mana: 2, veiled: false,
    opening: 'Something pale and long-legged unfolds from the dark of the cellar, and chirrs.' },
  flight: { name: 'The lost flight', short: 'lost flight', health: 96, mana: 10, veiled: false,
    opening: 'The couriers who froze on the peak lift out of the snow, still in their harness, and come at you in formation.' },
  inquisitor: { name: 'The inquisitor', short: 'inquisitor', health: 600, mana: 60, veiled: false,
    opening: 'The largest signature you have ever felt. A ram in grey, the royal seal at his collar. "Convict. You are a long way from your church." You cannot win this. Run.' },
} as const satisfies Record<Encounter, unknown>;
// Outcast omnivores who follow the boar. They hide their mana; he shields them with his own body.
// damage: what each blow does, when it is more than the usual follower's blow.
export const FOLLOWERS: Partial<Record<Encounter, readonly { name: string; health: number; weapon: string; damage?: number }[]>> = {
  boar: [{ name: 'Badger', health: 16, weapon: 'cudgel' }, { name: 'Rat', health: 12, weapon: 'cudgel' }],
  // The swarm-mother's brood can be killed, but she calls them back.
  swarm: [{ name: 'Nymph', health: 12, weapon: 'bite', damage: 3 }, { name: 'Nymph', health: 12, weapon: 'bite', damage: 3 }],
  // The warden's votives burn at its sides; while any burns, the warden cannot be harmed.
  warden: [{ name: 'Votive', health: 8, weapon: 'flare' }, { name: 'Votive', health: 8, weapon: 'flare' }],
  // The pack fights for its leader and goes on fighting without him.
  pack: [{ name: 'Hound', health: 14, weapon: 'bite' }, { name: 'Hound', health: 14, weapon: 'bite' }],
  // The hexer's brute hits hard and physically, in the same round the hexer casts.
  pair: [{ name: 'Brute', health: 38, weapon: 'pick', damage: 8 }],
  // The captain's lieutenant shields him with a crossbow.
  captain: [{ name: 'Lieutenant', health: 34, weapon: 'crossbow', damage: 6 }],
  // The queen's brood hatches round her.
  brood: [{ name: 'Wriggler', health: 12, weapon: 'needle', damage: 3 }, { name: 'Wriggler', health: 12, weapon: 'needle', damage: 3 }],
  // The lost flight comes in formation.
  flight: [{ name: 'Courier', health: 20, weapon: 'frozen talons', damage: 4 }, { name: 'Courier', health: 20, weapon: 'frozen talons', damage: 4 }],
  // The hyena's dead get up again, unless she has eaten them.
  hyena: [{ name: 'Ghoul', health: 24, weapon: 'claws', damage: 5 }, { name: 'Ghoul', health: 24, weapon: 'claws', damage: 5 }],
};
// Fights the party only has to live through: the enemy cannot fall, and the fight ends after this many rounds.
export const SURVIVE: Partial<Record<Encounter, number>> = { vulture: 3 };
// How much stronger the hyena grows with every body she feeds on, and with anyone falling at all, on either side.
export const FEED = 5;
export const FRENZY = 2;
// Second stages: when a boss first drops to half health, it changes. enter applies the change on the spot.
// Second stages: the first time a boss falls, it doesn't stay down. A short scene plays, it gets back up with RISE of its health,
// and it fights on as something worse. enter applies anything else that changes. who '' is narration; anyone else speaks.
export type SceneLine = Readonly<{ who: string; line: string }>;
// rise: a share of its health the boss gets back, when it differs from RISE.
export const STAGES: Partial<Record<Encounter, { title: string; line: string; scene: readonly SceneLine[]; rise?: number; enter?: (battle: Battle) => Partial<Battle> }>> = {
  boar: { title: 'The boar, cornered', line: 'The boar gets back up out of the ash. He will charge every round now.', scene: [
    { who: '', line: 'The boar goes down on his knees in the ash of his own house.' },
    { who: 'THE BADGER', line: 'Stay down! It\'s done. Stay down!' },
    { who: 'THE BOAR', line: 'I stayed down last time.' },
    { who: '', line: 'He gets up. Smoke is rising off his bristles.' },
  ], enter: battle => ({ fury: battle.fury + 4 }) },
  warden: { title: 'The warden, unbound', line: 'The warden stands back up inside the votives\' light.', rise: 0.3, scene: [
    { who: '', line: 'The warden folds over its censer and is still.' },
    { who: '', line: 'Then the censer cracks open. Whatever is inside it is still burning.' },
    { who: '', line: 'Both votives flare up at once, and the warden rises inside their light. It no longer waits between judgements.' },
  ], enter: battle => ({ followers: battle.followers.map(follower => ({ ...follower, health: follower.maxHealth })) }) },
  leech: { title: 'The mire leech, shedding', line: 'The leech crawls out of its own skin, hungrier.', scene: [
    { who: '', line: 'The leech goes slack in the silt.' },
    { who: '', line: 'Its skin splits down the middle, and something crawls out of it: raw, wet, and hungrier than before.' },
  ] },
  swarm: { title: 'The swarm-mother, airborne', line: 'The swarm-mother takes to the air, and her brood rises with her.', scene: [
    { who: '', line: 'The swarm-mother drops out of the branches. Her brood screams.' },
    { who: '', line: 'The husk on the ground splits. She tears free of it and takes the air, and every fallen nymph rises with her.' },
  ], enter: battle => ({ followers: battle.followers.map(follower => ({ ...follower, health: follower.maxHealth })) }) },
  pack: { title: 'The pack leader, howling', line: 'The pack leader howls, and his pack gets up with him.', scene: [
    { who: '', line: 'The leader goes down, and the pack stops where it stands.' },
    { who: '', line: 'Then he throws back his head and howls, and the fallen hounds get up with him. Every rush will come with the whole pack.' },
  ], enter: battle => ({ followers: battle.followers.map(follower => ({ ...follower, health: follower.maxHealth })) }) },
  drowned: { title: 'The drowned, the bell freed', line: 'The drowned rises with the bell in its arms.', scene: [
    { who: '', line: 'It sinks back into the chapel water. The bell rope goes slack.' },
    { who: '', line: 'Then the rope snaps, and it comes up out of the water with the bell itself in its arms.' },
  ] },
  hyena: { title: 'The hyena, not laughing', line: 'The hyena gets up, and eats her own dead to do it.', rise: 0.4, scene: [
    { who: '', line: 'The hyena falls among her bones, laughing.' },
    { who: '', line: 'Then she stops laughing.' },
    { who: 'THE HYENA', line: 'You still don\'t understand. I don\'t stay dead. Nobody down here does.' },
    { who: '', line: 'She turns on her own dead and eats them where they stand.' },
  ], enter: battle => {
      const eaten = battle.followers.filter(follower => follower.health > 0 && !follower.eaten).length;
      return {
        followers: battle.followers.map(follower => follower.health > 0 && !follower.eaten ? { ...follower, health: 0, eaten: true } : follower),
        fury: battle.fury + eaten * FRENZY,
        enemy: { ...battle.enemy, health: Math.min(battle.enemy.maxHealth, battle.enemy.health + eaten * 6) },
      };
    } },
  cuckoo: { title: 'The cuckoo, in no one\'s shape', line: 'The cuckoo gets up wearing no one\'s face at all, and moves faster for it.', rise: 0.4, scene: [
    { who: '', line: 'The cuckoo goes down among the house\'s banners.' },
    { who: 'THE CUCKOO', line: 'They fed me from their own beaks. I had a room at the top of the house. Then someone looked at my eggs.' },
    { who: 'THE CUCKOO', line: 'He remembers you. He told me you opened a door, once. He said you\'d understand.' },
    { who: '', line: 'He gets up, and for a moment he is every one of you, and then he is no one.' },
  ], enter: () => ({ impostor: null }) },
  viper: { title: 'The viper, shed', line: 'The viper comes out of her own skin, and the air goes bitter.', rise: 0.4, scene: [
    { who: '', line: 'The viper goes down among the jars, and the water closes over her.' },
    { who: 'THE VIPER', line: 'I set his bones. I sat up with him three nights. They said I bit him.' },
    { who: 'THE VIPER', line: 'So I bit them.' },
    { who: '', line: 'Her skin floats up empty. She comes up out of the water beside it, raw and shining, and every breath in the room tastes of venom.' },
  ], enter: battle => ({ party: battle.party.map(member => member.health > 0 ? { ...member, poison: member.poison + 3 } : member) }) },
};
// Fights that start with the party already poisoned, and for how many rounds.
export const STARTS_POISONED: Partial<Record<Encounter, number>> = { viper: 4 };
// What poison does each round: to a hero, and to the enemy from the frog's darts.
export const POISON = 2;
export const ENEMY_POISON = 3;
// How long the frog's dart keeps the enemy poisoned, how much her dose mends, and how long Souring lasts.
export const DART = 3;
export const DOSE = 6;
export const SOUR = 2;
// How much of its health a boss gets back when it rises.
export const RISE = 0.5;
const QUIET = 'The signature flickers out. It is quiet again.';

// After any blow the party lands, a boss brought down for the first time rises into its second stage instead of falling.
function staged(battle: Battle): Battle {
  // A fight in waves: when one falls, the next comes on.
  if (battle.phase === 'victory' && battle.wave < battle.waves) {
    const allActed = battle.party.every(member => member.health <= 0 || member.acted);
    return {
      ...battle, wave: battle.wave + 1, phase: allActed ? 'enemy' : 'player',
      enemy: { ...battle.enemy, health: battle.enemy.maxHealth, mana: battle.enemy.maxMana },
      followers: battle.followers.map(follower => ({ ...follower, health: follower.maxHealth, eaten: false })),
      log: [...battle.log.filter(line => line !== QUIET), `Another ${ENEMIES[battle.encounter].short} comes on. (${battle.wave + 1} of ${battle.waves})`],
    };
  }
  const stage = STAGES[battle.encounter];
  if (!stage || battle.stage === 2 || battle.enemy.health > 0) return battle;
  const allActed = battle.party.every(member => member.health <= 0 || member.acted);
  const risen: Battle = {
    ...battle, stage: 2, phase: allActed ? 'enemy' : 'player',
    enemy: { ...battle.enemy, health: Math.round(battle.enemy.maxHealth * (stage.rise ?? RISE)) },
    // It didn't fall after all: no victory, and no followers fighting on without it.
    log: [...battle.log.filter(line => line !== QUIET && !/ falls\. The .* fight on\.$/.test(line)), stage.line],
  };
  return { ...risen, ...stage.enter?.(risen) };
}

// The human's lieutenants, one to a region. Beating one finishes that region's orders, and the church has more.
export const LIEUTENANTS: readonly Encounter[] = ['boar', 'hyena', 'viper', 'cuckoo'];

// Followers who give up once their leader falls. Everyone else fights until the last of them is down.
export const YIELDING: Partial<Record<Encounter, true>> = { boar: true, hyena: true, brood: true };
export const FURY_PER_HIT = 3;
export const FOLLOWER_BLOW = 2;
export const COST = { attack: 0, support: 0, suppress: 1, barrier: 5, analyze: 2, gather: 0, unmask: 0 } as const;
// Heroes recover mana slowly in a fight, and not at all between fights until they rest.
// Gathering trades a hero's action for a larger draw. Enemies recover at their own pace.
export const MANA_REGEN = 1;
export const GATHER = 3;
export const ENEMY_REGEN = 3;
// How much more mana a caster shows for the enemy turn after a spell, enough to draw the enemy's eye.
export const FLARE = 8;
export const UNHOLLOWED: Hollow = { mana: 0, damage: 0, trained: true };
// Enemy health for a party of one, two, or three, so a smaller party is not simply outmatched.
export const PARTY_SCALE = [0.45, 0.65, 1] as const;

// Hollow perks strengthen only the hero; companions keep their own memories.
// What a fight starts from, beyond the enemy and the shared grimoire. Everything defaults to a fresh, full party.
export type BattleOptions = Readonly<{
  hollow?: Hollow; gear?: Gear; books?: Books; roster?: readonly MemberId[]; supplies?: Supplies;
  // Damage and spent mana carried in from earlier fights, until the party rests.
  wounds?: Wounds; drained?: Drained;
  // An ambush gives the enemy the first turn. A surprise, from a hero with hidden mana, costs the enemy its first move.
  ambush?: boolean; surprise?: boolean;
  // tempered: keepsakes the smith has tempered. waves: how many times the enemy comes on before the fight is won.
  tempered?: readonly KeepsakeId[]; waves?: number;
}>;
// A fight's party when none is given: the three who fought together first.
const TRIO: readonly MemberId[] = ['chameleon', 'bear', 'vulture'];
export function createBattle(encounter: Encounter = 'locust', studied: readonly string[] = [], options: BattleOptions = {}): Battle {
  const { hollow = UNHOLLOWED, gear, books = STARTING_BOOKS, roster = TRIO, supplies = NO_SUPPLIES, wounds = {}, drained = {}, ambush = false, surprise = false, tempered = [], waves = 1 } = options;
  const member = (id: MemberId, base: number, mana: number): Member => {
    const worn = gear ? mods(gear, id, tempered) : NO_MODS;
    const maxHealth = Math.max(1, base + worn.health);
    // Heroes enter hurt if they were hurt before; a hero who fell stays down.
    const health = Math.max(0, maxHealth - (wounds[id] ?? 0));
    return { id, health, maxHealth, mana: Math.max(0, mana - (drained[id] ?? 0)), maxMana: mana, acted: false, guardingFor: null, focused: false, suppressed: false, barrier: false, gear: worn, cooldown: 0, flaring: false,
      poison: health > 0 ? STARTS_POISONED[encounter] ?? 0 : 0,
      spell: books[id] ? BOOKS[books[id]!].spell : null };
  };
  const size = Math.max(1, Math.min(3, roster.length));
  const scaled = (health: number) => Math.round(health * PARTY_SCALE[size - 1]);
  return {
    round: 1, phase: ambush ? 'enemy' : 'player', encounter, studied: studied.filter(name => STUDIABLE.includes(name)), hollow, enemyRevealed: false,
    party: [member('chameleon', 20, 10 + hollow.mana), member('bear', 30, 12), member('vulture', 16, 10), member('frog', 18, 12)].filter(member => roster.includes(member.id)),
    enemy: { health: scaled(ENEMIES[encounter].health), maxHealth: scaled(ENEMIES[encounter].health), mana: ENEMIES[encounter].mana, maxMana: ENEMIES[encounter].mana },
    followers: (FOLLOWERS[encounter] ?? []).map(({ name, health }) => ({ name, health: scaled(health), maxHealth: scaled(health), mana: 4, maxMana: 4 })),
    fury: 0, step: 0, snared: surprise && !ambush, stage: 1, wave: 1, waves, supplies, enemyPoison: 0, soured: 0, impostor: null,
    log: [ENEMIES[encounter].opening, ...(STARTS_POISONED[encounter] ? ['The air in here is thick with venom. Everyone is poisoned already.'] : []), ...(ambush ? ['Ambush! It moves before you can.'] : surprise ? ['It never saw you coming. It loses its first move.'] : [])],
  };
}

// The mana each hero has spent and not recovered, carried from a won fight until they rest.
export function drainedAfter(battle: Battle): Drained {
  return Object.fromEntries(battle.party.filter(member => member.mana < member.maxMana).map(member => [member.id, member.maxMana - member.mana]));
}

// The party can run from anything but the boar, who stands between them and the road.
export function canFlee(battle: Battle): boolean {
  return battle.phase === 'player' && battle.encounter !== 'boar';
}

// Running costs a free parting blow on whoever the enemy is watching. It wounds, and the wound
// carries, but it never drops the last hero standing: the point of running is getting away.
export function flee(battle: Battle): Battle {
  if (!canFlee(battle)) return battle;
  const target = enemyTarget(battle)!;
  const living = battle.followers.find(follower => follower.health > 0);
  const blow = battle.enemy.health > 0 && intent(battle).damage > 0 ? intent(battle)
    : { name: living ? `${living.name.toLowerCase()}'s ${FOLLOWERS[battle.encounter]!.find(kind => kind.name === living.name)!.weapon}` : 'parting blow', damage: FOLLOWER_BLOW };
  const alone = battle.party.filter(member => member.health > 0).length === 1;
  const health = Math.max(alone ? 1 : 0, target.health - blow.damage);
  const party = battle.party.map(member => member.id === target.id ? { ...member, health } : member);
  return {
    ...battle, party, phase: 'fled',
    log: [...battle.log, `You run. The ${blow.name.toLowerCase()} catches ${MEMBERS[target.id].name} on the way out.${health === 0 ? ' They are carried off the field.' : ''}`],
  };
}

// What each hero carries away from a won fight.
export function woundsAfter(battle: Battle): Wounds {
  return Object.fromEntries(battle.party.filter(member => member.health < member.maxHealth).map(member => [member.id, member.maxHealth - member.health]));
}

export function condition(fighter: Fighter): string {
  if (fighter.health <= 0) return 'Downed';
  if (fighter.health <= fighter.maxHealth / 4) return 'Barely standing';
  if (fighter.health <= fighter.maxHealth / 2) return 'Wounded';
  if (fighter.health < fighter.maxHealth) return 'Bloodied';
  return 'Unhurt';
}

export function visibleMana(member: Member): number {
  return member.suppressed ? Math.min(1, member.mana) : Math.max(0, member.mana + member.gear.shown + (member.flaring ? FLARE : 0));
}

// What an action costs this member, after keepsakes.
export function cost(member: Member, action: Action): number {
  return COST[action] + (action === 'suppress' ? member.gear.suppressCost : 0);
}

export function enemyMana(battle: Battle): number {
  const shown = FALSE_MANA[battle.encounter];
  if (shown !== undefined) return shown;
  return ENEMIES[battle.encounter].veiled && !battle.enemyRevealed ? Math.min(2, battle.enemy.mana) : battle.enemy.mana;
}

export function intent(battle: Battle): Move & { tell: string } {
  const move = plainIntent(battle);
  if (!move.spell || battle.studied.includes(move.spell)) return move;
  // An unstudied spell keeps its name even while it is still gathering.
  return { ...move, name: move.type === 'spell' ? '???' : move.name, tell: move.tell.replaceAll(move.spell, '???') };
}

function plainIntent(battle: Battle): Move & { tell: string } {
  if (battle.encounter === 'acolyte') {
    const casting = battle.round % 2 === 0;
    return {
      name: casting ? SPELL : 'Staff strike', type: casting ? 'spell' as const : 'physical' as const, spell: SPELL,
      tell: casting ? `${SPELL} · 1 enemy turn — releasing next.${battle.studied.includes(SPELL) ? ' It comes fast.' : ''}` : `A staff is raised. ${SPELL} gathers · 2 enemy turns.`,
      damage: casting ? 18 : 4,
      ...(casting ? { window: { perfect: 40, graze: 110 } } : {}),
    };
  }
  if (battle.encounter === 'boar') {
    const fury = battle.fury ? ` His fury burns · ${battle.fury} will drive through any guard.` : '';
    if (battle.stage === 2 && battle.round % 3 === 0)
      return { name: 'Trample', type: 'physical', tell: `He drops his head and comes through everything. No guard will stop it.${fury}`, damage: 8 + battle.fury, unblockable: true, window: { perfect: 45, graze: 120 } };
    return battle.round % 2 === 0 || battle.stage === 2
      ? { name: 'Tusk charge', type: 'physical', tell: `He lowers his tusks and paws the ash. A charge is coming, fast.${fury}`, damage: 10 + battle.fury, piercing: battle.fury, window: { perfect: 45, graze: 120 } }
      : { name: 'Shoulder blow', type: 'physical', tell: `He squares his shoulders.${fury}`, damage: 4 + battle.fury, piercing: battle.fury };
  }
  if (battle.encounter === 'warden') {
    if (battle.round % 4 === 0) return { name: 'Rekindle', type: 'physical', tell: 'It lifts its censer to the dark wicks. The votives will burn again.', damage: 0, revive: true };
    if (battle.stage === 2 && battle.round % 2 === 1)
      return { name: 'Censer storm', type: 'physical', tell: 'The censer whirls on its chain. Three blows are coming.', damage: 4, hits: 3, window: { perfect: 55, graze: 140 } };
    return battle.round % (battle.stage === 2 ? 2 : 3) === 0
      ? { name: 'Judgement', type: 'spell', spell: 'Judgement', tell: 'It raises the censer high. Judgement falls next: a spell. It can\'t be dodged until you have studied it, and a guard is no use against it.', damage: 14, window: { perfect: 45, graze: 120 } }
      : { name: 'Censer swing', type: 'physical', tell: 'The censer swings on its chain.', damage: 6 };
  }
  if (battle.encounter === 'leech' && battle.stage === 2 && battle.round % 3 === 1)
    return { name: 'Thrash', type: 'physical', tell: 'It thrashes, raw and blind. Two blows, and no guard will stop them.', damage: 6, hits: 2, unblockable: true, window: { perfect: 55, graze: 140 } };
  if (battle.encounter === 'leech') return battle.round % 3 === 0
    ? { name: 'Coil', type: 'physical', tell: 'It draws its whole length back into a coil. It cannot be dodged, and a guard won\'t hold all of it.', damage: 13, piercing: 6, undodgeable: true }
    : { name: 'Latch', type: 'physical', tell: 'Its mouth opens toward you. Whatever it takes, it keeps.', damage: battle.stage === 2 ? 11 : 8, drain: true, window: { perfect: 60, graze: 150 } };
  if (battle.encounter === 'hound') return battle.round % 2 === 0
    ? { name: 'Lunge', type: 'physical', tell: 'It drops onto its haunches. A lunge is coming, fast.', damage: 12, piercing: 3, window: { perfect: 50, graze: 130 } }
    : { name: 'Snap', type: 'physical', tell: 'It circles, snapping.', damage: 6 };
  if (battle.encounter === 'pack') {
    // The rush grows with every hound still standing: thin the pack first.
    const hounds = battle.followers.filter(follower => follower.health > 0).length;
    return battle.round % (battle.stage === 2 ? 2 : 3) === 0
      ? { name: 'Pack rush', type: 'physical', tell: `He barks once and ${hounds ? 'the pack goes for you together' : 'comes alone'}. It cannot be dodged.`, damage: 5 + 4 * hounds, undodgeable: true }
      : battle.stage === 2
        ? { name: 'Savage', type: 'physical', tell: 'He drops low and goes for the throat, twice, fast.', damage: 6, hits: 2, window: { perfect: 50, graze: 130 } }
        : { name: 'Throat bite', type: 'physical', tell: 'He drops low. He will go for the throat, fast.', damage: 8, window: { perfect: 50, graze: 130 } };
  }
  if (battle.encounter === 'wisp') return battle.round % 2 === 0
    ? { name: 'Marsh-fire', type: 'spell', spell: 'Marsh-fire', tell: 'The light gutters, then swells: Marsh-fire, and it comes very fast.', damage: 7, window: { perfect: 35, graze: 90 } }
    : { name: 'Flicker', type: 'physical', tell: 'The light flickers at the edge of your eye.', damage: 3 };
  if (battle.encounter === 'drowned') {
    if (battle.stage === 2 && battle.round % 2 === 0) return { name: 'Bell swing', type: 'physical', tell: 'It swings the bell itself. Nothing will block it: dodge, or take it.', damage: 12, unblockable: true, window: { perfect: 45, graze: 110 } };
    if (battle.round % 3 === 0) return { name: 'Drowning toll', type: 'spell', spell: 'Drowning toll', tell: 'It hauls on the rope. The sunken bell will toll: Drowning toll, a spell. It can\'t be dodged until you have studied it, and a guard is no use against it.', damage: 10, window: { perfect: 50, graze: 130 } };
    return battle.round % 3 === 2
      ? { name: 'Pull under', type: 'physical', tell: 'It lets go of the rope and reaches for you. It will try to pull someone under.', damage: 12, window: { perfect: 45, graze: 110 } }
      : { name: 'Grasp', type: 'physical', tell: 'Cold hands come up out of the water, and drag. A guard won\'t hold all of it.', damage: 7, piercing: 3 };
  }
  if (battle.encounter === 'raider') return battle.round % 2 === 0
    ? { name: 'Ambush cut', type: 'physical', tell: 'It drops out of sight again. The next cut comes from nowhere, fast, and a guard won\'t stop all of it.', damage: 13, piercing: 4, window: { perfect: 40, graze: 110 } }
    : { name: 'Hatchet', type: 'physical', tell: 'A hatchet comes up.', damage: 8 };
  if (battle.encounter === 'ghoul') return battle.round % 3 === 0
    ? { name: 'Gnaw', type: 'physical', tell: 'Its jaw hangs open. Whatever it bites, it keeps, and a guard won\'t stop all of it.', damage: 11, piercing: 3, drain: true }
    : { name: 'Claw', type: 'physical', tell: 'It reaches for you.', damage: 7 };
  if (battle.encounter === 'vulture') return battle.round % 3 === 0
    ? { name: 'Stoop', type: 'physical', tell: 'She climbs out of reach. She will drop on you, fast.', damage: 10, window: { perfect: 45, graze: 120 } }
    : { name: 'Talon rake', type: 'physical', tell: 'Her talons come forward.', damage: 6 };
  if (battle.encounter === 'pair') {
    return battle.round % 2 === 0
      ? { name: SPELL, type: 'spell', spell: SPELL, tell: `The hexer's hands are moving: ${SPELL}, this turn, while the brute swings his pick. Both will land.`, damage: 14, window: { perfect: 50, graze: 130 } }
      : { name: 'Knife', type: 'physical', tell: 'The hexer has a knife out. The brute is lifting his pick.', damage: 4 };
  }
  if (battle.encounter === 'hyena') {
    const fed = battle.fury ? ` She has fed · ${battle.fury} more on every blow.` : '';
    if (battle.round % 3 === 0 && battle.followers.some(follower => follower.health <= 0 && !follower.eaten))
      return { name: 'Raise', type: 'physical', tell: `She calls the dead up again.${fed}`, damage: 0, revive: true };
    if ((battle.round % 2 === 0 || battle.stage === 2) && bodies(battle).length)
      return { name: 'Feed', type: 'physical', tell: `She turns toward the fallen. She will feed this turn unless a barrier covers the body.${fed}`, damage: 0, feed: true };
    return battle.round % (battle.stage === 2 ? 2 : 3) === 0
      ? { name: battle.stage === 2 ? 'Lunge' : 'Laughing lunge', type: 'physical', tell: `She starts to laugh. She will lunge, very fast, and most of it will go through a guard.${fed}`, damage: 14 + battle.fury, piercing: 7 + Math.floor(battle.fury / 2), window: { perfect: 35, graze: 95 } }
      : battle.stage === 2
        ? { name: 'Frenzy', type: 'physical', tell: `She doesn't stop. Three blows, each one hungrier.${fed}`, damage: 4 + Math.floor(battle.fury / 2), hits: 3, piercing: 2, window: { perfect: 50, graze: 120 } }
        : { name: 'Rend', type: 'physical', tell: `She comes in low.${fed}`, damage: 9 + battle.fury, piercing: 3 + Math.floor(battle.fury / 2), window: { perfect: 50, graze: 120 } };
  }
  if (battle.encounter === 'mosquito') return battle.round % 2 === 0
    ? { name: 'Swarm', type: 'physical', tell: 'Its wings blur. It will come at you three times, fast.', damage: 3, hits: 3, window: { perfect: 55, graze: 140 } }
    : { name: 'Needle', type: 'physical', tell: 'Its needle lowers. Whatever it pierces, it poisons.', damage: 5, poison: 3, window: { perfect: 55, graze: 140 } };
  if (battle.encounter === 'scorpion') return battle.round % 2 === 0
    ? { name: 'Seize', type: 'physical', tell: 'Its forelegs open wide. It will seize someone, hard, and a guard won\'t hold all of it.', damage: 12, piercing: 4, window: { perfect: 45, graze: 120 } }
    : { name: 'Stab', type: 'physical', tell: 'Its beak comes up. A poisoned stab.', damage: 6, poison: 2 };
  if (battle.encounter === 'brood') {
    if (battle.round % 3 === 0 && battle.followers.some(follower => follower.health <= 0))
      return { name: 'Hatch', type: 'physical', tell: 'She shudders over the eggs. More of her brood will hatch.', damage: 0, revive: true };
    return battle.round % 2 === 0
      ? { name: 'Blood cloud', type: 'physical', tell: 'She shakes out a cloud of her brood. Three stings, and no guard will stop them.', damage: 3, hits: 3, unblockable: true, poison: 2, window: { perfect: 55, graze: 140 } }
      : { name: 'Drink', type: 'physical', tell: 'She settles on someone to drink. Whatever she takes, she keeps.', damage: 8, drain: true, window: { perfect: 55, graze: 140 } };
  }
  if (battle.encounter === 'apprentice') return battle.round % 2 === 0
    ? { name: SOURING, type: 'spell', spell: SOURING, sour: true, tell: `${SOURING}: a spell that does little harm, but any healing after it burns instead, for two turns.`, damage: 4, window: { perfect: 50, graze: 130 } }
    : { name: 'Spit', type: 'physical', tell: 'He hawks. The spit is poison.', damage: 6, poison: 3 };
  if (battle.encounter === 'viper') {
    if (battle.round % 3 === 0) return { name: SOURING, type: 'spell', spell: SOURING, sour: true, tell: `She breathes over all of you: ${SOURING}. Any healing after it burns instead, for two turns.`, damage: 6, window: { perfect: 45, graze: 120 } };
    if (battle.stage === 2 && battle.round % 3 === 2)
      return { name: 'Venom spray', type: 'physical', tell: 'She rears and sprays. Three mouthfuls, and no guard will stop them. Each one poisons.', damage: 4, hits: 3, unblockable: true, poison: 2, window: { perfect: 50, graze: 130 } };
    return battle.round % 3 === 1
      ? { name: 'Fang', type: 'physical', tell: 'She draws her head back. A strike, very fast, and it poisons.', damage: 10, poison: 4, window: { perfect: 40, graze: 110 } }
      : { name: 'Coil', type: 'physical', tell: 'She throws coils over someone. Two crushing squeezes.', damage: 7, hits: 2 };
  }
  if (battle.encounter === 'hornet') return battle.round % 2 === 0
    ? { name: 'Sting', type: 'physical', tell: 'Its abdomen curls under. A sting, fast, and it poisons.', damage: 9, poison: 2, window: { perfect: 50, graze: 130 } }
    : { name: 'Mandibles', type: 'physical', tell: 'It closes in, biting.', damage: 6 };
  if (battle.encounter === 'spider') return battle.round % 3 === 0
    ? { name: 'Bind', type: 'physical', tell: 'It rears and throws silk. Nobody can dodge silk, and a guard won\'t hold all of it.', damage: 12, piercing: 5, undodgeable: true }
    : { name: 'Fangs', type: 'physical', tell: 'It drops on someone, fangs first.', damage: 10, poison: 2, window: { perfect: 50, graze: 130 } };
  if (battle.encounter === 'duellist') return battle.round % 2 === 0
    ? { name: 'Talon hex', type: 'spell', spell: 'Talon hex', tell: 'His talons trace something in the air: Talon hex, a spell. His mana display doesn\'t flicker. Watch it.', damage: 13, window: { perfect: 45, graze: 120 } }
    : { name: 'Rapier', type: 'physical', tell: 'He comes on with the rapier, twice, very correct.', damage: 5, hits: 2, window: { perfect: 55, graze: 140 } };
  if (battle.encounter === 'cuckoo') {
    if (battle.impostor) return { name: 'Knife in the ranks', type: 'physical', tell: 'He is somewhere among you, wearing a friend. Whoever\'s mana hasn\'t moved is him: press Strike on their card. Until then, a knife comes from inside the party, and no guard is watching for it.', damage: 11, unblockable: true, undodgeable: true };
    if (battle.round % (battle.stage === 2 ? 2 : 3) === 1 && battle.round > 1)
      return { name: 'Talon hex', type: 'spell', spell: 'Talon hex', tell: 'He traces the house\'s sign in the air: Talon hex, a spell.', damage: 14, window: { perfect: 45, graze: 120 } };
    return { name: 'Borrowed blade', type: 'physical', tell: 'He fights with the lord\'s sword, the way the lord was taught.', damage: 12, piercing: 3, window: { perfect: 50, graze: 130 } };
  }
  if (battle.encounter === 'warder') return battle.round % 3 === 0
    ? { name: 'Snap', type: 'physical', tell: 'He draws his head back into the shell, then the jaws come out like a trap. Most of it will go through a guard.', damage: 15, piercing: 6, window: { perfect: 40, graze: 110 } }
    : { name: 'Shell bash', type: 'physical', tell: 'He throws his shell at someone, twice.', damage: 6, hits: 2 };
  if (battle.encounter === 'cricket') return battle.round % 2 === 0
    ? { name: 'Leap', type: 'physical', tell: 'Its long legs fold. It will land on someone, fast.', damage: 11, window: { perfect: 45, graze: 120 } }
    : { name: 'Chirr', type: 'physical', tell: 'It chirrs and lashes out, twice.', damage: 4, hits: 2 };
  if (battle.encounter === 'flight') return battle.round % 3 === 0
    ? { name: 'Whiteout', type: 'physical', tell: 'They climb into the wind and come down in a blizzard of their own feathers. Three blows, and no guard will stop them.', damage: 5, hits: 3, unblockable: true, window: { perfect: 55, graze: 140 } }
    : { name: 'Dive', type: 'physical', tell: 'The lead courier folds and drops, the way it was taught.', damage: 10, window: { perfect: 50, graze: 130 } };
  if (battle.encounter === 'harrier') return battle.round % 2 === 0
    ? { name: 'Stoop', type: 'physical', tell: 'It climbs into the wind and folds. A dive no guard will stop is coming.', damage: 11, unblockable: true, window: { perfect: 45, graze: 120 } }
    : { name: 'Rake', type: 'physical', tell: 'It rakes past, low, twice.', damage: 4, hits: 2 };
  if (battle.encounter === 'captain') {
    // A volley every third round, an execution blow when someone is down, a sabre otherwise.
    if (battle.round % 3 === 0) return { name: 'Volley', type: 'physical', tell: 'He calls the volley. Three bolts from the walls, one after another, and no guard will stop them.', damage: 5, hits: 3, unblockable: true, window: { perfect: 50, graze: 130 } };
    if (battle.party.some(member => member.health <= 0)) return { name: 'Execution', type: 'physical', tell: 'He looks at the fallen and lifts the sabre in both hands. The next blow will go through a guard.', damage: 15, piercing: 8, window: { perfect: 40, graze: 110 } };
    return { name: 'Sabre', type: 'physical', tell: 'He comes on with the sabre, the way they taught him on the walls. A guard won\'t stop all of it.', damage: 10, piercing: 3, window: { perfect: 55, graze: 140 } };
  }
  if (battle.encounter === 'inquisitor')
    return { name: 'Verdict', type: 'spell', spell: 'Verdict', tell: 'He does not hurry. Verdict: no barrier will stop it, and it cannot be dodged.', damage: 14, undodgeable: true, unblockable: true };
  if (battle.encounter === 'swarm') return battle.round % 3 === 0
    ? { name: 'Brood call', type: 'physical', tell: 'She shrills, and the brood answers. Fallen nymphs will rise again.', damage: 0, revive: true }
    : battle.stage === 2
      ? { name: 'Dive', type: 'physical', tell: 'She folds her wings and drops, and comes round again. Two dives, fast.', damage: 6, hits: 2, window: { perfect: 45, graze: 120 } }
      : { name: 'Wing buffet', type: 'physical', tell: 'Her wings rattle. A buffet is coming.', damage: 5 };
  if (battle.encounter === 'weevil') return battle.round % 3 === 0
    ? { name: 'Rolling charge', type: 'physical' as const, tell: 'It tucks its snout and rocks back. A rolling charge is coming. It cannot be dodged.', damage: 9, undodgeable: true }
    : { name: 'Snout jab', type: 'physical' as const, tell: 'Its snout lowers. It will jab.', damage: 5 };
  return battle.round % 2 === 0
    ? { name: 'Crushing leap', type: 'physical' as const, tell: 'Its hind legs draw tight. A crushing leap is coming.', damage: 11 }
    : { name: 'Mandible strike', type: 'physical' as const, tell: 'Its mandibles part. It will strike twice.', damage: 3, hits: 2 };
}

// What the hyena could feed on: fallen heroes no barrier covers, then her own fallen dead.
export function bodies(battle: Pick<Battle, 'party' | 'followers'>): ({ hero: Member } | { follower: number })[] {
  return [
    ...battle.party.filter(member => member.health <= 0 && !member.barrier).map(hero => ({ hero })),
    ...battle.followers.flatMap((follower, index) => follower.health <= 0 && !follower.eaten ? [{ follower: index }] : []),
  ];
}

// Mana ties prefer the bear, then the stable party order. Downed members never draw attacks.
export function enemyTarget(battle: Battle): Member | undefined {
  // The cuckoo's knife never finds the shape he is wearing, unless nobody else is left standing.
  const others = battle.party.filter(member => member.health > 0 && member.id !== battle.impostor?.as);
  return (others.length ? others : battle.party.filter(member => member.health > 0)).reduce<Member | undefined>((target, member) => {
    if (!target || visibleMana(member) > visibleMana(target) || (visibleMana(member) === visibleMana(target) && member.id === 'bear')) return member;
    return target;
  }, undefined);
}

// The warden cannot be harmed while any of its votives still burns.
export function warded(battle: Pick<Battle, 'encounter' | 'followers'>): boolean {
  return battle.encounter === 'warden' && battle.followers.some(follower => follower.health > 0);
}

// Whether a given enemy is still on its feet.
function standing(battle: Battle, foe: Foe): boolean {
  return foe === 0 ? battle.enemy.health > 0 : battle.followers[foe - 1]?.health > 0;
}

// A fight is won when the main enemy is down and so is everyone who would fight on without it.
export function won(battle: Pick<Battle, 'encounter' | 'enemy' | 'followers'>): boolean {
  return battle.enemy.health === 0 && (Boolean(YIELDING[battle.encounter]) || battle.followers.every(follower => follower.health === 0));
}

// What the log says when the main enemy falls but its followers do not.
function fallen(before: Battle, after: Pick<Battle, 'encounter' | 'enemy' | 'followers'>): string[] {
  if (before.enemy.health === 0 || after.enemy.health > 0 || won(after)) return [];
  const kinds = [...new Set(after.followers.filter(follower => follower.health > 0).map(follower => `${follower.name.toLowerCase()}s`))];
  return [`The ${ENEMIES[after.encounter].short} falls. The ${kinds.join(' and ')} fight on.`];
}

export function canAct(battle: Battle, actor: MemberId, action: Action, target: MemberId = actor, foe: Foe = 0): boolean {
  const member = battle.party.find(member => member.id === actor);
  if (battle.phase !== 'player' || !member || member.health <= 0 || member.acted || member.mana < cost(member, action)) return false;
  if (action === 'attack' && !standing(battle, foe)) return false;
  if (action === 'suppress' && member.suppressed) return false;
  if (action === 'gather' && member.mana >= member.maxMana) return false;
  const casts = ENEMY_SPELLS[battle.encounter];
  if (action === 'analyze' && (!casts || battle.studied.includes(casts))) return false;
  // A barrier can cover a fallen ally too, which keeps the hyena off the body.
  if (action === 'barrier' && !battle.party.some(ally => ally.id === target)) return false;
  // Striking an ally is only for the fight with the cuckoo, and never at oneself.
  if (action === 'unmask') return battle.encounter === 'cuckoo' && target !== actor && battle.party.some(member => member.id === target && member.health > 0);
  if (action === 'support') {
    if (!battle.party.some(member => member.id === target && member.health > 0)) return false;
    if (actor !== 'bear' && actor !== 'frog' && target !== actor) return false;
  }
  return true;
}

// Damage aimed at an enemy. The boar takes every hit aimed at his followers, at half strength, and each one makes him stronger.
function land(battle: Battle, damage: number, foe: Foe) {
  const shielded = foe > 0 && battle.encounter === 'boar' && battle.enemy.health > 0;
  const blocked = foe === 0 && (warded(battle) || Boolean(battle.impostor));
  const dealt = blocked ? 0 : shielded ? Math.floor(damage / 2) : damage;
  // An enemy the party only has to survive cannot be brought down.
  const floor = SURVIVE[battle.encounter] ? 1 : 0;
  const enemy = foe === 0 || shielded ? { ...battle.enemy, health: Math.max(floor, battle.enemy.health - dealt) } : battle.enemy;
  const followers = foe > 0 && !shielded
    ? battle.followers.map((follower, index) => index === foe - 1 ? { ...follower, health: Math.max(0, follower.health - damage) } : follower)
    : battle.followers;
  // Anyone falling feeds the hyena's frenzy, her own dead included.
  const fell = battle.encounter === 'hyena' ? followers.filter((follower, index) => follower.health === 0 && battle.followers[index].health > 0).length : 0;
  return { enemy, followers, fury: battle.fury + (shielded ? FURY_PER_HIT : 0) + fell * FRENZY, shielded, blocked };
}

export function canUse(battle: Battle, actor: MemberId, supply: SupplyId, target: MemberId = actor, foe: Foe = 0): boolean {
  const member = battle.party.find(member => member.id === actor);
  if (battle.phase !== 'player' || !member || member.health <= 0 || member.acted || battle.supplies[supply] <= 0) return false;
  const ally = battle.party.find(member => member.id === target);
  const kind = SUPPLIES[supply].target;
  if (kind === 'ally') return Boolean(ally && ally.health > 0);
  if (kind === 'fallen') return Boolean(ally && ally.health === 0);
  return standing(battle, foe);
}

// Using a supply is the actor's action for the round.
export function useSupply(battle: Battle, actor: MemberId, supply: SupplyId, target: MemberId = actor, foe: Foe = 0): Battle {
  if (!canUse(battle, actor, supply, target, foe)) return battle;
  if (battle.impostor?.as === actor) return betray(battle, actor, 'supply');
  const { name, power, target: kind } = SUPPLIES[supply];
  const hit = kind === 'enemy' ? land(battle, power, foe) : undefined;
  const cure = Boolean(SUPPLIES[supply].cure);
  const party = battle.party.map(member => ({
    ...member,
    ...(member.id === actor ? { acted: true } : {}),
    ...(member.id === target && kind === 'ally' ? { health: mend(member, power, battle.soured), poison: cure ? 0 : member.poison } : {}),
    ...(member.id === target && kind === 'fallen' ? { health: power } : {}),
  }));
  const enemy = hit?.enemy ?? battle.enemy;
  const after = { encounter: battle.encounter, enemy, followers: hit?.followers ?? battle.followers };
  const victory = won(after);
  const allActed = party.every(member => member.health <= 0 || member.acted);
  const aimed = foe > 0 ? battle.followers[foe - 1].name.toLowerCase() : ENEMIES[battle.encounter].short;
  const burned = kind === 'ally' && power > 0 && battle.soured > 0;
  const message = kind === 'ally' ? `${MEMBERS[actor].name} shares the ${name.toLowerCase()}${target !== actor ? ` with ${MEMBERS[target].name}` : ''}.${cure ? ' The poison goes out of them.' : ''}${burned ? ' It burns going down: everything is soured.' : ''}`
    : kind === 'fallen' ? `${MEMBERS[actor].name} holds the smelling salts under ${MEMBERS[target].name}'s nose. They get back up.`
    : hit?.blocked && battle.impostor ? 'The firepot bursts against an empty chair. He is somewhere among you.'
    : hit?.blocked ? `The firepot bursts against the candlelight. The warden is untouched while its votives burn.`
    : hit?.shielded ? `The boar throws himself in front of the ${aimed}. The firepot bursts against him instead, and his fury grows.`
    : `${MEMBERS[actor].name} throws a firepot. It bursts across the ${aimed}.`;
  return staged({
    ...battle, party, enemy, followers: hit?.followers ?? battle.followers, fury: hit?.fury ?? battle.fury,
    supplies: { ...battle.supplies, [supply]: battle.supplies[supply] - 1 },
    phase: victory ? 'victory' : allActed ? 'enemy' : 'player',
    log: [...battle.log, message, ...fallen(battle, after), ...(victory ? [QUIET] : [])],
  });
}

export function canCast(battle: Battle, actor: MemberId, foe: Foe = 0): boolean {
  const member = battle.party.find(member => member.id === actor);
  if (battle.phase !== 'player' || !member?.spell || member.health <= 0 || member.acted || member.cooldown > 0 || member.mana < SPELLS[member.spell].cost) return false;
  // Only damage needs a standing target; wards, mending, and snares do not.
  return SPELLS[member.spell].kind !== 'damage' || standing(battle, foe);
}

// Cast the actor's spell. The sequence is typed in the battle view; a fizzle still spends the turn and the mana.
export function cast(battle: Battle, actor: MemberId, success: boolean, foe: Foe = 0): Battle {
  if (!canCast(battle, actor, foe)) return battle;
  if (battle.impostor?.as === actor) return betray(battle, actor, 'cast');
  const member = battle.party.find(member => member.id === actor)!;
  const spell = SPELLS[member.spell!];
  const hit = success && spell.kind === 'damage' ? land(battle, spell.power, foe) : undefined;
  const party = battle.party.map(current => {
    // Casting spends the mana, starts the cooldown, ends any hiding, and lights the caster up for the enemy, fizzle or not.
    const spent = current.id === actor ? { acted: true, mana: current.mana - spell.cost, cooldown: spell.cooldown, flaring: true, suppressed: false } : {};
    if (!success || current.health <= 0) return { ...current, ...spent };
    // Healing draws out poison too, unless Souring has turned it.
    if (spell.kind === 'heal') return { ...current, ...spent, health: mend(current, spell.power, battle.soured), poison: battle.soured ? current.poison : 0 };
    if (spell.kind === 'ward') return { ...current, ...spent, guardingFor: current.guardingFor ?? current.id };
    return { ...current, ...spent };
  });
  const enemy = hit?.enemy ?? battle.enemy;
  const after = { encounter: battle.encounter, enemy, followers: hit?.followers ?? battle.followers };
  const victory = won(after);
  const target = foe > 0 ? battle.followers[foe - 1].name.toLowerCase() : ENEMIES[battle.encounter].short;
  const message = !success ? `${MEMBERS[actor].name}'s ${spell.name.toLowerCase()} unravels half-spoken. The mana is gone.`
    : hit?.blocked && battle.impostor ? `${MEMBERS[actor].name} casts ${spell.name} at an empty chair. He is somewhere among you.`
    : hit?.blocked ? `${MEMBERS[actor].name} casts ${spell.name}. It breaks on the candlelight; the warden is untouched while its votives burn.`
    : hit?.shielded ? `The boar throws himself in front of the ${target}. ${spell.name} strikes him instead, and his fury grows.`
    : spell.kind === 'damage' ? `${MEMBERS[actor].name} casts ${spell.name}. It tears into the ${target}.`
    : spell.kind === 'heal' ? (battle.soured ? `${MEMBERS[actor].name} casts ${spell.name}, and it burns: everything is soured. Wounds open across the party.` : `${MEMBERS[actor].name} casts ${spell.name}. Wounds close across the party.`)
    : spell.kind === 'ward' ? `${MEMBERS[actor].name} casts ${spell.name}. Stone settles over everyone still standing.`
    : `${MEMBERS[actor].name} casts ${spell.name}. Thorns bind the ${ENEMIES[battle.encounter].short} where it stands.`;
  const allActed = party.every(member => member.health <= 0 || member.acted);
  return staged({
    ...battle, party, enemy, followers: hit?.followers ?? battle.followers, fury: hit?.fury ?? battle.fury,
    snared: battle.snared || (success && spell.kind === 'snare' && enemy.health > 0),
    phase: victory ? 'victory' : allActed ? 'enemy' : 'player',
    log: [...battle.log, message, ...fallen(battle, after), ...(victory ? [QUIET] : [])],
  });
}

export function act(battle: Battle, actor: MemberId, action: Action, target: MemberId = actor, foe: Foe = 0): Battle {
  if (!canAct(battle, actor, action, target, foe)) return battle;
  if (battle.impostor?.as === actor) return betray(battle, actor, action);
  if (action === 'unmask') return unmask(battle, actor, target);
  const member = battle.party.find(member => member.id === actor)!;
  const definition = MEMBERS[actor];
  // Forgetting his training leaves the hero with an ordinary reveal.
  const reveal = (actor === 'chameleon' && battle.hollow.trained ? 4 : 2) + member.gear.reveal;
  const base = definition.damage + member.gear.damage + (actor === 'chameleon' ? battle.hollow.damage : 0) + (member.focused ? 3 : 0) + (member.suppressed ? reveal : 0);
  // Against the main enemy, what it is decides how well this hero's blow lands. Its followers are ordinary.
  const fit = foe === 0 ? matchup(actor, battle.encounter) : 1;
  const damage = Math.max(1, Math.round(base * fit));
  const { enemy, followers, fury, shielded, blocked } = action === 'attack' ? land(battle, damage, foe)
    : { enemy: battle.enemy, followers: battle.followers, fury: battle.fury, shielded: false, blocked: false };
  // The frog's dart leaves its toxin in the main enemy; her dose mends an ally and draws out their poison.
  const dart = actor === 'frog' && action === 'attack' && foe === 0 && !blocked && enemy.health > 0;
  const poisons = dart && venom(battle.encounter) > 0;
  const dose = actor === 'frog' && action === 'support';
  const party = battle.party.map(current => ({
    ...current,
    ...(current.id === actor ? {
      acted: true, mana: action === 'gather' ? Math.min(current.maxMana, current.mana + GATHER) : current.mana - cost(current, action),
      focused: action === 'attack' ? false : (action === 'support' && actor === 'vulture') || current.focused,
      suppressed: action === 'suppress' ? true : action === 'attack' ? false : current.suppressed,
      guardingFor: action === 'support' && (actor === 'chameleon' || actor === 'bear') ? target : current.guardingFor,
    } : {}),
    barrier: (action === 'barrier' && current.id === target) || current.barrier,
    ...(dose && current.id === target ? { health: mend(current, DOSE, battle.soured), poison: battle.soured ? current.poison : 0 } : {}),
  }));
  const after = { encounter: battle.encounter, enemy, followers };
  const victory = won(after);
  const allActed = party.every(member => member.health <= 0 || member.acted);
  const message = action === 'gather' ? `${definition.name} goes still and gathers their mana.`
    : action === 'suppress' ? `${definition.name} conceals their mana.`
    : action === 'barrier' ? `${definition.name} raises a spell barrier around ${MEMBERS[target].name}.`
    : action === 'analyze' ? `${definition.name} studies the gathering spell. ${ENEMY_SPELLS[battle.encounter]} is written into the grimoire.`
    : blocked && battle.impostor ? `${definition.name}'s ${definition.attack.toLowerCase()} finds nothing. The lord's chair is empty: he is somewhere among you.`
    : blocked ? `${definition.name}'s ${definition.attack.toLowerCase()} breaks on the candlelight. The warden is untouched while its votives burn.`
    : shielded ? `The boar throws himself in front of the ${battle.followers[foe - 1].name.toLowerCase()}. ${definition.name}'s ${definition.attack.toLowerCase()} strikes him instead, and his fury grows.`
    : action === 'attack' ? `${definition.name}'s ${definition.attack.toLowerCase()} strikes the ${foe > 0 ? battle.followers[foe - 1].name.toLowerCase() : ENEMIES[battle.encounter].short}${member.suppressed ? ' in a burst of revealed mana' : ''}${member.focused ? ' with focused force' : ''}.${fit > 1 ? ' It lands hard.' : fit < 1 ? ' It barely tells.' : ''}${dart ? (venom(battle.encounter) === 0 ? ' The toxin does nothing to the dead.' : ' The toxin goes in.') : ''}`
    : dose ? (battle.soured ? `Frog doses ${target === actor ? 'herself' : MEMBERS[target].name}, and it burns: everything is soured.` : `Frog doses ${target === actor ? 'herself' : MEMBERS[target].name}. A small dose mends.`)
    : actor === 'vulture' ? 'Vulture steadies her aim. Her next attack will strike harder.'
    : actor === 'bear' && target !== actor ? `Bear steps in front of ${MEMBERS[target].name}.`
    : `${definition.name} plants their feet and guards.`;
  return staged({
    ...battle, party, enemy, followers, fury, enemyPoison: poisons ? Math.max(battle.enemyPoison, DART) : battle.enemyPoison, studied: action === 'analyze' ? [...battle.studied, ENEMY_SPELLS[battle.encounter]!] : battle.studied, phase: victory ? 'victory' : allActed ? 'enemy' : 'player',
    log: [...battle.log, message, ...fallen(battle, after), ...(victory ? [QUIET] : [])],
  });
}

// Dodging is timed by the player, never rolled. Times are milliseconds from the moment the blow lands.
export const DODGE = { perfect: 75, heavyPerfect: 50, graze: 170 } as const;

// Early or late by errorMs; heavy, telegraphed blows leave a narrower perfect window.
// A move may set its own window: stronger enemies leave less room.
// agility scales the windows: a nimble hero has more room, a heavy one less.
export function grade(errorMs: number, move: Move, agility = 1): Dodge {
  const off = Math.abs(errorMs);
  const window = move.window ?? { perfect: move.damage >= 10 ? DODGE.heavyPerfect : DODGE.perfect, graze: DODGE.graze };
  if (off <= window.perfect * agility) return 'perfect';
  return off <= window.graze * agility ? 'graze' : 'miss';
}

// A hero's agility: innate, plus anything their keepsakes add.
export function agility(member: Member): number {
  return Math.max(0.4, MEMBERS[member.id].agility + member.gear.agility / 100);
}

// Taking too long to act gives the enemy a free blow. It cannot be dodged, but a guard still holds.
export const PATIENCE = 15000;
export function hesitate(battle: Battle): Battle {
  if (battle.phase !== 'player' || battle.enemy.health <= 0) return battle;
  const target = enemyTarget(battle);
  if (!target) return battle;
  const base = Math.max(3, Math.ceil(intent(battle).damage * 0.6));
  const guarded = target.guardingFor === target.id || battle.party.some(member => member.id === 'bear' && member.health > 0 && member.guardingFor === target.id);
  const damage = guarded ? 0 : base;
  const party = battle.party.map(member => member.id === target.id ? { ...member, health: Math.max(0, member.health - damage) } : member);
  const defeat = party.every(member => member.health === 0);
  return {
    ...battle, party, phase: defeat ? 'defeat' : 'player',
    log: [...battle.log, `You hesitate. The ${ENEMIES[battle.encounter].short} doesn't.${damage ? ` It catches ${MEMBERS[target.id].name}.` : ` ${MEMBERS[target.id].name}'s guard holds.`}${defeat ? ' The last of you falls.' : ''}`],
  };
}

// The main enemy moves first, then each standing follower.
function enemyMoves(battle: Battle): Move[] {
  // A fallen leader takes no more turns; its followers do.
  const main = battle.snared || battle.enemy.health <= 0 ? [] : [intent(battle)];
  return [...main.flatMap(move => Array.from({ length: move.hits ?? 1 }, (_, i) => move.hits ? { ...move, name: `${move.name} (${i + 1} of ${move.hits})` } : move)), ...battle.followers.filter(follower => follower.health > 0)
    .map(follower => {
      const kind = FOLLOWERS[battle.encounter]!.find(kind => kind.name === follower.name)!;
      return { name: `${follower.name.toLowerCase()}'s ${kind.weapon}`, type: 'physical' as const, damage: kind.damage ?? FOLLOWER_BLOW };
    })];
}

// The next blow of the enemy turn: who it will hit, for how much, and whether it can be dodged.
export function nextStrike(battle: Battle) {
  if (battle.phase !== 'enemy') return undefined;
  const move = enemyMoves(battle)[battle.step];
  const target = enemyTarget(battle);
  if (!move || !target) return undefined;
  const protector = battle.party.find(member => member.health > 0 && member.id === 'bear' && member.guardingFor !== null
    && (member.guardingFor === target.id || member.id === target.id));
  const guarded = move.unblockable ? undefined : move.type === 'physical' ? protector || (target.guardingFor === target.id ? target : undefined) : undefined;
  const blocked = !move.unblockable && move.type === 'spell' && battle.studied.includes(move.spell ?? '') && target.barrier;
  // A guard stops an ordinary blow; piercing strength still lands.
  const damage = blocked ? 0 : guarded ? move.piercing ?? 0 : move.damage;
  // Nobody can dodge a spell they have not studied.
  const unknown = move.type === 'spell' && !battle.studied.includes(move.spell ?? '');
  return { move, target, guarded, blocked, damage, dodgeable: damage > 0 && !unknown && !move.undodgeable };
}

// Land the next blow. Each blow picks the most visible target at that moment; the last one ends the enemy turn.
export function strike(battle: Battle, dodge: Dodge = 'miss'): Battle {
  if (battle.phase !== 'enemy') return battle;
  const next = nextStrike(battle);
  if (!next) return enemyTurnEnds(battle);
  if (next.move.feed) {
    // She feeds on the first body she can reach. A barrier keeps her off a fallen hero.
    const body = bodies(battle)[0];
    const followers = body && 'follower' in body ? battle.followers.map((follower, index) => index === body.follower ? { ...follower, eaten: true } : follower) : battle.followers;
    const eaten = !body ? undefined : 'hero' in body ? MEMBERS[body.hero.id].name : `her own ${battle.followers[body.follower].name.toLowerCase()}`;
    const warded = battle.party.filter(member => member.health <= 0 && member.barrier).map(member => MEMBERS[member.id].name);
    const after = {
      ...battle, followers, step: battle.step + 1,
      fury: battle.fury + (body ? FEED : 0),
      enemy: body ? { ...battle.enemy, health: Math.min(battle.enemy.maxHealth, battle.enemy.health + 18) } : battle.enemy,
      log: [...battle.log, ...(warded.length ? [`She circles ${warded.join(' and ')}, but the barrier holds her off.`] : []),
        body ? `The hyena feeds on ${eaten}. She gets up stronger.` : 'She finds nothing she can reach.'],
    };
    return enemyMoves(after)[after.step] ? after : enemyTurnEnds(after);
  }
  if (next.move.revive) {
    const followers = battle.followers.map(follower => follower.health > 0 || follower.eaten ? follower : { ...follower, health: follower.maxHealth });
    const risen = followers.length - battle.followers.filter(follower => follower.health > 0).length;
    const kin = battle.encounter === 'hyena' ? ['A ghoul gets up', 'Her dead get up', 'her dead are already standing'] : ['A fallen nymph rises', 'Her fallen brood rises', 'her brood is already standing'];
    const after = { ...battle, followers, step: battle.step + 1, log: [...battle.log, risen ? `The ${ENEMIES[battle.encounter].short} calls. ${risen === 1 ? kin[0] : kin[1]} again.` : `The ${ENEMIES[battle.encounter].short} calls, but ${kin[2]}.`] };
    return enemyMoves(after)[after.step] ? after : enemyTurnEnds(after);
  }
  const { move, target, guarded, blocked } = next;
  const avoided = next.dodgeable ? dodge : 'miss';
  const damage = avoided === 'perfect' ? 0 : avoided === 'graze' ? Math.ceil(next.damage / 2) : next.damage;
  // A poisoned blow that lands at all leaves its poison.
  const party = battle.party.map(member => member.id === target.id ? { ...member, health: Math.max(0, member.health - damage), poison: damage > 0 && move.poison ? Math.max(member.poison, move.poison) : member.poison } : member);
  // A draining blow feeds the attacker by whatever it actually took.
  const taken = target.health - party.find(member => member.id === target.id)!.health;
  const enemy = move.drain && taken > 0 ? { ...battle.enemy, health: Math.min(battle.enemy.maxHealth, battle.enemy.health + taken) } : battle.enemy;
  const downed = party.find(member => member.id === target.id)!.health === 0;
  const name = MEMBERS[target.id].name;
  const message = blocked ? `${name}'s barrier stops ${move.spell}.`
    : avoided === 'perfect' ? `${name} slips aside. The ${move.name.toLowerCase()} finds only air.`
    : guarded ? `${MEMBERS[guarded.id].name} turns aside the ${move.name.toLowerCase()}${guarded.id !== target.id ? ` aimed at ${name}` : ''}.${damage ? ` His fury drives through anyway${avoided === 'graze' ? ', though only just' : ''}${downed ? `, and ${name} falls` : ''}.` : ''}`
    : avoided === 'graze' ? `${name} half twists away. The ${move.name.toLowerCase()} only grazes them.${downed ? ' They fall.' : ''}`
    : `The ${move.name.toLowerCase()} catches ${name}.${downed ? ' They fall.' : ''}`;
  const frenzy = battle.encounter === 'hyena' && downed ? FRENZY : 0;
  const after = { ...battle, party, enemy, fury: battle.fury + frenzy, step: battle.step + 1, log: [...battle.log, message, ...(enemy.health > battle.enemy.health ? [`The ${ENEMIES[battle.encounter].short} swells with what it took.`] : []), ...(frenzy ? ['The hyena laughs. Someone falling only makes her stronger.'] : [])] };
  const done = party.every(member => member.health === 0) || !enemyMoves(battle)[battle.step + 1];
  return done ? enemyTurnEnds(after) : after;
}

function enemyTurnEnds(battle: Battle): Battle {
  // Poison bites at the end of every enemy turn, on both sides.
  const poisoned = battle.party.filter(member => member.health > 0 && member.poison > 0);
  const defeat = battle.party.every(member => member.health === 0 || (member.poison > 0 && member.health <= POISON));
  const party = battle.party.map(member => ({
    ...member, guardingFor: null, barrier: false, acted: false, flaring: false, cooldown: Math.max(0, member.cooldown - 1),
    health: member.health > 0 && member.poison > 0 ? Math.max(0, member.health - POISON) : member.health,
    poison: Math.max(0, member.poison - 1),
    // The shape the cuckoo wears shows the same mana, round after round: it never moves.
    mana: !defeat && member.health > 0 && member.id !== battle.impostor?.as ? Math.min(member.maxMana, member.mana + MANA_REGEN) : member.mana,
  }));
  const toxin = battle.enemyPoison > 0 && battle.enemy.health > 0 ? Math.min(ENEMY_POISON * venom(battle.encounter), battle.enemy.health - (SURVIVE[battle.encounter] ? 1 : 0)) : 0;
  const poisonLog = [
    ...poisoned.map(member => `The poison works in ${MEMBERS[member.id].name}.${party.find(after => after.id === member.id)!.health === 0 ? ' They fall.' : ''}`),
    ...(toxin ? [`The frog's toxin works in the ${ENEMIES[battle.encounter].short}.`] : []),
  ];
  const cast = !battle.snared && battle.enemy.health > 0 && plainIntent(battle).type === 'spell' ? plainIntent(battle).spell : undefined;
  const sours = Boolean(cast && plainIntent(battle).sour);
  const spell = Boolean(cast);
  const learned = spell && !battle.studied.includes(cast!);
  // A fight the party only had to survive ends once they have.
  const survived = !defeat && SURVIVE[battle.encounter] !== undefined && battle.round >= SURVIVE[battle.encounter]!;
  if (survived) return { ...battle, party, step: 0, snared: false, phase: 'victory', log: [...battle.log, 'She lands and folds her wings. "Grave thieves run. You didn\'t."'] };
  const enemyHealth = battle.enemy.health - toxin;
  const after: Battle = {
    ...battle, party, step: 0, snared: false,
    enemyPoison: Math.max(0, battle.enemyPoison - 1),
    soured: sours && !defeat ? SOUR : Math.max(0, battle.soured - 1),
    studied: learned && !defeat ? [...battle.studied, cast!] : battle.studied,
    enemyRevealed: battle.enemyRevealed || spell,
    enemy: { ...battle.enemy, health: enemyHealth, mana: Math.min(battle.enemy.maxMana, battle.enemy.mana - (spell ? 5 : 0) + ENEMY_REGEN) },
    phase: defeat ? 'defeat' : 'player', round: defeat ? battle.round : battle.round + 1,
    log: [...battle.log, ...(battle.snared && battle.enemy.health > 0 ? [`The ${ENEMIES[battle.encounter].short} strains against the thorns and cannot move.`] : []), ...poisonLog,
      ...(sours && !defeat ? ['Everything tastes bitter. For two turns, healing will burn.'] : []),
      ...(cast && FALSE_MANA[battle.encounter] !== undefined && !defeat && !battle.log.some(line => line.startsWith('Its mana display did not move')) ? ['Its mana display did not move. Real mana drops when a spell is cast; that one never will. It is a lie.'] : []),
      ...(learned && !defeat ? [`Surviving the spell reveals its structure. ${cast} joins the grimoire.`] : []), ...(defeat ? ['The last of you falls. Then, the familiar smell of salt.'] : [])],
  };
  // The cuckoo slips into the party, wearing the shape of whoever shows the most mana. Everyone else's mana is shaken loose; his doesn't move.
  const slips = battle.encounter === 'cuckoo' && !battle.impostor && !defeat && enemyHealth > 0 && battle.round % (battle.stage === 2 ? 2 : 3) === 2;
  // With nobody left to fool, he steps back out of the shape.
  if (after.impostor && !after.party.some(member => member.health > 0 && member.id !== after.impostor!.as))
    return { ...after, impostor: null, log: [...after.log, 'With nobody left to fool, the cuckoo steps back out of the shape he was wearing.'] };
  const shape = slips ? enemyTarget({ ...after, impostor: null, party: after.party.filter(member => member.id !== 'chameleon') }) : undefined;
  if (shape) return {
    ...after, impostor: { as: shape.id, shown: shape.mana },
    party: after.party.map(member => member.id !== shape.id && member.health > 0 ? { ...member, mana: Math.max(0, member.mana - 2) } : member),
    log: [...after.log, 'The lord\'s chair is empty. Feathers everywhere, and everyone\'s mana shaken loose. When they settle, there are still as many of you. One of you is not who they were.'],
  };
  // The toxin can finish what the party started.
  if (defeat || enemyHealth > 0 || battle.enemy.health <= 0) return after;
  const victory = won(after);
  return staged({ ...after, phase: victory ? 'victory' : 'player', log: [...after.log, ...fallen(battle, after), ...(victory ? [QUIET] : [])] });
}

// An order given to the cuckoo, wearing a friend's shape. It looks as if it was carried out, and it wasn't.
function betray(battle: Battle, actor: MemberId, action: Action | 'cast' | 'supply'): Battle {
  const name = MEMBERS[actor].name;
  const party = battle.party.map(member => member.id === actor ? { ...member, acted: true } : member);
  const quiet = action === 'attack' ? `${name}'s ${MEMBERS[actor].attack.toLowerCase()} goes wide.`
    : action === 'cast' ? `${name}'s spell unravels half-spoken.`
    : action === 'unmask' ? `${name} swings at a friend, and misses by a long way.`
    : `${name} does as they are told. Nothing changes.`;
  const allActed = party.every(member => member.health <= 0 || member.acted);
  return { ...battle, party, phase: allActed ? 'enemy' : 'player', log: [...battle.log, quiet] };
}

// Strike a friend, in case they are the cuckoo. If they are, he is thrown out of their shape, hard. If not, a friend is hurt.
function unmask(battle: Battle, actor: MemberId, target: MemberId): Battle {
  const striker = battle.party.find(member => member.id === actor)!;
  const found = battle.impostor?.as === target;
  const damage = MEMBERS[actor].damage + striker.gear.damage;
  const party = battle.party.map(member => ({
    ...member,
    ...(member.id === actor ? { acted: true } : {}),
    ...(member.id === target && !found ? { health: Math.max(0, member.health - damage) } : {}),
  }));
  const enemy = found ? { ...battle.enemy, health: Math.max(0, battle.enemy.health - UNMASK) } : battle.enemy;
  const after = { encounter: battle.encounter, enemy, followers: battle.followers };
  const victory = won(after);
  const allActed = party.every(member => member.health <= 0 || member.acted);
  return staged({
    ...battle, party, enemy, impostor: found ? null : battle.impostor,
    phase: victory ? 'victory' : allActed ? 'enemy' : 'player',
    log: [...battle.log, found
      ? `${MEMBERS[actor].name} strikes ${MEMBERS[target].name}, and feathers burst out of the wound. The cuckoo tumbles out of the shape, and the real ${MEMBERS[target].name} is standing behind him.`
      : `${MEMBERS[actor].name} strikes ${MEMBERS[target].name}. It is really ${MEMBERS[target].name}.${party.find(member => member.id === target)!.health === 0 ? ' They fall.' : ''}`,
      ...(victory ? [QUIET] : [])],
  });
}

// What a heal does to someone: mends, or, while soured, burns for the same.
function mend(member: Member, amount: number, soured: number): number {
  return soured > 0 ? Math.max(0, member.health - amount) : Math.min(member.maxHealth, member.health + amount);
}

// The whole enemy turn with no dodges attempted.
export function resolveEnemy(battle: Battle): Battle {
  if (battle.phase !== 'enemy') return battle;
  if (!enemyTarget(battle)) return { ...battle, phase: 'defeat' };
  while (battle.phase === 'enemy') battle = strike(battle);
  return battle;
}
