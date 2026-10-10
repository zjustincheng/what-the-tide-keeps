// Original music for the game, written as data: which instrument plays which note on which beat.
// No Web Audio here, so the compositions can be checked without a browser. The sound itself is in music.ts.
import type { Encounter } from '../rules/battle';

export type Voice = 'harp' | 'pluck' | 'flute' | 'strings' | 'staccato' | 'organ' | 'bell' | 'celesta' | 'bass' | 'choir' | 'drum' | 'snare';
export type NoteEvent = Readonly<{ beat: number; voice: Voice; midi: number; beats: number; velocity: number }>;
export type ThemeId = 'church' | 'fields' | 'town' | 'wilds' | 'hearth' | 'battle' | 'boss' | 'wake' | 'highlands' | 'marsh'
  | 'capital' | 'garrison' | 'holds' | 'downs' | 'crypt' | 'shanty' | 'sea' | 'deep' | 'arena';
export type Theme = Readonly<{ name: string; bpm: number; beatsPerBar: number; bars: number; events: readonly NoteEvent[] }>;

type Quality = 'm' | 'M';
type Chord = readonly [root: number, quality: Quality];
// A rest is null. Durations are in beats.
type Line = readonly (readonly [number | null, number])[];

const third = (quality: Quality) => quality === 'm' ? 3 : 4;

// Play a melody line from a starting beat, one note after another.
function line(voice: Voice, notes: Line, velocity: number, start = 0): NoteEvent[] {
  const events: NoteEvent[] = [];
  let beat = start;
  for (const [midi, beats] of notes) {
    if (midi !== null) events.push({ beat, voice, midi, beats, velocity });
    beat += beats;
  }
  return events;
}

// Build something for every bar of a chord progression.
function perBar(progression: readonly Chord[], beatsPerBar: number, build: (chord: Chord, start: number, bar: number) => NoteEvent[]): NoteEvent[] {
  return progression.flatMap((chord, bar) => build(chord, bar * beatsPerBar, bar));
}

// A held chord: root, third, and fifth around the given octave.
function held(voice: Voice, [root, quality]: Chord, start: number, beats: number, velocity: number, octave = 12): NoteEvent[] {
  return [0, third(quality), 7].map(step => ({ beat: start, voice, midi: root + octave + step, beats, velocity }));
}

// An arpeggio of chord steps, evenly spaced.
function arpeggio(voice: Voice, [root, quality]: Chord, start: number, steps: readonly (number | 'third')[], spacing: number, velocity: number, ring: number, octave = 12): NoteEvent[] {
  return steps.map((step, index) => ({ beat: start + index * spacing, voice, midi: root + octave + (step === 'third' ? third(quality) : step), beats: ring, velocity }));
}

// The fields: harp arpeggios and a flute over soft strings, in a slow 3/4. D Dorian, wistful but walking on.
const FIELDS_CHORDS: Chord[] = [[38, 'm'], [38, 'm'], [36, 'M'], [36, 'M'], [34, 'M'], [34, 'M'], [33, 'm'], [33, 'm'], [38, 'm'], [41, 'M'], [36, 'M'], [43, 'M'], [34, 'M'], [36, 'M'], [38, 'm'], [38, 'm']];
const FIELDS_MELODY: Line = [
  [69, 1], [74, 1], [76, 1], [77, 2], [76, 1], [74, 1], [72, 1], [69, 1], [67, 3],
  [65, 1], [69, 1], [74, 1], [72, 2], [70, 1], [69, 2], [72, 1], [76, 3],
  [74, 1], [77, 1], [81, 1], [79, 1.5], [77, 1.5], [76, 1], [74, 1], [72, 1], [71, 2], [74, 1],
  [77, 2], [74, 1], [76, 1], [79, 1], [76, 1], [74, 3], [null, 3],
];

// The church: slow organ and a few bells. A Aeolian, sacred and cold.
const CHURCH_CHORDS: Chord[] = [[45, 'm'], [41, 'M'], [48, 'M'], [43, 'M'], [45, 'm'], [38, 'm'], [40, 'M'], [45, 'm']];
const CHURCH_BELLS: Line = [[76, 2], [null, 2], [72, 2], [69, 2], [67, 3], [null, 1], [71, 2], [67, 2], [69, 2], [72, 2], [74, 2], [77, 2], [76, 4], [null, 4]];

