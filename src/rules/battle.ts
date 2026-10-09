// Pure game rules: no Phaser, DOM, timers, or random state.
// Rule modules import each other with .ts extensions so Node can run their tests directly.
import type { Hollow } from './memory';
import { MEMBER_IDS, mods, NO_MODS } from './gear.ts';
import type { Gear, KeepsakeId, Mods } from './gear';
import { BOOKS, SPELLS, STARTING_BOOKS } from './spells.ts';
import type { Books, SpellId } from './spells';
import { NO_SUPPLIES, SUPPLIES } from './economy.ts';
import type { Supplies, SupplyId } from './economy';
import type { Drained, Wounds } from './world';
export type MemberId = 'chameleon' | 'bear' | 'vulture';
export type Action = 'attack' | 'support' | 'suppress' | 'barrier' | 'analyze' | 'gather';
export type Encounter = 'locust' | 'acolyte' | 'weevil' | 'boar' | 'swarm' | 'warden' | 'leech' | 'hound' | 'pack' | 'wisp' | 'drowned'
  | 'raider' | 'ghoul' | 'vulture' | 'pair' | 'hyena' | 'inquisitor' | 'captain' | 'harrier';
export const SPELL = 'Salt lance';
// Each caster's spell. Until a spell is studied (analyzed, or survived once) its name is hidden, it can't be dodged,
// and no barrier stops it. Once studied, it can be seen coming, dodged, and barred.
export const ENEMY_SPELLS: Partial<Record<Encounter, string>> = {
  acolyte: SPELL, pair: SPELL, warden: 'Judgement', drowned: 'Drowning toll', wisp: 'Marsh-fire', inquisitor: 'Verdict',
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
// spell: for a spell, which one it is.
// dodge: how this blow is dodged, when it differs from what dodgeKind would choose.
type Move = { name: string; type: 'physical' | 'spell'; spell?: string; dodge?: DodgeKind; damage: number; piercing?: number; revive?: boolean; drain?: boolean; feed?: boolean; hits?: number; unblockable?: boolean;
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
};
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

// Followers who give up once their leader falls. Everyone else fights until the last of them is down.
export const YIELDING: Partial<Record<Encounter, true>> = { boar: true, hyena: true };
export const FURY_PER_HIT = 3;
export const FOLLOWER_BLOW = 2;
export const COST = { attack: 0, support: 0, suppress: 1, barrier: 5, analyze: 2, gather: 0 } as const;
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
export function createBattle(encounter: Encounter = 'locust', studied: readonly string[] = [], options: BattleOptions = {}): Battle {
  const { hollow = UNHOLLOWED, gear, books = STARTING_BOOKS, roster = MEMBER_IDS, supplies = NO_SUPPLIES, wounds = {}, drained = {}, ambush = false, surprise = false, tempered = [], waves = 1 } = options;
  const member = (id: MemberId, base: number, mana: number): Member => {
    const worn = gear ? mods(gear, id, tempered) : NO_MODS;
    const maxHealth = Math.max(1, base + worn.health);
    // Heroes enter hurt if they were hurt before; a hero who fell stays down.
    const health = Math.max(0, maxHealth - (wounds[id] ?? 0));
    return { id, health, maxHealth, mana: Math.max(0, mana - (drained[id] ?? 0)), maxMana: mana, acted: false, guardingFor: null, focused: false, suppressed: false, barrier: false, gear: worn, cooldown: 0, flaring: false,
      spell: books[id] ? BOOKS[books[id]!].spell : null };
  };
  const size = Math.max(1, Math.min(3, roster.length));
  const scaled = (health: number) => Math.round(health * PARTY_SCALE[size - 1]);
  return {
    round: 1, phase: ambush ? 'enemy' : 'player', encounter, studied: studied.filter(name => STUDIABLE.includes(name)), hollow, enemyRevealed: false,
    party: [member('chameleon', 20, 10 + hollow.mana), member('bear', 30, 12), member('vulture', 16, 10)].filter(member => roster.includes(member.id)),
    enemy: { health: scaled(ENEMIES[encounter].health), maxHealth: scaled(ENEMIES[encounter].health), mana: ENEMIES[encounter].mana, maxMana: ENEMIES[encounter].mana },
    followers: (FOLLOWERS[encounter] ?? []).map(({ name, health }) => ({ name, health: scaled(health), maxHealth: scaled(health), mana: 4, maxMana: 4 })),
    fury: 0, step: 0, snared: surprise && !ambush, stage: 1, wave: 1, waves, supplies,
    log: [ENEMIES[encounter].opening, ...(ambush ? ['Ambush! It moves before you can.'] : surprise ? ['It never saw you coming. It loses its first move.'] : [])],
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
  return battle.party.filter(member => member.health > 0).reduce<Member | undefined>((target, member) => {
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
  if (action === 'support') {
    if (!battle.party.some(member => member.id === target && member.health > 0)) return false;
    if (actor !== 'bear' && target !== actor) return false;
  }
  return true;
}

// Damage aimed at an enemy. The boar takes every hit aimed at his followers, at half strength, and each one makes him stronger.
function land(battle: Battle, damage: number, foe: Foe) {
  const shielded = foe > 0 && battle.encounter === 'boar' && battle.enemy.health > 0;
  const blocked = foe === 0 && warded(battle);
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
  const { name, power, target: kind } = SUPPLIES[supply];
  const hit = kind === 'enemy' ? land(battle, power, foe) : undefined;
  const party = battle.party.map(member => ({
    ...member,
    ...(member.id === actor ? { acted: true } : {}),
    ...(member.id === target && kind === 'ally' ? { health: Math.min(member.maxHealth, member.health + power) } : {}),
    ...(member.id === target && kind === 'fallen' ? { health: power } : {}),
  }));
  const enemy = hit?.enemy ?? battle.enemy;
  const after = { encounter: battle.encounter, enemy, followers: hit?.followers ?? battle.followers };
  const victory = won(after);
  const allActed = party.every(member => member.health <= 0 || member.acted);
  const aimed = foe > 0 ? battle.followers[foe - 1].name.toLowerCase() : ENEMIES[battle.encounter].short;
  const message = kind === 'ally' ? `${MEMBERS[actor].name} shares the ${name.toLowerCase()}${target !== actor ? ` with ${MEMBERS[target].name}` : ''}.`
    : kind === 'fallen' ? `${MEMBERS[actor].name} holds the smelling salts under ${MEMBERS[target].name}'s nose. They get back up.`
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
  const member = battle.party.find(member => member.id === actor)!;
  const spell = SPELLS[member.spell!];
  const hit = success && spell.kind === 'damage' ? land(battle, spell.power, foe) : undefined;
  const party = battle.party.map(current => {
    // Casting spends the mana, starts the cooldown, ends any hiding, and lights the caster up for the enemy, fizzle or not.
    const spent = current.id === actor ? { acted: true, mana: current.mana - spell.cost, cooldown: spell.cooldown, flaring: true, suppressed: false } : {};
    if (!success || current.health <= 0) return { ...current, ...spent };
    if (spell.kind === 'heal') return { ...current, ...spent, health: Math.min(current.maxHealth, current.health + spell.power) };
    if (spell.kind === 'ward') return { ...current, ...spent, guardingFor: current.guardingFor ?? current.id };
    return { ...current, ...spent };
  });
  const enemy = hit?.enemy ?? battle.enemy;
  const after = { encounter: battle.encounter, enemy, followers: hit?.followers ?? battle.followers };
  const victory = won(after);
  const target = foe > 0 ? battle.followers[foe - 1].name.toLowerCase() : ENEMIES[battle.encounter].short;
  const message = !success ? `${MEMBERS[actor].name}'s ${spell.name.toLowerCase()} unravels half-spoken. The mana is gone.`
    : hit?.blocked ? `${MEMBERS[actor].name} casts ${spell.name}. It breaks on the candlelight; the warden is untouched while its votives burn.`
    : hit?.shielded ? `The boar throws himself in front of the ${target}. ${spell.name} strikes him instead, and his fury grows.`
    : spell.kind === 'damage' ? `${MEMBERS[actor].name} casts ${spell.name}. It tears into the ${target}.`
    : spell.kind === 'heal' ? `${MEMBERS[actor].name} casts ${spell.name}. Wounds close across the party.`
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
  const member = battle.party.find(member => member.id === actor)!;
  const definition = MEMBERS[actor];
  // Forgetting his training leaves the hero with an ordinary reveal.
  const reveal = (actor === 'chameleon' && battle.hollow.trained ? 4 : 2) + member.gear.reveal;
  const damage = definition.damage + member.gear.damage + (actor === 'chameleon' ? battle.hollow.damage : 0) + (member.focused ? 3 : 0) + (member.suppressed ? reveal : 0);
  const { enemy, followers, fury, shielded, blocked } = action === 'attack' ? land(battle, damage, foe)
    : { enemy: battle.enemy, followers: battle.followers, fury: battle.fury, shielded: false, blocked: false };
  const party = battle.party.map(current => ({
    ...current,
    ...(current.id === actor ? {
      acted: true, mana: action === 'gather' ? Math.min(current.maxMana, current.mana + GATHER) : current.mana - cost(current, action),
      focused: action === 'attack' ? false : (action === 'support' && actor === 'vulture') || current.focused,
      suppressed: action === 'suppress' ? true : action === 'attack' ? false : current.suppressed,
      guardingFor: action === 'support' && actor !== 'vulture' ? target : current.guardingFor,
    } : {}),
    barrier: (action === 'barrier' && current.id === target) || current.barrier,
  }));
  const after = { encounter: battle.encounter, enemy, followers };
  const victory = won(after);
  const allActed = party.every(member => member.health <= 0 || member.acted);
  const message = action === 'gather' ? `${definition.name} goes still and gathers their mana.`
    : action === 'suppress' ? `${definition.name} conceals their mana.`
    : action === 'barrier' ? `${definition.name} raises a spell barrier around ${MEMBERS[target].name}.`
    : action === 'analyze' ? `${definition.name} studies the gathering spell. ${ENEMY_SPELLS[battle.encounter]} is written into the grimoire.`
    : blocked ? `${definition.name}'s ${definition.attack.toLowerCase()} breaks on the candlelight. The warden is untouched while its votives burn.`
    : shielded ? `The boar throws himself in front of the ${battle.followers[foe - 1].name.toLowerCase()}. ${definition.name}'s ${definition.attack.toLowerCase()} strikes him instead, and his fury grows.`
    : action === 'attack' ? `${definition.name}'s ${definition.attack.toLowerCase()} strikes the ${foe > 0 ? battle.followers[foe - 1].name.toLowerCase() : ENEMIES[battle.encounter].short}${member.suppressed ? ' in a burst of revealed mana' : ''}${member.focused ? ' with focused force' : ''}.`
    : actor === 'vulture' ? 'Vulture steadies her aim. Her next attack will strike harder.'
    : actor === 'bear' && target !== actor ? `Bear steps in front of ${MEMBERS[target].name}.`
    : `${definition.name} plants their feet and guards.`;
  return staged({
    ...battle, party, enemy, followers, fury, studied: action === 'analyze' ? [...battle.studied, ENEMY_SPELLS[battle.encounter]!] : battle.studied, phase: victory ? 'victory' : allActed ? 'enemy' : 'player',
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
  const party = battle.party.map(member => member.id === target.id ? { ...member, health: Math.max(0, member.health - damage) } : member);
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
  const defeat = battle.party.every(member => member.health === 0);
  const party = battle.party.map(member => ({
    ...member, guardingFor: null, barrier: false, acted: false, flaring: false, cooldown: Math.max(0, member.cooldown - 1),
    mana: !defeat && member.health > 0 ? Math.min(member.maxMana, member.mana + MANA_REGEN) : member.mana,
  }));
  const cast = !battle.snared && battle.enemy.health > 0 && plainIntent(battle).type === 'spell' ? plainIntent(battle).spell : undefined;
  const spell = Boolean(cast);
  const learned = spell && !battle.studied.includes(cast!);
  // A fight the party only had to survive ends once they have.
  const survived = !defeat && SURVIVE[battle.encounter] !== undefined && battle.round >= SURVIVE[battle.encounter]!;
  if (survived) return { ...battle, party, step: 0, snared: false, phase: 'victory', log: [...battle.log, 'She lands and folds her wings. "Grave thieves run. You didn\'t."'] };
  return {
    ...battle, party, step: 0, snared: false,
    studied: learned && !defeat ? [...battle.studied, cast!] : battle.studied,
    enemyRevealed: battle.enemyRevealed || spell,
    enemy: { ...battle.enemy, mana: Math.min(battle.enemy.maxMana, battle.enemy.mana - (spell ? 5 : 0) + ENEMY_REGEN) },
    phase: defeat ? 'defeat' : 'player', round: defeat ? battle.round : battle.round + 1,
    log: [...battle.log, ...(battle.snared && battle.enemy.health > 0 ? [`The ${ENEMIES[battle.encounter].short} strains against the thorns and cannot move.`] : []), ...(learned && !defeat ? [`Surviving the spell reveals its structure. ${cast} joins the grimoire.`] : []), ...(defeat ? ['The last of you falls. Then, the familiar smell of salt.'] : [])],
  };
}

// The whole enemy turn with no dodges attempted.
export function resolveEnemy(battle: Battle): Battle {
  if (battle.phase !== 'enemy') return battle;
  if (!enemyTarget(battle)) return { ...battle, phase: 'defeat' };
  while (battle.phase === 'enemy') battle = strike(battle);
  return battle;
}
