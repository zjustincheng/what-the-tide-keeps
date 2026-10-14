// Original music for the game, written as data: which instrument plays which note on which beat.
// No Web Audio here, so the compositions can be checked without a browser. The sound itself is in music.ts.
import type { Encounter } from '../rules/battle';
import { BOSS_MUSIC, BOSS_THEMES } from './bossThemes.ts';
import type { BossThemeId } from './bossThemes.ts';
import { smooth } from './voicing.ts';

export type Voice = 'harp' | 'pluck' | 'flute' | 'brass' | 'strings' | 'staccato' | 'organ' | 'bell' | 'celesta' | 'bass' | 'choir' | 'drum' | 'snare';
export type NoteEvent = Readonly<{ beat: number; voice: Voice; midi: number; beats: number; velocity: number }>;
export type ThemeId = 'church' | 'fields' | 'town' | 'wilds' | 'hearth' | 'battle' | 'kraken' | 'wake' | 'highlands' | 'marsh'
  | 'capital' | 'garrison' | 'holds' | 'downs' | 'crypt' | 'shanty' | 'sea' | 'deep' | 'arena' | BossThemeId;
export type Theme = Readonly<{ name: string; bpm: number; beatsPerBar: number; bars: number; events: readonly NoteEvent[] }>;

type Quality = 'm' | 'M';
type Chord = readonly [root: number, quality: Quality];
// A rest is null. Durations are in beats.
type Line = readonly (readonly [number | null, number])[];

const third = (quality: Quality) => quality === 'm' ? 3 : 4;

// Play a melody line from a starting beat, one note after another.
function line(voice: Voice, notes: Line, velocity: number, start = 0, transpose = 0): NoteEvent[] {
  const events: NoteEvent[] = [];
  let beat = start;
  for (const [midi, beats] of notes) {
    if (midi !== null) events.push({ beat, voice, midi: midi + transpose, beats, velocity });
    beat += beats;
  }
  return events;
}

