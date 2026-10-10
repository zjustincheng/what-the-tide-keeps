import { KEEPSAKE_IDS, MEMBER_IDS } from '../rules/gear';
import { BOOK_IDS } from '../rules/spells';
import { NO_SUPPLIES, SUPPLY_IDS } from '../rules/economy';
import { FISH_IDS, NO_CATCH } from '../rules/fishing';
import { createWorld, FLAGS, ITEMS } from '../rules/world';
import { INGREDIENT_IDS } from '../rules/cooking';
import { NIGHT } from '../rules/clock';
import type { Pantry } from '../rules/cooking';
import type { Flag, Item, World } from '../rules/world';

const KEY = 'tide-keeps.world.v1';
let session: World | undefined;

// A saved count per hero, such as wounds or spent mana, keeping only sensible values.
function perMember(saved: unknown) {
  return Object.fromEntries(MEMBER_IDS.flatMap(id => {
    const value = (saved as Record<string, unknown>)?.[id];
    return typeof value === 'number' && value > 0 ? [[id, Math.floor(value)]] : [];
  }));
}

function parse(raw: string | null): World | undefined {
  if (raw === null) return undefined;
  const saved: unknown = JSON.parse(raw);
  if (typeof saved !== 'object' || saved === null) return undefined;
  const { flags, carried, found = [], coins = 0, supplies = {}, fish = {}, wounds = {}, drained = {}, deaths = 0, pantry = {}, night = false, clock, bench, tempered = [] } = saved as Record<string, unknown>;
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
    wounds: perMember(wounds),
    drained: perMember(drained),
    deaths: typeof deaths === 'number' && deaths >= 0 ? Math.floor(deaths) : 0,
    // Night follows the clock. Older saves only knew day or night: start them at morning or at nightfall.
    night: timed(clock) ? clock >= NIGHT : night === true,
    clock: timed(clock) ? clock : night === true ? NIGHT : 0.1,
    bench: MEMBER_IDS.find(id => id === bench && id !== 'chameleon'),
    tempered: Array.isArray(tempered) ? KEEPSAKE_IDS.filter(id => tempered.includes(id)) : [],
    pantry: Object.fromEntries(INGREDIENT_IDS.map(id => {
      const count = (pantry as Record<string, unknown>)?.[id];
      return [id, typeof count === 'number' && count > 0 ? Math.floor(count) : 0];
    })) as Pantry,
  };
}

export function loadWorld(): World {
  if (!session) {
    try { session = parse(localStorage.getItem(KEY)); } catch { /* Unavailable or malformed storage must not prevent play. */ }
    session ??= createWorld();
  }
  return session;
}

const timed = (clock: unknown): clock is number => typeof clock === 'number' && clock >= 0 && clock < 1;

// The time of day changes every frame, so it is kept in memory and written with the next real save.
// Writing it on its own timer could overwrite a save erased or replaced in the meantime.
export function keepClock(clock: number): void {
  session = { ...loadWorld(), clock };
}

export function saveWorld(world: World): boolean {
  session = world;
  try { localStorage.setItem(KEY, JSON.stringify(world)); return true; }
  catch { return false; }
}
