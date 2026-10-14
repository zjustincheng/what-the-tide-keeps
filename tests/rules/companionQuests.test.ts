import { test } from 'node:test';
import assert from 'node:assert/strict';
import { frogReturn, octopusReturn, vultureReturn, withFrogBook, withFrogReplies, withOctopusReplies, withVultureReplies } from '../../src/content/companionQuests.ts';
import { fortLore } from '../../src/content/lore.ts';
import { hospice, wickmere } from '../../src/content/marsh.ts';
import { seaPens } from '../../src/content/ocean.ts';
import { apply, conversation, createWorld, drop, holds, replies } from '../../src/rules/world.ts';
import type { Context, Flag } from '../../src/rules/world';
import type { Dialogue } from '../../src/content/dialogue';
import { forgetAll, held, keepMemory, tideTakesAll, wipe } from '../../src/rules/memory.ts';
import { act, canAct, createBattle, DOSE, MIMIC_COST, mimicCost } from '../../src/rules/battle.ts';
import { canEquip, createGear, equip, KEEPSAKES } from '../../src/rules/gear.ts';
import { leads } from '../../src/rules/orders.ts';

const ctx = (flags: Flag[] = []): Context => ({ world: { ...createWorld(), flags }, lost: [], studied: [] });
const reply = (dialogue: Dialogue, point: string, context: Context, text: string) =>
  replies(conversation(dialogue, point, context).choices, context).find(choice => choice.text.startsWith(text));

// Each quest, from asking to go back to the keepsake: both endings must give it, once, and it must hold that companion's memory.
const QUESTS = [
  { who: 'vulture', ready: ['vulture-free', 'hyena-slain'], back: [vultureReturn, 'vulture-return'], keepsake: 'tally-stone', done: 'vulture-quest-complete',
    read: (context: Context) => reply(withVultureReplies(fortLore), 'chaplain', context, 'Show the vulture her line')! },
  { who: 'frog', ready: ['frog-free', 'viper-slain'], back: [frogReturn, 'frog-return'], keepsake: 'glass-dropper', done: 'frog-quest-complete',
    read: (context: Context) => ({ ...conversation(withFrogBook(hospice), 'ward-book', context), text: 'the ward book' }) },
  { who: 'octopus', ready: ['octopus-free', 'cuttlefish-slain'], back: [octopusReturn, 'octopus-return'], keepsake: 'net-knot', done: 'octopus-quest-complete',
    read: (context: Context) => reply(withOctopusReplies(seaPens), 'elder', context, 'The octopus wants to see its knot')! },
] as const;

test('each companion quest runs from going back, to reading what was written, to either ending, to a keepsake that holds their memory', () => {
  for (const quest of QUESTS) {
    const [dialogue, point] = quest.back;
    let context = ctx([...quest.ready]);
    context = apply(context, conversation(dialogue, point, context).then!);
    const record = quest.read(context);
    assert.ok(record, `${quest.who}: the record can be read once they have asked`);
    context = apply(context, record.then!);
    const [stay, leave, wait] = record.choices!;
    assert.match(wait.text, /Not yet/);
    // The frog's first ending needs one more step: the copy taken to the magistrate.
    let accountable = apply(context, stay.then!);
    if (quest.who === 'frog') {
      assert.equal(conversation(dialogue, point, accountable).choices, undefined, 'carrying the copy is not the end of it');
      accountable = apply(accountable, reply(withFrogReplies(wickmere), 'magistrate', accountable, 'Show him the ward book')!.then!);
    }
    for (const route of [accountable, apply(context, leave.then!)]) {
      const reward = conversation(dialogue, point, route).choices![0].then!;
      assert.equal(reward.find, quest.keepsake); assert.equal(reward.keepMemory, quest.who);
      const finished = apply(route, reward);
      assert.ok(finished.world.flags.includes(quest.done));
      assert.equal(finished.world.found.filter(id => id === quest.keepsake).length, 1);
      assert.equal(conversation(dialogue, point, finished).choices, undefined, `${quest.who}: the keepsake is given once`);
      assert.ok(drop(finished.world).found.includes(quest.keepsake), 'a wipe never takes it');
      assert.equal(KEEPSAKES[quest.keepsake].keeps, quest.who);
      assert.equal(canEquip([quest.keepsake], 'chameleon', quest.keepsake), false, 'it fits only its companion');
    }
  }
});

