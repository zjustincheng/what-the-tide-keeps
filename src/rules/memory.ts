// Pure memory rules: no Phaser, DOM, or storage.
export type MemoryId = 'feast' | 'trial' | 'kraken' | 'bear' | 'vulture' | 'frog' | 'octopus' | 'training' | 'home' | 'name';
export type Perk = 'mana' | 'force';
// anchors: memories written down at a fire. Each survives the next death, then has to be written again.
// reminded: lost memories a companion has reminded the hero of. They are his again until the next death, which takes them back.
export type Memory = Readonly<{ lost: readonly MemoryId[]; pending: boolean; anchors?: readonly MemoryId[]; reminded?: readonly MemoryId[] }>;
// kraken: whether he still has the party's technique from the kraken fight, which keeps everyone's dodging sharp.
export type Hollow = Readonly<{ mana: number; damage: number; trained: boolean; kraken: boolean }>;

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
  return MEMORY_IDS.filter(id => !memory.lost.includes(id) || (memory.reminded ?? []).includes(id));
}

// A wipe leaves a choice owed; with nothing left to take, the hero simply wakes.
export function wipe(memory: Memory): Memory {
  return held(memory).length ? { ...memory, pending: true } : memory;
}

// What the tide can take after a wipe: anything truly held and not written down, unless everything left is written down.
// What a companion reminded him of goes back by itself.
export function forgettable(memory: Memory): MemoryId[] {
  const own = held(memory).filter(id => !(memory.reminded ?? []).includes(id));
  const free = own.filter(id => !(memory.anchors ?? []).includes(id));
  return free.length ? free : own;
}

// The tide chooses, not the hero: one of the memories he could lose, the same one however often the game is reloaded.
export function tideTakes(memory: Memory, deaths: number): MemoryId | undefined {
  const choices = forgettable(memory);
  if (!choices.length) return undefined;
  let roll = Math.imul(deaths + 1, 2654435761);
  roll = Math.imul(roll ^ (roll >>> 15), 2246822519);
  roll = (roll ^ (roll >>> 13)) >>> 0;
  return choices[roll % choices.length];
}

// Losing a memory uses up the anchors (they carried what they held through this death), and every reminder fades,
// except one that was written down: what a friend reminded him of and he wrote down is his again for good.
export function forget(memory: Memory, id: MemoryId): Memory {
  if (!memory.pending || !forgettable(memory).includes(id)) return memory;
  const restored = (memory.reminded ?? []).filter(other => (memory.anchors ?? []).includes(other));
  return { lost: [...memory.lost.filter(other => !restored.includes(other)), id], pending: false, anchors: [], reminded: [] };
}

// A companion the hero still remembers can remind him of something he lost, until his next death. They can't remind him of themselves.
export type Companion = 'bear' | 'vulture' | 'frog' | 'octopus';
export function canRemind(memory: Memory, by: Companion, id: MemoryId): boolean {
  return held(memory).includes(by) && memory.lost.includes(id) && !(memory.reminded ?? []).includes(id) && id !== by && !INITIAL_LOST.includes(id);
}
export function remind(memory: Memory, by: Companion, id: MemoryId): Memory {
  return canRemind(memory, by, id) ? { ...memory, reminded: [...(memory.reminded ?? []), id] } : memory;
}

// Write a memory down. With every slot full, the oldest is replaced.
export function anchor(memory: Memory, id: MemoryId): Memory {
  if (!held(memory).includes(id)) return memory;
  const anchors = [...(memory.anchors ?? []).filter(other => other !== id), id].slice(-ANCHOR_SLOTS);
  return { ...memory, anchors };
}

// A memory he holds again, reminded, gives back the perk that filled its place.
export function hollow(memory: Memory): Hollow {
  const has = held(memory);
  const gained = memory.lost.filter(id => !INITIAL_LOST.includes(id) && !has.includes(id)).map(id => PERKS[id]);
  return {
    mana: gained.filter(perk => perk === 'mana').length * PERK_BONUS.mana,
    damage: gained.filter(perk => perk === 'force').length * PERK_BONUS.force,
    trained: has.includes('training'),
    kraken: has.includes('kraken'),
  };
}
