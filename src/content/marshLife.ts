import type { Dialogue } from './dialogue';

export const marshStreet: Dialogue = {
  'treatment-queue': { speaker: 'A WATER RAT AT THE HOSPICE', portrait: 'water-rat', prompt: 'Speak to the waiting relative', lines: [
    '“They make us wait out here. Say it passes from breath to breath.”',
    'He watches the food barrels go past. “Nobody else in our house caught it. Only her.”',
  ], variants: [
    { if: { flag: 'viper-slain' }, lines: ['“She ate breakfast. Kept it down. They let me take her shawl in.”', 'He is still holding the empty basket. “I have not worked out what to do with my hands when I am not waiting.”'] },
    { if: { flag: 'frog-free' }, lines: ['“The little healer said not to eat from a broken seal. I wrote it on the basket.”', '“The magistrate still calls it plague. His cook shops somewhere else.”'] },
  ] },
  'barrel-inspector': { speaker: 'A COYPU AT THE LANDING', portrait: 'coypu', prompt: 'Speak to the barrel inspector', lines: [
    '“Fresh wax on old wax. The seal says the church accepted them.”',
    'She has not put her hands near the water. “That used to mean enough.”',
  ], variants: [
    { if: { flag: 'cuttlefish-slain' }, lines: ['The landing ropes are coiled. There is nothing to inspect.', '“The sea has stopped sending them. We know what was in those barrels now, but knowing does not feed a town.”'] },
    { if: { flag: 'viper-slain' }, lines: ['“We open every barrel now. In front of the driver. Nothing gets waved through for a stamp.”', 'She knots a clean strip of cloth around an inspected lid. “The seal is still there. So are my eyes.”'] },
    { if: { flag: 'frog-free' }, lines: ['“Poison. Not plague.” She says it quietly, then louder.', '“The doubtful barrels stay on this landing. The magistrate can argue with the tide.”'] },
  ] },
  'washed-cloths': { speaker: 'THE WASHING RACK', prompt: 'Examine the washing rack', lines: [
    'A row of rinsed cloths on a low rack. Nobody will take them into the hospice.',
    'Written on the wash tub: NOT FROM THE SICK. The sick still need cloths.',
  ], variants: [{ if: { flag: 'viper-slain' }, lines: ['Clean cloths dry above a fresh basin. The warning has been scrubbed off the tub.', 'Someone has folded two small ones separately, for the frog’s hands.'] }] },
  'deck-marker': { speaker: 'THE DECK MARKER', prompt: 'Read the deck marker', lines: ['WICKMERE. Keep to the planks. The water takes what it is given.'], variants: [
    { if: { not: { remembers: 'frog' } }, lines: ['WICKMERE. You read the letters while the water moves beneath them.', 'You should remember a pair of careful hands here. Instead, you remember only that someone kept you from falling.'] },
  ] },
};

export const hospiceLife: Dialogue = {
  'meal-tray': { speaker: 'THE MEAL TRAY', prompt: 'Examine the meal tray', lines: [
    'Bowls of church soup, cooling untouched. One patient has pushed his toward the edge of the tray.',
    'The serving spoon has been wiped. The barrel it came from has not been opened again.',
  ], variants: [
    { if: { flag: 'viper-slain' }, lines: ['The bowls are empty. The patients have eaten.', 'The cook’s name is written beside the meal. Under it: BARREL OPENED AND CHECKED.'] },
    { if: { flag: 'frog-free' }, lines: ['The soup has been taken away. Fresh water and plain bread stand in its place.', 'A note in the frog’s hand says: KEEP THE SEAL. WRITE DOWN WHO ATE.'] },
  ] },
};