test('the quests wait for the region\'s lieutenant, and for the companion to be standing', () => {
  const hidden = (dialogue: Dialogue, point: string, context: Context) => (dialogue[point].hiddenIf ?? []).some(condition => holds(context, condition));
  const asked = { vulture: 'vulture-field-returned', frog: 'frog-ward-returned', octopus: 'octopus-grave-returned' } as const;
  for (const quest of QUESTS) {
    const [dialogue, point] = quest.back;
    assert.ok(hidden(dialogue, point, ctx([quest.ready[0]])), `${quest.who}: nothing to ask before the lieutenant is dead`);
    assert.ok(!hidden(dialogue, point, ctx([...quest.ready])), `${quest.who}: asks once it is`);
    const standing = ctx([...quest.ready, asked[quest.who]]);
    const down: Context = { ...standing, world: { ...standing.world, fallen: [quest.who] } };
    assert.ok(hidden(dialogue, point, down), `${quest.who}: not while they have fallen`);
    const record = quest.read(down);
    assert.ok(!record || record.then?.set === undefined || !String(record.then.set).endsWith('read'), `${quest.who}: their record waits for them`);
  }
});

test('the quests leave everything those people already said in place', () => {
  // The chaplain still answers about resurrection; the magistrate keeps his own replies; the ward book keeps its history.
  const chaplain = conversation(withVultureReplies(fortLore), 'chaplain', ctx());
  assert.ok(chaplain.choices!.some(choice => choice.text === 'What does it cost?'));
  const magistrate = conversation(withFrogReplies(wickmere), 'magistrate', ctx(['viper-slain']));
  assert.match(magistrate.lines.join(' '), /properly contained/);
  assert.match(conversation(withFrogBook(hospice), 'ward-book', ctx(['viper-slain'])).lines.join(' '), /IT WAS THE FOOD/);
  // The elder's pearl is never hidden by the octopus's ending: her thanks come first.
  const freed: Flag[] = ['octopus-free', 'cuttlefish-slain', 'octopus-knot-cut', 'nets-cut', 'squid-freed', 'newt-freed'];
  assert.equal(conversation(withOctopusReplies(seaPens), 'elder', ctx(freed)).then?.find, 'elder-pearl');
});

test('every line in a quest conversation is spoken by someone, in order', () => {
  const choices = [
    reply(withVultureReplies(fortLore), 'chaplain', ctx(['vulture-free', 'hyena-slain', 'vulture-field-returned']), 'Show the vulture her line')!,
    reply(withOctopusReplies(seaPens), 'elder', ctx(['octopus-free', 'cuttlefish-slain', 'octopus-grave-returned']), 'The octopus wants to see its knot')!,
    reply(withFrogReplies(wickmere), 'magistrate', ctx(['frog-free', 'viper-slain', 'frog-book-taken']), 'Show him the ward book')!,
  ];
  for (const choice of choices) {
    assert.equal(choice.voices?.length, choice.lines.length, choice.text);
    for (const ending of choice.choices ?? []) if (ending.voices) assert.equal(ending.voices.length, ending.lines.length, ending.text);
  }
  const book = conversation(withFrogBook(hospice), 'ward-book', ctx(['frog-free', 'viper-slain', 'frog-ward-returned']));
  assert.equal(book.voices?.length, book.lines.length);
  // The giving itself talks about the person, not equipment.
  for (const quest of QUESTS) {
    const [dialogue, point] = quest.back;
    const settled = { vulture: 'vulture-roll-taken', frog: 'frog-ward-left', octopus: 'octopus-knot-cut' }[quest.who] as Flag;
    assert.doesNotMatch(conversation(dialogue, point, ctx([...quest.ready, settled])).choices![0].lines.join(' '), /equip|permanently|mana/);
  }
});

