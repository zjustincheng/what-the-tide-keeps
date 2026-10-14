// Where the companions stand when they ask to go back: one point each, on maps that have been edited by hand since their
// create- script last ran. This patches the Points layer in place and can be run again safely; run it after any create- script.
import { readFileSync, writeFileSync } from 'node:fs';

// name: the point, at tile x, y.
const POINTS = [
  // The vulture, above the graves she dug.
  { map: 'battlefield', name: 'vulture-return', at: [14, 12] },
  // The frog, outside the grate she used to sleep behind.
  { map: 'hospice', name: 'frog-return', at: [16, 9] },
  // The octopus, under the kraken's ribs.
  { map: 'kraken-grave', name: 'octopus-return', at: [12, 12] },
];

for (const { map, name, at: [tx, ty] } of POINTS) {
  const path = `public/maps/${map}.json`;
  const json = JSON.parse(readFileSync(path, 'utf8'));
  const furniture = json.layers.find(layer => layer.name === 'Furniture').data;
  // Where their feet are, as the layout check sees it: just below the point, a little either side.
  const px = tx * 16 + 8, py = ty * 16 + 8;
  for (const [dx, dy] of [[0, 0], [0, 11], [-6, 11], [6, 11]]) {
    if (furniture[Math.floor((py + dy) / 16) * json.width + Math.floor((px + dx) / 16)]) throw new Error(`${map}: ${name} would stand inside something solid`);
  }
  const points = json.layers.find(layer => layer.name === 'Points').objects;
  const at = { x: tx * 16 + 8, y: ty * 16 + 8 };
  const existing = points.find(point => point.name === name);
  if (existing) Object.assign(existing, at);
  else points.push({ id: json.nextobjectid++, name, type: '', x: at.x, y: at.y, width: 0, height: 0, rotation: 0, visible: true, point: true });
  writeFileSync(path, `${JSON.stringify(json, null, 2)}\n`);
}
