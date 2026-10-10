import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';

// A map that uses a tile its sheet doesn't draw shows a blank square in the game. Every map's tiles must exist.
test('every map uses only tiles its tile sheet actually draws', () => {
  for (const file of readdirSync('public/maps')) {
    const map = JSON.parse(readFileSync(`public/maps/${file}`, 'utf8'));
    const tileset = map.tilesets[0];
    const sheet = readFileSync(`public/assets/${tileset.image.split('/').pop()}`, 'utf8');
    const drawn = (sheet.match(/<g /g) ?? []).length;
    // The top bits of a tile id say whether it is flipped; the rest is the tile.
    const used = Math.max(...map.layers.slice(0, 2).flatMap((layer: { data: number[] }) => layer.data.map(tile => tile & 0x1fffffff)));
    assert.ok(used <= drawn, `${file} uses tile ${used}, but its sheet draws only ${drawn}`);
    assert.ok(used <= tileset.tilecount, `${file} uses tile ${used}, but its tileset claims ${tileset.tilecount}`);
  }
});
