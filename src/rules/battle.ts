// Pure game rules: no Phaser, DOM, timers, or random state.
import type { Hollow } from './memory';
export type MemberId = 'chameleon' | 'bear' | 'vulture';
export type Action = 'attack' | 'support' | 'suppress' | 'barrier' | 'analyze';
export type Encounter = 'locust' | 'acolyte' | 'weevil' | 'boar';
export const SPELL = 'Salt lance';
export type Phase = 'player' | 'enemy' | 'victory' | 'defeat';
export type Fighter = Readonly<{ health: number; maxHealth: number; mana: number; maxMana: number }>;
export type Follower = Fighter & Readonly<{ name: string }>;
// Who an attack is aimed at: 0 is the main enemy, 1 and up are its followers.
export type Foe = number;
type Move = { name: string; type: 'physical' | 'spell'; damage: number; piercing?: number };
export type Member = Fighter & Readonly<{
  id: MemberId;
  acted: boolean;
  guardingFor: MemberId | null;
  focused: boolean;
  suppressed: boolean;
  barrier: boolean;
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
  log: readonly string[];
}>;

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
} as const satisfies Record<Encounter, unknown>;
// Outcast omnivores who follow the boar. They hide their mana; he shields them with his own body.
export const FOLLOWERS: Partial<Record<Encounter, readonly { name: string; health: number }[]>> = {
  boar: [{ name: 'Badger', health: 16 }, { name: 'Rat', health: 12 }],
};
export const FURY_PER_HIT = 3;
export const FOLLOWER_BLOW = 2;
export const COST = { attack: 2, support: 0, suppress: 1, barrier: 5, analyze: 2 } as const;
export const MANA_REGEN = 3;
export const UNHOLLOWED: Hollow = { mana: 0, damage: 0, trained: true };

// Hollow perks strengthen only the hero; companions keep their own memories.
export function createBattle(encounter: Encounter = 'locust', studied: readonly string[] = [], hollow: Hollow = UNHOLLOWED): Battle {
  const member = (id: MemberId, health: number, mana: number): Member => ({
    id, health, maxHealth: health, mana, maxMana: mana,
    acted: false, guardingFor: null, focused: false, suppressed: false, barrier: false,
  });
  return {
    round: 1, phase: 'player', encounter, studied: studied.includes(SPELL) ? [SPELL] : [], hollow, enemyRevealed: false,
    party: [member('chameleon', 20, 10 + hollow.mana), member('bear', 30, 12), member('vulture', 16, 10)],
    enemy: { health: ENEMIES[encounter].health, maxHealth: ENEMIES[encounter].health, mana: ENEMIES[encounter].mana, maxMana: ENEMIES[encounter].mana },
    followers: (FOLLOWERS[encounter] ?? []).map(({ name, health }) => ({ name, health, maxHealth: health, mana: 4, maxMana: 4 })),
    fury: 0,
    log: [ENEMIES[encounter].opening],
  };
}

export function condition(fighter: Fighter): string {
  if (fighter.health <= 0) return 'Downed';
  if (fighter.health <= fighter.maxHealth / 4) return 'Barely standing';
  if (fighter.health <= fighter.maxHealth / 2) return 'Wounded';
  if (fighter.health < fighter.maxHealth) return 'Bloodied';
  return 'Unhurt';
}

