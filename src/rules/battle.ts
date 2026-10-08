// Pure game rules: no Phaser, DOM, timers, or random state.
export type MemberId = 'chameleon' | 'bear' | 'vulture';
export type Action = 'attack' | 'support' | 'suppress' | 'barrier' | 'analyze';
export type Encounter = 'locust' | 'acolyte';
export const SPELL = 'Salt lance';
export type Phase = 'player' | 'enemy' | 'victory' | 'defeat';
export type Fighter = Readonly<{ health: number; maxHealth: number; mana: number; maxMana: number }>;
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
  enemyRevealed: boolean;
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
export const COST = { attack: 2, support: 0, suppress: 1, barrier: 5, analyze: 2 } as const;
export const MANA_REGEN = 3;

export function createBattle(encounter: Encounter = 'locust', studied: readonly string[] = []): Battle {
  const member = (id: MemberId, health: number, mana: number): Member => ({
    id, health, maxHealth: health, mana, maxMana: mana,
    acted: false, guardingFor: null, focused: false, suppressed: false, barrier: false,
  });
  return {
    round: 1, phase: 'player', encounter, studied: studied.includes(SPELL) ? [SPELL] : [], enemyRevealed: false,
    party: [member('chameleon', 16, 10), member('bear', 24, 12), member('vulture', 12, 10)],
    enemy: { health: 72, maxHealth: 72, mana: encounter === 'acolyte' ? 12 : 2, maxMana: encounter === 'acolyte' ? 12 : 2 },
    log: [encounter === 'locust' ? 'A crop locust has followed the grain sacks inside. The three of you take your places.' : 'The hooded exile shows almost no mana. A spell gathers behind the veil.'],
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
  return battle.encounter === 'acolyte' && !battle.enemyRevealed ? Math.min(2, battle.enemy.mana) : battle.enemy.mana;
}

export function intent(battle: Battle) {
  if (battle.encounter === 'acolyte') {
    const casting = battle.round % 2 === 0;
    const name = battle.studied.includes(SPELL) ? SPELL : '???';
    return {
      name: casting ? name : 'Staff strike', type: casting ? 'spell' as const : 'physical' as const,
      tell: casting ? `${name} · 1 enemy turn — releasing next.` : `A staff is raised. ${name} gathers · 2 enemy turns.`,
      damage: casting ? 18 : 5,
    };
  }
  return battle.round % 2 === 0
    ? { name: 'Crushing leap', type: 'physical' as const, tell: 'Its hind legs draw tight. A crushing leap is coming.', damage: 14 }
    : { name: 'Mandible strike', type: 'physical' as const, tell: 'Its mandibles part. It will strike.', damage: 6 };
}

// Mana ties prefer the bear, then the stable party order. Downed members never draw attacks.
export function enemyTarget(battle: Battle): Member | undefined {
  return battle.party.filter(member => member.health > 0).reduce<Member | undefined>((target, member) => {
    if (!target || visibleMana(member) > visibleMana(target) || (visibleMana(member) === visibleMana(target) && member.id === 'bear')) return member;
    return target;
  }, undefined);
}

export function canAct(battle: Battle, actor: MemberId, action: Action, target: MemberId = actor): boolean {
  const member = battle.party.find(member => member.id === actor);
  if (battle.phase !== 'player' || !member || member.health <= 0 || member.acted || member.mana < COST[action]) return false;
  if (action === 'suppress' && member.suppressed) return false;
  if (action === 'analyze' && (battle.encounter !== 'acolyte' || battle.studied.includes(SPELL))) return false;
  if (action === 'barrier' && !battle.party.some(ally => ally.id === target && ally.health > 0)) return false;
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
  const damage = definition.damage + (member.focused ? 3 : 0) + (member.suppressed ? actor === 'chameleon' ? 4 : 2 : 0);
  const enemy = action === 'attack' ? { ...battle.enemy, health: Math.max(0, battle.enemy.health - damage) } : battle.enemy;
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
    : action === 'attack' ? `${definition.name}'s ${definition.attack.toLowerCase()} strikes the ${battle.encounter === 'locust' ? 'locust' : 'exile'}${member.suppressed ? ' in a burst of revealed mana' : ''}${member.focused ? ' with focused force' : ''}.`
    : actor === 'vulture' ? 'Vulture steadies her aim. Her next attack will strike harder.'
    : actor === 'bear' && target !== actor ? `Bear steps in front of ${MEMBERS[target].name}.`
    : `${definition.name} plants their feet and guards.`;
  return {
    ...battle, party, enemy, studied: action === 'analyze' ? [SPELL] : battle.studied, phase: victory ? 'victory' : allActed ? 'enemy' : 'player',
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
  const guarded = move.type === 'physical' ? protector || (target.guardingFor === target.id ? target : undefined) : undefined;
  const blocked = move.type === 'spell' && battle.studied.includes(SPELL) && target.barrier;
  const hitParty = battle.party.map(member => member.id === target.id && !guarded && !blocked
    ? { ...member, health: Math.max(0, member.health - move.damage) } : member);
  const defeat = hitParty.every(member => member.health === 0);
  const party = hitParty.map(member => ({
    ...member, guardingFor: null, barrier: false, acted: false,
    mana: !defeat && member.health > 0 ? Math.min(member.maxMana, member.mana + MANA_REGEN) : member.mana,
  }));
  const downed = party.find(member => member.id === target.id)!.health === 0;
  const message = blocked ? `${MEMBERS[target.id].name}'s barrier stops ${SPELL}.` : guarded ? `${MEMBERS[guarded.id].name} turns aside the ${move.name.toLowerCase()}${guarded.id !== target.id ? ` aimed at ${MEMBERS[target.id].name}` : ''}.`
    : `The ${move.name.toLowerCase()} catches ${MEMBERS[target.id].name}.${downed ? ' They fall.' : ''}`;
  return {
    ...battle, party,
    studied: move.type === 'spell' && !defeat ? [SPELL] : battle.studied,
    enemyRevealed: battle.enemyRevealed || move.type === 'spell',
    enemy: { ...battle.enemy, mana: Math.min(battle.enemy.maxMana, battle.enemy.mana - (move.type === 'spell' ? 5 : 0) + MANA_REGEN) },
    phase: defeat ? 'defeat' : 'player', round: defeat ? battle.round : battle.round + 1,
    log: [...battle.log, message, ...(move.type === 'spell' && !defeat && !battle.studied.includes(SPELL) ? [`Surviving the spell reveals its structure. ${SPELL} joins the grimoire.`] : []), ...(defeat ? ['The last of you falls. Then, the familiar smell of salt.'] : [])],
  };
}
