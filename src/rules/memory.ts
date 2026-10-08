// Pure memory rules: no Phaser, DOM, or storage.
export type MemoryId = 'feast' | 'trial' | 'kraken' | 'bear' | 'vulture' | 'frog' | 'octopus' | 'training' | 'home' | 'name';
export type Perk = 'mana' | 'force';
export type Memory = Readonly<{ lost: readonly MemoryId[]; pending: boolean }>;
export type Hollow = Readonly<{ mana: number; damage: number; trained: boolean }>;

// Each memory names the Hollow perk that fills its place, so the trade is visible before choosing.
export const PERKS: Record<MemoryId, Perk> = {
  feast: 'force', trial: 'mana', kraken: 'force', bear: 'mana', vulture: 'mana',
  frog: 'force', octopus: 'force', training: 'mana', home: 'mana', name: 'force',
};
export const MEMORY_IDS = Object.keys(PERKS) as MemoryId[];
export const PERK_BONUS = { mana: 2, force: 2 } as const;
// Lost before the game begins. Their perks are already part of the hero's starting strength.
export const INITIAL_LOST: readonly MemoryId[] = ['home', 'name'];

export function createMemory(): Memory {
  return { lost: INITIAL_LOST, pending: false };
}

export function held(memory: Memory): MemoryId[] {
  return MEMORY_IDS.filter(id => !memory.lost.includes(id));
}

// A wipe leaves a choice owed; with nothing left to take, the hero simply wakes.
export function wipe(memory: Memory): Memory {
  return held(memory).length ? { ...memory, pending: true } : memory;
}

export function forget(memory: Memory, id: MemoryId): Memory {
  if (!memory.pending || memory.lost.includes(id) || !MEMORY_IDS.includes(id)) return memory;
  return { lost: [...memory.lost, id], pending: false };
}

export function hollow(memory: Memory): Hollow {
  const gained = memory.lost.filter(id => !INITIAL_LOST.includes(id)).map(id => PERKS[id]);
  return {
    mana: gained.filter(perk => perk === 'mana').length * PERK_BONUS.mana,
    damage: gained.filter(perk => perk === 'force').length * PERK_BONUS.force,
    trained: !memory.lost.includes('training'),
  };
}
