// Chord voicing shared by every score.
type Chord = readonly [root: number, quality: 'm' | 'M'];
const third = (quality: Chord[1]) => quality === 'm' ? 3 : 4;

// Voice each chord as close as it can sit to the one before, the way players move: the fewest steps, no lurching
// root-position blocks. The first chord sits in root position around the given octave, and the rest stay near it.
export function smooth(progression: readonly Chord[], octave = 12): number[][] {
  let previous: number[] | undefined;
  return progression.map(([root, quality]) => {
    const home = root + octave, tones = [0, third(quality), 7];
    if (!previous) return previous = tones.map(step => home + step);
    let best = previous, cost = Infinity;
    for (let inversion = 0; inversion < 3; inversion++) for (const shift of [-12, 0, 12]) {
      const notes = tones.map((step, index) => home + step + (index < inversion ? 12 : 0) + shift).sort((a, b) => a - b);
      const moved = notes.reduce((sum, midi, index) => sum + Math.abs(midi - previous![index]), 0) + Math.abs(notes[0] - home) * 0.25;
      if (moved < cost) { cost = moved; best = notes; }
    }
    return previous = best;
  });
}
