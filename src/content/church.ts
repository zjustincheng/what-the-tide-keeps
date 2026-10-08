// Narrative content stays separate from rendering and input.
export const conversations: Record<string, { speaker: string; lines: string[] }> = {
  priest: { speaker: 'THE PRIEST', lines: [
    'Easy, hero. The sea has given you back to us again.',
    'You asked me to remember something for you. I am sorry. You never told me what it was.',
    'Something came in with the last grain sacks. A small signature, by the south wall. Watch its legs before you strike.',
  ] },
  ledger: { speaker: 'THE RESURRECTION LEDGER', lines: [
    'Five names. Five sentences. Beneath yours, a column of dates runs into the margin.',
    'The last entry is still wet. You do not recognize the handwriting. You do not recognize your name.',
  ] },
  basin: { speaker: 'THE TIDAL BASIN', lines: [
    'Salt has gathered around the rim. For a moment, the water smells of a feast you almost remember.',
  ] },
  door: { speaker: 'THE CAPITAL', lines: [
    'Beyond the doors, a bell calls the city awake. The road to the farmland waits.',
    'Your journey beyond the church is not built yet. For now, there is only this room, and what remains of you.',
  ] },
};
