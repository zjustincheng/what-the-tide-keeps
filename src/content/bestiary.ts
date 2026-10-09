import type { Encounter } from '../rules/battle';

// What the hero knows of everything he has fought, written as he might put it. Names are placeholders.
export const BESTIARY: Record<Encounter, string> = {
  locust: 'Grown fat on church-dosed wheat. It doesn\'t hide its mana; it doesn\'t need to. Its mandibles strike twice.',
  weevil: 'A grain weevil the size of a handcart. Every third turn it tucks in and rolls, and nothing stops that but a guard.',
  acolyte: 'One of the boar\'s hooded followers. Veils its mana and casts Salt lance. Study the spell and a barrier stops it.',
  swarm: 'The swarm-mother, nesting in the dark woods. Her brood fights on without her, and she calls the fallen back. Brought down once, she takes the air.',
  warden: 'A shrine warden. While its votives burn, nothing touches it: put them out first. Its Judgement is a spell; study it. Brought down once, the votives relight.',
  leech: 'The mire leech, under the ford. What it bites, it keeps, and grows fat on. Dodge or guard and it starves. Brought down once, it sheds its skin.',
  boar: 'An omnivore Millbrook burned out over a kid who came home alive. He takes every blow aimed at his followers and grows furious. Brought down once, he gets up.',
  hound: 'Starved since the commons were closed to them. Lunges fast.',
  pack: 'The pack leader in the old watchtower. His rush grows with every hound standing beside him. Brought down once, he howls the fallen back up.',
  wisp: 'A light over the drowned hamlet, the height of a lantern held by someone short. Its Marsh-fire is a spell, and very fast.',
  drowned: 'Something in a rotted cassock, still holding the chapel\'s bell rope. Tolls the Drowning toll, a spell. Brought down once, it rises with the bell itself.',
  raider: 'Highland raiders hide their mana until they are on you. Their ambush cut drives through a guard.',
  ghoul: 'The raised dead of the old battlefield. Whatever it bites, it keeps.',
  vulture: 'She takes you for a grave thief. She can\'t be beaten; live through three rounds. Better still, bring her own note.',
  pair: 'Two deserters, a hexer and a brute. The hexer casts Salt lance while the brute swings: guard against one, bar the other.',
  hyena: 'The gravedigger of the winter of no bread. Anyone falling feeds her, on either side; a barrier keeps her off a fallen body. Brought down once, she eats her own dead and rises.',
  captain: 'A garrison captain who walked off the walls with his company, and kept the walls. His volleys come three at a time, and he executes the fallen through any guard. Kill the lieutenant or live with the bolts.',
  harrier: 'Hawks who rob the couriers\' road from the air, since the holds stopped sending escorts. Its stoop goes through any guard: dodge it.',
  inquisitor: 'A royal investigator, certain of your guilt. His Verdict cannot be dodged or barred. You cannot win this yet. Run.',
};
