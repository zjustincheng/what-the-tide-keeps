// Cut the hidden rooms into the maps: one in each land region, behind a wall that only looks solid (see `hollows` in
// src/scenes/areas.ts). Some maps have been edited by hand since their create- script last ran, so this patches the
// JSON in place, and can be run again safely: after any create- script, run this too.
import { readFileSync, writeFileSync } from 'node:fs';

// room: the hidden room, x, y, width, height in tiles, all of it covered by wall until it is found.
// door: the tile of the face it is entered from, on the open side. cover: the wall tile drawn over the room.
// floor: the ground laid under it, an inside floor, dark, so the room reads as a room once it opens. walls: tiles to paint solid around it, where the map had none.
const SECRETS = [
  // A robbers' tunnel into the west end of the barrow mound, on the downs.
  { map: 'downs', name: 'secret-barrow', room: [15, 32, 3, 3], floor: 18 },
  // A cleft in an outcrop at the top of the high pass, against the border rock.
  { map: 'pass', name: 'secret-cleft', room: [35, 1, 3, 3], floor: 21, cover: 4, walls: [[34, 1, 1, 4], [38, 1, 1, 4], [35, 4, 3, 1]], door: [36, 4] },
  // A room in a Wickmere house, plastered over, behind the alcove in its front wall.
  { map: 'wickmere', name: 'secret-plastered', room: [11, 4, 3, 3], floor: 20 },
  // A space in the hold's tower wall, under the cliff.
  { map: 'hold', name: 'secret-wall', room: [34, 12, 3, 3], floor: 14 },
  // Behind a door nobody uses, in the tenement row over the lanes.
  { map: 'lanes', name: 'secret-door', room: [32, 3, 3, 3], floor: 2 },
];

for (const { map, name, room: [x, y, w, h], floor, cover, walls = [], door } of SECRETS) {
  const path = `public/maps/${map}.json`;
  const json = JSON.parse(readFileSync(path, 'utf8'));
  const W = json.width;
  const layer = name => json.layers.find(layer => layer.name === name);
  const furniture = layer('Furniture').data, ground = layer('Floor').data;
  const paint = (rx, ry, rw, rh, data, gid) => { for (let ty = ry; ty < ry + rh; ty++) for (let tx = rx; tx < rx + rw; tx++) data[ty * W + tx] = gid; };
  for (const [wx, wy, ww, wh] of walls) paint(wx, wy, ww, wh, furniture, cover);
  // Floor under the room, and the room itself covered, so it can't be seen until someone walks into it.
  paint(x, y, w, h, ground, floor);
  if (cover) paint(x, y, w, h, furniture, cover);
  if (door) { paint(door[0], door[1], 1, 1, ground, floor); paint(door[0], door[1], 1, 1, furniture, cover); }
  // What is left there, at the room's middle.
  const points = layer('Points').objects;
  const at = { x: (x + Math.floor(w / 2)) * 16 + 8, y: (y + Math.floor(h / 2)) * 16 + 8 };
  const existing = points.find(point => point.name === name);
  if (existing) Object.assign(existing, at);
  else points.push({ id: json.nextobjectid++, name, type: '', x: at.x, y: at.y, width: 0, height: 0, rotation: 0, visible: true, point: true });
  writeFileSync(path, `${JSON.stringify(json, null, 2)}\n`);
  console.log(`${map}: ${name} at ${x},${y}`);
}
