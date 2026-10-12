import { test } from 'node:test';
import assert from 'node:assert/strict';
import { battleTheme, frequency, loopBeats, THEME_IDS, THEMES } from '../../src/audio/themes.ts';

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

test('melodies end exactly where their loop does', () => {
  const lastEnd = (id: keyof typeof THEMES, voice: string) => Math.max(...THEMES[id].events.filter(event => event.voice === voice).map(event => event.beat + event.beats));
  assert.equal(lastEnd('fields', 'flute'), loopBeats(THEMES.fields) - 3, 'the fields melody rests for its last bar');
  assert.equal(lastEnd('town', 'flute'), loopBeats(THEMES.town));
  assert.equal(lastEnd('hearth', 'celesta'), loopBeats(THEMES.hearth));
  assert.equal(lastEnd('battle', 'strings'), loopBeats(THEMES.battle));
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
