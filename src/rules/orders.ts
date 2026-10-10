// What the church has ordered, and what the hero has picked up along the way, read from where the story stands.
// Written plainly, as the hero would remind himself: where to go and who to ask, never how it ends.
import type { Flag, Item, World } from './world';

export type Orders = Readonly<{ title: string; given: string; next: string }>;

// The current orders: the region's aim, and the next thing that would move it on.
export function orders(world: World): Orders {
  const has = (flag: Flag) => world.flags.includes(flag);
  const carrying = (item: Item) => world.carried.includes(item);
  if (!has('boar-defeated')) return {
    title: 'The farmland', given: 'Grain has stopped reaching the highlands. Find out why.',
    next: !has('bear-free') ? 'The bear is chained to the mill west of the stream. The reeve in Millbrook can sign a writ for him.'
      : !has('kid-found') ? 'The boar was burned out over the miller\'s kid, who never came home. Someone on the downs might know where the kid went.'
      : !has('burn-order-seen') ? 'Someone signed the order to burn the boar out. The records are in the reeve\'s hall in Millbrook.'
      : !has('lane-open') ? 'The boar\'s sister keeps his lane off the border road. Tell her what you know.'
      : 'The boar waits in the ashes of his farm, up the lane.',
  };
  if (!has('hyena-slain')) return {
    title: 'The highlands', given: 'Bodies are going missing from the old battlefield below the highland fort. Put the grave-eaters down.',
    next: !has('vulture-free') ? 'A vulture clears the dead on the battlefield. She takes everyone for a grave thief. Something of hers is in the fort\'s barracks.'
      : !has('pair-slain') ? 'Two deserters hold the abbey gate past the battlefield.'
      : !(has('dead-1') && has('dead-2') && has('dead-3')) ? 'The monk at the abbey keeps the ossuary key until his dead are buried. Three lie unburied in the abbey yard.'
      : !has('ossuary-key') ? 'The dead are buried. The monk owes you the ossuary key.'
      : !has('lantern') ? 'The ossuary is too dark for a candle. The garrison\'s signal lantern is in the old border fort, north of the fort town.'
      : 'Go down into the ossuary, with the key and the lantern.',
  };
  if (!has('viper-slain')) return {
    title: 'The marsh', given: 'A sickness in the river towns, and the church\'s stores at Wickmere are spoiling. Guard the hospice. Find what is spoiling.',
    next: !has('brood-slain') && !has('channel-firm') ? 'The crane at the weir ferries you downriver. In Wickmere, the ferryman wants the reed-bed queen on the causeway dead.'
      : !has('channel-firm') ? 'The reed-bed queen is dead. Tell the ferryman in Wickmere.'
      : !has('apprentice-slain') && !carrying('venom-vial') && !has('frog-free') ? 'Cross the channel to the far bank. Something is wrong in the church storehouse.'
      : !has('frog-free') ? (carrying('venom-vial') ? 'Show the frog in the hospice what you found.' : 'Search the storehouse on the far bank.')
      : 'The viper is in the flooded apothecary on the far bank. Take the frog.',
  };
  return {
    title: 'Waiting', given: 'Wickmere is quiet. Someone asked the church what the lighthouse is. Nobody has come back down with an answer.',
    next: 'The holds\' gate is shut at the top of the rookery road. For now, walk where you like.',
  };
}

// Things carried and promises made: each with who it is for.
export function leads(world: World): string[] {
  const has = (flag: Flag) => world.flags.includes(flag);
  const carrying = (item: Item) => world.carried.includes(item);
  return [
    ...(carrying('bell') ? ['A small brass bell. The lamb in Millbrook lost one.'] : []),
    ...(has('barrel-bought') && !has('squid-freed') ? ['The fishmonger\'s barrel has a live squid in it. The mill stream runs to the sea.'] : []),
    ...(carrying('crate') ? ['A crate from the weir\'s smuggler, for the weasel in the fort town\'s alley.'] : []),
    ...(carrying('letter') ? ['A courier\'s letter with a church seal, for the quartermaster in the fort town.'] : []),
    ...(carrying('note') ? ['The vulture\'s own note, from the barracks. Give it to her.'] : []),
    ...(carrying('ring') ? ['A ring from under the ice. The trapper at the tarn.'] : []),
    ...(carrying('shrine-stone') ? ['A stone from the last shrine, for the pilgrim in the fields.'] : []),
    ...(carrying('raven-letter') ? ['The raven\'s letter, for under the holds\' gate at the top of the rookery road.'] : []),
    ...(carrying('sealed-order') ? ['An unsigned order sealed with a cuckoo\'s egg. The raven in the fort town should see it.'] : []),
    ...(carrying('venom-vial') ? ['The apprentice\'s vial of venom. The frog in the hospice.'] : []),
    ...(has('stood-count') && !has('salt-cut') ? ['The fox\'s word for the night market: the salt cut.'] : []),
    ...(has('old-roads') ? [] : carrying('shrine-stone') ? [] : ['The pilgrim in the fields is walking to the last shrine, on the harbour quay.']),
  ];
}
