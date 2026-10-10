// Pure story state: what the hero carries and what he has changed. No Phaser, DOM, or storage.
import type { Choice, Conversation, Dialogue } from '../content/dialogue';
import type { MemoryId } from './memory';
import type { KeepsakeId } from './gear';
import type { BookId } from './spells';
import type { MemberId } from './battle';
import { NO_SUPPLIES } from './economy.ts';
import type { Supplies, SupplyId } from './economy';
import { feed, FISH_IDS, NO_CATCH } from './fishing.ts';
import { NO_PANTRY } from './cooking.ts';
import type { Pantry } from './cooking';
import type { WaystoneId } from './waystones';
import type { Catch } from './fishing';

// Carried items are lost on a wipe and go back to where they were found.
export type Item = 'bell' | 'letter' | 'note' | 'crate' | 'ring' | 'shrine-stone' | 'raven-letter' | 'sealed-order' | 'venom-vial';
export type Flag = 'lamb-thanked' | 'hedge-open' | 'boar-defeated' | 'pests-field' | 'pests-yard' | 'writ-given' | 'bear-free' | 'vulture-free'
  | 'sheep-woods' | 'sheep-orchard' | 'sheep-yard' | 'sheep-reward' | 'barrel-bought' | 'squid-freed' | 'swarm-slain' | 'bounty-paid'
  | 'warden-slain' | 'leech-slain'
  | 'followers-spared' | 'followers-reported' | 'followers-paid' | 'fishmonger-angry' | 'stall-cowed' | 'stood-count' | 'inn-room' | 'reeve-pardon'
  | 'hounds-fed' | 'pack-slain' | 'ram-paid' | 'barrow-coins' | 'sluice-open' | 'drowned-slain' | 'otter-trusted' | 'otter-reported' | 'otter-paid'
  | 'vulture-met' | 'anchors-known' | 'letter-delivered' | 'bridge-lowered' | 'pair-slain' | 'hyena-slain' | 'ration-ledger' | 'merchant-thanked'
  | 'ring-1' | 'ring-2' | 'ring-3' | 'ring-champion' | 'shells-won' | 'arm-won' | 'hide-started' | 'hide-1' | 'hide-2' | 'hide-3' | 'hide-found' | 'warder-slain' | 'pens-freed' | 'lord-freed' | 'lord-left' | 'son-freed' | 'flight-slain' | 'cuckoo-slain' | 'cuckoo-challenged' | 'stair-open' | 'lab-remembered' | 'inquisitor-spoke' | 'octopus-letter' | 'duellist-beaten'
  | 'salt-cut' | 'brood-slain' | 'channel-firm' | 'apprentice-slain' | 'frog-free' | 'viper-challenged' | 'viper-slain' | 'newt-freed' | 'manifest-read'
  | 'captain-slain' | 'lantern' | 'letter-left' | 'order-read' | 'hall-key' | 'crab-freed' | 'old-roads' | 'way-crossroads' | 'way-millbrook' | 'way-downs' | 'way-weir' | 'way-fort' | 'way-square' | 'way-wickmere' | 'way-holds'
  | 'brother-freed' | 'warden-bribed' | 'crate-delivered' | 'ring-returned' | 'ladder-down' | 'drove-gate-open' | 'drover-cache'
  | 'burn-order-seen' | 'kid-found' | 'lane-open' | 'boar-challenged' | 'dead-1' | 'dead-2' | 'dead-3' | 'ossuary-key' | 'hyena-challenged';
