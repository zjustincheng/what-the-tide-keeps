import type { Dialogue } from './dialogue';

// New street conversations keep the region's recovery distinct from the sea crisis.
export const millbrookStreet: Dialogue = {
  'grain-driver': { speaker: 'A BADGER CARTER', portrait: 'carter', prompt: 'Speak to the grain carter', lines: [
    '“Six mornings loading. Six evenings unloading. The grain is going damp under the canvas.”',
    'He looks toward the border road. “The highlands are waiting. They will blame us before they blame an order nobody signed.”',
  ], variants: [
    { if: { all: [{ flag: 'boar-defeated' }, { not: { remembers: 'bear' } }] }, lines: ['“You again. Your bear helped lift the axle yesterday.”', 'You look at him without recognition.', '“This is Millbrook,” he adds, more quietly. “You helped us. That happened, whether you remember or not.”'] },
    { if: { flag: 'boar-defeated' }, lines: ['“First cart went through before sunrise. The driver came back with an empty wagon.”', 'He pats a sack. “I will take empty over rich, just for today.”', '“The bear can ride with me if his wrists are still bad. Tell him I said it.”'] },
  ] },
  'ration-queue': { speaker: 'A FOX IN THE RATION LINE', portrait: 'fox', prompt: 'Speak to the fox in line', lines: [
    '“They weigh the fish twice. Once for the church, once to make sure we are not getting more than we ought.”',
    'She folds an empty cloth around her ration token. “We keep the Covenant. It could keep us a little better.”',
  ], variants: [
    { if: { flag: 'cuttlefish-slain' }, lines: ['The weighing table is bare. The line is still here.', '“No boats. No ration. The church says another arrangement is being made.”', 'She opens her empty cloth. “How long does an arrangement take?”'] },
    { if: { any: [{ flag: 'hyena-slain' }, { flag: 'ration-ledger' }, { flag: 'viper-slain' }] }, lines: ['“Half a portion. Same stamp on the token.”', 'Behind her, the line bends around the corner.', '“The grain wagons can move all they like. They do not feed this quarter.”'] },
    { if: { flag: 'boar-defeated' }, lines: ['“They opened the little bread stall. My daughter can queue on that side now.”', '“My ration is still the same.” She shrugs. “But she comes home with something warm.”'] },
  ] },
  'quarter-watch': { speaker: 'THE QUARTER WATCH', portrait: 'guard', prompt: 'Speak to the quarter watch', lines: [
    '“Keep to the road. The quarter is counted at dusk.”',
    'He watches the foxes, not the full grain sacks on the other side of the square.',
  ], variants: [
    { if: { flag: 'cuttlefish-slain' }, lines: ['His hand stays on the gate key.', '“No hunting in the square. That is still the law.” He says it to the empty ration table.'] },
    { if: { flag: 'boar-defeated' }, lines: ['The spear is resting against the wall.', '“The reeve says the grain road is clear. Wagons have right of way.”', 'He moves his foot out of yours. The quarter will still be counted tonight.'] },
  ] },
  'bread-stall': { speaker: 'THE LITTLE BREAD STALL', prompt: 'Examine the bread stall', lines: [
    'The boards are shut. A chalk mark reads: DELIVERIES HELD AT THE BORDER.',
    'On the back, in smaller writing: One loaf promised. Ask again tomorrow.',
  ], variants: [{ if: { all: [{ flag: 'boar-defeated' }, { night: true }] }, lines: [
    'The stall is latched for the night. Flour dust lies beneath the folded shutters.',
    'The chalk mark now reads: FRESH BREAD AT DAWN. Someone has underlined dawn twice.',
  ] }, { if: { flag: 'boar-defeated' }, lines: [
    'The shutters are folded back. Warm loaves cool on a clean cloth.',
    'Two children wait together: a lamb and a fox cub. Nobody sends the cub around to the other side.',
    'The old promise has been rubbed out. A thumbprint of flour remains.',
  ] }] },
  'town-sign': { speaker: 'THE ROAD SIGN', prompt: 'Read the town sign', lines: ['MILLBROOK. Grain to the highlands. Fish from the capital. Two arrows point in opposite directions.'],
    variants: [{ if: { not: { remembers: 'bear' } }, lines: ['MILLBROOK, the sign says. You can read it. You cannot make it familiar.', 'A memory of a broad paw turning you toward the right road ought to be here. There is only the shape of something missing.'] }] },
};
