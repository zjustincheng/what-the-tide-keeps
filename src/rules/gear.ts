// Pure equipment rules: keepsakes and the slots that hold them. No Phaser, DOM, or storage.
import type { MemberId } from './battle';

export type KeepsakeId = 'cracked-mirror' | 'crow-feather' | 'covenant-token' | 'yoke-peg' | 'wool-charm' | 'boar-tusk' | 'iron-collar' | 'famine-spoon' | 'weir-hook' | 'frost-ring' | 'tide-shell'
  | 'garrison-buckler' | 'saints-medal' | 'night-cloak' | 'smuggled-blade' | 'raven-quill' | 'viper-fang' | 'hospice-bell' | 'liars-charm' | 'adders-coil' | 'house-signet' | 'courier-bell' | 'wren-feather' | 'champions-torc' | 'elder-pearl' | 'kraken-tooth' | 'sea-glass'
  | 'grafting-knife' | 'cutters-wedge' | 'shepherds-horn' | 'tin-cup' | 'brand-iron' | 'drowned-bell'
  | 'broken-link' | 'climbers-chalk' | 'falconers-hood' | 'reed-charm' | 'watch-flint' | 'ice-pick' | 'lookouts-glass';
// What a keepsake changes about its holder in battle.
// agility: in hundredths of a hero's dodge windows; +15 makes every window 15% wider.
export type Mods = Readonly<{ health: number; damage: number; reveal: number; suppressCost: number; shown: number; agility: number; guardAll: number }>;
export type Gear = Readonly<Record<MemberId, readonly KeepsakeId[]>>;

export const NO_MODS: Mods = { health: 0, damage: 0, reveal: 0, suppressCost: 0, shown: 0, agility: 0, guardAll: 0 };
export const SLOTS = 2;
export const MEMBER_IDS: readonly MemberId[] = ['chameleon', 'bear', 'vulture', 'frog', 'octopus'];