// Millbrook: a plucked folk tune, tired. E minor.
const TOWN_CHORDS: Chord[] = [[40, 'm'], [36, 'M'], [38, 'M'], [40, 'm'], [45, 'm'], [40, 'm'], [35, 'M'], [40, 'm']];
const TOWN_MELODY: Line = [[71, 1], [74, 1], [71, 1], [72, 2], [71, 1], [69, 1], [71, 1], [74, 1], [71, 3], [72, 1], [71, 1], [69, 1], [67, 2], [66, 1], [66, 1], [67, 1], [69, 1], [64, 3]];

// The wilds: the border road, the burned farm. A drone, a distant choir, a harp note now and then.
const WILDS_CHOIR: Line = [[62, 8], [65, 8], [64, 8], [62, 8]];

// The highlands: cold strings, a sparse plucked line, a lonely flute, and a garrison drum far off. G minor.
const HIGHLANDS_CHORDS: Chord[] = [[43, 'm'], [39, 'M'], [46, 'M'], [41, 'M'], [43, 'm'], [36, 'm'], [38, 'M'], [43, 'm']];
const HIGHLANDS_MELODY: Line = [
  [null, 4], [67, 2], [70, 2], [69, 3], [65, 1], [67, 4],
  [74, 2], [72, 1], [70, 1], [69, 3], [66, 1], [67, 2], [62, 2], [67, 4],
];

// The marsh: a low choir, celesta drips that never quite land on the beat, and a harp turning between two chords. B Phrygian, close and wet.
const MARSH_CHORDS: Chord[] = [[35, 'm'], [36, 'M'], [35, 'm'], [33, 'M'], [35, 'm'], [36, 'M'], [31, 'M'], [30, 'M']];
const MARSH_CHOIR: Line = [[59, 8], [60, 8], [62, 8], [59, 8]];
const MARSH_DRIPS: Line = [[null, 1.5], [83, 0.5], [null, 3], [78, 0.5], [null, 2.5], [79, 1], [null, 4.5], [83, 0.5], [null, 1], [81, 0.5], [null, 6],
  [null, 2.5], [78, 0.5], [null, 3], [76, 1], [null, 3.5]];

// The capital: a slow procession on the organ, cold bells over it. D minor, turning to F and back.
const CAPITAL_CHORDS: Chord[] = [[38, 'm'], [34, 'M'], [41, 'M'], [36, 'M'], [38, 'm'], [43, 'm'], [33, 'M'], [38, 'm']];
const CAPITAL_BELLS: Line = [[74, 2], [72, 1], [69, 1], [70, 2], [69, 2], [77, 3], [76, 1], [74, 4], [72, 2], [70, 1], [69, 1], [67, 2], [65, 2], [64, 2], [61, 2], [62, 4]];

// The garrison: a far-off snare, low strings, and a lonely line on the flute like a bugle nobody answers. E minor.
const GARRISON_CHORDS: Chord[] = [[40, 'm'], [40, 'm'], [36, 'M'], [38, 'M'], [40, 'm'], [35, 'M'], [36, 'M'], [35, 'M']];
const GARRISON_BUGLE: Line = [[null, 4], [64, 1], [67, 1], [71, 2], [71, 1.5], [67, 0.5], [64, 2], [null, 4], [66, 1], [69, 1], [71, 2], [74, 3], [71, 1], [null, 2], [64, 2], [66, 1], [67, 1], [66, 2]];

// The holds: a harp turning high and quick, a flute above it, the air thin. F Lydian, in three.
const HOLDS_CHORDS: Chord[] = [[41, 'M'], [43, 'M'], [41, 'M'], [45, 'm'], [41, 'M'], [43, 'M'], [38, 'm'], [36, 'M']];
const HOLDS_FLUTE: Line = [[81, 2], [83, 1], [84, 2], [83, 1], [81, 1], [79, 1], [77, 2], [null, 3], [79, 2], [81, 1], [83, 2], [79, 1], [77, 3], [76, 2]];

// The downs: one flute over a drone, like someone whistling with nobody to hear. A Mixolydian, in three.
const DOWNS_FLUTE: Line = [[69, 2], [71, 1], [73, 2], [74, 1], [76, 3], [74, 1.5], [73, 1.5], [71, 2], [69, 1], [67, 3], [null, 3],
  [71, 2], [73, 1], [76, 2], [79, 1], [78, 1.5], [76, 1.5], [74, 3], [73, 1], [71, 1], [69, 1], [69, 3], [null, 3]];

// The crypt: low choir clusters, a bell tolling slow, and nothing else. C minor, close and still.
const CRYPT_CHOIR: readonly (readonly number[])[] = [[48, 51, 55], [48, 51, 56], [47, 50, 55], [48, 51, 55]];

