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

test('elites and bosses get the darker battle theme', () => {
  assert.equal(battleTheme('locust'), 'battle');
  assert.equal(battleTheme('boar'), 'boss');
  assert.equal(battleTheme('warden'), 'boss');
  assert.equal(frequency(69), 440);
  assert.equal(Math.round(frequency(60)), 262);
});
