// Pure money and supply rules. No Phaser, DOM, or storage.
import type { Encounter } from './battle';
import type { Flag, Found, World } from './world';
import { KEEPSAKES } from './gear.ts';
import type { KeepsakeId } from './gear';
import { BOOKS, SPELLS } from './spells.ts';
import type { BookId } from './spells';
import { catchValue, NO_CATCH } from './fishing.ts';

export type SupplyId = 'smoked-fish' | 'smelling-salts' | 'firepot' | 'fish-stew' | 'herb-salve' | 'trail-cake';
export type Supplies = Readonly<Record<SupplyId, number>>;
export const NO_SUPPLIES: Supplies = { 'smoked-fish': 0, 'smelling-salts': 0, firepot: 0, 'fish-stew': 0, 'herb-salve': 0, 'trail-cake': 0 };

// Supplies are used in battle as a hero's action. Like coins, they are lost on a wipe.
export const SUPPLIES: Record<SupplyId, { name: string; price: number; target: 'ally' | 'fallen' | 'enemy'; power: number; text: string }> = {
  'smoked-fish': { name: 'Smoked fish', price: 3, target: 'ally', power: 10, text: 'One standing ally recovers 10 health.' },
  'smelling-salts': { name: 'Smelling salts', price: 5, target: 'fallen', power: 8, text: 'A fallen ally gets back up with 8 health.' },
  firepot: { name: 'Firepot', price: 4, target: 'enemy', power: 10, text: 'Thrown at one enemy for 10 damage.' },
  // Cooked at a campfire, never sold.
  'fish-stew': { name: 'Fish stew', price: 6, target: 'ally', power: 18, text: 'One standing ally recovers 18 health.' },
  'herb-salve': { name: 'Herb salve', price: 8, target: 'fallen', power: 14, text: 'A fallen ally gets back up with 14 health.' },
  'trail-cake': { name: 'Trail cake', price: 2, target: 'ally', power: 7, text: 'One standing ally recovers 7 health.' },
};
export const SUPPLY_IDS = Object.keys(SUPPLIES) as SupplyId[];

// What a defeated enemy leaves behind.
export const BOUNTY: Record<Encounter, number> = { locust: 4, weevil: 5, acolyte: 10, boar: 30, swarm: 12, warden: 15, leech: 10, hound: 6, pack: 14, wisp: 5, drowned: 12, raider: 8, ghoul: 5, vulture: 0, pair: 14, hyena: 35, inquisitor: 0 };

// Something for sale: a supply, or a one-time deed that sets a story flag.
// A shop can also buy: sellCatch trades every fish in the pack for coins.
// fair: sold at the citizen's price whatever the buyer's brand. gear: a keepsake or grimoire, kept for good once bought.
export type Ware = { supply: SupplyId; fair?: true } | { deed: Flag; name: string; text: string; price: number } | { sellCatch: true } | { gear: Found; price: number };

export function gearName(id: Found): string {
  return id in KEEPSAKES ? KEEPSAKES[id as KeepsakeId].name : BOOKS[id as BookId].name;
}
export function gearText(id: Found): string {
  if (id in KEEPSAKES) { const keepsake = KEEPSAKES[id as KeepsakeId]; return `${keepsake.effect} ${keepsake.drawback}`; }
  const spell = SPELLS[BOOKS[id as BookId].spell];
  return `A grimoire. Teaches ${spell.name}: ${spell.text}`;
}

// Shops overcharge the branded convict: triple the citizen's price, double once the boar is beaten and the town thaws.
export function price(world: World, ware: Ware): number {
  if ('sellCatch' in ware) return catchValue(world.fish);
  if ('deed' in ware || 'gear' in ware) return ware.price;
  // With the reeve's letter of good conduct, the hero pays what a citizen pays.
  if (ware.fair || world.flags.includes('reeve-pardon')) return SUPPLIES[ware.supply].price;
  // Leaning on the stallholder with the bear at your back gets the same as the thaw.
  return SUPPLIES[ware.supply].price * (world.flags.includes('boar-defeated') || world.flags.includes('stall-cowed') ? 2 : 3);
}

export function canBuy(world: World, ware: Ware): boolean {
  if ('sellCatch' in ware) return catchValue(world.fish) > 0;
  if ('deed' in ware && world.flags.includes(ware.deed)) return false;
  if ('gear' in ware && world.found.includes(ware.gear)) return false;
  return world.coins >= price(world, ware);
}

export function buy(world: World, ware: Ware): World {
  if (!canBuy(world, ware)) return world;
  if ('sellCatch' in ware) return { ...world, coins: world.coins + catchValue(world.fish), fish: NO_CATCH };
  const coins = world.coins - price(world, ware);
  if ('deed' in ware) return { ...world, coins, flags: [...world.flags, ware.deed] };
  if ('gear' in ware) return { ...world, coins, found: [...world.found, ware.gear] };
  return { ...world, coins, supplies: { ...world.supplies, [ware.supply]: world.supplies[ware.supply] + 1 } };
}

export function earn(world: World, coins: number): World {
  return { ...world, coins: world.coins + coins };
}