// Each keepsake changes how its holder plays, usually with a drawback. Some fit only one hero.
export const KEEPSAKES: Record<KeepsakeId, { name: string; holder?: MemberId; effect: string; drawback: string; mods: Partial<Mods> }> = {
  'cracked-mirror': { name: 'Cracked mirror', holder: 'chameleon',
    effect: 'His reveal hits 3 harder.', drawback: 'Hiding costs 2 mana instead of 1.', mods: { reveal: 3, suppressCost: 1 } },
  'crow-feather': { name: "Crow's feather", holder: 'vulture',
    effect: 'Every attack hits 3 harder.', drawback: '4 less health.', mods: { damage: 3, health: -4 } },
  'covenant-token': { name: 'Covenant token',
    effect: '6 more health.', drawback: 'Shows 2 more mana, so enemies watch the holder.', mods: { health: 6, shown: 2 } },
  'broken-link': { name: 'Broken mill-chain link', holder: 'bear', effect: 'Protect guards both allies as well as himself. Permanently holds the hero’s memory of the bear, even when unequipped.', drawback: 'Protect costs 3 mana and uses his action.', mods: { guardAll: 1 } },
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
  'raven-quill': { name: 'Raven\'s quill', holder: 'vulture',
    effect: 'Dodges come much easier (+25% timing), and attacks hit 1 harder.', drawback: '3 less health.', mods: { agility: 25, damage: 1, health: -3 } },
  // The marsh.
  'viper-fang': { name: 'Viper\'s fang', holder: 'frog',
    effect: 'Her dart hits 3 harder.', drawback: '3 less health.', mods: { damage: 3, health: -3 } },
  'hospice-bell': { name: 'Hospice handbell', effect: '6 more health.', drawback: 'Shows 2 more mana: the sick always know where you are.', mods: { health: 6, shown: 2 } },
  // The holds: the duellist's charm, which shows almost nothing.
  'liars-charm': { name: 'Liar\'s charm', effect: 'Shows 4 less mana: enemies look elsewhere.', drawback: 'Hits 1 softer.', mods: { shown: -4, damage: -1 } },
  'adders-coil': { name: 'Adder\'s coil', holder: 'frog', effect: '5 more health, and dodges come easier (+10% timing).', drawback: 'Shows 1 more mana.', mods: { health: 5, agility: 10, shown: 1 } },
  'house-signet': { name: 'The house signet', holder: 'chameleon', effect: 'Revealing from hiding hits 2 harder.', drawback: '2 less health: it is heavy, and people stare.', mods: { reveal: 2, health: -2 } },
  'courier-bell': { name: 'Courier\'s bell', effect: 'Dodges come much easier (+15% timing).', drawback: 'Shows 2 more mana: it rings.', mods: { agility: 15, shown: 2 } },
  'wren-feather': { name: 'Wren\'s feather', holder: 'vulture', effect: 'Hits 2 harder.', drawback: 'Shows 1 more mana.', mods: { damage: 2, shown: 1 } },
  'champions-torc': { name: 'Champion\'s torc', effect: 'Hits 3 harder.', drawback: 'Shows 3 more mana: everyone in the holds knows that torc.', mods: { damage: 3, shown: 3 } },
  // The sea.
  'elder-pearl': { name: 'The elder\'s pearl', effect: '8 more health. The sea knows who carries it.', drawback: 'Shows 2 more mana.', mods: { health: 8, shown: 2 } },
  'kraken-tooth': { name: 'The kraken\'s tooth', holder: 'octopus', effect: 'Its grapple hits 4 harder.', drawback: '4 less health: it weighs on it.', mods: { damage: 4, health: -4 } },
  'sea-glass': { name: 'Sea glass charm', effect: 'Dodges come easier (+12% timing).', drawback: 'Hits 1 softer.', mods: { agility: 12, damage: -1 } },
  // Off the roads.
  'grafting-knife': { name: 'Grafting knife', holder: 'chameleon', effect: 'Revealing from hiding hits 3 harder.', drawback: 'Shows 1 more mana.', mods: { reveal: 3, shown: 1 } },
  'cutters-wedge': { name: 'The cutter\'s wedge', holder: 'bear', effect: 'Attacks hit 3 harder.', drawback: 'Dodging is harder (-10% timing): it is heavy.', mods: { damage: 3, agility: -10 } },
  'shepherds-horn': { name: 'The shepherds\' horn', effect: '4 more health, and dodges come easier (+8% timing).', drawback: 'Shows 2 more mana: it carries.', mods: { health: 4, agility: 8, shown: 2 } },
  'tin-cup': { name: 'A tin cup', effect: 'Shows 2 less mana: nobody looks twice at a beggar.', drawback: '2 less health.', mods: { shown: -2, health: -2 } },
  'brand-iron': { name: 'The old brand-iron', effect: 'Attacks hit 2 harder, and 4 more health.', drawback: 'Shows 3 more mana: it remembers the fire.', mods: { damage: 2, health: 4, shown: 3 } },
  'drowned-bell': { name: 'The drowned bell', holder: 'octopus', effect: '6 more health, and hits 1 harder.', drawback: 'Dodging is harder (-10% timing).', mods: { health: 6, damage: 1, agility: -10 } },
  // Found only by leaping for them.
  'climbers-chalk': { name: 'Climber\'s chalk', effect: 'Dodges come much easier (+15% timing).', drawback: '2 less health.', mods: { agility: 15, health: -2 } },
  'falconers-hood': { name: 'The falconer\'s hood', holder: 'vulture', effect: 'Dodges come much easier (+20% timing), and shows 1 less mana.', drawback: 'Hits 1 softer.', mods: { agility: 20, shown: -1, damage: -1 } },
  'lookouts-glass': { name: 'The lookout\'s glass', holder: 'chameleon', effect: 'Sees a blow coming: dodges come easier (+10% timing), and revealing from hiding hits 2 harder.', drawback: 'Shows 2 more mana.', mods: { agility: 10, reveal: 2, shown: 2 } },
  'reed-charm': { name: 'Reed charm', holder: 'frog', effect: '4 more health, and dodges come easier (+10% timing).', drawback: 'Shows 1 more mana.', mods: { health: 4, agility: 10, shown: 1 } },
  'watch-flint': { name: 'The watch\'s flint', effect: 'Hits 2 harder.', drawback: 'Dodging is a little harder (-5% timing).', mods: { damage: 2, agility: -5 } },
  'ice-pick': { name: 'A courier\'s ice pick', holder: 'bear', effect: 'Hits 2 harder, and 3 more health.', drawback: 'Shows 1 more mana.', mods: { damage: 2, health: 3, shown: 1 } },
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
  return { chameleon: [], bear: [], vulture: [], frog: [], octopus: [] };
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
const GOOD: Record<keyof Mods, 1 | -1> = { health: 1, damage: 1, reveal: 1, agility: 1, shown: -1, suppressCost: -1, guardAll: 1 };

// A tempered keepsake's benefits grow by half (rounded up); its drawbacks stay as they were.
export function keepsakeMods(id: KeepsakeId, tempered = false): Partial<Mods> {
  const base = KEEPSAKES[id].mods;
  if (!tempered) return base;
  return Object.fromEntries((Object.entries(base) as [keyof Mods, number][]).map(([key, value]) =>
    [key, Math.sign(value) === GOOD[key] ? Math.sign(value) * Math.ceil(Math.abs(value) * 1.5) : value])) as Partial<Mods>;
}

export function mods(gear: Gear, member: MemberId, tempered: readonly KeepsakeId[] = []): Mods {
  return (gear[member] ?? []).reduce<Mods>((total, id) => {
    const add = keepsakeMods(id, tempered.includes(id));
    return Object.fromEntries(Object.entries(total).map(([key, value]) => [key, value + (add[key as keyof Mods] ?? 0)])) as Mods;
  }, NO_MODS);
}
