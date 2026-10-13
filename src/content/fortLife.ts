import type { Dialogue } from './dialogue';

export const fortStreet: Dialogue = {
  'ration-table': { speaker: 'THE WEIGHING TABLE', prompt: 'Examine the ration table', lines: [
    'Half-empty barrels stand beneath the church seal. A knife scores each fish into portions.',
    'Tokens for the families are stacked beside a heavier weight marked BARRACKS.',
  ], variants: [
    { if: { flag: 'cuttlefish-slain' }, lines: ['The barrels are empty. The church seal is still nailed to the table.', 'The quartermaster has turned the weighing scales toward the wall. Nobody has left the line.'] },
    { if: { all: [{ flag: 'frog-free' }, { not: { flag: 'viper-slain' } }] }, lines: ['The lid is off a rejected barrel. The brine smells sweet, and wrong.', 'A strip of hospice cloth is tied to it: DO NOT ISSUE. The good barrel beside it is almost empty.'] },
    { if: { flag: 'hyena-slain' }, lines: ['The knife is washed. The portions are laid out in neat rows. There are no more than before.', 'A child carries one to an old wolf without being pushed aside. Order has returned before food.'] },
  ] },
  'mourning-wall': { speaker: 'THE WALL OF NAMES', prompt: 'Read the names on the wall', lines: [
    'Names cut into dark stone. Beside some, a charcoal mark: MISSING FROM THE FIELD.',
    'Someone has left an unlit candle beneath each mark. The families will not light them until the dead stay buried.',
  ], variants: [
    { if: { all: [{ flag: 'hyena-slain' }, { not: { remembers: 'vulture' } }] }, lines: ['The charcoal has been washed away. Small candles burn beneath the names.', 'There should be a voice beside you, reading a name you cannot pronounce. You wait for it. You do not know whose it was.'] },
    { if: { flag: 'hyena-slain' }, lines: ['The charcoal has been washed away. Small candles burn beneath the names.', 'Two dates have been corrected in the vulture’s uneven handwriting. Her work is here, even when she cannot remember doing it.'] },
  ] },
  'grain-hauler': { speaker: 'A CARTER AT THE FORT', portrait: 'carter', prompt: 'Speak to the grain hauler', lines: [
    '“I took this wagon down empty. Brought it back empty. They turned us around before the farmland.”',
    '“The goats have seed. The wolves have swords. Neither can eat the other’s trade.”',
  ], variants: [{ if: { flag: 'boar-defeated' }, lines: [
    '“Millbrook grain. It came through.” He hooks a thumb toward the sacks.',
    '“The herbivore shops can bake again. I wish that fed everybody.”',
    'He watches the ration line. “Empty grain wagons were a problem. Empty fish barrels are another.”',
  ] }] },
  'merchant-watch': { speaker: 'A WOLF ON THE INNER WATCH', portrait: 'sergeant', prompt: 'Speak to the inner watch', lines: [
    '“Stay away from the merchant wall after the horn. They hear claws on the stones and think it is the end.”',
    'He keeps looking toward the battlefield gate. “A patrol did not come back with all its dead.”',
  ], variants: [
    { if: { flag: 'cuttlefish-slain' }, lines: ['“No hunting in the streets. Not tonight. Not any night.”', 'His spear is upright again. From behind the wall, someone slides a bolt into place.'] },
    { if: { flag: 'hyena-slain' }, lines: ['His spear is leaning against the stones. “The burial patrol came home before dark.”', '“Let the merchants shut their own doors tonight. They do not need me to do it for them.”'] },
  ] },
  'fort-sign': { speaker: 'THE GARRISON SIGN', prompt: 'Read the garrison sign', lines: ['COVENANT GARRISON. Gate open to licensed traffic. Families draw their ration at the east table.'], variants: [
    { if: { not: { remembers: 'vulture' } }, lines: ['COVENANT GARRISON. You read it twice.', 'The way to the barracks feels almost familiar. You cannot remember the friend who showed you why you needed to go there.'] },
  ] },
};
