import { KEEPSAKE_IDS } from '../rules/gear';
import { BOOK_IDS } from '../rules/spells';
import { NO_SUPPLIES, SUPPLY_IDS } from '../rules/economy';
import { FISH_IDS, NO_CATCH } from '../rules/fishing';
import { createWorld, FLAGS, ITEMS } from '../rules/world';
import type { Flag, Item, World } from '../rules/world';

const KEY = 'tide-keeps.world.v1';
let session: World | undefined;

function parse(raw: string | null): World | undefined {
  if (raw === null) return undefined;
  const saved: unknown = JSON.parse(raw);
  if (typeof saved !== 'object' || saved === null) return undefined;
  const { flags, carried, found = [], coins = 0, supplies = {}, fish = {} } = saved as Record<string, unknown>;
  if (!Array.isArray(flags) || !Array.isArray(carried) || !Array.isArray(found)) return undefined;
  return {
    flags: FLAGS.filter((flag): flag is Flag => flags.includes(flag)), carried: ITEMS.filter((item): item is Item => carried.includes(item)),
    found: [...KEEPSAKE_IDS, ...BOOK_IDS].filter(id => found.includes(id)),
    coins: typeof coins === 'number' && coins >= 0 ? Math.floor(coins) : 0,
    supplies: Object.fromEntries(SUPPLY_IDS.map(id => {
      const count = (supplies as Record<string, unknown>)?.[id];
      return [id, typeof count === 'number' && count > 0 ? Math.floor(count) : 0];
    })) as typeof NO_SUPPLIES,
    fish: Object.fromEntries(FISH_IDS.map(id => {
      const count = (fish as Record<string, unknown>)?.[id];
      return [id, typeof count === 'number' && count > 0 ? Math.floor(count) : 0];
    })) as typeof NO_CATCH,
  };
}

export function loadWorld(): World {
  if (!session) {
    try { session = parse(localStorage.getItem(KEY)); } catch { /* Unavailable or malformed storage must not prevent play. */ }
    session ??= createWorld();
  }
  return session;
}

export function saveWorld(world: World): boolean {
  session = world;
  try { localStorage.setItem(KEY, JSON.stringify(world)); return true; }
  catch { return false; }
}
