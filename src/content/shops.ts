import type { Ware } from '../rules/economy';
import type { ShopId } from '../rules/world';
import { KEEPSAKE_IDS } from '../rules/gear';

// What each shopkeeper offers. Names are placeholders.
export const SHOPS: Record<ShopId, { title: string; note: string; wares: Ware[] }> = {
  stall: {
    title: 'The stallholder',
    note: 'Citizen prices are chalked on the board. Yours are not.',
    wares: [{ supply: 'smoked-fish' }, { supply: 'smelling-salts' }, { supply: 'firepot' }],
  },
  fishmonger: {
    title: 'The fishmonger',
    note: 'He buys local catch at a local price. He does not ask where you fished, and you do not ask about the barrel.',
    wares: [{ sellCatch: true }, { deed: 'barrel-bought', name: 'The barrel', text: 'Whatever is pickling inside. No questions asked, none answered.', price: 25 }],
  },
  // In the fort town nobody cares about the brand: the frightened herbivores sell at the board price, and so does the fence.
  merchant: {
    title: 'The goat behind the bars',
    note: 'He passes everything through the bars at arm\'s length. The board price, and no haggling.',
    wares: [{ supply: 'smoked-fish', fair: true }, { supply: 'smelling-salts', fair: true }, { supply: 'firepot', fair: true }, { gear: 'garrison-buckler', price: 25 }],
  },
  fence: {
    title: 'The weasel in the alley',
    note: 'Fair prices, for a market that isn\'t supposed to exist. She buys fish, too.',
    wares: [{ sellCatch: true }, { supply: 'smelling-salts', fair: true }, { supply: 'firepot', fair: true }],
  },
  // The capital charges the branded the same as anywhere in the farmland.
  apothecary: {
    title: 'The apothecary',
    note: 'Church-licensed remedies, priced on a schedule for the branded.',
    wares: [{ supply: 'smelling-salts' }, { supply: 'smoked-fish' }, { supply: 'firepot' }, { gear: 'saints-medal', price: 40 }],
  },
  // Wickmere's herbalist: antivenom, which everyone buys, for a sickness it doesn't cure.
  herbalist: {
    title: 'The herbalist',
    note: 'Bunches of marsh herbs hang from the ceiling. The antivenom is on the counter, where she can watch it.',
    wares: [{ supply: 'antivenom' }, { supply: 'trail-cake' }, { supply: 'herb-salve' }, { supply: 'smelling-salts' }],
  },
  // The hold's magpie: whatever came up the mountain before the rookery shut.
  magpie: {
    title: 'The magpie',
    note: 'Bright things, mostly. Nothing has come up the mountain in a year, and it shows in the prices.',
    wares: [{ supply: 'trail-cake' }, { supply: 'herb-salve' }, { supply: 'smelling-salts' }, { supply: 'antivenom' }, { supply: 'firepot' }],
  },
  // The seal at the smugglers' creek: sea goods, never stamped.
  smuggler: {
    title: 'The seal\'s oilcloth',
    note: 'Salt fish, firepots wrapped in tar, and a few things from further out. No prices. She looks at you and decides.',
    wares: [{ supply: 'fish-stew' }, { supply: 'smoked-fish' }, { supply: 'firepot' }, { supply: 'antivenom' }, { gear: 'smuggled-blade', price: 30 }],
  },
  // After dark, behind the tannery: things the church would rather nobody owned.
  'night-market': {
    title: 'The shuttered stall, open',
    note: 'Lamplight through the slats. No prices chalked anywhere. She tells you, and you pay.',
    wares: [{ gear: 'night-cloak', price: 30 }, { gear: 'smuggled-blade', price: 35 }, { gear: 'banned-hymnal', price: 60 }, { supply: 'smelling-salts', fair: true }],
  },
  // The fort's smith tempers a keepsake once: its benefits grow by half, its drawbacks don't change.
  smith: {
    title: 'The smith',
    note: 'He looks at each thing a long time before he names a price. Whatever it gives you, tempered, it gives more. What it costs you stays.',
    wares: KEEPSAKE_IDS.map(id => ({ temper: id, price: 30 })),
  },
  reeve: {
    title: 'The reeve',
    note: 'A writ can be earned, or the fine can be paid.',
    wares: [{ deed: 'writ-given', name: "The bear's writ", text: 'Releases the bear into your custody. Show it to the miller.', price: 60 }],
  },
};
