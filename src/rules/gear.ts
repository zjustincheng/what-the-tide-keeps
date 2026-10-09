// Pure equipment rules: keepsakes and the slots that hold them. No Phaser, DOM, or storage.
import type { MemberId } from './battle';

export type KeepsakeId = 'cracked-mirror' | 'crow-feather' | 'covenant-token' | 'yoke-peg' | 'wool-charm' | 'boar-tusk' | 'iron-collar' | 'famine-spoon' | 'weir-hook' | 'frost-ring' | 'tide-shell'
  | 'garrison-buckler' | 'saints-medal' | 'night-cloak' | 'smuggled-blade';
// What a keepsake changes about its holder in battle.
// agility: in hundredths of a hero's dodge windows; +15 makes every window 15% wider.
export type Mods = Readonly<{ health: number; damage: number; reveal: number; suppressCost: number; shown: number; agility: number }>;
export type Gear = Readonly<Record<MemberId, readonly KeepsakeId[]>>;

export const NO_MODS: Mods = { health: 0, damage: 0, reveal: 0, suppressCost: 0, shown: 0, agility: 0 };
export const SLOTS = 2;
export const MEMBER_IDS: readonly MemberId[] = ['chameleon', 'bear', 'vulture'];

// Each keepsake changes how its holder plays, usually with a drawback. Some fit only one hero.
export const KEEPSAKES: Record<KeepsakeId, { name: string; holder?: MemberId; effect: string; drawback: string; mods: Partial<Mods> }> = {
  'cracked-mirror': { name: 'Cracked mirror', holder: 'chameleon',
    effect: 'His reveal hits 3 harder.', drawback: 'Hiding costs 2 mana instead of 1.', mods: { reveal: 3, suppressCost: 1 } },
  'crow-feather': { name: "Crow's feather", holder: 'vulture',
    effect: 'Every attack hits 3 harder.', drawback: '4 less health.', mods: { damage: 3, health: -4 } },
  'covenant-token': { name: 'Covenant token',
    effect: '6 more health.', drawback: 'Shows 2 more mana, so enemies watch the holder.', mods: { health: 6, shown: 2 } },
  'yoke-peg': { name: 'Yoke peg', holder: 'bear',
    effect: '8 more health.', drawback: 'Attacks hit 2 softer.', mods: { health: 8, damage: -2 } },
  'wool-charm': { name: 'Wool charm',
    effect: '5 more health.', drawback: 'Shows 1 more mana.', mods: { health: 5, shown: 1 } },
  'boar-tusk': { name: "Boar's tusk",
    effect: 'Attacks hit 3 harder.', drawback: '3 less health.', mods: { damage: 3, health: -3 } },
  'iron-collar': { name: 'Iron collar', holder: 'bear',
    effect: 'Attacks hit 2 harder and 4 more health.', drawback: 'Shows 3 more mana, and dodging is harder (-15% timing).', mods: { damage: 2, health: 4, shown: 3, agility: -15 } },
  'weir-hook': { name: 'Weir hook',
    effect: 'Attacks hit 2 harder.', drawback: 'Shows 1 more mana.', mods: { damage: 2, shown: 1 } },
  'frost-ring': { name: 'Frost ring', holder: 'vulture',
    effect: '7 more health.', drawback: 'Attacks hit 1 softer.', mods: { health: 7, damage: -1 } },
  'tide-shell': { name: 'Tide shell',
    effect: '3 more health, and dodges come easier (+20% timing).', drawback: 'Attacks hit 1 softer.', mods: { health: 3, agility: 20, damage: -1 } },
  // Sold rather than found.
  'garrison-buckler': { name: 'Garrison buckler',
    effect: '7 more health.', drawback: 'Attacks hit 1 softer, and dodging is harder (-10% timing).', mods: { health: 7, damage: -1, agility: -10 } },
  'saints-medal': { name: "Saint's medal",
    effect: '4 more health, and shows 1 less mana.', drawback: 'Hiding costs 1 more mana.', mods: { health: 4, shown: -1, suppressCost: 1 } },
  'night-cloak': { name: 'Night cloak',
    effect: 'Dodges come easier (+20% timing), and shows 1 less mana.', drawback: '3 less health.', mods: { agility: 20, shown: -1, health: -3 } },
  'smuggled-blade': { name: 'Smuggled blade',
    effect: 'Attacks hit 3 harder.', drawback: 'Shows 2 more mana, so enemies watch the holder.', mods: { damage: 3, shown: 2 } },
  'famine-spoon': { name: 'Famine spoon',
    effect: 'Shows 3 less mana, so enemies watch the others.', drawback: '3 less health.', mods: { shown: -3, health: -3 } },
};
export const KEEPSAKE_IDS = Object.keys(KEEPSAKES) as KeepsakeId[];

export function createGear(): Gear {
  return { chameleon: [], bear: [], vulture: [] };
}

export function canEquip(owned: readonly KeepsakeId[], member: MemberId, id: KeepsakeId): boolean {
  const holder = KEEPSAKES[id].holder;
  return owned.includes(id) && (!holder || holder === member);
}

// Put a keepsake in a hero's slot. A keepsake held by someone else moves; slot -1 takes it off.
export function equip(gear: Gear, owned: readonly KeepsakeId[], member: MemberId, slot: number, id: KeepsakeId | null): Gear {
  if (slot < 0 || slot >= SLOTS || (id && !canEquip(owned, member, id))) return gear;
  const next = Object.fromEntries(MEMBER_IDS.map(other => [other, gear[other].filter(held => held !== id)])) as Record<MemberId, KeepsakeId[]>;
  const slots = [...gear[member]];
  if (id) slots[slot] = id; else slots.splice(slot, 1);
  next[member] = slots.filter((held, index): held is KeepsakeId => Boolean(held) && slots.indexOf(held) === index && index < SLOTS);
  return next;
}

// Which way is better for each modifier: more health is good, more mana shown is not.
const GOOD: Record<keyof Mods, 1 | -1> = { health: 1, damage: 1, reveal: 1, agility: 1, shown: -1, suppressCost: -1 };

// A tempered keepsake's benefits grow by half (rounded up); its drawbacks stay as they were.
export function keepsakeMods(id: KeepsakeId, tempered = false): Partial<Mods> {
  const base = KEEPSAKES[id].mods;
  if (!tempered) return base;
  return Object.fromEntries((Object.entries(base) as [keyof Mods, number][]).map(([key, value]) =>
    [key, Math.sign(value) === GOOD[key] ? Math.sign(value) * Math.ceil(Math.abs(value) * 1.5) : value])) as Partial<Mods>;
}

export function mods(gear: Gear, member: MemberId, tempered: readonly KeepsakeId[] = []): Mods {
  return gear[member].reduce<Mods>((total, id) => {
    const add = keepsakeMods(id, tempered.includes(id));
    return Object.fromEntries(Object.entries(total).map(([key, value]) => [key, value + (add[key as keyof Mods] ?? 0)])) as Mods;
  }, NO_MODS);
}