// Things worth keeping: keepsakes and grimoires. Once found, they are kept through every death; carried items are not.
export type Found = KeepsakeId | BookId;
// Coins and supplies, like carried items, are lost on a wipe.
// Wounds: damage each hero still carries from earlier fights, healed by resting at a campfire or waking in the church.
export type Wounds = Readonly<Partial<Record<MemberId, number>>>;
// Drained: mana each hero has spent and not yet recovered. Like wounds, it lasts until rest.
export type Drained = Readonly<Partial<Record<MemberId, number>>>;
// deaths: how many times the party has fallen since the game began; the church keeps count.
// pantry: herbs, mushrooms, and berries foraged for cooking. Like fish, they are lost on a wipe.
// night: whether it is dark. clock: how far through the day it is, 0 to 1 from dawn (see clock.ts); night follows it.
// The hero chooses when he sleeps whether to wake at dawn or at nightfall.
// tempered: keepsakes the fort's smith has tempered; kept for good, like the keepsakes themselves.
// waiting: companions the player has sent to wait out fights.
export type World = Readonly<{ night?: boolean; clock?: number; waiting?: readonly MemberId[]; tempered?: readonly KeepsakeId[]; flags: readonly Flag[]; carried: readonly Item[]; found: readonly Found[]; coins: number; supplies: Supplies; fish: Catch; wounds: Wounds; drained: Drained; deaths: number; pantry?: Pantry }>;
export const ITEMS: readonly Item[] = ['bell', 'letter', 'note', 'crate', 'ring', 'shrine-stone', 'raven-letter', 'sealed-order', 'venom-vial'];
export const FLAGS: readonly Flag[] = ['lamb-thanked', 'hedge-open', 'boar-defeated', 'pests-field', 'pests-yard', 'writ-given', 'bear-free', 'vulture-free',
  'sheep-woods', 'sheep-orchard', 'sheep-yard', 'sheep-reward', 'barrel-bought', 'squid-freed', 'swarm-slain', 'bounty-paid',
  'warden-slain', 'leech-slain',
  'followers-spared', 'followers-reported', 'followers-paid', 'fishmonger-angry', 'stall-cowed', 'stood-count', 'inn-room', 'reeve-pardon',
  'hounds-fed', 'pack-slain', 'ram-paid', 'barrow-coins', 'sluice-open', 'drowned-slain', 'otter-trusted', 'otter-reported', 'otter-paid',
  'vulture-met', 'anchors-known', 'letter-delivered', 'bridge-lowered', 'pair-slain', 'hyena-slain', 'ration-ledger', 'merchant-thanked',
  'ring-1', 'ring-2', 'ring-3', 'ring-champion', 'shells-won', 'arm-won', 'hide-started', 'hide-1', 'hide-2', 'hide-3', 'hide-found', 'warder-slain', 'pens-freed', 'lord-freed', 'lord-left', 'son-freed', 'flight-slain', 'cuckoo-slain', 'cuckoo-challenged', 'stair-open', 'lab-remembered', 'inquisitor-spoke', 'octopus-letter', 'duellist-beaten',
  'salt-cut', 'brood-slain', 'channel-firm', 'apprentice-slain', 'frog-free', 'viper-challenged', 'viper-slain', 'newt-freed', 'manifest-read', 'captain-slain', 'lantern', 'letter-left', 'order-read', 'hall-key', 'crab-freed', 'old-roads', 'way-crossroads', 'way-millbrook', 'way-downs', 'way-weir', 'way-fort', 'way-square', 'way-wickmere', 'way-holds',
  'brother-freed', 'warden-bribed', 'crate-delivered', 'ring-returned', 'ladder-down', 'drove-gate-open', 'drover-cache',
  'burn-order-seen', 'kid-found', 'lane-open', 'boar-challenged', 'dead-1', 'dead-2', 'dead-3', 'ossuary-key', 'hyena-challenged'];
// A favor spell: a small everyday spell a villager trades for help. It opens the hedge on the border road.
export const BRAMBLES = "Bramble's leave";

// What a line of dialogue can depend on.
export type Context = Readonly<{ world: World; lost: readonly MemoryId[]; studied: readonly string[] }>;
export type Condition = { forgot: MemoryId } | { has: Item } | { flag: Flag } | { knows: string } | { owns: Found } | { not: Condition } | { all: Condition[] } | { any: Condition[] }
  // coins: carrying at least this many.
  | { coins: number }
  // night: true holds after dark, false in daylight.
  | { night: boolean }
  // fish: carrying at least this many fish, of any kind.
  | { fish: number };
// shop names a shop to open once the conversation ends.
// pay spends coins; supply hands over one of a supply.
export type Effect = { give?: Item; take?: Item; set?: Flag | readonly Flag[]; learn?: string; find?: Found; earn?: number; pay?: number; feed?: number; supply?: SupplyId;
  // Handled by the scene, not the story: camp sleeps at the fire, cook opens the cooking, dice starts a game of bones for that stake.
  camp?: true; cook?: true; dice?: number;
  // travel: go to that waystone.
  travel?: WaystoneId; shop?: ShopId; rest?: true;
  // church: go back to the priest, for the next orders. bout: fight that bout in the Talon Ring.
  // shells and arm: play the shell game, or arm-wrestle, for that stake.
  church?: true; bout?: number; shells?: number; arm?: number };
export type ShopId = 'stall' | 'reeve' | 'fishmonger' | 'merchant' | 'fence' | 'apothecary' | 'night-market' | 'smith' | 'herbalist' | 'magpie' | 'smuggler';

export function createWorld(): World {
  return { flags: [], carried: [], found: [], coins: 0, supplies: NO_SUPPLIES, fish: NO_CATCH, wounds: {}, drained: {}, deaths: 0, pantry: NO_PANTRY };
}

export function holds(context: Context, condition: Condition): boolean {
  if ('not' in condition) return !holds(context, condition.not);
  if ('all' in condition) return condition.all.every(each => holds(context, each));
  if ('any' in condition) return condition.any.some(each => holds(context, each));
  if ('coins' in condition) return context.world.coins >= condition.coins;
  if ('night' in condition) return Boolean(context.world.night) === condition.night;
  if ('fish' in condition) return FISH_IDS.reduce((total, fish) => total + (context.world.fish[fish] ?? 0), 0) >= condition.fish;
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
      flags: [...world.flags, ...[effect.set ?? []].flat().filter((flag, i, all) => !world.flags.includes(flag) && all.indexOf(flag) === i)],
      found: effect.find && !world.found.includes(effect.find) ? [...world.found, effect.find] : world.found,
      coins: Math.max(0, world.coins + (effect.earn ?? 0) - (effect.pay ?? 0)),
      supplies: effect.supply ? { ...world.supplies, [effect.supply]: world.supplies[effect.supply] + 1 } : world.supplies, fish: effect.feed ? feed(world.fish, effect.feed) : world.fish, deaths: world.deaths, pantry: world.pantry, night: world.night, clock: world.clock, waiting: world.waiting, tempered: world.tempered, wounds: effect.rest ? {} : world.wounds, drained: effect.rest ? {} : world.drained,
    },
    studied: effect.learn && !studied.includes(effect.learn) ? [...studied, effect.learn] : studied,
  };
}

