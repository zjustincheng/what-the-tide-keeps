// Pure rules for bones, the dice game played in inns and barracks: three dice, one reroll, best hand wins.
// Rolls are drawn by the caller and passed in, so the rules stay deterministic.
export type Dice = readonly [number, number, number];

// Three of a kind beats a pair beats a plain total; within a kind, higher faces win.
export function score(dice: Dice): number {
  const [a, b, c] = [...dice].sort((x, y) => y - x);
  if (a === c) return 300 + a;
  if (a === b) return 200 + a * 10 + c;
  if (b === c) return 200 + b * 10 + a;
  return a + b + c;
}

export function hand(dice: Dice): string {
  const value = score(dice);
  if (value >= 300) return `three ${value - 300}s`;
  if (value >= 200) return `a pair of ${Math.floor((value - 200) / 10)}s`;
  return `${value}`;
}

// keep[i] true keeps that die; the rest take the next fresh rolls in order.
export function reroll(dice: Dice, keep: readonly boolean[], rolls: readonly number[]): Dice {
  let next = 0;
  return dice.map((face, i) => keep[i] ? face : rolls[next++]) as unknown as Dice;
}

// The house keeps any pair and any die of four or more, and throws the rest again.
export function houseKeeps(dice: Dice): boolean[] {
  return dice.map(face => face >= 4 || dice.filter(other => other === face).length > 1);
}

export function outcome(player: Dice, house: Dice): 'win' | 'lose' | 'draw' {
  const [mine, theirs] = [score(player), score(house)];
  return mine > theirs ? 'win' : mine < theirs ? 'lose' : 'draw';
}
