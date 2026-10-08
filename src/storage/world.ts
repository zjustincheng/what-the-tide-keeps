import { createWorld, FLAGS, ITEMS } from '../rules/world';
import type { Flag, Item, World } from '../rules/world';

const KEY = 'tide-keeps.world.v1';
let session: World | undefined;

function parse(raw: string | null): World | undefined {
  if (raw === null) return undefined;
  const saved: unknown = JSON.parse(raw);
  if (typeof saved !== 'object' || saved === null) return undefined;
  const { flags, carried } = saved as Record<string, unknown>;
  if (!Array.isArray(flags) || !Array.isArray(carried)) return undefined;
  return { flags: FLAGS.filter((flag): flag is Flag => flags.includes(flag)), carried: ITEMS.filter((item): item is Item => carried.includes(item)) };
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
