import { test } from 'node:test';
import assert from 'node:assert/strict';
import { battleTheme, frequency, loopBeats, THEME_IDS, THEMES } from '../../src/audio/themes.ts';
import { smooth } from '../../src/audio/voicing.ts';
import { feel } from '../../src/audio/feel.ts';

test('every theme fits its loop, in a playable range', () => {
  for (const id of THEME_IDS) {
    const theme = THEMES[id];
    assert.ok(theme.events.length > 0, id);
    for (const event of theme.events) {
      assert.ok(event.beat >= 0 && event.beat < loopBeats(theme), `${id}: a note at beat ${event.beat} falls outside the loop`);
      assert.ok(event.midi >= 24 && event.midi <= 96, `${id}: ${event.midi} is out of range`);
      assert.ok(event.velocity > 0 && event.velocity <= 0.5, `${id}: velocity ${event.velocity}`);
    }
  }
});

test('nothing sounds past the end of its loop, so every theme loops without a seam', () => {
  for (const id of THEME_IDS) {
    for (const event of THEMES[id].events) assert.ok(event.beat + event.beats <= loopBeats(THEMES[id]) + 1e-9, `${id}: a note at beat ${event.beat} runs past the loop`);
  }
});

test('places and ordinary fights have room to breathe: long loops, and a stretch where the tune rests', () => {
  const seconds = (id: keyof typeof THEMES) => loopBeats(THEMES[id]) * 60 / THEMES[id].bpm;
  for (const id of ['fields', 'church', 'town', 'wilds', 'highlands', 'marsh', 'capital', 'garrison', 'holds', 'downs', 'crypt', 'shanty', 'sea', 'deep', 'hearth', 'arena', 'battle'] as const) {
    assert.ok(seconds(id) >= 40, `${id} loops after only ${seconds(id).toFixed(0)} seconds`);
  }
  // The longest silence in each tune is at least a bar.
  for (const [id, voice] of [['fields', 'flute'], ['town', 'flute'], ['church', 'bell'], ['capital', 'bell'], ['garrison', 'flute'], ['holds', 'flute'], ['downs', 'flute']] as const) {
    const theme = THEMES[id];
    const notes = theme.events.filter(event => event.voice === voice).sort((a, b) => a.beat - b.beat);
    const gaps = notes.map((event, index) => (notes[index + 1]?.beat ?? loopBeats(theme) + notes[0].beat) - (event.beat + event.beats));
    assert.ok(Math.max(...gaps) >= theme.beatsPerBar, `${id}: the ${voice} never rests for a whole bar`);
  }
});

test('chords are voice-led: the same notes as the chord, moving by the smallest steps', () => {
  const progression = [[38, 'm'], [36, 'M'], [34, 'M'], [33, 'm'], [41, 'M'], [43, 'M']] as const;
  const voiced = smooth(progression, 24);
  progression.forEach(([root, quality], index) => {
    const classes = new Set([root, root + (quality === 'm' ? 3 : 4), root + 7].map(midi => midi % 12));
    assert.deepEqual(new Set(voiced[index].map(midi => midi % 12)), classes, `chord ${index + 1} keeps its notes`);
  });
  const motion = (chords: readonly (readonly number[])[]) => chords.slice(1).reduce((sum, chord, index) => sum + chord.reduce((moved, midi, voice) => moved + Math.abs(midi - chords[index][voice]), 0), 0);
  const blocks = progression.map(([root, quality]) => [root + 24, root + 24 + (quality === 'm' ? 3 : 4), root + 31]);
  assert.ok(motion(voiced) < motion(blocks) / 2, `voice-led ${motion(voiced)} against ${motion(blocks)} in root position`);
});

test('the playing has a human feel: a little early or late, a little louder or softer, never the same twice', () => {
  const note = { beat: 1, voice: 'flute', midi: 72, beats: 1, velocity: 0.2 } as const;
  const passes = Array.from({ length: 50 }, (_, pass) => feel(note, 4, 3 + pass * 10007));
  for (const { shift, velocity } of passes) {
    assert.ok(Math.abs(shift) <= 0.01, `shifted ${shift}s`);
    assert.ok(velocity > 0.18 && velocity < 0.22, `velocity ${velocity}`);
  }
  assert.ok(new Set(passes.map(({ shift }) => shift.toFixed(4))).size > 40, 'each pass lands a little differently');
  assert.deepEqual(feel(note, 4, 3), feel(note, 4, 3), 'the same note on the same pass always plays the same way');
  const drum = feel({ ...note, voice: 'drum' }, 4, 5);
  assert.ok(Math.abs(drum.shift) <= 0.003, 'drums stay tight');
});

test('elites and bosses get their own battle scores', () => {
  assert.equal(battleTheme('locust'), 'battle');
  assert.equal(battleTheme('boar'), 'boss-boar');
  assert.equal(battleTheme('warden'), 'boss-warden');
  assert.equal(frequency(69), 440);
  assert.equal(Math.round(frequency(60)), 262);
});

test('boss melodies have distinct phrases, short subdivisions, and held notes', () => {
  const signatures = new Set<string>();
  for (const id of THEME_IDS.filter(id => id.startsWith('boss-'))) {
    const theme = THEMES[id];
    // The foreground is louder than the accompaniment; exclude percussion/bass.
    const melody = theme.events.filter(event => !['drum', 'snare', 'bass'].includes(event.voice) && event.velocity >= .17);
    assert.ok(melody.some(event => event.beat % 1 !== 0), `${id}: the tune needs offbeat notes`);
    assert.ok(melody.some(event => event.beats <= .45), `${id}: the tune needs short notes`);
    assert.ok(melody.some(event => event.beats >= 1.35), `${id}: the tune needs room to sustain`);
    const first = melody[0];
    const signature = melody.map(event => [event.beat, event.midi - first.midi, event.beats]).join('|');
    assert.ok(!signatures.has(signature), `${id}: a melody duplicates another boss after transposition`);
    signatures.add(signature);
    for (const event of theme.events) {
      assert.ok(event.beats > 0 && event.beat + event.beats <= loopBeats(theme), `${id}: a note crosses the loop boundary`);
    }
  }
});

test('the blade melody keeps flowing between notes and across the loop', () => {
  const theme = THEMES['boss-duellist'];
  const melody = theme.events.filter(event => event.voice === 'harp').sort((a, b) => a.beat - b.beat);
  assert.equal(melody[0].beat, 0);
  for (let i = 0; i < melody.length; i++) {
    const next = melody[i + 1]?.beat ?? loopBeats(theme);
    assert.ok(next - (melody[i].beat + melody[i].beats) < .04, `a break interrupts the blade melody at beat ${next}`);
  }
});
