// Pure money and supply rules. No Phaser, DOM, or storage.
import type { Encounter } from './battle';
import type { Flag, World } from './world';

export type SupplyId = 'smoked-fish' | 'smelling-salts' | 'firepot';
export type Supplies = Readonly<Record<SupplyId, number>>;
export const NO_SUPPLIES: Supplies = { 'smoked-fish': 0, 'smelling-salts': 0, firepot: 0 };

// Supplies are used in battle as a hero's action. Like coins, they are lost on a wipe.
export const SUPPLIES: Record<SupplyId, { name: string; price: number; target: 'ally' | 'fallen' | 'enemy'; power: number; text: string }> = {
  'smoked-fish': { name: 'Smoked fish', price: 3, target: 'ally', power: 10, text: 'One standing ally recovers 10 health.' },
  'smelling-salts': { name: 'Smelling salts', price: 5, target: 'fallen', power: 8, text: 'A fallen ally gets back up with 8 health.' },
  firepot: { name: 'Firepot', price: 4, target: 'enemy', power: 10, text: 'Thrown at one enemy for 10 damage.' },
};
export const SUPPLY_IDS = Object.keys(SUPPLIES) as SupplyId[];

// What a defeated enemy leaves behind.
export const BOUNTY: Record<Encounter, number> = { locust: 4, weevil: 5, acolyte: 10, boar: 30 };

// Something for sale: a supply, or a one-time deed that sets a story flag.
export type Ware = { supply: SupplyId } | { deed: Flag; name: string; text: string; price: number };

// Shops overcharge the branded convict: triple the citizen's price, double once the boar is beaten and the town thaws.
export function price(world: World, ware: Ware): number {
  if ('deed' in ware) return ware.price;
  return SUPPLIES[ware.supply].price * (world.flags.includes('boar-defeated') ? 2 : 3);
}

export function canBuy(world: World, ware: Ware): boolean {
  if ('deed' in ware && world.flags.includes(ware.deed)) return false;
  return world.coins >= price(world, ware);
}

export function buy(world: World, ware: Ware): World {
  if (!canBuy(world, ware)) return world;
  const coins = world.coins - price(world, ware);
  if ('deed' in ware) return { ...world, coins, flags: [...world.flags, ware.deed] };
  return { ...world, coins, supplies: { ...world.supplies, [ware.supply]: world.supplies[ware.supply] + 1 } };
}

export function earn(world: World, coins: number): World {
  return { ...world, coins: world.coins + coins };
}
