import type { Dialogue } from './dialogue';

// Narrative content stays separate from rendering and input.
export const church: Dialogue = {
  priest: { speaker: 'THE PRIEST', prompt: 'Speak to the priest', lines: [
    'Easy, hero. The sea has given you back to us again.',
    'You asked me to remember something for you. I am sorry. You never told me what it was.',
    'There is a veiled stranger by the east wall. A small signature can hide a great deal. Something came in with the last grain sacks. A small signature, by the south wall. Watch its legs before you strike.',
    'The church has work for its heroes. Grain has stopped reaching the highlands. Take the south door, follow the farm road, and find out why.',
  ], forgotten: { feast: [
    'Easy, hero. The sea has given you back to us again.',
    'Every time you woke, you told me you were framed. You have stopped saying it. I find I miss it.',
    'There is a veiled stranger by the east wall. A small signature can hide a great deal. Something came in with the last grain sacks. A small signature, by the south wall. Watch its legs before you strike.',
    'The church has work for its heroes. Grain has stopped reaching the highlands. Take the south door, follow the farm road, and find out why.',
  ] } },
  ledger: { speaker: 'THE RESURRECTION LEDGER', lines: [
    'Five names. Five sentences. Beneath yours, a column of dates runs into the margin.',
    'The last entry is still wet. You do not recognize the handwriting. You do not recognize your name.',
  ], forgotten: { trial: [
    'Five names. Five sentences. Beside yours, a single word you cannot make yourself read.',
    'The brand on your wrist matches the seal at the foot of the page. You do not know what you did to earn either.',
  ] } },
  basin: { speaker: 'THE TIDAL BASIN', lines: [
    'Salt has gathered around the rim. For a moment, the water smells of a feast you almost remember.',
  ], forgotten: { feast: [
    'Salt has gathered around the rim. The water smells of the sea, and of nothing else.',
  ] } },
};
