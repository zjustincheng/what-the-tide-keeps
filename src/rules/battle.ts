// Pure game rules: no Phaser, DOM, timers, or random state.
export type Action = 'attack' | 'guard';
export type Phase = 'player' | 'enemy' | 'victory' | 'defeat';
export type Fighter = Readonly<{ health: number; maxHealth: number; mana: number; maxMana: number }>;
export type Battle = Readonly<{
  round: number;
  phase: Phase;
  hero: Fighter;
  enemy: Fighter;
  guarding: boolean;
  log: readonly string[];
}>;

export const COST = { attack: 2, guard: 5 } as const;
export const MANA_REGEN = 3;

export function createBattle(): Battle {
  return {
    round: 1, phase: 'player', guarding: false,
    hero: { health: 16, maxHealth: 16, mana: 10, maxMana: 10 },
    enemy: { health: 18, maxHealth: 18, mana: 2, maxMana: 2 },
    log: ['A crop locust has followed the grain sacks inside.'],
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
    ? { name: 'Crushing leap', tell: 'Its hind legs draw tight. A crushing leap is coming.', damage: 7 }
    : { name: 'Mandible strike', tell: 'Its mandibles part. It will strike.', damage: 3 };
}

export function canAct(battle: Battle, action: Action): boolean {
  return battle.phase === 'player' && battle.hero.mana >= COST[action];
}

export function act(battle: Battle, action: Action): Battle {
  if (!canAct(battle, action)) return battle;
  const hero = { ...battle.hero, mana: battle.hero.mana - COST[action] };
  const enemy = action === 'attack' ? { ...battle.enemy, health: Math.max(0, battle.enemy.health - 4) } : battle.enemy;
  const victory = enemy.health === 0;
  return {
    ...battle, hero, enemy, guarding: action === 'guard', phase: victory ? 'victory' : 'enemy',
    log: [...battle.log, action === 'attack' ? 'Your thorn spell strikes the locust.' : 'You plant your feet and hold your ground.',
      ...(victory ? ['The signature flickers out. The room is quiet again.'] : [])],
  };
}

export function resolveEnemy(battle: Battle): Battle {
  if (battle.phase !== 'enemy') return battle;
  const move = intent(battle);
  const health = Math.max(0, battle.hero.health - (battle.guarding ? 0 : move.damage));
  const defeat = health === 0;
  return {
    ...battle, guarding: false, phase: defeat ? 'defeat' : 'player',
    round: defeat ? battle.round : battle.round + 1,
    hero: { ...battle.hero, health, mana: defeat ? battle.hero.mana : Math.min(battle.hero.maxMana, battle.hero.mana + MANA_REGEN) },
    log: [...battle.log, battle.guarding ? `You turn aside the ${move.name.toLowerCase()}.` : `The ${move.name.toLowerCase()} catches you.`,
      ...(defeat ? ['The stone rises to meet you. Then, the familiar smell of salt.'] : [])],
  };
}
