import type { Dialogue } from './dialogue';
import type { Effect, Flag } from '../rules/world';

// Rooms behind walls that only look solid, one in each land region: walk into the right face and it gives way, for good.
// room: x, y, width, height in tiles, all covered by wall until found. door: a tile of the face it's entered by, when it
// is outside the room. scripts/add-secrets.mjs cuts the rooms into the maps; flag remembers the wall is broken.
export type Hollow = Readonly<{ flag: Flag; room: readonly [number, number, number, number]; door?: readonly [number, number] }>;

export const HOLLOWS: Readonly<Record<string, readonly Hollow[]>> = {
  downs: [{ flag: 'secret-barrow', room: [15, 32, 3, 3] }],
  pass: [{ flag: 'secret-cleft', room: [35, 1, 3, 3], door: [36, 4] }],
  wickmere: [{ flag: 'secret-plastered', room: [11, 4, 3, 3] }],
  hold: [{ flag: 'secret-wall', room: [34, 12, 3, 3] }],
  lanes: [{ flag: 'secret-door', room: [32, 3, 3, 3] }],
};

// What was left in each: once taken, only the rest of it stays.
const room = (flag: Flag, taken: Flag, speaker: string, prompt: string, lines: string[], after: string[], then: { earn: number; supply: NonNullable<Effect['supply']> }): Dialogue => ({
  [flag]: { speaker, prompt, lines, then: { ...then, set: taken }, variants: [{ if: { flag: taken }, lines: after }] },
});

export const SECRETS: Readonly<Record<string, Dialogue>> = {
  downs: room('secret-barrow', 'secret-barrow-taken', 'THE ROBBERS\' TUNNEL', 'Search the tunnel', [
    'A tunnel dug in from the side of the mound and shored with fence posts. Whoever dug it stopped here.',
    'A pick, a lamp with no oil, and a purse they never came back for. Scratched into a post: CHURCH GOT THERE FIRST.',
  ], ['The pick and the empty lamp. Nobody is coming back for them.'], { earn: 25, supply: 'smelling-salts' }),
  pass: room('secret-cleft', 'secret-cleft-taken', 'A CLEFT IN THE ROCK', 'Search the cleft', [
    'Out of the wind, a hollow in the rock just big enough for one. The stone is worn smooth where someone\'s back went, more than one night.',
    'A deserter\'s pack. Hard bread wrapped in a levy notice with the name torn off. A letter that starts "Tell Mother" and stops.',
  ], ['The torn notice, and the letter that stops.'], { earn: 15, supply: 'trail-cake' }),
  wickmere: room('secret-plastered', 'secret-plastered-taken', 'A ROOM WITH NO DOOR', 'Search the room', [
    'Behind the plaster, a room someone sealed from the outside.',
    'Two cots. Tally marks on the wall at a child\'s height, then lower, then none. Nailed inside the door: QUARANTINE. BY ORDER.',
    'Under a cot, a jar of antivenom with the seal unbroken.',
  ], ['The tally marks, and the notice. You don\'t count them again.'], { earn: 10, supply: 'antivenom' }),
  hold: room('secret-wall', 'secret-wall-taken', 'INSIDE THE WALL', 'Search the space', [
    'A space inside the tower wall, where the old messengers waited out the winter. The cage on the hook still has a bird in it, a long time dead.',
    'A sack of letters the holds never sent, all to the same address in the capital: THE CHURCH. ATTENTION OF THE LIGHT. A salve tin, and coin put by for a journey nobody made.',
  ], ['The dead bird, and the letters to the light.'], { earn: 30, supply: 'herb-salve' }),
  lanes: room('secret-door', 'secret-door-taken', 'A DOOR NOBODY USES', 'Search the room', [
    'Behind the door, a room the soup line doesn\'t mention: a table, a strongbox, and a second ledger.',
    'It lists the same names as the soup book, with a price beside each. The column at the bottom is headed FOR THE LIGHT.',
    'In the strongbox, a firepot, and the coins the ledger says were paid.',
  ], ['The second ledger. Every name in it has a price.'], { earn: 40, supply: 'firepot' }),
};
