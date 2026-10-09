// Pure memory rules: no Phaser, DOM, or storage.
export type MemoryId = 'feast' | 'trial' | 'kraken' | 'bear' | 'vulture' | 'frog' | 'octopus' | 'training' | 'home' | 'name';
export type Perk = 'mana' | 'force';
// anchors: memories written down at a fire. Each survives the next death, then has to be written again.
export type Memory = Readonly<{ lost: readonly MemoryId[]; pending: boolean; anchors?: readonly MemoryId[] }>;
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
// How many memories can be written down at once.
export const ANCHOR_SLOTS = 1;

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

// What can be given up after a wipe: anything not written down, unless everything left is.
export function forgettable(memory: Memory): MemoryId[] {
  const free = held(memory).filter(id => !(memory.anchors ?? []).includes(id));
  return free.length ? free : held(memory);
}

// Giving up a memory uses up the anchors: they carried what they held through this death.
export function forget(memory: Memory, id: MemoryId): Memory {
  if (!memory.pending || !forgettable(memory).includes(id)) return memory;
  return { lost: [...memory.lost, id], pending: false, anchors: [] };
}

// Write a memory down. With every slot full, the oldest is replaced.
export function anchor(memory: Memory, id: MemoryId): Memory {
  if (!held(memory).includes(id)) return memory;
  const anchors = [...(memory.anchors ?? []).filter(other => other !== id), id].slice(-ANCHOR_SLOTS);
  return { ...memory, anchors };
}

export function hollow(memory: Memory): Hollow {
  const gained = memory.lost.filter(id => !INITIAL_LOST.includes(id)).map(id => PERKS[id]);
  return {
    mana: gained.filter(perk => perk === 'mana').length * PERK_BONUS.mana,
    damage: gained.filter(perk => perk === 'force').length * PERK_BONUS.force,
    trained: !memory.lost.includes('training'),
  };
}
