// Pure game rules: no Phaser, DOM, timers, or random state.
export type MemberId = 'chameleon' | 'bear' | 'vulture';
export type Action = 'attack' | 'support';
export type Phase = 'player' | 'enemy' | 'victory' | 'defeat';
export type Fighter = Readonly<{ health: number; maxHealth: number; mana: number; maxMana: number }>;
export type Member = Fighter & Readonly<{
  id: MemberId;
  acted: boolean;
  guardingFor: MemberId | null;
  focused: boolean;
}>;
export type Battle = Readonly<{
  round: number;
  phase: Phase;
  party: readonly Member[];
  enemy: Fighter;
  log: readonly string[];
}>;

export const MEMBERS = {
  chameleon: { name: 'Chameleon', attack: 'Thorn', support: 'Guard', damage: 4 },
  bear: { name: 'Bear', attack: 'Stone fist', support: 'Protect', damage: 3 },
  vulture: { name: 'Vulture', attack: 'Quill', support: 'Focus', damage: 6 },
} as const;
export const COST = { attack: 2, support: 0 } as const;
export const MANA_REGEN = 3;

export function createBattle(): Battle {
  const member = (id: MemberId, health: number, mana: number): Member => ({
    id, health, maxHealth: health, mana, maxMana: mana,
    acted: false, guardingFor: null, focused: false,
  });
  return {
    round: 1, phase: 'player',
    party: [member('chameleon', 16, 10), member('bear', 24, 12), member('vulture', 12, 10)],
    enemy: { health: 72, maxHealth: 72, mana: 2, maxMana: 2 },
    log: ['A crop locust has followed the grain sacks inside. The three of you take your places.'],
  };
}

export function condition(fighter: Fighter): string {
  if (fighter.health <= 0) return 'Downed';
  if (fighter.health <= fighter.maxHealth / 4) return 'Barely standing';
  if (fighter.health <= fighter.maxHealth / 2) return 'Wounded';
  if (fighter.health < fighter.maxHealth) return 'Bloodied';
  return 'Unhurt';
}

export function intent(battle: Battle) {
  return battle.round % 2 === 0
    ? { name: 'Crushing leap', tell: 'Its hind legs draw tight. A crushing leap is coming.', damage: 14 }
    : { name: 'Mandible strike', tell: 'Its mandibles part. It will strike.', damage: 6 };
}

// Mana ties prefer the bear, then the stable party order. Downed members never draw attacks.
export function enemyTarget(battle: Battle): Member | undefined {
  return battle.party.filter(member => member.health > 0).reduce<Member | undefined>((target, member) => {
    if (!target || member.mana > target.mana || (member.mana === target.mana && member.id === 'bear')) return member;
    return target;
  }, undefined);
}

export function canAct(battle: Battle, actor: MemberId, action: Action, target: MemberId = actor): boolean {
  const member = battle.party.find(member => member.id === actor);
  if (battle.phase !== 'player' || !member || member.health <= 0 || member.acted || member.mana < COST[action]) return false;
  if (action === 'support') {
    if (!battle.party.some(member => member.id === target && member.health > 0)) return false;
    if (actor !== 'bear' && target !== actor) return false;
  }
  return true;
}

export function act(battle: Battle, actor: MemberId, action: Action, target: MemberId = actor): Battle {
  if (!canAct(battle, actor, action, target)) return battle;
  const member = battle.party.find(member => member.id === actor)!;
  const definition = MEMBERS[actor];
  const damage = definition.damage + (member.focused ? 3 : 0);
  const enemy = action === 'attack' ? { ...battle.enemy, health: Math.max(0, battle.enemy.health - damage) } : battle.enemy;
  const party = battle.party.map(current => current.id !== actor ? current : {
    ...current, acted: true, mana: current.mana - COST[action],
    focused: action === 'attack' ? false : actor === 'vulture' || current.focused,
    guardingFor: action === 'support' && actor !== 'vulture' ? target : null,
  });
  const victory = enemy.health === 0;
  const allActed = party.every(member => member.health <= 0 || member.acted);
  const message = action === 'attack' ? `${definition.name}'s ${definition.attack.toLowerCase()} strikes the locust${member.focused ? ' with focused force' : ''}.`
    : actor === 'vulture' ? 'Vulture steadies her aim. Her next attack will strike harder.'
    : actor === 'bear' && target !== actor ? `Bear steps in front of ${MEMBERS[target].name}.`
    : `${definition.name} plants their feet and guards.`;
  return {
    ...battle, party, enemy, phase: victory ? 'victory' : allActed ? 'enemy' : 'player',
    log: [...battle.log, message, ...(victory ? ['The signature flickers out. The room is quiet again.'] : [])],
  };
}

export function resolveEnemy(battle: Battle): Battle {
  if (battle.phase !== 'enemy') return battle;
  const target = enemyTarget(battle);
  if (!target) return { ...battle, phase: 'defeat' };
  const move = intent(battle);
  const protector = battle.party.find(member => member.health > 0 && member.id === 'bear' && member.guardingFor !== null
    && (member.guardingFor === target.id || member.id === target.id));
  const guarded = protector || (target.guardingFor === target.id ? target : undefined);
  const hitParty = battle.party.map(member => member.id === target.id && !guarded
    ? { ...member, health: Math.max(0, member.health - move.damage) } : member);
  const defeat = hitParty.every(member => member.health === 0);
  const party = hitParty.map(member => ({
    ...member, guardingFor: null, acted: false,
    mana: !defeat && member.health > 0 ? Math.min(member.maxMana, member.mana + MANA_REGEN) : member.mana,
  }));
  const downed = party.find(member => member.id === target.id)!.health === 0;
  const message = guarded ? `${MEMBERS[guarded.id].name} turns aside the ${move.name.toLowerCase()}${guarded.id !== target.id ? ` aimed at ${MEMBERS[target.id].name}` : ''}.`
    : `The ${move.name.toLowerCase()} catches ${MEMBERS[target.id].name}.${downed ? ' They fall.' : ''}`;
  return {
    ...battle, party, phase: defeat ? 'defeat' : 'player', round: defeat ? battle.round : battle.round + 1,
    log: [...battle.log, message, ...(defeat ? ['The last of you falls. Then, the familiar smell of salt.'] : [])],
  };
}
