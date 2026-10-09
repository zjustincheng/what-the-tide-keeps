// Pure fishing rules: a skill check, not a roll. Randomness (bite timing, which fish, where the zone sits)
// is drawn by the caller and passed in, so these rules stay deterministic and testable.

export type FishId = 'minnow' | 'perch' | 'eel' | 'char';
export type SpotId = 'pond' | 'stream' | 'dewpond' | 'fen' | 'weir' | 'tarn';
export type Catch = Readonly<Record<FishId, number>>;
export const NO_CATCH: Catch = { minnow: 0, perch: 0, eel: 0, char: 0 };

// zone: the share of the bar that lands the fish. speed: sweeps of the bar per second.
export const FISH: Record<FishId, { name: string; value: number; zone: number; speed: number }> = {
  minnow: { name: 'Minnow', value: 2, zone: 0.24, speed: 0.8 },
  perch: { name: 'Perch', value: 3, zone: 0.16, speed: 1.1 },
  eel: { name: 'River eel', value: 6, zone: 0.1, speed: 1.5 },
  // Only the cold highland water holds char, and they fight hardest of all.
  char: { name: 'Mountain char', value: 9, zone: 0.08, speed: 1.7 },
};
export const FISH_IDS = Object.keys(FISH) as FishId[];

// The stream runs deeper than the pond, so its fish are bigger and harder to land.
export const SPOTS: Record<SpotId, { name: string; odds: Record<FishId, number> }> = {
  pond: { name: 'The pond', odds: { minnow: 0.6, perch: 0.35, eel: 0.05, char: 0 } },
  stream: { name: 'The mill stream', odds: { minnow: 0.2, perch: 0.5, eel: 0.3, char: 0 } },
  // A dew pond on the downs holds only what someone put in it. The otter's run in the fen is mostly eels.
  dewpond: { name: 'The dew pond', odds: { minnow: 0.55, perch: 0.45, eel: 0, char: 0 } },
  fen: { name: "The otter's run", odds: { minnow: 0.1, perch: 0.25, eel: 0.65, char: 0 } },
  weir: { name: 'The eel weir', odds: { minnow: 0.15, perch: 0.35, eel: 0.5, char: 0 } },
  tarn: { name: 'The hole in the ice', odds: { minnow: 0.1, perch: 0.3, eel: 0, char: 0.6 } },
};

// roll is a number in [0, 1).
export function bite(spot: SpotId, roll: number): FishId {
  let total = 0;
  for (const fish of FISH_IDS) {
    total += SPOTS[spot].odds[fish];
    if (roll < total) return fish;
  }
  return FISH_IDS[FISH_IDS.length - 1];
}

// Where the marker is, from 0 to 1, after some seconds: it sweeps back and forth across the bar.
export function marker(seconds: number, fish: FishId): number {
  const phase = (seconds * FISH[fish].speed) % 2;
  return phase < 1 ? phase : 2 - phase;
}

export function landed(position: number, zoneStart: number, fish: FishId): boolean {
  return position >= zoneStart && position <= zoneStart + FISH[fish].zone;
}

export function addCatch(caught: Catch, fish: FishId): Catch {
  return { ...caught, [fish]: (caught[fish] ?? 0) + 1 };
}

export function catchValue(caught: Catch): number {
  return FISH_IDS.reduce((total, fish) => total + (caught[fish] ?? 0) * FISH[fish].value, 0);
}

// Handing over fish gives up the smallest first.
export function feed(caught: Catch, count: number): Catch {
  const left = { ...caught };
  for (const fish of FISH_IDS) {
    const given = Math.min(left[fish] ?? 0, count);
    if (!given) continue;
    left[fish] -= given; count -= given;
  }
  return left;
}

export function fishCount(caught: Catch): number {
  return FISH_IDS.reduce((total, fish) => total + (caught[fish] ?? 0), 0);
}