// Wrecktown: a sea shanty, tired, in a lilting three. D Dorian.
const SHANTY_CHORDS: Chord[] = [[38, 'm'], [38, 'm'], [36, 'M'], [36, 'M'], [38, 'm'], [43, 'M'], [45, 'm'], [38, 'm']];
const SHANTY_TUNE: Line = [[62, 1], [65, 1], [69, 1], [67, 2], [65, 1], [64, 1], [60, 1], [64, 1], [67, 3], [69, 1], [72, 1], [71, 1], [69, 2], [67, 1], [69, 1], [65, 1], [62, 1], [62, 3]];

// The sea: a bass rising and falling like a swell, choir far off, the harp coming down. A Aeolian, slow.
const SEA_CHORDS: Chord[] = [[33, 'm'], [29, 'M'], [36, 'M'], [31, 'M'], [33, 'm'], [26, 'm'], [28, 'M'], [33, 'm']];
const SEA_CHOIR: Line = [[57, 8], [60, 8], [55, 8], [57, 8]];

// The deep: a drone, and celesta notes rising out of the dark like bubbles. B Locrian, wrong on purpose.
const DEEP_BUBBLES: Line = [[null, 2], [83, 0.5], [86, 0.5], [null, 5], [77, 0.5], [80, 0.5], [83, 0.5], [null, 6.5], [86, 1], [null, 3], [74, 0.5], [77, 0.5], [null, 4]];

// The ring: war drums for the crowd, a fanfare on staccato strings. G minor, loud.
const ARENA_CHORDS: Chord[] = [[43, 'm'], [43, 'm'], [39, 'M'], [41, 'M'], [43, 'm'], [38, 'M'], [39, 'M'], [38, 'M']];
const ARENA_FANFARE: Line = [[67, 0.5], [67, 0.5], [70, 1], [74, 2], [72, 0.5], [70, 0.5], [69, 1], [67, 2], [67, 0.5], [70, 0.5], [74, 1], [79, 1.5], [77, 0.5], [75, 2], [74, 0.5], [72, 0.5], [70, 1], [69, 1], [66, 1], [67, 4], [null, 8]];

// Indoors: a music-box lullaby by the hearth. F major.
const HEARTH_CHORDS: Chord[] = [[41, 'M'], [38, 'm'], [34, 'M'], [36, 'M'], [41, 'M'], [45, 'm'], [34, 'M'], [36, 'M']];
const HEARTH_MELODY: Line = [[77, 1], [76, 1], [72, 1], [74, 2], [69, 1], [70, 1], [74, 1], [77, 1], [76, 3], [77, 1], [81, 1], [79, 1], [76, 2], [72, 1], [74, 1], [72, 1], [70, 1], [72, 3]];

// Battle: a driving string ostinato over drums. A minor.
const BATTLE_CHORDS: Chord[] = [[45, 'm'], [45, 'm'], [41, 'M'], [43, 'M'], [45, 'm'], [45, 'm'], [38, 'm'], [40, 'M']];
const BATTLE_LEAD: Line = [
  [76, 1.5], [77, 0.5], [76, 1], [72, 1], [69, 4], [72, 1.5], [74, 0.5], [72, 1], [69, 1], [71, 4],
  [76, 1.5], [77, 0.5], [79, 1], [81, 1], [79, 2], [77, 2], [77, 1.5], [76, 0.5], [74, 1], [72, 1], [71, 2], [68, 2],
];

// Bosses and elites: faster, darker, a flattened second, and a choir over it all. D Phrygian.
const BOSS_CHORDS: Chord[] = [[38, 'm'], [38, 'm'], [39, 'M'], [38, 'm'], [34, 'M'], [43, 'm'], [39, 'M'], [45, 'M']];
const BOSS_CHOIR: Line = [[62, 4], [63, 4], [62, 4], [65, 4], [62, 4], [67, 4], [63, 4], [61, 4]];

// Waking after a wipe: choir and bells hanging in the air, bright and wrong. C Lydian.
const WAKE_CHORDS: readonly (readonly number[])[] = [[60, 64, 66, 71], [62, 66, 69, 73], [64, 67, 71, 74], [62, 66, 69, 72]];
const WAKE_BELLS: Line = [[79, 2], [null, 2], [78, 2], [null, 2], [76, 4], [74, 4]];

