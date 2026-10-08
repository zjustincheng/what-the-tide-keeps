// Pure game rules: no Phaser, DOM, timers, or random state.
// Rule modules import each other with .ts extensions so Node can run their tests directly.
import type { Hollow } from './memory';
import { MEMBER_IDS, mods, NO_MODS } from './gear.ts';
import type { Gear, Mods } from './gear';
import { BOOKS, SPELLS, STARTING_BOOKS } from './spells.ts';
import type { Books, SpellId } from './spells';
import { NO_SUPPLIES, SUPPLIES } from './economy.ts';
import type { Supplies, SupplyId } from './economy';
import type { Wounds } from './world';
export type MemberId = 'chameleon' | 'bear' | 'vulture';
export type Action = 'attack' | 'support' | 'suppress' | 'barrier' | 'analyze';
export type Encounter = 'locust' | 'acolyte' | 'weevil' | 'boar' | 'swarm';
export const SPELL = 'Salt lance';
export type Phase = 'player' | 'enemy' | 'victory' | 'defeat';
export type Fighter = Readonly<{ health: number; maxHealth: number; mana: number; maxMana: number }>;
export type Follower = Fighter & Readonly<{ name: string }>;
// Who an attack is aimed at: 0 is the main enemy, 1 and up are its followers.
export type Foe = number;
// revive: the move raises fallen followers instead of striking.
type Move = { name: string; type: 'physical' | 'spell'; damage: number; piercing?: number; revive?: boolean };
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
  // Supplies brought into the fight; whatever is left goes back into the pack.
  supplies: Supplies;
  log: readonly string[];
}>;
export type Dodge = 'perfect' | 'graze' | 'miss';

export const MEMBERS = {
  chameleon: { name: 'Chameleon', attack: 'Thorn', support: 'Guard', damage: 7 },
  bear: { name: 'Bear', attack: 'Stone fist', support: 'Protect', damage: 5 },
  vulture: { name: 'Vulture', attack: 'Quill', support: 'Focus', damage: 9 },
} as const;
// Crop pests hide nothing and only strike physically; the exile veils its mana and casts.
export const ENEMIES = {
  locust: { name: 'Crop locust', short: 'locust', health: 40, mana: 2, veiled: false,
    opening: 'A crop locust has followed the grain sacks inside. The three of you take your places.' },
  acolyte: { name: 'Hooded exile', short: 'exile', health: 56, mana: 12, veiled: true,
    opening: 'The hooded exile shows almost no mana. A spell gathers behind the veil.' },
  weevil: { name: 'Grain weevil', short: 'weevil', health: 48, mana: 3, veiled: false,
    opening: 'A grain weevil the size of a handcart shoulders out of the wheat.' },
  boar: { name: 'The boar', short: 'boar', health: 72, mana: 6, veiled: false,
    opening: 'The boar rises from the ashes of his own hearth. His followers close in at his flanks. "Not them," he says. "Me."' },
  swarm: { name: 'Swarm-mother', short: 'swarm-mother', health: 64, mana: 4, veiled: false,
    opening: 'Something the size of a cart unfolds in the dark between the trees. Her brood drops from the branches around her.' },
} as const satisfies Record<Encounter, unknown>;
// Outcast omnivores who follow the boar. They hide their mana; he shields them with his own body.
export const FOLLOWERS: Partial<Record<Encounter, readonly { name: string; health: number; weapon: string }[]>> = {
  boar: [{ name: 'Badger', health: 16, weapon: 'cudgel' }, { name: 'Rat', health: 12, weapon: 'cudgel' }],
  // The swarm-mother's brood can be killed, but she calls them back.
  swarm: [{ name: 'Nymph', health: 10, weapon: 'bite' }, { name: 'Nymph', health: 10, weapon: 'bite' }],
};
export const FURY_PER_HIT = 3;
export const FOLLOWER_BLOW = 2;
export const COST = { attack: 2, support: 0, suppress: 1, barrier: 5, analyze: 2 } as const;
export const MANA_REGEN = 3;
export const UNHOLLOWED: Hollow = { mana: 0, damage: 0, trained: true };
// Enemy health for a party of one, two, or three, so a smaller party is not simply outmatched.
export const PARTY_SCALE = [0.45, 0.65, 1] as const;

