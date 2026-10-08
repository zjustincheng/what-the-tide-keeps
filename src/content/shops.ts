import type { Ware } from '../rules/economy';
import type { ShopId } from '../rules/world';

// What each shopkeeper offers. Names are placeholders.
export const SHOPS: Record<ShopId, { title: string; note: string; wares: Ware[] }> = {
  stall: {
    title: 'The stallholder',
    note: 'Citizen prices are chalked on the board. Yours are not.',
    wares: [{ supply: 'smoked-fish' }, { supply: 'smelling-salts' }, { supply: 'firepot' }],
  },
  reeve: {
    title: 'The reeve',
    note: 'A writ can be earned, or the fine can be paid.',
    wares: [{ deed: 'writ-given', name: "The bear's writ", text: 'Releases the bear into your custody. Show it to the miller.', price: 60 }],
  },
};
