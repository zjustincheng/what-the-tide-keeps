// Pure memory rules: no Phaser, DOM, or storage.
import { bond, INITIAL_MINDS, remembers } from './companionMemory.ts';
import type { Minds } from './companionMemory';
export type MemoryId = 'feast' | 'trial' | 'kraken' | 'bear' | 'vulture' | 'frog' | 'octopus' | 'training' | 'home' | 'name';
export type Perk = 'mana' | 'force';
// anchors: memories written down at a fire. Each survives the next death, then has to be written again.
// reminded: lost memories a companion has reminded the hero of. They are his again until the next death, which takes them back.
// owed: how many memories this wipe takes, when it is more than one: at sea, the church can't fetch you back cleanly.
// companions: what each companion remembers (src/rules/companionMemory.ts). fought: the companions in the fight that wiped, who each owe the tide a memory too.
// pages: what he wrote out at a fire, two of each memory's four lines, by place. Paper outlasts him: pages survive every death.
export type Pages = Readonly<Partial<Record<MemoryId, readonly [number, number]>>>;
export type Memory = Readonly<{ lost: readonly MemoryId[]; pending: boolean; anchors?: readonly MemoryId[]; reminded?: readonly MemoryId[]; owed?: number; keepsakeMemories?: readonly MemoryId[]; companions?: Minds; fought?: readonly Companion[]; pages?: Pages }>;
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
  return { lost: INITIAL_LOST, pending: false, companions: INITIAL_MINDS };
}

export function held(memory: Memory): MemoryId[] {
  return MEMORY_IDS.filter(id => !memory.lost.includes(id) || (memory.reminded ?? []).includes(id) || (memory.keepsakeMemories ?? []).includes(id));
}

// A wipe leaves a debt owed: one memory, or more at sea. With nothing left to take, the hero simply wakes.
export function wipe(memory: Memory, owed = 1): Memory {
  return held(memory).length ? { ...memory, pending: true, owed } : memory;
}

// Everything the tide takes for this wipe, in order: one roll per memory owed, never the same twice.
export function tideTakesAll(memory: Memory, deaths: number): MemoryId[] {
  const taken: MemoryId[] = [];
  let left = memory;
  for (let i = 0; i < (memory.owed ?? 1); i++) {
    const id = tideTakes(left, deaths + i * 997);
    if (!id) break;
    taken.push(id);
    left = { ...left, lost: [...left.lost, id] };
  }
  return taken;
}

// What the tide can take after a wipe: anything truly held and not written down.
// What a companion reminded him of goes back by itself.
export function forgettable(memory: Memory): MemoryId[] {
  const own = held(memory).filter(id => !(memory.reminded ?? []).includes(id) && !(memory.keepsakeMemories ?? []).includes(id));
  const free = own.filter(id => !(memory.anchors ?? []).includes(id));
  return free;
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
  return { lost: [...memory.lost.filter(other => !restored.includes(other)), id], pending: false, anchors: [], reminded: [], owed: undefined, ...(memory.keepsakeMemories?.length ? { keepsakeMemories: memory.keepsakeMemories } : {}),
    ...(memory.companions ? { companions: memory.companions } : {}), ...(memory.fought ? { fought: memory.fought } : {}), ...(memory.pages ? { pages: memory.pages } : {}) };
}

// Pay a whole wipe's debt at once.
export function forgetAll(memory: Memory, ids: readonly MemoryId[]): Memory {
  // A protected last memory can leave nothing to take. The page still carries
  // it through this death and is used up; written reminders become truly held.
  if (memory.pending && !ids.length && !forgettable(memory).length) {
    const restored = (memory.reminded ?? []).filter(id => (memory.anchors ?? []).includes(id));
    return { ...memory, lost: memory.lost.filter(id => !restored.includes(id)), pending: false, anchors: [], reminded: [], owed: undefined };
  }
  return ids.reduce<Memory>((paid, id, index) => index === 0 ? forget(paid, id) : forget({ ...paid, pending: true }, id), memory);
}

// A companion the hero still remembers, and who still remembers him, can remind him of something he lost, until his next death.
// They can't remind him of themselves.
export type Companion = 'bear' | 'vulture' | 'frog' | 'octopus';
export function canRemind(memory: Memory, by: Companion, id: MemoryId): boolean {
  return held(memory).includes(by) && remembers(memory.companions ?? INITIAL_MINDS, by, 'hero') && memory.lost.includes(id) && !(memory.reminded ?? []).includes(id) && id !== by && !INITIAL_LOST.includes(id);
}
export function remind(memory: Memory, by: Companion, id: MemoryId): Memory {
  return canRemind(memory, by, id) ? { ...memory, reminded: [...(memory.reminded ?? []), id] } : memory;
}

// Write a memory down. With every slot full, the oldest is replaced.
export function anchor(memory: Memory, id: MemoryId): Memory {
  if (!held(memory).includes(id) || memory.keepsakeMemories?.includes(id)) return memory;
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

// A lost memory found again, written down somewhere he can read it: it is his once more.
export function recall(memory: Memory, id: MemoryId): Memory {
  return memory.lost.includes(id) ? { ...memory, lost: memory.lost.filter(other => other !== id) } : memory;
}

// Companion keepsakes hold a memory forever, whether or not the equipment is worn.
// A companion's own keepsake holds the bond both ways: they remember the hero again, for good, too.
export function keepMemory(memory: Memory, id: MemoryId): Memory {
  const companions = (['bear', 'vulture', 'frog', 'octopus'] as const).includes(id as Companion) ? bond(memory.companions ?? INITIAL_MINDS, id as Companion) : memory.companions;
  return { ...recall(memory, id), ...(companions ? { companions } : {}), keepsakeMemories: [...new Set([...(memory.keepsakeMemories ?? []), id])],
    anchors: (memory.anchors ?? []).filter(other => other !== id), reminded: (memory.reminded ?? []).filter(other => other !== id) };
}

// Writing it out: two of its four lines, the two he most wants to keep. Only what he still holds can be written.
export function writePage(memory: Memory, id: MemoryId, lines: readonly number[]): Memory {
  const kept = [...new Set(lines)].filter(line => Number.isInteger(line) && line >= 0 && line < 4).sort();
  if (!held(memory).includes(id) || INITIAL_LOST.includes(id) || kept.length !== 2) return memory;
  return { ...memory, pages: { ...memory.pages, [id]: [kept[0], kept[1]] } };
}
// His own page, read at a fire, brings back a memory he lost as a friend would: until the next death.
export function canReadPage(memory: Memory, id: MemoryId): boolean {
  return Boolean(memory.pages?.[id]) && memory.lost.includes(id) && !(memory.reminded ?? []).includes(id) && !INITIAL_LOST.includes(id);
}
export function readPage(memory: Memory, id: MemoryId): Memory {
  return canReadPage(memory, id) ? { ...memory, reminded: [...(memory.reminded ?? []), id] } : memory;
}