export const THEMES: Record<ThemeId, Theme> = {
  fields: { name: 'The fields', bpm: 84, beatsPerBar: 3, bars: 16, events: [
    ...perBar(FIELDS_CHORDS, 3, (chord, start) => [
      ...arpeggio('harp', chord, start, [0, 7, 12, 'third', 12, 7], 0.5, 0.22, 1.5),
      ...held('strings', chord, start, 3, 0.07, 24),
      { beat: start, voice: 'bass', midi: chord[0], beats: 3, velocity: 0.26 },
    ]),
    ...line('flute', FIELDS_MELODY, 0.2),
  ] },
  church: { name: 'The church', bpm: 54, beatsPerBar: 4, bars: 8, events: [
    ...perBar(CHURCH_CHORDS, 4, (chord, start) => [...held('organ', chord, start, 4, 0.1, 12), { beat: start, voice: 'organ', midi: chord[0], beats: 4, velocity: 0.12 }]),
    ...line('bell', CHURCH_BELLS, 0.16),
  ] },
  town: { name: 'Millbrook', bpm: 92, beatsPerBar: 3, bars: 8, events: [
    ...perBar(TOWN_CHORDS, 3, (chord, start) => [
      ...arpeggio('pluck', chord, start, [0, 7, 12, 7, 'third', 7], 0.5, 0.18, 0.5, 24),
      { beat: start, voice: 'bass', midi: chord[0], beats: 3, velocity: 0.22 },
    ]),
    ...line('flute', TOWN_MELODY, 0.17),
  ] },
  wilds: { name: 'The wilds', bpm: 58, beatsPerBar: 4, bars: 8, events: [
    ...perBar(Array.from({ length: 8 }, () => [38, 'm'] as Chord), 4, ([root], start, bar) => [
      { beat: start, voice: 'bass', midi: root, beats: 4, velocity: 0.2 },
      { beat: start, voice: 'strings', midi: root + 12, beats: 4, velocity: 0.06 },
      { beat: start, voice: 'strings', midi: root + 19, beats: 4, velocity: 0.05 },
      ...(bar % 2 === 1 ? [{ beat: start, voice: 'drum' as const, midi: 36, beats: 1, velocity: 0.14 }] : []),
      ...(bar % 2 === 0 ? [{ beat: start + 2, voice: 'harp' as const, midi: [81, 77, 76, 74][bar / 2], beats: 3, velocity: 0.16 }] : []),
    ]),
    ...line('choir', WILDS_CHOIR, 0.11),
  ] },
  highlands: { name: 'The highlands', bpm: 60, beatsPerBar: 4, bars: 8, events: [
    ...perBar(HIGHLANDS_CHORDS, 4, (chord, start, bar) => [
      ...held('strings', chord, start, 4, 0.06, 12),
      { beat: start, voice: 'bass', midi: chord[0], beats: 4, velocity: 0.22 },
      ...arpeggio('pluck', chord, start + 1, [0, 7, 'third'], 1, 0.12, 0.9, 24),
      ...(bar % 2 === 1 ? [{ beat: start, voice: 'drum' as const, midi: 36, beats: 1, velocity: 0.12 }, { beat: start + 0.5, voice: 'drum' as const, midi: 36, beats: 1, velocity: 0.08 }] : []),
    ]),
    ...line('flute', HIGHLANDS_MELODY, 0.16),
  ] },
  marsh: { name: 'The marsh', bpm: 54, beatsPerBar: 4, bars: 8, events: [
    ...perBar(MARSH_CHORDS, 4, (chord, start) => [
      { beat: start, voice: 'bass', midi: chord[0], beats: 4, velocity: 0.18 },
      ...held('strings', chord, start, 4, 0.045, 12),
      ...arpeggio('harp', chord, start + 0.5, [0, 'third', 7], 1.25, 0.1, 2, 24),
    ]),
    ...line('choir', MARSH_CHOIR, 0.09),
    ...line('celesta', MARSH_DRIPS, 0.1),
  ] },
  capital: { name: 'The capital', bpm: 62, beatsPerBar: 4, bars: 8, events: [
    ...perBar(CAPITAL_CHORDS, 4, (chord, start) => [
      ...held('organ', chord, start, 4, 0.07, 12),
      { beat: start, voice: 'bass', midi: chord[0], beats: 4, velocity: 0.2 },
      { beat: start + 2, voice: 'bass', midi: chord[0] + 7, beats: 2, velocity: 0.12 },
    ]),
    ...line('bell', CAPITAL_BELLS, 0.12),
  ] },
  garrison: { name: 'The garrison', bpm: 74, beatsPerBar: 4, bars: 8, events: [
    ...perBar(GARRISON_CHORDS, 4, (chord, start, bar) => [
      ...held('strings', chord, start, 4, 0.06, 12),
      { beat: start, voice: 'bass', midi: chord[0], beats: 2, velocity: 0.2 }, { beat: start + 2, voice: 'bass', midi: chord[0], beats: 2, velocity: 0.16 },
      ...[0, 0.75, 1, 2, 2.75, 3].map(offset => ({ beat: start + offset, voice: 'snare' as const, midi: 60, beats: 0.2, velocity: bar % 2 ? 0.07 : 0.1 })),
    ]),
    ...line('flute', GARRISON_BUGLE, 0.15),
  ] },
  holds: { name: 'The mountain holds', bpm: 76, beatsPerBar: 3, bars: 8, events: [
    ...perBar(HOLDS_CHORDS, 3, (chord, start) => [
      ...arpeggio('harp', chord, start, [0, 7, 12, 'third', 12, 7], 0.5, 0.13, 1.2, 24),
      ...held('strings', chord, start, 3, 0.04, 24),
      { beat: start, voice: 'bass', midi: chord[0] + 12, beats: 3, velocity: 0.12 },
    ]),
    ...line('flute', HOLDS_FLUTE, 0.14),
  ] },
  downs: { name: 'The downs', bpm: 84, beatsPerBar: 3, bars: 16, events: [
    ...Array.from({ length: 16 }, (_, bar) => [
      { beat: bar * 3, voice: 'bass' as const, midi: 33, beats: 3, velocity: 0.16 },
      { beat: bar * 3, voice: 'strings' as const, midi: 52, beats: 3, velocity: 0.05 },
      ...(bar % 4 === 3 ? [{ beat: bar * 3 + 1, voice: 'harp' as const, midi: 76, beats: 2, velocity: 0.08 }] : []),
    ]).flat(),
    ...line('flute', DOWNS_FLUTE, 0.15),
  ] },
  crypt: { name: 'Under the ground', bpm: 42, beatsPerBar: 4, bars: 4, events: [
    ...CRYPT_CHOIR.flatMap((notes, bar) => [
      ...notes.map(midi => ({ beat: bar * 4, voice: 'choir' as const, midi, beats: 4, velocity: 0.08 })),
      { beat: bar * 4, voice: 'bass' as const, midi: 36, beats: 4, velocity: 0.16 },
      ...(bar % 2 === 0 ? [{ beat: bar * 4 + 2, voice: 'bell' as const, midi: 60, beats: 2, velocity: 0.09 }] : []),
    ]),
  ] },
  shanty: { name: 'Wrecktown', bpm: 96, beatsPerBar: 3, bars: 8, events: [
    ...perBar(SHANTY_CHORDS, 3, (chord, start) => [
      { beat: start, voice: 'bass', midi: chord[0], beats: 1, velocity: 0.2 },
      ...[1, 2].map(offset => ({ beat: start + offset, voice: 'pluck' as const, midi: chord[0] + 12 + third(chord[1]), beats: 0.8, velocity: 0.08 })),
      { beat: start, voice: 'drum', midi: 36, beats: 0.5, velocity: 0.12 },
    ]),
    ...line('pluck', SHANTY_TUNE, 0.15, 0),
  ] },
  sea: { name: 'The sea', bpm: 50, beatsPerBar: 4, bars: 8, events: [
    ...perBar(SEA_CHORDS, 4, (chord, start) => [
      { beat: start, voice: 'bass', midi: chord[0], beats: 2, velocity: 0.18 }, { beat: start + 2, voice: 'bass', midi: chord[0] + 7, beats: 2, velocity: 0.12 },
      ...arpeggio('harp', chord, start, [24, 19, 'third', 12, 7], 0.75, 0.08, 2, 12),
      ...held('strings', chord, start, 4, 0.04, 12),
    ]),
    ...line('choir', SEA_CHOIR, 0.1),
  ] },
  deep: { name: 'The deep', bpm: 46, beatsPerBar: 4, bars: 8, events: [
    ...Array.from({ length: 8 }, (_, bar) => [
      { beat: bar * 4, voice: 'bass' as const, midi: 35, beats: 4, velocity: 0.18 },
      { beat: bar * 4, voice: 'choir' as const, midi: bar % 2 ? 53 : 50, beats: 4, velocity: 0.07 },
    ]).flat(),
    ...line('celesta', DEEP_BUBBLES, 0.1),
  ] },
  arena: { name: 'The Talon Ring', bpm: 116, beatsPerBar: 4, bars: 8, events: [
    ...perBar(ARENA_CHORDS, 4, (chord, start) => [
      ...[0, 1, 1.5, 2, 3, 3.5].map(offset => ({ beat: start + offset, voice: 'drum' as const, midi: 36, beats: 0.5, velocity: 0.3 })),
      ...[1, 3].map(offset => ({ beat: start + offset, voice: 'snare' as const, midi: 60, beats: 0.25, velocity: 0.16 })),
      { beat: start, voice: 'bass', midi: chord[0], beats: 4, velocity: 0.2 },
      ...held('strings', chord, start, 4, 0.05, 12),
    ]),
    ...line('staccato', ARENA_FANFARE, 0.14),
  ] },
  hearth: { name: 'By the hearth', bpm: 70, beatsPerBar: 3, bars: 8, events: [
    ...perBar(HEARTH_CHORDS, 3, (chord, start) => [...held('strings', chord, start, 3, 0.05, 24), { beat: start, voice: 'bass', midi: chord[0] + 12, beats: 3, velocity: 0.12 }]),
    ...line('celesta', HEARTH_MELODY, 0.16),
  ] },
  battle: { name: 'Battle', bpm: 132, beatsPerBar: 4, bars: 8, events: [
    ...perBar(BATTLE_CHORDS, 4, (chord, start) => [
      ...arpeggio('staccato', chord, start, [0, 0, 12, 0, 7, 0, 12, 7], 0.5, 0.14, 0.45, 12),
      ...[0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5].map(offset => ({ beat: start + offset, voice: 'bass' as const, midi: chord[0], beats: 0.45, velocity: 0.2 })),
      ...held('strings', chord, start, 4, 0.05, 24),
      ...[0, 1.5, 2].map(offset => ({ beat: start + offset, voice: 'drum' as const, midi: 36, beats: 0.5, velocity: 0.32 })),
      ...[1, 3].map(offset => ({ beat: start + offset, voice: 'snare' as const, midi: 60, beats: 0.25, velocity: 0.18 })),
    ]),
    ...line('strings', BATTLE_LEAD, 0.13),
  ] },
  boss: { name: 'A stronger foe', bpm: 144, beatsPerBar: 4, bars: 8, events: [
    ...perBar(BOSS_CHORDS, 4, (chord, start) => [
      ...[0, 0, 1, 0, 12, 0, 1, 0].map((step, index) => ({ beat: start + index * 0.5, voice: 'staccato' as const, midi: 50 + step, beats: 0.4, velocity: 0.15 })),
      ...[0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5].map(offset => ({ beat: start + offset, voice: 'bass' as const, midi: chord[0], beats: 0.4, velocity: 0.22 })),
      ...held('strings', chord, start, 4, 0.05, 24),
      ...[0, 0.75, 2, 2.5].map(offset => ({ beat: start + offset, voice: 'drum' as const, midi: 36, beats: 0.5, velocity: 0.36 })),
      ...[1, 3].map(offset => ({ beat: start + offset, voice: 'snare' as const, midi: 60, beats: 0.25, velocity: 0.2 })),
    ]),
    ...line('choir', BOSS_CHOIR, 0.12),
  ] },
  wake: { name: 'Waking', bpm: 48, beatsPerBar: 4, bars: 4, events: [
    ...WAKE_CHORDS.flatMap((notes, bar) => [
      ...notes.map(midi => ({ beat: bar * 4, voice: 'choir' as const, midi, beats: 4, velocity: 0.07 })),
      { beat: bar * 4, voice: 'bass' as const, midi: 36, beats: 4, velocity: 0.14 },
    ]),
    ...line('bell', WAKE_BELLS, 0.13),
  ] },
};
export const THEME_IDS = Object.keys(THEMES) as ThemeId[];

// Elites and bosses get the darker battle music.
const BOSSES: readonly Encounter[] = ['boar', 'warden', 'leech', 'swarm', 'pack', 'drowned', 'vulture', 'pair', 'hyena', 'inquisitor', 'captain', 'brood', 'apprentice', 'viper', 'duellist', 'cuckoo', 'keeper'];
export function battleTheme(encounter: Encounter): ThemeId {
  return BOSSES.includes(encounter) ? 'boss' : 'battle';
}

export const loopBeats = (theme: Theme) => theme.bars * theme.beatsPerBar;
export const frequency = (midi: number) => 440 * 2 ** ((midi - 69) / 12);