// Hollow perks strengthen only the hero; companions keep their own memories.
export function createBattle(encounter: Encounter = 'locust', studied: readonly string[] = [], hollow: Hollow = UNHOLLOWED, gear?: Gear, books: Books = STARTING_BOOKS, roster: readonly MemberId[] = MEMBER_IDS, supplies: Supplies = NO_SUPPLIES, wounds: Wounds = {}): Battle {
  const member = (id: MemberId, base: number, mana: number): Member => {
    const worn = gear ? mods(gear, id) : NO_MODS;
    const maxHealth = Math.max(1, base + worn.health);
    // Heroes enter hurt if they were hurt before; a hero who fell stays down.
    const health = Math.max(0, maxHealth - (wounds[id] ?? 0));
    return { id, health, maxHealth, mana, maxMana: mana, acted: false, guardingFor: null, focused: false, suppressed: false, barrier: false, gear: worn,
      spell: books[id] ? BOOKS[books[id]!].spell : null };
  };
  const size = Math.max(1, Math.min(3, roster.length));
  const scaled = (health: number) => Math.round(health * PARTY_SCALE[size - 1]);
  return {
    round: 1, phase: 'player', encounter, studied: studied.includes(SPELL) ? [SPELL] : [], hollow, enemyRevealed: false,
    party: [member('chameleon', 20, 10 + hollow.mana), member('bear', 30, 12), member('vulture', 16, 10)].filter(member => roster.includes(member.id)),
    enemy: { health: scaled(ENEMIES[encounter].health), maxHealth: scaled(ENEMIES[encounter].health), mana: ENEMIES[encounter].mana, maxMana: ENEMIES[encounter].mana },
    followers: (FOLLOWERS[encounter] ?? []).map(({ name, health }) => ({ name, health: scaled(health), maxHealth: scaled(health), mana: 4, maxMana: 4 })),
    fury: 0, step: 0, snared: false, supplies,
    log: [ENEMIES[encounter].opening],
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
  return member.suppressed ? Math.min(1, member.mana) : member.mana + member.gear.shown;
}

// What an action costs this member, after keepsakes.
export function cost(member: Member, action: Action): number {
  return COST[action] + (action === 'attack' ? member.gear.attackCost : action === 'suppress' ? member.gear.suppressCost : 0);
}

export function enemyMana(battle: Battle): number {
  return ENEMIES[battle.encounter].veiled && !battle.enemyRevealed ? Math.min(2, battle.enemy.mana) : battle.enemy.mana;
}

export function intent(battle: Battle): Move & { tell: string } {
  if (battle.encounter === 'acolyte') {
    const casting = battle.round % 2 === 0;
    const name = battle.studied.includes(SPELL) ? SPELL : '???';
    return {
      name: casting ? name : 'Staff strike', type: casting ? 'spell' as const : 'physical' as const,
      tell: casting ? `${name} · 1 enemy turn — releasing next.` : `A staff is raised. ${name} gathers · 2 enemy turns.`,
      damage: casting ? 18 : 4,
    };
  }
  if (battle.encounter === 'boar') {
    const fury = battle.fury ? ` His fury burns · ${battle.fury} will drive through any guard.` : '';
    return battle.round % 2 === 0
      ? { name: 'Tusk charge', type: 'physical', tell: `He lowers his tusks and paws the ash. A charge is coming.${fury}`, damage: 10 + battle.fury, piercing: battle.fury }
      : { name: 'Shoulder blow', type: 'physical', tell: `He squares his shoulders.${fury}`, damage: 4 + battle.fury, piercing: battle.fury };
  }
  if (battle.encounter === 'swarm') return battle.round % 3 === 0
    ? { name: 'Brood call', type: 'physical', tell: 'She shrills, and the brood answers. Fallen nymphs will rise again.', damage: 0, revive: true }
    : { name: 'Wing buffet', type: 'physical', tell: 'Her wings rattle. A buffet is coming.', damage: 5 };
  if (battle.encounter === 'weevil') return battle.round % 3 === 0
    ? { name: 'Rolling charge', type: 'physical' as const, tell: 'It tucks its snout and rocks back. A rolling charge is coming.', damage: 9 }
    : { name: 'Snout jab', type: 'physical' as const, tell: 'Its snout lowers. It will jab.', damage: 3 };
  return battle.round % 2 === 0
    ? { name: 'Crushing leap', type: 'physical' as const, tell: 'Its hind legs draw tight. A crushing leap is coming.', damage: 10 }
    : { name: 'Mandible strike', type: 'physical' as const, tell: 'Its mandibles part. It will strike.', damage: 4 };
}

// Mana ties prefer the bear, then the stable party order. Downed members never draw attacks.
export function enemyTarget(battle: Battle): Member | undefined {
  return battle.party.filter(member => member.health > 0).reduce<Member | undefined>((target, member) => {
    if (!target || visibleMana(member) > visibleMana(target) || (visibleMana(member) === visibleMana(target) && member.id === 'bear')) return member;
    return target;
  }, undefined);
}

export function canAct(battle: Battle, actor: MemberId, action: Action, target: MemberId = actor, foe: Foe = 0): boolean {
  const member = battle.party.find(member => member.id === actor);
  if (battle.phase !== 'player' || !member || member.health <= 0 || member.acted || member.mana < cost(member, action)) return false;
  if (action === 'attack' && foe > 0 && !(battle.followers[foe - 1]?.health > 0)) return false;
  if (action === 'suppress' && member.suppressed) return false;
  if (action === 'analyze' && (battle.encounter !== 'acolyte' || battle.studied.includes(SPELL))) return false;
  if (action === 'barrier' && !battle.party.some(ally => ally.id === target && ally.health > 0)) return false;
  if (action === 'support') {
    if (!battle.party.some(member => member.id === target && member.health > 0)) return false;
    if (actor !== 'bear' && target !== actor) return false;
  }
  return true;
}

// Damage aimed at an enemy. The boar takes every hit aimed at his followers, at half strength, and each one makes him stronger.
function land(battle: Battle, damage: number, foe: Foe) {
  const shielded = foe > 0 && battle.encounter === 'boar';
  const enemy = foe === 0 || shielded ? { ...battle.enemy, health: Math.max(0, battle.enemy.health - (shielded ? Math.floor(damage / 2) : damage)) } : battle.enemy;
  const followers = foe > 0 && !shielded
    ? battle.followers.map((follower, index) => index === foe - 1 ? { ...follower, health: Math.max(0, follower.health - damage) } : follower)
    : battle.followers;
  return { enemy, followers, fury: battle.fury + (shielded ? FURY_PER_HIT : 0), shielded };
}

export function canUse(battle: Battle, actor: MemberId, supply: SupplyId, target: MemberId = actor, foe: Foe = 0): boolean {
  const member = battle.party.find(member => member.id === actor);
  if (battle.phase !== 'player' || !member || member.health <= 0 || member.acted || battle.supplies[supply] <= 0) return false;
  const ally = battle.party.find(member => member.id === target);
  const kind = SUPPLIES[supply].target;
  if (kind === 'ally') return Boolean(ally && ally.health > 0);
  if (kind === 'fallen') return Boolean(ally && ally.health === 0);
  return foe === 0 || battle.followers[foe - 1]?.health > 0;
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
  const victory = enemy.health === 0;
  const allActed = party.every(member => member.health <= 0 || member.acted);
  const aimed = foe > 0 ? battle.followers[foe - 1].name.toLowerCase() : ENEMIES[battle.encounter].short;
  const message = kind === 'ally' ? `${MEMBERS[actor].name} shares the ${name.toLowerCase()}${target !== actor ? ` with ${MEMBERS[target].name}` : ''}.`
    : kind === 'fallen' ? `${MEMBERS[actor].name} holds the smelling salts under ${MEMBERS[target].name}'s nose. They get back up.`
    : hit?.shielded ? `The boar throws himself in front of the ${aimed}. The firepot bursts against him instead, and his fury grows.`
    : `${MEMBERS[actor].name} throws a firepot. It bursts across the ${aimed}.`;
  return {
    ...battle, party, enemy, followers: hit?.followers ?? battle.followers, fury: hit?.fury ?? battle.fury,
    supplies: { ...battle.supplies, [supply]: battle.supplies[supply] - 1 },
    phase: victory ? 'victory' : allActed ? 'enemy' : 'player',
    log: [...battle.log, message, ...(victory ? ['The signature flickers out. It is quiet again.'] : [])],
  };
}

export function canCast(battle: Battle, actor: MemberId, foe: Foe = 0): boolean {
  const member = battle.party.find(member => member.id === actor);
  if (battle.phase !== 'player' || !member?.spell || member.health <= 0 || member.acted || member.mana < SPELLS[member.spell].cost) return false;
  return foe === 0 || battle.followers[foe - 1]?.health > 0;
}

// Cast the actor's spell. The sequence is typed in the battle view; a fizzle still spends the turn and the mana.
export function cast(battle: Battle, actor: MemberId, success: boolean, foe: Foe = 0): Battle {
  if (!canCast(battle, actor, foe)) return battle;
  const member = battle.party.find(member => member.id === actor)!;
  const spell = SPELLS[member.spell!];
  const hit = success && spell.kind === 'damage' ? land(battle, spell.power, foe) : undefined;
  const party = battle.party.map(current => {
    const spent = current.id === actor ? { acted: true, mana: current.mana - spell.cost } : {};
    if (!success || current.health <= 0) return { ...current, ...spent };
    if (spell.kind === 'heal') return { ...current, ...spent, health: Math.min(current.maxHealth, current.health + spell.power) };
    if (spell.kind === 'ward') return { ...current, ...spent, guardingFor: current.guardingFor ?? current.id };
    return { ...current, ...spent };
  });
  const enemy = hit?.enemy ?? battle.enemy;
  const victory = enemy.health === 0;
  const target = foe > 0 ? battle.followers[foe - 1].name.toLowerCase() : ENEMIES[battle.encounter].short;
  const message = !success ? `${MEMBERS[actor].name}'s ${spell.name.toLowerCase()} unravels half-spoken. The mana is gone.`
    : hit?.shielded ? `The boar throws himself in front of the ${target}. ${spell.name} strikes him instead, and his fury grows.`
    : spell.kind === 'damage' ? `${MEMBERS[actor].name} casts ${spell.name}. It tears into the ${target}.`
    : spell.kind === 'heal' ? `${MEMBERS[actor].name} casts ${spell.name}. Wounds close across the party.`
    : spell.kind === 'ward' ? `${MEMBERS[actor].name} casts ${spell.name}. Stone settles over everyone still standing.`
    : `${MEMBERS[actor].name} casts ${spell.name}. Thorns bind the ${ENEMIES[battle.encounter].short} where it stands.`;
  const allActed = party.every(member => member.health <= 0 || member.acted);
  return {
    ...battle, party, enemy, followers: hit?.followers ?? battle.followers, fury: hit?.fury ?? battle.fury,
    snared: battle.snared || (success && spell.kind === 'snare'),
    phase: victory ? 'victory' : allActed ? 'enemy' : 'player',
    log: [...battle.log, message, ...(victory ? ['The signature flickers out. It is quiet again.'] : [])],
  };
}

export function act(battle: Battle, actor: MemberId, action: Action, target: MemberId = actor, foe: Foe = 0): Battle {
  if (!canAct(battle, actor, action, target, foe)) return battle;
  const member = battle.party.find(member => member.id === actor)!;
  const definition = MEMBERS[actor];
  // Forgetting his training leaves the hero with an ordinary reveal.
  const reveal = (actor === 'chameleon' && battle.hollow.trained ? 4 : 2) + member.gear.reveal;
  const damage = definition.damage + member.gear.damage + (actor === 'chameleon' ? battle.hollow.damage : 0) + (member.focused ? 3 : 0) + (member.suppressed ? reveal : 0);
  const { enemy, followers, fury, shielded } = action === 'attack' ? land(battle, damage, foe)
    : { enemy: battle.enemy, followers: battle.followers, fury: battle.fury, shielded: false };
  const party = battle.party.map(current => ({
    ...current,
    ...(current.id === actor ? {
      acted: true, mana: current.mana - cost(current, action),
      focused: action === 'attack' ? false : (action === 'support' && actor === 'vulture') || current.focused,
      suppressed: action === 'suppress' ? true : action === 'attack' ? false : current.suppressed,
      guardingFor: action === 'support' && actor !== 'vulture' ? target : current.guardingFor,
    } : {}),
    barrier: (action === 'barrier' && current.id === target) || current.barrier,
  }));
  const victory = enemy.health === 0;
  const allActed = party.every(member => member.health <= 0 || member.acted);
  const message = action === 'suppress' ? `${definition.name} conceals their mana.`
    : action === 'barrier' ? `${definition.name} raises a spell barrier around ${MEMBERS[target].name}.`
    : action === 'analyze' ? `${definition.name} studies the gathering spell. ${SPELL} is written into the grimoire.`
    : shielded ? `The boar throws himself in front of the ${battle.followers[foe - 1].name.toLowerCase()}. ${definition.name}'s ${definition.attack.toLowerCase()} strikes him instead, and his fury grows.`
    : action === 'attack' ? `${definition.name}'s ${definition.attack.toLowerCase()} strikes the ${foe > 0 ? battle.followers[foe - 1].name.toLowerCase() : ENEMIES[battle.encounter].short}${member.suppressed ? ' in a burst of revealed mana' : ''}${member.focused ? ' with focused force' : ''}.`
    : actor === 'vulture' ? 'Vulture steadies her aim. Her next attack will strike harder.'
    : actor === 'bear' && target !== actor ? `Bear steps in front of ${MEMBERS[target].name}.`
    : `${definition.name} plants their feet and guards.`;
  return {
    ...battle, party, enemy, followers, fury, studied: action === 'analyze' ? [SPELL] : battle.studied, phase: victory ? 'victory' : allActed ? 'enemy' : 'player',
    log: [...battle.log, message, ...(victory ? ['The signature flickers out. It is quiet again.'] : [])],
  };
}

// Dodging is timed by the player, never rolled. Times are milliseconds from the moment the blow lands.
export const DODGE = { perfect: 90, heavyPerfect: 60, graze: 200 } as const;

// Early or late by errorMs; heavy, telegraphed blows leave a narrower perfect window.
export function grade(errorMs: number, move: Move): Dodge {
  const off = Math.abs(errorMs);
  if (off <= (move.damage >= 10 ? DODGE.heavyPerfect : DODGE.perfect)) return 'perfect';
  return off <= DODGE.graze ? 'graze' : 'miss';
}

// The main enemy moves first, then each standing follower.
function enemyMoves(battle: Battle): Move[] {
  return [...(battle.snared ? [] : [intent(battle)]), ...battle.followers.filter(follower => follower.health > 0)
    .map(follower => ({ name: `${follower.name.toLowerCase()}'s ${FOLLOWERS[battle.encounter]!.find(kind => kind.name === follower.name)!.weapon}`, type: 'physical' as const, damage: FOLLOWER_BLOW }))];
}

// The next blow of the enemy turn: who it will hit, for how much, and whether it can be dodged.
export function nextStrike(battle: Battle) {
  if (battle.phase !== 'enemy') return undefined;
  const move = enemyMoves(battle)[battle.step];
  const target = enemyTarget(battle);
  if (!move || !target) return undefined;
  const protector = battle.party.find(member => member.health > 0 && member.id === 'bear' && member.guardingFor !== null
    && (member.guardingFor === target.id || member.id === target.id));
  const guarded = move.type === 'physical' ? protector || (target.guardingFor === target.id ? target : undefined) : undefined;
  const blocked = move.type === 'spell' && battle.studied.includes(SPELL) && target.barrier;
  // A guard stops an ordinary blow; piercing strength still lands.
  const damage = blocked ? 0 : guarded ? move.piercing ?? 0 : move.damage;
  // Nobody can dodge a spell they have not studied.
  const unknown = move.type === 'spell' && !battle.studied.includes(SPELL);
  return { move, target, guarded, blocked, damage, dodgeable: damage > 0 && !unknown };
}

// Land the next blow. Each blow picks the most visible target at that moment; the last one ends the enemy turn.
export function strike(battle: Battle, dodge: Dodge = 'miss'): Battle {
  if (battle.phase !== 'enemy') return battle;
  const next = nextStrike(battle);
  if (!next) return enemyTurnEnds(battle);
  if (next.move.revive) {
    const followers = battle.followers.map(follower => follower.health > 0 ? follower : { ...follower, health: follower.maxHealth });
    const risen = followers.length - battle.followers.filter(follower => follower.health > 0).length;
    const after = { ...battle, followers, step: battle.step + 1, log: [...battle.log, risen ? `The ${ENEMIES[battle.encounter].short} shrills. ${risen === 1 ? 'A fallen nymph rises' : 'Her fallen brood rises'} again.` : `The ${ENEMIES[battle.encounter].short} shrills, but her brood is already standing.`] };
    return enemyMoves(after)[after.step] ? after : enemyTurnEnds(after);
  }
  const { move, target, guarded, blocked } = next;
  const avoided = next.dodgeable ? dodge : 'miss';
  const damage = avoided === 'perfect' ? 0 : avoided === 'graze' ? Math.ceil(next.damage / 2) : next.damage;
  const party = battle.party.map(member => member.id === target.id ? { ...member, health: Math.max(0, member.health - damage) } : member);
  const downed = party.find(member => member.id === target.id)!.health === 0;
  const name = MEMBERS[target.id].name;
  const message = blocked ? `${name}'s barrier stops ${SPELL}.`
    : avoided === 'perfect' ? `${name} slips aside. The ${move.name.toLowerCase()} finds only air.`
    : guarded ? `${MEMBERS[guarded.id].name} turns aside the ${move.name.toLowerCase()}${guarded.id !== target.id ? ` aimed at ${name}` : ''}.${damage ? ` His fury drives through anyway${avoided === 'graze' ? ', though only just' : ''}${downed ? `, and ${name} falls` : ''}.` : ''}`
    : avoided === 'graze' ? `${name} half twists away. The ${move.name.toLowerCase()} only grazes them.${downed ? ' They fall.' : ''}`
    : `The ${move.name.toLowerCase()} catches ${name}.${downed ? ' They fall.' : ''}`;
  const after = { ...battle, party, step: battle.step + 1, log: [...battle.log, message] };
  const done = party.every(member => member.health === 0) || !enemyMoves(battle)[battle.step + 1];
  return done ? enemyTurnEnds(after) : after;
}

function enemyTurnEnds(battle: Battle): Battle {
  const defeat = battle.party.every(member => member.health === 0);
  const party = battle.party.map(member => ({
    ...member, guardingFor: null, barrier: false, acted: false,
    mana: !defeat && member.health > 0 ? Math.min(member.maxMana, member.mana + MANA_REGEN) : member.mana,
  }));
  const spell = !battle.snared && intent(battle).type === 'spell';
  return {
    ...battle, party, step: 0, snared: false,
    studied: spell && !defeat ? [SPELL] : battle.studied,
    enemyRevealed: battle.enemyRevealed || spell,
    enemy: { ...battle.enemy, mana: Math.min(battle.enemy.maxMana, battle.enemy.mana - (spell ? 5 : 0) + MANA_REGEN) },
    phase: defeat ? 'defeat' : 'player', round: defeat ? battle.round : battle.round + 1,
    log: [...battle.log, ...(battle.snared ? [`The ${ENEMIES[battle.encounter].short} strains against the thorns and cannot move.`] : []), ...(spell && !defeat && !battle.studied.includes(SPELL) ? [`Surviving the spell reveals its structure. ${SPELL} joins the grimoire.`] : []), ...(defeat ? ['The last of you falls. Then, the familiar smell of salt.'] : [])],
  };
}

// The whole enemy turn with no dodges attempted.
export function resolveEnemy(battle: Battle): Battle {
  if (battle.phase !== 'enemy') return battle;
  if (!enemyTarget(battle)) return { ...battle, phase: 'defeat' };
  while (battle.phase === 'enemy') battle = strike(battle);
  return battle;
}
