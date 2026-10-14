// Edges for drifts of snow and sheets of ice: one tile for every way a cell can sit among its eight neighbours,
// so a drift's border is a soft, continuous line, lit from the upper left, rather than one wedge turned to face the snow.
// The shape is worked out from a 3×3 grid of what touches each side and corner, so two tiles always meet along a side.
import { rect } from './tile-kit.mjs';

// Bits: the four sides, then the four corners (a corner only counts when both sides beside it do).
export const N = 1, E = 2, S = 4, W = 8, NE = 16, SE = 32, SW = 64, NW = 128;
const CORNERS = [[NE, N, E], [SE, S, E], [SW, S, W], [NW, N, W]];
export const tidy = (bits) => CORNERS.reduce((b, [c, a, d]) => (b & a && b & d ? b : b & ~c), bits);

// Every distinct edge, in a fixed order: the tile numbers depend on it. A cell with everything around it is plain snow.
export const EDGES = Array.from({ length: 256 }, (_, b) => b).filter(b => tidy(b) === b && b !== 255);

const smooth = (t) => t * t * (3 - 2 * t);
function mask(bits) {
  const on = (bit) => (bits & bit ? 1 : 0);
  const grid = [[on(NW), on(N), on(NE)], [on(W), 1, on(E)], [on(SW), on(S), on(SE)]];
  return Array.from({ length: 16 }, (_, py) => Array.from({ length: 16 }, (_, px) => {
    const u = (px + 0.5) / 8, v = (py + 0.5) / 8;
    const i = Math.min(1, Math.floor(u)), j = Math.min(1, Math.floor(v));
    const fu = smooth(u - i), fv = smooth(v - j);
    const value = grid[j][i] * (1 - fu) * (1 - fv) + grid[j][i + 1] * fu * (1 - fv) + grid[j + 1][i] * (1 - fu) * fv + grid[j + 1][i + 1] * fu * fv;
    // A little wobble inside the tile, none at its sides, so the line is uneven without breaking at a seam.
    const wobble = 0.34 * Math.sin(Math.PI * (px + 0.5) / 16) * Math.sin(Math.PI * (py + 0.5) / 16) * (Math.sin(px * 0.9 + py * 0.5 + bits * 0.7) + 0.6 * Math.sin(py * 1.3 - px * 0.4 + bits)) / 1.6;
    return value + wobble > 0.5;
  }));
}

// One row at a time, runs of the same colour as single rects.
function paint(cells) {
  let out = '';
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16;) {
    const c = cells[y][x]; let w = 1;
    while (x + w < 16 && cells[y][x + w] === c) w++;
    if (c) out += rect(x, y, w, 1, c[0], c[1]);
    x += w;
  }
  return out;
}

// ground: what shows where the drift ends. face, lit, shaded: the drift's surface, its lit upper lip, and its shaded lower lip.
// marks: [x, y, colour] flecks on the surface.
export function driftEdge(bits, { ground, face, lit, shaded, marks = [] }) {
  const m = mask(bits);
  const at = (x, y) => m[Math.max(0, Math.min(15, y))][Math.max(0, Math.min(15, x))];
  const top = m.map((row, y) => row.map((snow, x) => {
    if (snow) return [!at(x, y + 1) || !at(x + 1, y + 1) ? shaded : !at(x, y - 1) || !at(x - 1, y) ? lit : face];
    return undefined;
  }));
  for (const [x, y, c] of marks) if (m[y][x] && top[y][x][0] === face) top[y][x] = [c];
  // The drift's shadow falls down and to the right of it.
  const shade = m.map((row, y) => row.map((snow, x) => (!snow && (at(x, y - 1) || at(x - 1, y - 1)) ? ['#000000', 0.26] : !snow && at(x - 1, y - 2) ? ['#000000', 0.12] : undefined)));
  return ground + paint(shade) + paint(top);
}
