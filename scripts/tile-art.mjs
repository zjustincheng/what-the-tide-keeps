// Shared pieces for the redrawn tilesets: everything lit from the upper left, with a lit edge, a shaded edge, and a
// shadow on the ground, so a region reads as places and things rather than coloured squares.
import { ellipse, rect } from './tile-kit.mjs';

export const shadow = (cx, cy, rx, ry, o = 0.22) => ellipse(cx, cy, rx, ry, '#000000', o);

// A blade of grass: a light stroke over a dark one.
export const tuft = (x, y, light, dark) => rect(x, y, 1, 2, light) + rect(x + 1, y + 1, 1, 1, dark);
export const turf = (base, light, dark) => rect(0, 0, 16, 16, base) + tuft(3, 4, light, dark) + tuft(11, 10, light, dark) + tuft(7, 13, light, dark) + rect(13, 2, 1, 1, light, 0.6);

// A tree: a round canopy darker underneath and lit on top, a trunk with its shaded side, and its shadow at its foot.
export function tree({ ground, leaf, dark, light, trunk = '#4a3a28', trunkDark = '#33281c', fruit }) {
  return rect(0, 0, 16, 16, ground) + shadow(9, 14.5, 6, 1.6)
    + rect(7, 10, 3, 6, trunk) + rect(9, 10, 1, 6, trunkDark)
    + ellipse(8, 6.5, 7.5, 6.5, dark) + ellipse(7, 5.5, 6, 5, leaf) + ellipse(5.5, 3.5, 3, 2, light) + rect(11, 7, 2, 1, dark) + rect(3, 8, 1, 1, dark)
    + (fruit ? rect(4, 5, 2, 2, fruit) + rect(10, 4, 2, 2, fruit) + rect(7, 8, 2, 2, fruit) + rect(4, 5, 1, 1, '#e08a6a') + rect(10, 4, 1, 1, '#e08a6a') : '');
}
// A tree with nothing left on it: a trunk and bare branches, lit on one side.
export function deadTree(ground, wood = '#2e2620', light = '#4a3e32') {
  return rect(0, 0, 16, 16, ground) + shadow(9, 15, 4, 1)
    + rect(7, 4, 2, 12, wood) + rect(7, 4, 1, 12, light) + rect(3, 4, 4, 1, wood) + rect(3, 2, 1, 2, wood) + rect(9, 2, 4, 1, wood) + rect(12, 0, 1, 2, wood)
    + rect(5, 7, 2, 1, wood) + rect(9, 8, 3, 1, wood) + rect(11, 6, 1, 2, wood);
}
// Still or slow water: ripples and a glint or two, and no band along any edge, so it never stripes when tiled.
export function water(base, ripple, glint, deep) {
  return rect(0, 0, 16, 16, base) + rect(2, 3, 4, 1, ripple) + rect(3, 2, 2, 1, ripple, 0.5) + rect(9, 8, 5, 1, ripple) + rect(10, 7, 3, 1, ripple, 0.5)
    + rect(4, 12, 3, 1, ripple) + rect(1, 13, 3, 1, deep) + rect(11, 5, 3, 1, deep) + rect(12, 3, 1, 1, glint) + rect(6, 9, 1, 1, glint);
}
// Coursed stone: blocks in offset rows, each lit along its top and left and shaded along its right.
export const COURSES = [[0, 0, 7, 5], [8, 0, 8, 5], [0, 6, 4, 4], [5, 6, 7, 4], [13, 6, 3, 4], [0, 11, 9, 5], [10, 11, 6, 5]];
export const blocks = (mortar, face, light, shade, courses = COURSES) => rect(0, 0, 16, 16, mortar)
  + courses.map(([x, y, w, h]) => rect(x, y, w, h, face) + rect(x, y, w, 1, light) + rect(x, y, 1, h, light) + rect(x + w - 1, y + 1, 1, h - 1, shade)).join('');
// A boulder or a heap of stones sitting on the ground.
export const boulder = (cx, cy, rx, ry, face, light, dark) => shadow(cx + 1, cy + ry - 0.5, rx, ry * 0.4)
  + ellipse(cx, cy, rx, ry, dark) + ellipse(cx - 0.5, cy - 0.5, rx - 0.8, ry - 0.8, face) + ellipse(cx - rx * 0.35, cy - ry * 0.4, rx * 0.4, ry * 0.3, light);
// Planks laid side by side, each with a lit left edge and a dark gap.
export const planks = (x0, y0, w, h, face, light, gap, every = 4) => rect(x0, y0, w, h, face)
  + Array.from({ length: Math.ceil(w / every) }, (_, i) => rect(x0 + i * every, y0, 1, h, gap) + rect(x0 + i * every + 1, y0, 1, h, light)).join('');
