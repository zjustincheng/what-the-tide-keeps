// Pure story state: what the hero carries and what he has changed. No Phaser, DOM, or storage.
import type { Conversation, Dialogue } from '../content/dialogue';
import type { MemoryId } from './memory';
import type { KeepsakeId } from './gear';
import type { BookId } from './spells';
import type { MemberId } from './battle';
import { NO_SUPPLIES } from './economy.ts';
import type { Supplies } from './economy';
import { NO_CATCH } from './fishing.ts';
import type { Catch } from './fishing';

export type Item = 'bell';
export type Flag = 'lamb-thanked' | 'hedge-open' | 'boar-defeated' | 'pests-field' | 'pests-yard' | 'writ-given' | 'bear-free' | 'vulture-free';
// Things worth keeping: keepsakes and grimoires. Once found, they are kept through every death; carried items are not.
export type Found = KeepsakeId | BookId;
// Coins and supplies, like carried items, are lost on a wipe.
export type World = Readonly<{ flags: readonly Flag[]; carried: readonly Item[]; found: readonly Found[]; coins: number; supplies: Supplies; fish: Catch }>;
export const ITEMS: readonly Item[] = ['bell'];
export const FLAGS: readonly Flag[] = ['lamb-thanked', 'hedge-open', 'boar-defeated', 'pests-field', 'pests-yard', 'writ-given', 'bear-free', 'vulture-free'];
// A favor spell: a small everyday spell a villager trades for help. It opens the hedge on the border road.
export const BRAMBLES = "Bramble's leave";

// What a line of dialogue can depend on.
export type Context = Readonly<{ world: World; lost: readonly MemoryId[]; studied: readonly string[] }>;
export type Condition = { forgot: MemoryId } | { has: Item } | { flag: Flag } | { knows: string } | { owns: Found } | { not: Condition } | { all: Condition[] };
// shop names a shop to open once the conversation ends.
export type Effect = { give?: Item; take?: Item; set?: Flag; learn?: string; find?: Found; earn?: number; shop?: ShopId };
export type ShopId = 'stall' | 'reeve' | 'fishmonger';

export function createWorld(): World {
  return { flags: [], carried: [], found: [], coins: 0, supplies: NO_SUPPLIES, fish: NO_CATCH };
}

export function holds(context: Context, condition: Condition): boolean {
  if ('not' in condition) return !holds(context, condition.not);
  if ('all' in condition) return condition.all.every(each => holds(context, each));
  if ('forgot' in condition) return context.lost.includes(condition.forgot);
  if ('has' in condition) return context.world.carried.includes(condition.has);
  if ('flag' in condition) return context.world.flags.includes(condition.flag);
  if ('owns' in condition) return context.world.found.includes(condition.owns);
  return context.studied.includes(condition.knows);
}

export function apply(context: Context, effect: Effect): Context {
  const { world, studied } = context;
  const carried = world.carried.filter(item => item !== effect.take);
  return {
    ...context,
    world: {
      carried: effect.give && !carried.includes(effect.give) ? [...carried, effect.give] : carried,
      flags: effect.set && !world.flags.includes(effect.set) ? [...world.flags, effect.set] : world.flags,
      found: effect.find && !world.found.includes(effect.find) ? [...world.found, effect.find] : world.found,
      coins: world.coins + (effect.earn ?? 0), supplies: world.supplies, fish: world.fish,
    },
    studied: effect.learn && !studied.includes(effect.learn) ? [...studied, effect.learn] : studied,
  };
}

// The hero sets out alone. Companions join as they are found and freed, in the order of the story.
// Only the bear can be freed so far; the vulture waits in the highlands.
export function roster(world: World): MemberId[] {
  return ['chameleon', ...(world.flags.includes('bear-free') ? ['bear' as const] : []), ...(world.flags.includes('vulture-free') ? ['vulture' as const] : [])];
}

// Things carried, coins, supplies, and fish gathered since the last death are lost on a wipe. Flags, like opened shortcuts, persist.
export function drop(world: World): World {
  return { ...world, carried: [], coins: 0, supplies: NO_SUPPLIES, fish: NO_CATCH };
}

// The world remembers what the hero cannot: what he hears depends on what he has forgotten, carries, and has done.
export function conversation(dialogue: Dialogue, name: string, context: Context): Conversation {
  const { speaker, lines, then, variants = [] } = dialogue[name];
  const variant = variants.find(variant => holds(context, variant.if));
  return variant ? { speaker, lines: variant.lines, then: variant.then } : { speaker, lines, then };
}
