import { createGear, KEEPSAKE_IDS, MEMBER_IDS, SLOTS } from '../rules/gear';
import type { Gear, KeepsakeId } from '../rules/gear';

const KEY = 'tide-keeps.gear.v1';
let session: Gear | undefined;

function parse(raw: string | null): Gear | undefined {
  if (raw === null) return undefined;
  const saved: unknown = JSON.parse(raw);
  if (typeof saved !== 'object' || saved === null) return undefined;
  const record = saved as Record<string, unknown>;
  return Object.fromEntries(MEMBER_IDS.map(id => {
    const held = Array.isArray(record[id]) ? record[id] as unknown[] : [];
    return [id, held.filter((item): item is KeepsakeId => KEEPSAKE_IDS.includes(item as KeepsakeId)).slice(0, SLOTS)];
  })) as unknown as Gear;
}

export function loadGear(): Gear {
  if (!session) {
    try { session = parse(localStorage.getItem(KEY)); } catch { /* Unavailable or malformed storage must not prevent play. */ }
    session ??= createGear();
  }
  return session;
}

export function saveGear(gear: Gear): boolean {
  session = gear;
  try { localStorage.setItem(KEY, JSON.stringify(gear)); return true; }
  catch { return false; }
}
