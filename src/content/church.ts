import type { MemoryId } from '../rules/memory';

type Conversation = { speaker: string; lines: string[] };

// Narrative content stays separate from rendering and input.
export const conversations: Record<string, Conversation & { forgotten?: Partial<Record<MemoryId, string[]>> }> = {
  priest: { speaker: 'THE PRIEST', lines: [
    'Easy, hero. The sea has given you back to us again.',
    'You asked me to remember something for you. I am sorry. You never told me what it was.',
    'There is a veiled stranger by the east wall. A small signature can hide a great deal. Something came in with the last grain sacks. A small signature, by the south wall. Watch its legs before you strike.',
  ], forgotten: { feast: [
    'Easy, hero. The sea has given you back to us again.',
    'Every time you woke, you told me you were framed. You have stopped saying it. I find I miss it.',
    'There is a veiled stranger by the east wall. A small signature can hide a great deal. Something came in with the last grain sacks. A small signature, by the south wall. Watch its legs before you strike.',
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
  door: { speaker: 'THE CAPITAL', lines: [
    'Beyond the doors, a bell calls the city awake. The road to the farmland waits.',
    'Your journey beyond the church is not built yet. For now, there is only this room, and what remains of you.',
  ] },
};

// The world remembers what the hero cannot: a forgotten memory changes what he hears.
export function conversation(name: string, lost: readonly MemoryId[]): Conversation {
  const { speaker, lines, forgotten = {} } = conversations[name];
  const memory = lost.find(id => id in forgotten);
  return { speaker, lines: memory ? forgotten[memory]! : lines };
}
