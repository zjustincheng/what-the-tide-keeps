import type { Ware } from '../rules/economy';
import type { ShopId } from '../rules/world';

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
    wares: [{ supply: 'smoked-fish', fair: true }, { supply: 'smelling-salts', fair: true }, { supply: 'firepot', fair: true }],
  },
  fence: {
    title: 'The weasel in the alley',
    note: 'Fair prices, for a market that isn\'t supposed to exist. She buys fish, too.',
    wares: [{ sellCatch: true }, { supply: 'smelling-salts', fair: true }, { supply: 'firepot', fair: true }],
  },
  reeve: {
    title: 'The reeve',
    note: 'A writ can be earned, or the fine can be paid.',
    wares: [{ deed: 'writ-given', name: "The bear's writ", text: 'Releases the bear into your custody. Show it to the miller.', price: 60 }],
  },
};