test('the journal says what each companion is waiting for', () => {
  const note = (flags: Flag[]) => leads({ ...createWorld(), flags }).join(' ');
  assert.match(note(['vulture-field-returned']), /chaplain’s roll/);
  assert.match(note(['vulture-field-returned', 'vulture-roll-taken']), /stone from the graves/);
  assert.match(note(['frog-ward-returned', 'frog-book-taken']), /magistrate in Wickmere/);
  assert.match(note(['octopus-grave-returned']), /elder put it/);
  assert.doesNotMatch(note(['octopus-grave-returned', 'octopus-quest-complete']), /octopus/);
});

test('a keepsake from a quest holds that companion\'s memory through every wipe', () => {
  for (const who of ['vulture', 'frog', 'octopus'] as const) {
    let memory = keepMemory({ lost: [who, 'home', 'name'], pending: false }, who);
    assert.ok(held(memory).includes(who));
    for (let death = 1; death < 20; death++) {
      const owed = wipe(memory, 2);
      memory = forgetAll(owed, tideTakesAll(owed, death));
      assert.ok(held(memory).includes(who), `${who} is still remembered after death ${death}`);
    }
  }
});

test('the tally stone gives the vulture something back when her blow fells an enemy, and only then', () => {
  const gear = equip(createGear(), ['tally-stone'], 'vulture', 0, 'tally-stone');
  const start = createBattle('swarm', [], { gear });
  const hurt = { ...start, party: start.party.map(member => member.id === 'vulture' ? { ...member, mana: 2, health: 5 } : member) };
  // A nymph on its last legs: her blow fells it.
  const weak = { ...hurt, followers: hurt.followers.map((follower, index) => index === 0 ? { ...follower, health: 1 } : follower) };
  const felled = act(weak, 'vulture', 'attack', 'chameleon', 1);
  const after = felled.party.find(member => member.id === 'vulture')!;
  assert.equal(after.mana, 2 + 3); assert.equal(after.health, 5 + 3);
  assert.match(felled.log.join(' '), /takes something back/);
  // A blow that leaves it standing gives nothing back.
  const glancing = act(hurt, 'vulture', 'attack', 'chameleon', 1).party.find(member => member.id === 'vulture')!;
  assert.equal(glancing.mana, 2); assert.equal(glancing.health, 5);
  // Without the stone, felling it gives nothing either.
  const bare = createBattle('swarm');
  const plain = { ...bare, party: bare.party.map(member => member.id === 'vulture' ? { ...member, mana: 2, health: 5 } : member), followers: bare.followers.map((follower, index) => index === 0 ? { ...follower, health: 1 } : follower) };
  assert.equal(act(plain, 'vulture', 'attack', 'chameleon', 1).party.find(member => member.id === 'vulture')!.mana, 2);
});

test('the glass dropper doubles the frog\'s dose, and the net knot halves the price of Mimic', () => {
  const roster = ['chameleon', 'frog', 'octopus'] as const;
  const dropper = equip(createGear(), ['glass-dropper'], 'frog', 0, 'glass-dropper');
  const battle = createBattle('locust', [], { gear: dropper, roster: [...roster] });
  const wounded = { ...battle, party: battle.party.map(member => member.id === 'chameleon' ? { ...member, health: 1 } : member) };
  const dosed = act(wounded, 'frog', 'support', 'chameleon').party.find(member => member.id === 'chameleon')!;
  assert.equal(dosed.health, 1 + DOSE * 2);
  const knot = equip(createGear(), ['net-knot'], 'octopus', 0, 'net-knot');
  const copying = createBattle('acolyte', ['Salt lance'], { gear: knot, roster: [...roster] });
  const octopus = copying.party.find(member => member.id === 'octopus')!;
  assert.equal(mimicCost(octopus), MIMIC_COST - 2);
  const low = { ...copying, party: copying.party.map(member => member.id === 'octopus' ? { ...member, mana: 2 } : member) };
  assert.ok(canAct(low, 'octopus', 'support'), 'two mana is enough with the knot');
  assert.equal(act(low, 'octopus', 'support').party.find(member => member.id === 'octopus')!.mana, 0);
  const without = createBattle('acolyte', ['Salt lance'], { roster: [...roster] });
  assert.equal(canAct({ ...without, party: without.party.map(member => member.id === 'octopus' ? { ...member, mana: 2 } : member) }, 'octopus', 'support'), false);
});
