import { test } from 'node:test';
import assert from 'node:assert/strict';
import { churchLore, downsLore, fieldsLore, fortLore, innLore, townLore, weirLore } from '../../src/content/lore.ts';

// These people carry the world, not the plot: each has several things to ask about, and none of it is about the man with no fur.
test('every keeper of lore has at least three topics about the world', () => {
  for (const dialogue of [churchLore, downsLore, fieldsLore, fortLore, innLore, townLore, weirLore])
    for (const [name, person] of Object.entries(dialogue)) {
      assert.ok((person.choices ?? []).length >= 3, name);
      const said = [...person.lines, ...(person.choices ?? []).flatMap(choice => choice.lines)].join(' ');
      assert.doesNotMatch(said, /no fur/i, name);
    }
});
