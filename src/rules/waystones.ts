// The old roads: standing stones that remember each other. Woken ones can be travelled between.
import type { Flag, World } from './world';

export type WaystoneId = 'crossroads' | 'millbrook' | 'downs' | 'weir' | 'fort' | 'square';
export const WAYSTONES: Record<WaystoneId, { area: string; name: string; flag: Flag }> = {
  crossroads: { area: 'farmland', name: 'The crossroads', flag: 'way-crossroads' },
  millbrook: { area: 'town', name: 'Millbrook', flag: 'way-millbrook' },
  downs: { area: 'downs', name: 'The downs', flag: 'way-downs' },
  weir: { area: 'weir', name: 'The weir', flag: 'way-weir' },
  fort: { area: 'fort', name: 'The fort town', flag: 'way-fort' },
  square: { area: 'square', name: 'The church square', flag: 'way-square' },
};
export const WAYSTONE_IDS = Object.keys(WAYSTONES) as WaystoneId[];

// The stone in a given area, if there is one.
export function waystoneIn(area: string): WaystoneId | undefined {
  return WAYSTONE_IDS.find(id => WAYSTONES[id].area === area);
}

// Where the hero can go from here: every other stone he has woken.
export function destinations(world: World, from: WaystoneId): WaystoneId[] {
  if (!world.flags.includes('old-roads') || !world.flags.includes(WAYSTONES[from].flag)) return [];
  return WAYSTONE_IDS.filter(id => id !== from && world.flags.includes(WAYSTONES[id].flag));
}