export function visibleMana(member: Member): number {
  return member.suppressed ? Math.min(1, member.mana) : member.mana;
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
  if (battle.phase !== 'player' || !member || member.health <= 0 || member.acted || member.mana < COST[action]) return false;
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

export function act(battle: Battle, actor: MemberId, action: Action, target: MemberId = actor, foe: Foe = 0): Battle {
  if (!canAct(battle, actor, action, target, foe)) return battle;
  const member = battle.party.find(member => member.id === actor)!;
  const definition = MEMBERS[actor];
  // Forgetting his training leaves the hero with an ordinary reveal.
  const reveal = actor === 'chameleon' && battle.hollow.trained ? 4 : 2;
  const damage = definition.damage + (actor === 'chameleon' ? battle.hollow.damage : 0) + (member.focused ? 3 : 0) + (member.suppressed ? reveal : 0);
  // The boar takes every hit aimed at his followers, and each one makes him stronger.
  const shielded = action === 'attack' && foe > 0 && battle.encounter === 'boar';
  const hitsMain = action === 'attack' && (foe === 0 || shielded);
  // Hits he takes for his followers glance off his hide at half strength.
  const enemy = hitsMain ? { ...battle.enemy, health: Math.max(0, battle.enemy.health - (shielded ? Math.floor(damage / 2) : damage)) } : battle.enemy;
  const followers = action === 'attack' && foe > 0 && !shielded
    ? battle.followers.map((follower, index) => index === foe - 1 ? { ...follower, health: Math.max(0, follower.health - damage) } : follower)
    : battle.followers;
  const fury = battle.fury + (shielded ? FURY_PER_HIT : 0);
  const party = battle.party.map(current => ({
    ...current,
    ...(current.id === actor ? {
      acted: true, mana: current.mana - COST[action],
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

// The main enemy moves first, then each standing follower. Each move picks the most visible target at that moment.
export function resolveEnemy(battle: Battle): Battle {
  if (battle.phase !== 'enemy') return battle;
  if (!enemyTarget(battle)) return { ...battle, phase: 'defeat' };
  const main = intent(battle);
  const moves: Move[] = [main, ...battle.followers.filter(follower => follower.health > 0)
    .map(follower => ({ name: `${follower.name.toLowerCase()}'s cudgel`, type: 'physical' as const, damage: FOLLOWER_BLOW }))];
  let party = battle.party;
  const log: string[] = [];
  for (const move of moves) {
    const target = enemyTarget({ ...battle, party });
    if (!target) break;
    const protector = party.find(member => member.health > 0 && member.id === 'bear' && member.guardingFor !== null
      && (member.guardingFor === target.id || member.id === target.id));
    const guarded = move.type === 'physical' ? protector || (target.guardingFor === target.id ? target : undefined) : undefined;
    const blocked = move.type === 'spell' && battle.studied.includes(SPELL) && target.barrier;
    // A guard stops an ordinary blow; piercing strength still lands.
    const damage = blocked ? 0 : guarded ? move.piercing ?? 0 : move.damage;
    party = party.map(member => member.id === target.id ? { ...member, health: Math.max(0, member.health - damage) } : member);
    const downed = party.find(member => member.id === target.id)!.health === 0;
    log.push(blocked ? `${MEMBERS[target.id].name}'s barrier stops ${SPELL}.`
      : guarded ? `${MEMBERS[guarded.id].name} turns aside the ${move.name.toLowerCase()}${guarded.id !== target.id ? ` aimed at ${MEMBERS[target.id].name}` : ''}.${damage ? ` His fury drives through anyway${downed ? `, and ${MEMBERS[target.id].name} falls` : ''}.` : ''}`
      : `The ${move.name.toLowerCase()} catches ${MEMBERS[target.id].name}.${downed ? ' They fall.' : ''}`);
  }
  const defeat = party.every(member => member.health === 0);
  party = party.map(member => ({
    ...member, guardingFor: null, barrier: false, acted: false,
    mana: !defeat && member.health > 0 ? Math.min(member.maxMana, member.mana + MANA_REGEN) : member.mana,
  }));
  const spell = main.type === 'spell';
  return {
    ...battle, party,
    studied: spell && !defeat ? [SPELL] : battle.studied,
    enemyRevealed: battle.enemyRevealed || spell,
    enemy: { ...battle.enemy, mana: Math.min(battle.enemy.maxMana, battle.enemy.mana - (spell ? 5 : 0) + MANA_REGEN) },
    phase: defeat ? 'defeat' : 'player', round: defeat ? battle.round : battle.round + 1,
    log: [...battle.log, ...log, ...(spell && !defeat && !battle.studied.includes(SPELL) ? [`Surviving the spell reveals its structure. ${SPELL} joins the grimoire.`] : []), ...(defeat ? ['The last of you falls. Then, the familiar smell of salt.'] : [])],
  };
}