export { feed } from './fishing.ts';

// Resting at a campfire closes every wound and restores every hero's mana.
export function rest(world: World): World {
  return { ...world, wounds: {}, drained: {} };
}

// The hero sets out alone. Companions join as they are found and freed, in the order of the story.
// Only the bear can be freed so far; the vulture waits in the highlands.
export function roster(world: World): MemberId[] {
  return ['chameleon', ...(world.flags.includes('bear-free') ? ['bear' as const] : []), ...(world.flags.includes('vulture-free') ? ['vulture' as const] : []),
    ...(world.flags.includes('frog-free') ? ['frog' as const] : [])];
}

// Three fight at a time, any three who have joined; the rest wait. If more than three are left fighting, the newest waits too.
// Someone always fights. Against a region's lieutenant the hero always does: it is his story, and he takes the place of the newest.
export const FIGHTERS = 3;
export function lineup(world: World, lieutenant = false): MemberId[] {
  const waiting = world.waiting ?? [];
  const joined = roster(world);
  const chosen = joined.filter(member => !waiting.includes(member)).slice(0, FIGHTERS);
  const fighting = chosen.length ? chosen : ['chameleon' as const];
  if (!lieutenant || fighting.includes('chameleon')) return fighting;
  return ['chameleon', ...fighting.slice(0, FIGHTERS - 1)];
}

// Send someone to wait, or bring them back to fight. Bringing a fourth back sends the newest fighter to wait in their place.
// The last one fighting can't be sent to wait.
export function toggleWaiting(world: World, member: MemberId): World {
  if (!roster(world).includes(member)) return world;
  const waiting = world.waiting ?? [];
  if (!lineup(world).includes(member)) {
    const back = { ...world, waiting: waiting.filter(other => other !== member) };
    const fighting = roster(back).filter(other => !(back.waiting ?? []).includes(other));
    const bumped = fighting.length > FIGHTERS ? fighting.filter(other => other !== member).at(-1) : undefined;
    return bumped ? { ...back, waiting: [...(back.waiting ?? []), bumped] } : back;
  }
  if (lineup(world).length <= 1) return world;
  return { ...world, waiting: [...waiting, member] };
}

// Things carried, coins, supplies, fish, and wounds gathered since the last death are lost on a wipe. Flags, like opened shortcuts, persist.
export function drop(world: World): World {
  // The church sends the party back out whole, and adds a line to the ledger.
  // The church wakes him at dawn.
  return { ...world, carried: [], coins: 0, supplies: NO_SUPPLIES, fish: NO_CATCH, pantry: NO_PANTRY, wounds: {}, drained: {}, deaths: world.deaths + 1, night: false, clock: 0 };
}

// Running from a fight drops half the coins carried, rounded in the enemy's favour.
export function fleeing(world: World): World {
  return { ...world, coins: Math.floor(world.coins / 2) };
}

// The ledger already holds forty-one deaths when the game begins.
export const LEDGER_START = 41;
const ONES = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
export function inWords(n: number): string {
  if (n < 20) return ONES[n] || 'zero';
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? `-${ONES[n % 10]}` : '');
  if (n < 1000) return `${ONES[Math.floor(n / 100)]} hundred${n % 100 ? ` and ${inWords(n % 100)}` : ''}`;
  return String(n);
}

// Lines can mention the death count: {deaths} in words, {Deaths} capitalised.
export function fill(text: string, context: Context): string {
  const words = inWords(LEDGER_START + context.world.deaths);
  return text.replaceAll('{deaths}', words).replaceAll('{Deaths}', words[0].toUpperCase() + words.slice(1));
}

// The world remembers what the hero cannot: what he hears depends on what he has forgotten, carries, and has done.
export function conversation(dialogue: Dialogue, name: string, context: Context): Conversation {
  const { speaker, lines, then, choices, variants = [] } = dialogue[name];
  const variant = variants.find(variant => holds(context, variant.if));
  return variant ? { speaker, lines: variant.lines, then: variant.then, choices: variant.choices } : { speaker, lines, then, choices };
}

// The replies the hero can give right now. What he has forgotten, he cannot say.
export function replies(choices: readonly Choice[] | undefined, context: Context): Choice[] {
  return (choices ?? []).filter(choice => !choice.if || holds(context, choice.if));
}