// A tune written the way it reads: 'A4:1 D5:1 | F5:2 -:1', a note (or - for a rest) and its beats.
// Bars are split by |, and each bar has to add up to the metre, so a miscounted bar fails at once.
const STEPS: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
function tune(text: string, beatsPerBar: number): Line {
  const bars = text.split('|').map(bar => bar.trim().split(/\s+/).map(token => {
    const [name, length] = token.split(':');
    const beats = Number(length);
    if (name === '-') return [null, beats] as const;
    const match = /^([A-G])([#b]?)(\d)$/.exec(name);
    if (!match || !(beats > 0)) throw new Error(`can't read ${token}`);
    return [12 * (Number(match[3]) + 1) + STEPS[match[1]] + (match[2] === '#' ? 1 : match[2] === 'b' ? -1 : 0), beats] as const;
  }));
  bars.forEach((bar, index) => {
    const total = bar.reduce((sum, [, beats]) => sum + beats, 0);
    if (Math.abs(total - beatsPerBar) > 1e-9) throw new Error(`bar ${index + 1} of '${text}' has ${total} beats`);
  });
  return bars.flat();
}

// Build something for every bar of a chord progression.
function perBar(progression: readonly Chord[], beatsPerBar: number, build: (chord: Chord, start: number, bar: number) => NoteEvent[]): NoteEvent[] {
  return progression.flatMap((chord, bar) => build(chord, bar * beatsPerBar, bar));
}

// Held chords, one a bar, voice-led.
function pad(voice: Voice, progression: readonly Chord[], beatsPerBar: number, velocity: number, octave = 12, beats = beatsPerBar): NoteEvent[] {
  return smooth(progression, octave).flatMap((notes, bar) => notes.map(midi => ({ beat: bar * beatsPerBar, voice, midi, beats, velocity })));
}

// An arpeggio of chord steps, evenly spaced. Notes ring, but stop where the arpeggio ends (or at until),
// so they don't hang on over the next chord.
function arpeggio(voice: Voice, [root, quality]: Chord, start: number, steps: readonly (number | 'third')[], spacing: number, velocity: number, ring: number, octave = 12, until = start + steps.length * spacing): NoteEvent[] {
  return steps.map((step, index) => {
    const beat = start + index * spacing;
    return { beat, voice, midi: root + octave + (step === 'third' ? third(quality) : step), beats: Math.min(ring, until - beat), velocity };
  });
}

// A section of a longer piece, and a piece made of sections played end to end. Nothing in a section may
// sound past its end, so sections join cleanly and the whole loops without a seam.
type Part = Readonly<{ bars: number; events: readonly NoteEvent[] }>;
function part(beatsPerBar: number, bars: number, ...layers: readonly NoteEvent[][]): Part {
  const events = layers.flat();
  for (const event of events) {
    if (event.beat + event.beats > bars * beatsPerBar + 1e-9) throw new Error(`a note at beat ${event.beat} runs past its ${bars}-bar section`);
  }
  return { bars, events };
}
function suite(beatsPerBar: number, ...parts: Part[]): { bars: number; events: NoteEvent[] } {
  let bars = 0;
  const events: NoteEvent[] = [];
  for (const piece of parts) {
    for (const event of piece.events) events.push({ ...event, beat: event.beat + bars * beatsPerBar });
    bars += piece.bars;
  }
  return { bars, events };
}

// Each place's theme is a short suite: its first melody, a second section that goes somewhere else, and a
// stretch where the tune rests and only the ground of it plays, so a long walk doesn't hear one phrase on repeat.

// The fields: harp arpeggios and a flute over soft strings, in a slow 3/4. D Dorian, wistful but walking on.
// The middle goes to the relative major, and the strings take the tune; on the way back a celesta joins the flute.
const FIELDS_CHORDS: Chord[] = [[38, 'm'], [38, 'm'], [36, 'M'], [36, 'M'], [34, 'M'], [34, 'M'], [33, 'm'], [33, 'm'], [38, 'm'], [41, 'M'], [36, 'M'], [43, 'M'], [34, 'M'], [36, 'M'], [38, 'm'], [38, 'm']];
const FIELDS_MELODY: Line = [
  [69, 1], [74, 1], [76, 1], [77, 2], [76, 1], [74, 1], [72, 1], [69, 1], [67, 3],
  [65, 1], [69, 1], [74, 1], [72, 2], [70, 1], [69, 2], [72, 1], [76, 3],
  [74, 1], [77, 1], [81, 1], [79, 1.5], [77, 1.5], [76, 1], [74, 1], [72, 1], [71, 2], [74, 1],
  [77, 2], [74, 1], [76, 1], [79, 1], [76, 1], [74, 3], [null, 3],
];
const FIELDS_SECOND: Chord[] = [[34, 'M'], [41, 'M'], [43, 'm'], [38, 'm'], [34, 'M'], [36, 'M'], [33, 'M'], [33, 'M']];
const FIELDS_SECOND_TUNE = tune('D5:2 F5:1 | C5:3 | Bb4:2 D5:1 | A4:3 | G4:1 A4:1 Bb4:1 | C5:2 E5:1 | E5:2 C#5:1 | A4:3', 3);
const FIELDS_REST: Chord[] = [[38, 'm'], [36, 'M'], [34, 'M'], [33, 'M']];
const fieldsGround = (chords: readonly Chord[]) => [
  ...perBar(chords, 3, (chord, start) => [
    ...arpeggio('harp', chord, start, [0, 7, 12, 'third', 12, 7], 0.5, 0.22, 1.5),
    { beat: start, voice: 'bass', midi: chord[0], beats: 3, velocity: 0.26 },
  ]),
  ...pad('strings', chords, 3, 0.07, 24),
];

// The church: slow organ and a few bells. A Aeolian, sacred and cold. Then a choir, low, as if from the next room,
// and the organ alone.
const CHURCH_CHORDS: Chord[] = [[45, 'm'], [41, 'M'], [48, 'M'], [43, 'M'], [45, 'm'], [38, 'm'], [40, 'M'], [45, 'm']];
const CHURCH_BELLS: Line = [[76, 2], [null, 2], [72, 2], [69, 2], [67, 3], [null, 1], [71, 2], [67, 2], [69, 2], [72, 2], [74, 2], [77, 2], [76, 4], [null, 4]];
const CHURCH_SECOND: Chord[] = [[41, 'M'], [36, 'M'], [38, 'm'], [45, 'm'], [46, 'M'], [41, 'M'], [40, 'M'], [40, 'M']];
const CHURCH_CHOIR = tune('A4:4 | G4:4 | F4:2 A4:2 | E4:4 | F4:3 D4:1 | C4:4 | B3:2 D4:2 | E4:4', 4);
const CHURCH_REST: Chord[] = [[45, 'm'], [41, 'M'], [38, 'm'], [40, 'M']];
const organ = (chords: readonly Chord[]) => [
  ...pad('organ', chords, 4, 0.1),
  ...perBar(chords, 4, (chord, start) => [{ beat: start, voice: 'organ', midi: chord[0], beats: 4, velocity: 0.12 }]),
];

// Millbrook: a plucked folk tune, tired. E minor. A second verse in G, a little brighter, as the market fills;
// then the first tune again, low on the strings, and the plucking on its own.
const TOWN_CHORDS: Chord[] = [[40, 'm'], [36, 'M'], [38, 'M'], [40, 'm'], [45, 'm'], [40, 'm'], [35, 'M'], [40, 'm']];
const TOWN_MELODY: Line = [[71, 1], [74, 1], [71, 1], [72, 2], [71, 1], [69, 1], [71, 1], [74, 1], [71, 3], [72, 1], [71, 1], [69, 1], [67, 2], [66, 1], [66, 1], [67, 1], [69, 1], [64, 3]];
const TOWN_SECOND: Chord[] = [[43, 'M'], [38, 'M'], [40, 'm'], [36, 'M'], [43, 'M'], [38, 'M'], [36, 'M'], [35, 'M']];
const TOWN_SECOND_TUNE = tune('B4:1 D5:1 G5:1 | F#5:2 E5:1 | D5:1 B4:2 | C5:1 E5:1 G5:1 | G5:1.5 F#5:0.5 E5:1 | D5:1 A4:2 | G4:1 A4:1 C5:1 | B4:3', 3);
const TOWN_REST: Chord[] = [[40, 'm'], [36, 'M'], [45, 'm'], [35, 'M']];
const townGround = (chords: readonly Chord[]) => perBar(chords, 3, (chord, start) => [
  ...arpeggio('pluck', chord, start, [0, 7, 12, 7, 'third', 7], 0.5, 0.18, 0.5, 24),
  { beat: start, voice: 'bass', midi: chord[0], beats: 3, velocity: 0.22 },
]);

// The wilds: the border road, the burned farm. A drone, a distant choir, a harp note now and then.
// The second time round the choir sinks lower and a flute is heard once, far off; then only the drone.
const WILDS_CHOIR: Line = [[62, 8], [65, 8], [64, 8], [62, 8]];
const WILDS_LOWER = tune('A3:4 | A3:4 | G3:4 | G3:4 | F3:4 | F3:4 | E3:4 | E3:4', 4);
const WILDS_CALL = tune('F5:2 E5:1 D5:1 | A4:4', 4);
const drone = (bars: number, harp: readonly number[] = [], drums = true) => Array.from({ length: bars }, (_, bar) => [
  { beat: bar * 4, voice: 'bass' as const, midi: 38, beats: 4, velocity: 0.2 },
  { beat: bar * 4, voice: 'strings' as const, midi: 50, beats: 4, velocity: 0.06 },
  { beat: bar * 4, voice: 'strings' as const, midi: 57, beats: 4, velocity: 0.05 },
  ...(drums && bar % 2 === 1 ? [{ beat: bar * 4, voice: 'drum' as const, midi: 36, beats: 1, velocity: 0.14 }] : []),
  ...(bar % 2 === 0 && harp[bar / 2] ? [{ beat: bar * 4 + 2, voice: 'harp' as const, midi: harp[bar / 2], beats: 2, velocity: 0.16 }] : []),
]).flat();

// The highlands: cold strings, a sparse plucked line, a lonely flute, and a garrison drum far off. G minor.
// The middle climbs into E flat on the strings; on the way back the flute waits half the verse before it comes in.
const HIGHLANDS_CHORDS: Chord[] = [[43, 'm'], [39, 'M'], [46, 'M'], [41, 'M'], [43, 'm'], [36, 'm'], [38, 'M'], [43, 'm']];
const HIGHLANDS_MELODY: Line = [
  [null, 4], [67, 2], [70, 2], [69, 3], [65, 1], [67, 4],
  [74, 2], [72, 1], [70, 1], [69, 3], [66, 1], [67, 2], [62, 2], [67, 4],
];
const HIGHLANDS_SECOND: Chord[] = [[39, 'M'], [46, 'M'], [36, 'm'], [43, 'm'], [39, 'M'], [41, 'M'], [38, 'M'], [38, 'M']];
const HIGHLANDS_SECOND_TUNE = tune('G4:3 Bb4:1 | D5:2 C5:1 Bb4:1 | C5:2 Eb5:2 | D5:4 | Eb5:2 D5:1 C5:1 | C5:2 A4:2 | F#4:2 A4:2 | D4:4', 4);
const highlandsGround = (chords: readonly Chord[]) => [
  ...pad('strings', chords, 4, 0.06),
  ...perBar(chords, 4, (chord, start, bar) => [
    { beat: start, voice: 'bass', midi: chord[0], beats: 4, velocity: 0.22 },
    ...arpeggio('pluck', chord, start + 1, [0, 7, 'third'], 1, 0.12, 0.9, 24),
    ...(bar % 2 === 1 ? [{ beat: start, voice: 'drum' as const, midi: 36, beats: 1, velocity: 0.12 }, { beat: start + 0.5, voice: 'drum' as const, midi: 36, beats: 1, velocity: 0.08 }] : []),
  ]),
];

// The marsh: a low choir, celesta drips that never quite land on the beat, and a harp turning between two chords.
// B Phrygian, close and wet. The choir follows the chords bar by bar; in the middle the strings take a slow low line.
const MARSH_CHORDS: Chord[] = [[35, 'm'], [36, 'M'], [35, 'm'], [33, 'M'], [35, 'm'], [36, 'M'], [31, 'M'], [30, 'M']];
const MARSH_CHOIR = tune('B3:4 | C4:4 | D4:4 | C#4:4 | D4:4 | E4:4 | D4:4 | C#4:4', 4);
const MARSH_DRIPS: Line = [[null, 1.5], [83, 0.5], [null, 3], [78, 0.5], [null, 2.5], [79, 1], [null, 4.5], [83, 0.5], [null, 1], [81, 0.5], [null, 6],
  [null, 2.5], [78, 0.5], [null, 3], [76, 1], [null, 3.5]];
const MARSH_SECOND: Chord[] = [[40, 'm'], [36, 'M'], [40, 'm'], [38, 'M'], [36, 'M'], [35, 'm'], [31, 'M'], [30, 'M']];
const MARSH_SECOND_TUNE = tune('G4:4 | G4:2 E4:2 | E4:3 G4:1 | F#4:4 | E4:2 G4:2 | F#4:4 | D4:2 B3:2 | C#4:2 A#3:2', 4);
const marshGround = (chords: readonly Chord[]) => [
  ...pad('strings', chords, 4, 0.045),
  ...perBar(chords, 4, (chord, start) => [
    { beat: start, voice: 'bass', midi: chord[0], beats: 4, velocity: 0.18 },
    ...arpeggio('harp', chord, start + 0.5, [0, 'third', 7], 1.25, 0.1, 2, 24, start + 4),
  ]),
  ...line('celesta', MARSH_DRIPS, 0.1),
];

// The capital: a slow procession on the organ, cold bells over it. D minor, turning to F and back.
// Then the strings walk the procession in B flat, and the organ is left on its own.
const CAPITAL_CHORDS: Chord[] = [[38, 'm'], [34, 'M'], [41, 'M'], [36, 'M'], [38, 'm'], [43, 'm'], [33, 'M'], [38, 'm']];
const CAPITAL_BELLS: Line = [[74, 2], [72, 1], [69, 1], [70, 2], [69, 2], [77, 3], [76, 1], [74, 4], [72, 2], [70, 1], [69, 1], [67, 2], [65, 2], [64, 2], [61, 2], [62, 4]];
const CAPITAL_SECOND: Chord[] = [[34, 'M'], [41, 'M'], [43, 'm'], [38, 'm'], [34, 'M'], [36, 'M'], [33, 'M'], [33, 'M']];
const CAPITAL_SECOND_TUNE = tune('F4:2 D4:2 | C4:2 F4:1 A4:1 | Bb4:3 A4:1 | A4:2 F4:2 | D5:2 Bb4:2 | C5:2 G4:2 | A4:2 C#5:2 | A4:4', 4);
const CAPITAL_REST: Chord[] = [[38, 'm'], [34, 'M'], [43, 'm'], [33, 'M']];
const procession = (chords: readonly Chord[]) => [
  ...pad('organ', chords, 4, 0.07),
  ...perBar(chords, 4, (chord, start) => [
    { beat: start, voice: 'bass', midi: chord[0], beats: 4, velocity: 0.2 },
    { beat: start + 2, voice: 'bass', midi: chord[0] + 7, beats: 2, velocity: 0.12 },
  ]),
];

// The garrison: a far-off snare, low strings, and a lonely line on the flute like a bugle nobody answers. E minor.
// A second call, higher, that turns back on itself; then only the drum.
const GARRISON_CHORDS: Chord[] = [[40, 'm'], [40, 'm'], [36, 'M'], [38, 'M'], [40, 'm'], [35, 'M'], [36, 'M'], [35, 'M']];
const GARRISON_BUGLE: Line = [[null, 4], [64, 1], [67, 1], [71, 2], [71, 1.5], [67, 0.5], [64, 2], [null, 4], [66, 1], [69, 1], [71, 2], [74, 3], [71, 1], [null, 2], [64, 2], [66, 1], [67, 1], [66, 2]];
const GARRISON_SECOND: Chord[] = [[36, 'M'], [43, 'M'], [38, 'M'], [40, 'm'], [36, 'M'], [38, 'M'], [35, 'M'], [35, 'M']];
const GARRISON_SECOND_CALL = tune('E5:2 G5:2 | D5:3 B4:1 | A4:2 D5:2 | B4:4 | C5:1 E5:1 G5:2 | F#5:2 D5:2 | D#5:2 B4:2 | F#4:4', 4);
const GARRISON_REST: Chord[] = [[40, 'm'], [36, 'M'], [45, 'm'], [35, 'M']];
const garrisonGround = (chords: readonly Chord[]) => [
  ...pad('strings', chords, 4, 0.06),
  ...perBar(chords, 4, (chord, start, bar) => [
    { beat: start, voice: 'bass', midi: chord[0], beats: 2, velocity: 0.2 }, { beat: start + 2, voice: 'bass', midi: chord[0], beats: 2, velocity: 0.16 },
    ...[0, 0.75, 1, 2, 2.75, 3].map(offset => ({ beat: start + offset, voice: 'snare' as const, midi: 60, beats: 0.2, velocity: bar % 2 ? 0.07 : 0.1 })),
  ]),
];

// The holds: a harp turning high and quick, a flute above it, the air thin. F Lydian, in three.
// The flute's second phrase stays in the mode's brightest corner, on G; then the harp turns on alone.
const HOLDS_CHORDS: Chord[] = [[41, 'M'], [43, 'M'], [41, 'M'], [45, 'm'], [41, 'M'], [43, 'M'], [38, 'm'], [36, 'M']];
const HOLDS_FLUTE: Line = [[81, 2], [83, 1], [84, 2], [83, 1], [81, 1], [79, 1], [77, 2], [null, 3], [79, 2], [81, 1], [83, 2], [79, 1], [77, 3], [76, 2]];
const HOLDS_SECOND: Chord[] = [[38, 'm'], [45, 'm'], [43, 'M'], [36, 'M'], [38, 'm'], [40, 'm'], [43, 'M'], [43, 'M']];
const HOLDS_SECOND_TUNE = tune('A5:2 F5:1 | E5:3 | D5:1 B4:1 D5:1 | E5:2 G5:1 | F5:2 A5:1 | G5:2 E5:1 | B5:2 A5:1 | G5:3', 3);
const holdsGround = (chords: readonly Chord[]) => [
  ...perBar(chords, 3, (chord, start) => [
    ...arpeggio('harp', chord, start, [0, 7, 12, 'third', 12, 7], 0.5, 0.13, 1.2, 24),
    { beat: start, voice: 'bass', midi: chord[0] + 12, beats: 3, velocity: 0.12 },
  ]),
  ...pad('strings', chords, 3, 0.04, 24),
];

// The downs: one flute over a drone, like someone whistling with nobody to hear. A Mixolydian, in three.
// Between whistles, a long stretch of drone with a harp note now and then; the second time, the strings hum along.
const DOWNS_FLUTE: Line = [[69, 2], [71, 1], [73, 2], [74, 1], [76, 3], [74, 1.5], [73, 1.5], [71, 2], [69, 1], [67, 3], [null, 3],
  [71, 2], [73, 1], [76, 2], [79, 1], [78, 1.5], [76, 1.5], [74, 3], [73, 1], [71, 1], [69, 1], [69, 3], [null, 3]];
const downsGround = (bars: number, harp: (bar: number) => number | undefined) => Array.from({ length: bars }, (_, bar) => [
  { beat: bar * 3, voice: 'bass' as const, midi: 33, beats: 3, velocity: 0.16 },
  { beat: bar * 3, voice: 'strings' as const, midi: 52, beats: 3, velocity: 0.05 },
  ...(harp(bar) ? [{ beat: bar * 3 + 1, voice: 'harp' as const, midi: harp(bar)!, beats: 2, velocity: 0.08 }] : []),
]).flat();

// The crypt: low choir clusters, a bell tolling slow, and nothing else. C minor, close and still, sinking a step at a time.
const CRYPT_CHOIR: readonly (readonly number[])[] = [[48, 51, 55], [48, 51, 56], [47, 50, 55], [48, 51, 55], [44, 48, 51], [44, 48, 53], [43, 47, 50], [43, 46, 50], [46, 49, 53], [44, 48, 51], [43, 47, 50], [48, 51, 55]];
const CRYPT_BASS = [36, 36, 31, 36, 32, 32, 31, 31, 34, 32, 31, 36];
const CRYPT_TOLLS: Record<number, number> = { 0: 60, 2: 62, 4: 56, 6: 55, 8: 58, 10: 55 };

// Wrecktown: a sea shanty, tired, in a lilting three. D Dorian. The second time round someone sings it an octave up;
// then a verse in F with the flute, and back.
const SHANTY_CHORDS: Chord[] = [[38, 'm'], [38, 'm'], [36, 'M'], [36, 'M'], [38, 'm'], [43, 'M'], [45, 'm'], [38, 'm']];
const SHANTY_TUNE: Line = [[62, 1], [65, 1], [69, 1], [67, 2], [65, 1], [64, 1], [60, 1], [64, 1], [67, 3], [69, 1], [72, 1], [71, 1], [69, 2], [67, 1], [69, 1], [65, 1], [62, 1], [62, 3]];
const SHANTY_SECOND: Chord[] = [[41, 'M'], [36, 'M'], [38, 'm'], [45, 'm'], [46, 'M'], [41, 'M'], [43, 'M'], [45, 'M']];
const SHANTY_VERSE = tune('A4:1 C5:1 F5:1 | E5:2 C5:1 | D5:1 F5:1 A5:1 | E5:3 | D5:2 F5:1 | C5:2 A4:1 | B4:1 D5:1 G5:1 | E5:2 C#5:1', 3);
const deck = (chords: readonly Chord[]) => perBar(chords, 3, (chord, start) => [
  { beat: start, voice: 'bass', midi: chord[0], beats: 1, velocity: 0.2 },
  ...[1, 2].map(offset => ({ beat: start + offset, voice: 'pluck' as const, midi: chord[0] + 12 + third(chord[1]), beats: 0.8, velocity: 0.08 })),
  { beat: start, voice: 'drum', midi: 36, beats: 0.5, velocity: 0.12 },
]);

// The sea: a bass rising and falling like a swell, choir far off, the harp coming down. A Aeolian, slow.
// The choir follows the chords; in the middle a flute holds long notes over it, very high and very far away.
const SEA_CHORDS: Chord[] = [[33, 'm'], [29, 'M'], [36, 'M'], [31, 'M'], [33, 'm'], [26, 'm'], [28, 'M'], [33, 'm']];
const SEA_CHOIR = tune('A3:4 | A3:4 | G3:4 | G3:4 | A3:4 | A3:4 | G#3:4 | A3:4', 4);
const SEA_SECOND: Chord[] = [[29, 'M'], [36, 'M'], [38, 'm'], [33, 'm'], [29, 'M'], [31, 'M'], [28, 'M'], [28, 'M']];
const SEA_FLUTE = tune('C5:4 | E5:4 | F5:3 E5:1 | E5:2 C5:2 | A4:4 | B4:2 D5:2 | G#4:2 B4:2 | E5:4', 4);
const swell = (chords: readonly Chord[]) => [
  ...perBar(chords, 4, (chord, start) => [
    { beat: start, voice: 'bass', midi: chord[0], beats: 2, velocity: 0.18 }, { beat: start + 2, voice: 'bass', midi: chord[0] + 7, beats: 2, velocity: 0.12 },
    ...arpeggio('harp', chord, start, [24, 19, 'third', 12, 7], 0.75, 0.08, 2, 12),
  ]),
  ...pad('strings', chords, 4, 0.04),
];

// The deep: a drone, and celesta notes rising out of the dark like bubbles. B Locrian, wrong on purpose.
const DEEP_BUBBLES: Line = [[null, 2], [83, 0.5], [86, 0.5], [null, 5], [77, 0.5], [80, 0.5], [83, 0.5], [null, 6.5], [86, 1], [null, 3], [74, 0.5], [77, 0.5], [null, 4]];
const DEEP_LATER: Line = [[null, 3], [88, 0.5], [89, 0.5], [null, 4], [81, 0.5], [83, 0.5], [null, 7], [91, 1], [null, 4], [84, 0.5], [null, 10.5]];
const depths = (bars: number, choir: readonly [number, number]) => Array.from({ length: bars }, (_, bar) => [
  { beat: bar * 4, voice: 'bass' as const, midi: 35, beats: 4, velocity: 0.18 },
  { beat: bar * 4, voice: 'choir' as const, midi: choir[bar % 2], beats: 4, velocity: 0.07 },
]).flat();

// The ring: war drums for the crowd, a fanfare on staccato strings. G minor, loud. Then the brass, for the champion.
const ARENA_CHORDS: Chord[] = [[43, 'm'], [43, 'm'], [39, 'M'], [41, 'M'], [43, 'm'], [38, 'M'], [39, 'M'], [38, 'M']];
const ARENA_FANFARE: Line = [[67, 0.5], [67, 0.5], [70, 1], [74, 2], [72, 0.5], [70, 0.5], [69, 1], [67, 2], [67, 0.5], [70, 0.5], [74, 1], [79, 1.5], [77, 0.5], [75, 2], [74, 0.5], [72, 0.5], [70, 1], [69, 1], [66, 1], [67, 4], [null, 8]];
const ARENA_SECOND: Chord[] = [[39, 'M'], [41, 'M'], [43, 'm'], [38, 'M'], [39, 'M'], [41, 'M'], [38, 'M'], [38, 'M']];
const ARENA_CALL = tune('G4:0.5 Bb4:0.5 Eb5:2 D5:1 | C5:1 A4:1 F4:2 | G4:0.5 G4:0.5 D5:1 G5:2 | F#5:2 D5:2 | Eb5:1 G5:1 Bb5:1 G5:1 | A5:2 F5:2 | F#5:1 A5:1 D6:2 | A4:2 F#4:2', 4);
const crowd = (chords: readonly Chord[]) => [
  ...perBar(chords, 4, (chord, start) => [
    ...[0, 1, 1.5, 2, 3, 3.5].map(offset => ({ beat: start + offset, voice: 'drum' as const, midi: 36, beats: 0.5, velocity: 0.3 })),
    ...[1, 3].map(offset => ({ beat: start + offset, voice: 'snare' as const, midi: 60, beats: 0.25, velocity: 0.16 })),
    { beat: start, voice: 'bass', midi: chord[0], beats: 4, velocity: 0.2 },
  ]),
  ...pad('strings', chords, 4, 0.05),
];

// Indoors: a music-box lullaby by the hearth. F major. A second verse in B flat; then the first again,
// with a harp under the music box an octave down.
const HEARTH_CHORDS: Chord[] = [[41, 'M'], [38, 'm'], [34, 'M'], [36, 'M'], [41, 'M'], [45, 'm'], [34, 'M'], [36, 'M']];
const HEARTH_MELODY: Line = [[77, 1], [76, 1], [72, 1], [74, 2], [69, 1], [70, 1], [74, 1], [77, 1], [76, 3], [77, 1], [81, 1], [79, 1], [76, 2], [72, 1], [74, 1], [72, 1], [70, 1], [72, 3]];
const HEARTH_SECOND: Chord[] = [[34, 'M'], [41, 'M'], [43, 'm'], [36, 'M'], [38, 'm'], [34, 'M'], [43, 'm'], [36, 'M']];
const HEARTH_VERSE = tune('D5:2 F5:1 | C5:2 A4:1 | Bb4:1 D5:1 G5:1 | E5:3 | F5:2 D5:1 | D5:1 C5:1 Bb4:1 | G4:1 Bb4:1 D5:1 | C5:3', 3);
const hearth = (chords: readonly Chord[]) => [
  ...pad('strings', chords, 3, 0.05, 24),
  ...perBar(chords, 3, (chord, start) => [{ beat: start, voice: 'bass', midi: chord[0] + 12, beats: 3, velocity: 0.12 }]),
];

// Battle: a driving string ostinato over drums. A minor. A second strain climbs through F and G before it falls back.
const BATTLE_CHORDS: Chord[] = [[45, 'm'], [45, 'm'], [41, 'M'], [43, 'M'], [45, 'm'], [45, 'm'], [38, 'm'], [40, 'M']];
const BATTLE_LEAD: Line = [
  [76, 1.5], [77, 0.5], [76, 1], [72, 1], [69, 4], [72, 1.5], [74, 0.5], [72, 1], [69, 1], [71, 4],
  [76, 1.5], [77, 0.5], [79, 1], [81, 1], [79, 2], [77, 2], [77, 1.5], [76, 0.5], [74, 1], [72, 1], [71, 2], [68, 2],
];
const BATTLE_SECOND: Chord[] = [[41, 'M'], [43, 'M'], [40, 'm'], [45, 'm'], [41, 'M'], [43, 'M'], [40, 'M'], [40, 'M']];
const BATTLE_STRAIN = tune('A5:1.5 G5:0.5 F5:1 C5:1 | D5:2 B4:2 | E5:1.5 G5:0.5 B5:1 G5:1 | A5:4 | F5:1 A5:1 C6:1 A5:1 | B5:2 G5:1 D5:1 | E5:1.5 G#5:0.5 B5:1 G#5:1 | E5:2 B4:2', 4);
const fight = (chords: readonly Chord[]) => [
  ...perBar(chords, 4, (chord, start) => [
    ...arpeggio('staccato', chord, start, [0, 0, 12, 0, 7, 0, 12, 7], 0.5, 0.14, 0.45, 12),
    ...[0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5].map(offset => ({ beat: start + offset, voice: 'bass' as const, midi: chord[0], beats: 0.45, velocity: 0.2 })),
    ...[0, 1.5, 2].map(offset => ({ beat: start + offset, voice: 'drum' as const, midi: 36, beats: 0.5, velocity: 0.32 })),
    ...[1, 3].map(offset => ({ beat: start + offset, voice: 'snare' as const, midi: 60, beats: 0.25, velocity: 0.18 })),
  ]),
  ...pad('strings', chords, 4, 0.05, 24),
];

// The kraken, in memory: the harbour wall, and the five of them on it. B minor.
const KRAKEN_CHORDS: Chord[] = [[35, 'm'], [35, 'm'], [31, 'M'], [33, 'M'], [35, 'm'], [30, 'M'], [31, 'M'], [30, 'M']];

const KRAKEN_CALL: Line = [
  [71, 1], [74, .5], [78, .5], [76, 2], [74, 1], [73, 1], [71, 2],
  [67, 1], [71, 1], [74, 2], [69, 1], [73, .5], [76, .5], [78, 2],
  [83, 1], [81, 1], [78, 1], [76, 1], [78, 1], [76, 1], [73, 1], [70, 1],
  [74, 1], [71, 1], [69, 1], [67, 1], [66, 1], [70, 1], [73, 1], [71, 1],
];
// The second strain climbs through G and A to the dominant, the way the wave came up the wall, and falls back.
const KRAKEN_SECOND: Chord[] = [[31, 'M'], [33, 'M'], [30, 'M'], [35, 'm'], [31, 'M'], [33, 'M'], [30, 'M'], [30, 'M']];
const KRAKEN_CLIMB = tune('D5:1 F#5:1 B5:2 | A5:1.5 G5:0.5 F#5:1 E5:1 | F#5:1 A#5:1 C#6:2 | B5:4 | G5:1 B5:1 D6:2 | C#6:1 B5:1 A5:1 G5:1 | F#5:1.5 E5:0.5 C#5:1 A#4:1 | F#4:2 -:2', 4);
const harbour = (chords: readonly Chord[]) => [
  ...perBar(chords, 4, (chord, start) => [
    ...[0, 1, 2, 3].map(offset => ({ beat: start + offset, voice: 'bass' as const, midi: chord[0], beats: 0.85, velocity: 0.24 })),
    ...[0, 2].map(offset => ({ beat: start + offset, voice: 'drum' as const, midi: 36, beats: 0.7, velocity: 0.5 })),
    ...[1, 3].map(offset => ({ beat: start + offset, voice: 'snare' as const, midi: 60, beats: 0.35, velocity: 0.24 })),
    ...arpeggio('staccato', chord, start, [0, 7, 'third', 7], 1, .09, .45, 12),
  ]),
  ...pad('strings', chords, 4, 0.09),
];

// Waking after a wipe: choir and bells hanging in the air, bright and wrong. C Lydian.
const WAKE_CHORDS: readonly (readonly number[])[] = [[60, 64, 66, 71], [62, 66, 69, 73], [64, 67, 71, 74], [62, 66, 69, 72]];
const WAKE_BELLS: Line = [[79, 2], [null, 2], [78, 2], [null, 2], [76, 4], [74, 4]];
// The second half goes somewhere brighter and stranger still, and comes back to where it began.
const WAKE_LATER: readonly (readonly number[])[] = [[59, 62, 66, 71], [60, 64, 67, 71], [62, 66, 69, 72], [60, 64, 66, 71]];
const WAKE_LATER_BELLS: Line = [[74, 4], [76, 2], [null, 2], [72, 4], [71, 4]];
const waking = (chords: readonly (readonly number[])[]) => chords.flatMap((notes, bar) => [
  ...notes.map(midi => ({ beat: bar * 4, voice: 'choir' as const, midi, beats: 4, velocity: 0.07 })),
  { beat: bar * 4, voice: 'bass' as const, midi: 36, beats: 4, velocity: 0.14 },
]);

export const THEMES: Record<ThemeId, Theme> = {
  ...BOSS_THEMES,
  fields: { name: 'The fields', bpm: 84, beatsPerBar: 3, ...suite(3,
    part(3, 16, fieldsGround(FIELDS_CHORDS), line('flute', FIELDS_MELODY, 0.2)),
    part(3, 8, fieldsGround(FIELDS_SECOND), line('strings', FIELDS_SECOND_TUNE, 0.13)),
    part(3, 4, fieldsGround(FIELDS_REST)),
    part(3, 16, fieldsGround(FIELDS_CHORDS), line('flute', FIELDS_MELODY, 0.2), line('celesta', FIELDS_MELODY, 0.06, 0, 12)),
  ) },
  church: { name: 'The church', bpm: 54, beatsPerBar: 4, ...suite(4,
    part(4, 8, organ(CHURCH_CHORDS), line('bell', CHURCH_BELLS, 0.16)),
    part(4, 8, organ(CHURCH_SECOND), line('choir', CHURCH_CHOIR, 0.09), [{ beat: 0, voice: 'bell', midi: 81, beats: 4, velocity: 0.1 }, { beat: 16, voice: 'bell', midi: 74, beats: 4, velocity: 0.1 }]),
    part(4, 4, organ(CHURCH_REST)),
  ) },
  town: { name: 'Millbrook', bpm: 92, beatsPerBar: 3, ...suite(3,
    part(3, 8, townGround(TOWN_CHORDS), line('flute', TOWN_MELODY, 0.17)),
    part(3, 8, townGround(TOWN_SECOND), line('flute', TOWN_SECOND_TUNE, 0.17)),
    part(3, 8, townGround(TOWN_CHORDS), line('strings', TOWN_MELODY, 0.12, 0, -12)),
    part(3, 4, townGround(TOWN_REST)),
  ) },
  wilds: { name: 'The wilds', bpm: 58, beatsPerBar: 4, ...suite(4,
    part(4, 8, drone(8, [81, 77, 76, 74]), line('choir', WILDS_CHOIR, 0.11)),
    part(4, 8, drone(8, [74, 72, 69]), line('choir', WILDS_LOWER, 0.1), line('flute', WILDS_CALL, 0.1, 16)),
    part(4, 4, drone(4, [], false)),
  ) },
  highlands: { name: 'The highlands', bpm: 60, beatsPerBar: 4, ...suite(4,
    part(4, 8, highlandsGround(HIGHLANDS_CHORDS), line('flute', HIGHLANDS_MELODY, 0.16)),
    part(4, 8, highlandsGround(HIGHLANDS_SECOND), line('strings', HIGHLANDS_SECOND_TUNE, 0.12)),
    part(4, 8, highlandsGround(HIGHLANDS_CHORDS), line('flute', HIGHLANDS_MELODY.slice(6), 0.16, 16)),
  ) },
  marsh: { name: 'The marsh', bpm: 54, beatsPerBar: 4, ...suite(4,
    part(4, 8, marshGround(MARSH_CHORDS), line('choir', MARSH_CHOIR, 0.09)),
    part(4, 8, marshGround(MARSH_SECOND), line('strings', MARSH_SECOND_TUNE, 0.1)),
    part(4, 8, marshGround(MARSH_CHORDS), line('choir', MARSH_CHOIR, 0.09)),
  ) },
  capital: { name: 'The capital', bpm: 62, beatsPerBar: 4, ...suite(4,
    part(4, 8, procession(CAPITAL_CHORDS), line('bell', CAPITAL_BELLS, 0.12)),
    part(4, 8, procession(CAPITAL_SECOND), line('strings', CAPITAL_SECOND_TUNE, 0.11)),
    part(4, 4, procession(CAPITAL_REST)),
  ) },
  garrison: { name: 'The garrison', bpm: 74, beatsPerBar: 4, ...suite(4,
    part(4, 8, garrisonGround(GARRISON_CHORDS), line('flute', GARRISON_BUGLE, 0.15)),
    part(4, 8, garrisonGround(GARRISON_SECOND), line('flute', GARRISON_SECOND_CALL, 0.14)),
    part(4, 4, garrisonGround(GARRISON_REST)),
  ) },
  holds: { name: 'The mountain holds', bpm: 76, beatsPerBar: 3, ...suite(3,
    part(3, 8, holdsGround(HOLDS_CHORDS), line('flute', HOLDS_FLUTE, 0.14)),
    part(3, 8, holdsGround(HOLDS_SECOND), line('flute', HOLDS_SECOND_TUNE, 0.13)),
    part(3, 8, holdsGround(HOLDS_CHORDS)),
  ) },
  downs: { name: 'The downs', bpm: 84, beatsPerBar: 3, ...suite(3,
    part(3, 16, downsGround(16, bar => bar % 4 === 3 ? 76 : undefined), line('flute', DOWNS_FLUTE, 0.15)),
    part(3, 8, downsGround(8, bar => bar % 2 === 0 ? [76, 74, 73, 71][bar / 2] : undefined)),
    part(3, 16, downsGround(16, bar => bar % 4 === 3 ? 76 : undefined), line('flute', DOWNS_FLUTE, 0.15), line('strings', DOWNS_FLUTE.slice(11), 0.05, 21, -12)),
  ) },
  crypt: { name: 'Under the ground', bpm: 42, beatsPerBar: 4, bars: CRYPT_CHOIR.length, events: [
    ...CRYPT_CHOIR.flatMap((notes, bar) => [
      ...notes.map(midi => ({ beat: bar * 4, voice: 'choir' as const, midi, beats: 4, velocity: 0.08 })),
      { beat: bar * 4, voice: 'bass' as const, midi: CRYPT_BASS[bar], beats: 4, velocity: 0.16 },
      ...(CRYPT_TOLLS[bar] ? [{ beat: bar * 4 + 2, voice: 'bell' as const, midi: CRYPT_TOLLS[bar], beats: 2, velocity: 0.09 }] : []),
    ]),
  ] },
  shanty: { name: 'Wrecktown', bpm: 96, beatsPerBar: 3, ...suite(3,
    part(3, 8, deck(SHANTY_CHORDS), line('pluck', SHANTY_TUNE, 0.15)),
    part(3, 8, deck(SHANTY_CHORDS), line('pluck', SHANTY_TUNE, 0.15), line('flute', SHANTY_TUNE, 0.08, 0, 12)),
    part(3, 8, deck(SHANTY_SECOND), line('flute', SHANTY_VERSE, 0.14)),
    part(3, 8, deck(SHANTY_CHORDS), line('pluck', SHANTY_TUNE, 0.15)),
  ) },
  sea: { name: 'The sea', bpm: 50, beatsPerBar: 4, ...suite(4,
    part(4, 8, swell(SEA_CHORDS), line('choir', SEA_CHOIR, 0.1)),
    part(4, 8, swell(SEA_SECOND), line('flute', SEA_FLUTE, 0.11)),
    part(4, 8, swell(SEA_CHORDS), line('choir', SEA_CHOIR, 0.1)),
  ) },
  deep: { name: 'The deep', bpm: 46, beatsPerBar: 4, ...suite(4,
    part(4, 8, depths(8, [50, 53]), line('celesta', DEEP_BUBBLES, 0.1)),
    part(4, 8, depths(8, [52, 53]), line('celesta', DEEP_LATER, 0.09)),
  ) },
  arena: { name: 'The Talon Ring', bpm: 116, beatsPerBar: 4, ...suite(4,
    part(4, 8, crowd(ARENA_CHORDS), line('staccato', ARENA_FANFARE, 0.14)),
    part(4, 8, crowd(ARENA_SECOND), line('brass', ARENA_CALL, 0.15)),
    part(4, 8, crowd(ARENA_CHORDS), line('staccato', ARENA_FANFARE, 0.14)),
  ) },
  hearth: { name: 'By the hearth', bpm: 70, beatsPerBar: 3, ...suite(3,
    part(3, 8, hearth(HEARTH_CHORDS), line('celesta', HEARTH_MELODY, 0.16)),
    part(3, 8, hearth(HEARTH_SECOND), line('celesta', HEARTH_VERSE, 0.15)),
    part(3, 8, hearth(HEARTH_CHORDS), line('celesta', HEARTH_MELODY, 0.16), line('harp', HEARTH_MELODY, 0.08, 0, -12)),
  ) },
  battle: { name: 'Battle', bpm: 132, beatsPerBar: 4, ...suite(4,
    part(4, 8, fight(BATTLE_CHORDS), line('strings', BATTLE_LEAD, 0.13)),
    part(4, 8, fight(BATTLE_SECOND), line('strings', BATTLE_STRAIN, 0.13)),
    part(4, 8, fight(BATTLE_CHORDS), line('strings', BATTLE_LEAD, 0.13)),
  ) },
  kraken: { name: 'The Kraken', bpm: 118, beatsPerBar: 4, ...suite(4,
    part(4, 8, harbour(KRAKEN_CHORDS), line('brass', KRAKEN_CALL, .18)),
    part(4, 8, harbour(KRAKEN_SECOND), line('brass', KRAKEN_CLIMB, .17)),
    part(4, 8, harbour(KRAKEN_CHORDS), line('brass', KRAKEN_CALL, .18), line('flute', KRAKEN_CALL, .07, 0, 12)),
  ) },
  wake: { name: 'Waking', bpm: 48, beatsPerBar: 4, ...suite(4,
    part(4, 4, waking(WAKE_CHORDS), line('bell', WAKE_BELLS, 0.13)),
    part(4, 4, waking(WAKE_LATER), line('bell', WAKE_LATER_BELLS, 0.11)),
  ) },
};
export const THEME_IDS = Object.keys(THEMES) as ThemeId[];

// Elites and bosses get the darker battle music.
export function battleTheme(encounter: Encounter): ThemeId {
  if (encounter === 'kraken') return 'kraken';
  return BOSS_MUSIC[encounter] ?? 'battle';
}

export const loopBeats = (theme: Theme) => theme.bars * theme.beatsPerBar;
export const frequency = (midi: number) => 440 * 2 ** ((midi - 69) / 12);
