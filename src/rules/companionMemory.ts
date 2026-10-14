// What the companions remember: pure rules, no Phaser, DOM, or storage.
// Each has four memories, and every wipe takes one from each companion who was in the fight, as the guideline asks.
import type { Companion, MemoryId } from './memory';

// hero: who the chameleon is. feast: that the party was framed. kraken: the rhythm from the harbour wall. craft: their own skill.
export type CompanionMemoryId = 'hero' | 'feast' | 'kraken' | 'craft';
export const COMPANION_MEMORY_IDS: readonly CompanionMemoryId[] = ['hero', 'feast', 'kraken', 'craft'];
export const COMPANIONS: readonly Companion[] = ['bear', 'vulture', 'frog', 'octopus'];

// lost: what the tide has taken. reminded: what the hero has given back at a fire, until the next death.
// bonded: their quest is done, and the keepsake holds their memory of the hero as well as his of them.
export type Mind = Readonly<{ lost: readonly CompanionMemoryId[]; reminded?: readonly CompanionMemoryId[]; bonded?: boolean }>;
export type Minds = Readonly<Partial<Record<Companion, Mind>>>;

// Where each one starts, from the guideline: the bear has died least and remembers everything; the vulture has died most
// and doesn't know the hero; the frog remembers the party but no longer believes they were framed; the octopus has barely died.
export const INITIAL_MINDS: Minds = { vulture: { lost: ['hero', 'feast', 'kraken'] }, frog: { lost: ['feast'] } };

// What a lost memory costs them, and the Hollow perk that fills its place.
export const COMPANION_COSTS = { craft: 2, kraken: 10, perk: 3 } as const;

export const mind = (minds: Minds, who: Companion): Mind => minds[who] ?? { lost: [] };

export function remembers(minds: Minds, who: Companion, id: CompanionMemoryId): boolean {
  const { lost, reminded = [], bonded } = mind(minds, who);
  return !lost.includes(id) || reminded.includes(id) || (id === 'hero' && Boolean(bonded));
}
export const heldBy = (minds: Minds, who: Companion) => COMPANION_MEMORY_IDS.filter(id => remembers(minds, who, id));
// What the tide can take: what they truly hold, not what the hero only reminded them of, and never a bond.
export const forgettableBy = (minds: Minds, who: Companion) => COMPANION_MEMORY_IDS.filter(id => !mind(minds, who).lost.includes(id) && !(id === 'hero' && mind(minds, who).bonded));

// One memory from each companion who fought, chosen by the tide: the same however often the game is reloaded.
export function companionTakes(minds: Minds, fought: readonly Companion[], deaths: number): Partial<Record<Companion, CompanionMemoryId>> {
  return Object.fromEntries(fought.flatMap(who => {
    const choices = forgettableBy(minds, who);
    if (!choices.length) return [];
    let roll = Math.imul(deaths + 1 + 7919 * (COMPANIONS.indexOf(who) + 1), 2654435761);
    roll = Math.imul(roll ^ (roll >>> 15), 2246822519);
    roll = (roll ^ (roll >>> 13)) >>> 0;
    return [[who, choices[roll % choices.length]]];
  }));
}

// A death: the tide's choices are lost, and every reminder fades, for everyone.
export function forgetCompanions(minds: Minds, taken: Partial<Record<Companion, CompanionMemoryId>>): Minds {
  return Object.fromEntries(COMPANIONS.map(who => {
    const { lost, bonded } = mind(minds, who);
    const id = taken[who];
    return [who, { lost: id && !lost.includes(id) ? [...lost, id] : lost, ...(bonded ? { bonded } : {}) }];
  }));
}

// The hero can give back, at a fire, what he still holds himself: the feast, the kraken, or who he is, if he remembers them.
// Nobody can remind them of their own craft.
export const COUNTERPART = (who: Companion): Partial<Record<CompanionMemoryId, MemoryId>> => ({ hero: who, feast: 'feast', kraken: 'kraken' });
export function canRemindCompanion(heroHolds: readonly MemoryId[], minds: Minds, who: Companion, id: CompanionMemoryId): boolean {
  const counterpart = COUNTERPART(who)[id];
  return Boolean(counterpart) && heroHolds.includes(counterpart!) && !remembers(minds, who, id);
}
export function remindCompanion(heroHolds: readonly MemoryId[], minds: Minds, who: Companion, id: CompanionMemoryId): Minds {
  if (!canRemindCompanion(heroHolds, minds, who, id)) return minds;
  const current = mind(minds, who);
  return { ...minds, [who]: { ...current, reminded: [...(current.reminded ?? []), id] } };
}

// Their quest done, the bond holds both ways: they know who the hero is again, for good.
export function bond(minds: Minds, who: Companion): Minds {
  const current = mind(minds, who);
  return { ...minds, [who]: { ...current, lost: current.lost.filter(id => id !== 'hero'), bonded: true } };
}

// What their lost memories change in a fight: a forgotten craft hits softer, a forgotten kraken dodges worse,
// and each memory still gone leaves them harder to hurt, the Hollow trade.
export function companionMods(minds: Minds, who: Companion): { health: number; damage: number; agility: number } {
  const gone = COMPANION_MEMORY_IDS.filter(id => !remembers(minds, who, id));
  return { health: gone.length * COMPANION_COSTS.perk, damage: gone.includes('craft') ? -COMPANION_COSTS.craft : 0, agility: gone.includes('kraken') ? -COMPANION_COSTS.kraken : 0 };
}

export const believesFramed = (minds: Minds, who: Companion) => remembers(minds, who, 'feast');
