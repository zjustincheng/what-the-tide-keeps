// Putting a memory back together: pure rules, no Phaser or DOM.
// A friend tells it in pieces, out of order; the hero puts the pieces back in the order it happened.

// Orders that leave no piece where it belongs, so there is always something to do.
const SCRAMBLES: readonly (readonly number[])[] = [[1, 3, 0, 2], [2, 0, 3, 1], [3, 2, 1, 0], [1, 0, 3, 2], [2, 3, 0, 1], [3, 0, 1, 2]];

// The order the pieces are told in: the same for a memory every time, so it can be learned like anything else.
export function scramble(id: string): readonly number[] {
  const seed = [...id].reduce((sum, letter) => sum + letter.charCodeAt(0), 0);
  return SCRAMBLES[seed % SCRAMBLES.length];
}

// Which places hold the right piece. When all four do, the memory is whole again.
export function settle(placed: readonly number[]): { right: boolean[]; whole: boolean } {
  const right = placed.map((piece, place) => piece === place);
  return { right, whole: placed.length === 4 && right.every(Boolean) };
}
