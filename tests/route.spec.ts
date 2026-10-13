import { test, expect } from './fixtures';

// Plays the whole story at the level of its rules: from an empty world, it walks every area the open exits reach, takes every
// conversation, reply, purchase, and fight that changes the story, and grinds ordinary fights for coins only when nothing else
// moves. Main-story steps come first. It stops at the good ending, or where nothing more can be done, and reports the way it took,
// with every fight on it simulated for a player who never dodges, one who half-dodges, and one who dodges perfectly.
// It reads the rules only: where leaping, climbing, or a solid prop blocks the way on the map is for the other specs.
test('the story can be played from the church to the ending', async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto('/?practice');
  const report = await page.evaluate(async () => {
    const { AREAS } = await import('/src/scenes/areas.ts');
    const W = await import('/src/rules/world.ts');
    const { orders } = await import('/src/rules/orders.ts');
    const { BOUNTY, canBuy, buy } = await import('/src/rules/economy.ts');
    const { SHOPS } = await import('/src/content/shops.ts');
    const { WAYSTONES } = await import('/src/rules/waystones.ts');
    const { BOUTS, boutWon } = await import('/src/rules/ring.ts');
    type Context = import('../src/rules/world').Context;
    type Effect = import('../src/rules/world').Effect;
    type Choice = import('../src/content/dialogue').Choice;
    type Action = { area: string; who: string; text: string; effect: Effect; fight?: string; grind?: boolean };
    const byKey = new Map(AREAS.map(area => [area.key, area]));
    // Choices that close the story or turn the hero against the main road are left until they are all that is left.
    const final = (effect: Effect) => Boolean(effect.ending) || [effect.set ?? []].flat().some(flag => flag === 'human-seated');
    const key = (c: Context) => JSON.stringify([[...c.world.flags].sort(), [...c.world.carried].sort(), [...c.world.found].sort(), [...c.studied].sort(), c.world.fallen ?? []]);

    // The places the open ways reach, and everything that can be done in them.
    const survey = (c: Context) => {
      const seen = new Set<string>(['church']), queue = ['church'], actions: Action[] = [];
      const reach = (to: string) => { if (!seen.has(to) && byKey.has(to)) { seen.add(to); queue.push(to); } };
      const offer = (area: string, who: string, text: string, effect?: Effect) => {
        if (!effect) return;
        if (effect.sail) reach(effect.sail === 'out' ? 'outlaw-port' : 'creek');
        if (effect.travel) reach(WAYSTONES[effect.travel].area);
        actions.push({ area, who, text, effect });
        if (effect.shop) for (const ware of SHOPS[effect.shop].wares) if ('deed' in ware && !c.world.flags.includes(ware.deed))
          actions.push({ area, who, text: `buy ${ware.name}`, effect: { set: ware.deed, pay: 0 }, ...{ ware } } as Action);
        if (effect.bout !== undefined) actions.push({ area, who, text: 'the Talon Ring', effect: { bout: effect.bout }, fight: 'ring' });
      };
      const walk = (area: string, who: string, choices: readonly Choice[] | undefined, depth: number) => {
        if (depth > 6) return;
        for (const choice of W.replies(choices, c)) {
          offer(area, who, choice.text, choice.then);
          walk(area, who, choice.choices, depth + 1);
        }
      };
      while (queue.length) {
        const area = byKey.get(queue.shift()!)!;
        for (const exit of Object.values(area.exits)) if (!exit.requires || W.holds(c, exit.requires)) reach(exit.to);
        for (const [who, line] of Object.entries(area.dialogue)) {
          if (line.hiddenIf?.some(condition => W.holds(c, condition))) continue;
          const said = W.conversation(area.dialogue, who, c);
          offer(area.key, who, said.lines[0]?.slice(0, 50) ?? '', said.then);
          walk(area.key, who, said.choices, 0);
        }
        for (const enemy of area.enemies) if (!enemy.hiddenIf?.some(condition => W.holds(c, condition)))
          actions.push({ area: area.key, who: enemy.point, text: `fight the ${enemy.encounter}`, effect: { ...enemy.defeat, earn: (enemy.defeat?.earn ?? 0) + BOUNTY[enemy.encounter] }, fight: enemy.encounter });
      }
      return { reached: seen, actions };
    };

    const take = (c: Context, action: Action): Context => {
      const ware = (action as Action & { ware?: Parameters<typeof buy>[1] }).ware;
      if (ware) return canBuy(c.world, ware) ? { ...c, world: buy(c.world, ware) } : c;
      if (action.effect.bout !== undefined) return { ...c, world: BOUTS.reduce((world, _, index) => boutWon(world, index), c.world) };
      let next = W.apply(c, action.effect);
      if (action.effect.shells) next = { ...next, world: { ...next.world, flags: [...new Set([...next.world.flags, 'shells-won' as const])] } };
      if (action.effect.arm) next = { ...next, world: { ...next.world, flags: [...new Set([...next.world.flags, 'arm-won' as const])] } };
      return next;
    };

    let c: Context = { world: W.createWorld(), lost: [], studied: [] };
    const steps: { order: string; area: string; who: string; text: string; fight?: string; coins: number }[] = [];
    const fights: { encounter: string; area: string; order: string; roster: string[]; found: string[]; grind: boolean }[] = [];
    let grinds = 0, stuck = '', waited = '';
    for (let step = 0; step < 3000; step++) {
      const now = orders(c.world);
      if (c.world.flags.includes('human-spared')) break;
      const { actions } = survey(c);
      const before = key(c);
      const useful = actions.map(action => ({ action, next: take(c, action) })).filter(({ next }) => key(next) !== before);
      // The main road first; then anything else that changes the story; endings last.
      const rank = ({ action, next }: { action: Action; next: Context }) =>
        (final(action.effect) ? 100 : 0) + (orders(next.world).next !== now.next || orders(next.world).title !== now.title ? 0 : 10) + (action.fight ? 1 : 0);
      const pick = useful.sort((a, b) => rank(a) - rank(b))[0];
      if (pick && (!final(pick.action.effect) || now.title === 'The island')) {
        c = pick.next;
        steps.push({ order: `${now.title}: ${now.next}`, area: pick.action.area, who: pick.action.who, text: pick.action.text, fight: pick.action.fight, coins: c.world.coins });
        if (pick.action.fight) fights.push({ encounter: pick.action.fight, area: pick.action.area, order: now.title, roster: W.roster(c.world), found: [...c.world.found], grind: false });
        continue;
      }
      // Some things only happen after dark, or by day: let the time turn once before anything else.
      if (waited !== before) {
        waited = before;
        c = { ...c, world: { ...c.world, night: !c.world.night } };
        steps.push({ order: `${now.title}: ${now.next}`, area: '', who: '', text: c.world.night ? 'wait for night' : 'wait for day', coins: c.world.coins });
        continue;
      }
      // Nothing changes the story: earn coins in the best-paying fight that comes back, in case something is waiting on a price.
      const farm = actions.filter(action => action.fight && action.fight !== 'ring' && !action.effect.set).sort((a, b) => (b.effect.earn ?? 0) - (a.effect.earn ?? 0))[0];
      if (farm && grinds < 400 && c.world.coins < 400) {
        grinds++;
        c = { ...c, world: { ...c.world, coins: c.world.coins + (farm.effect.earn ?? 0) } };
        fights.push({ encounter: farm.fight!, area: farm.area, order: now.title, roster: W.roster(c.world), found: [...c.world.found], grind: true });
        continue;
      }
      stuck = `${now.title}: ${now.next}`;
      break;
    }
    // Every fight on the way, from full health, as a player who never dodges, one who half-dodges, and one who dodges perfectly.
    const B = await import('/src/rules/battle.ts');
    type Battle = import('../src/rules/battle').Battle;
    const play1 = (start: Battle, dodge: 'miss' | 'graze' | 'perfect', style: 'cast' | 'plain' | 'guard' | 'study') => {
      let b = start;
      for (let round = 0; round < 40 && (b.phase === 'player' || b.phase === 'enemy'); round++) {
        while (b.phase === 'enemy') { const next = B.nextStrike(b); b = B.strike(b, next?.dodgeable ? dodge : 'miss'); }
        for (const member of b.party) {
          if (b.phase !== 'player' || member.health <= 0) continue;
          // The leader first, unless followers shield him or he is already down.
          const foe = B.warded(b) || b.enemy.health <= 0 ? b.followers.findIndex(follower => follower.health > 0) + 1 : 0;
          // The cuckoo wearing a friend: whoever's mana hasn't moved is him.
          const disguised = b.impostor && b.impostor.as !== member.id ? b.impostor.as : undefined;
          // A fallen friend under a barrier can't be fed on.
          const fallen = b.encounter === 'hyena' ? b.party.find(other => other.health <= 0 && !other.barrier) : undefined;
          const weakest = [...b.party].filter(other => other.health > 0).sort((x, y) => x.health / x.maxHealth - y.health / y.maxHealth)[0];
          const tries = [() => disguised ? B.act(b, member.id, 'unmask', disguised) : b,
            () => fallen ? B.act(b, member.id, 'barrier', fallen.id) : b,
            // Studying the coming spell, so it can be dodged.
            () => style === 'study' ? B.act(b, member.id, 'analyze') : b,
            () => style === 'guard' && member.id === 'bear' && weakest ? B.act(b, member.id, 'support', weakest.id) : b,
            () => style === 'cast' && B.canCast(b, member.id, foe) ? B.cast(b, member.id, true, foe) : b, () => B.act(b, member.id, 'attack', member.id, foe), () => B.act(b, member.id, 'gather'), () => B.act(b, member.id, 'support')];
          for (const attempt of tries) { const next = attempt(); if (next !== b) { b = next; break; } }
        }
      }
      const party = b.party.reduce((sum, member) => sum + Math.max(0, member.health), 0), full = b.party.reduce((sum, member) => sum + member.maxHealth, 0);
      return { won: b.phase === 'victory', rounds: b.round, left: Math.round(100 * party / full), enemy: `${b.enemy.health}/${b.enemy.maxHealth}`, tail: b.log.slice(-4) };
    };
    // The best of four ways to fight: casting whenever a spell is ready, attacking only, the bear guarding the weakest, or studying each spell first.
    const play = (start: Battle, dodge: 'miss' | 'graze' | 'perfect') => (['cast', 'plain', 'guard', 'study'] as const).map(style => ({ style, ...play1(start, dodge, style) }))
      .sort((x, y) => Number(y.won) - Number(x.won) || y.left - x.left || x.rounds - y.rounds)[0];
    const boar = B.createBattle('boar', [], { roster: ['chameleon', 'bear'] });
    const boarWithBear = { never: play(boar, 'miss'), half: play(boar, 'graze'), expert: play(boar, 'perfect') };
    // The human casts the memories the tide took: a player who has died a few times faces more of them.
    const human = (lost: number) => { const start = B.createBattle('human', [], { roster: ['chameleon', 'bear', 'vulture'], lostMemories: (['feast', 'trial', 'kraken', 'bear', 'vulture', 'frog'] as const).slice(0, lost) }); return { lost, never: play(start, 'miss'), half: play(start, 'graze'), expert: play(start, 'perfect') }; };
    const humans = [0, 2, 4, 6].map(human);
    const battles = fights.filter(fight => !fight.grind && fight.encounter !== 'ring').map(fight => {
      const area = byKey.get(fight.area)!;
      const enemy = area.enemies.find(enemy => enemy.encounter === fight.encounter)!;
      const world = { ...W.createWorld(), flags: [] as never[] };
      const roster = fight.roster as import('../src/rules/battle').MemberId[];
      const lineup = W.lineup({ ...world, flags: [...(roster.includes('bear') ? ['bear-free'] : []), ...(roster.includes('vulture') ? ['vulture-free'] : []), ...(roster.includes('frog') ? ['frog-free'] : []), ...(roster.includes('octopus') ? ['octopus-free'] : [])] as never[] }, B.LIEUTENANTS.includes(fight.encounter as never));
      const start = B.createBattle(fight.encounter as never, [], { roster: lineup, waves: enemy?.waves, company: enemy?.company });
      return { fight: `${fight.encounter} (${fight.area})`, order: fight.order, party: lineup.join('+'), never: play(start, 'miss'), half: play(start, 'graze'), expert: play(start, 'perfect') };
    });
    return { humans, boarWithBear, battles, ending: c.world.flags.includes('human-spared'), stuck, steps, fights, grinds, flags: c.world.flags.length, reached: [...survey(c).reached], unreached: AREAS.map(area => area.key).filter(key => !survey(c).reached.has(key)) };
  });
  // The way taken, and how every fight on it went, for reading when the balance changes.
  await test.info().attach('route.json', { body: JSON.stringify(report, null, 1), contentType: 'application/json' });
  expect(report.stuck).toBe('');
  expect(report.ending).toBe(true);
  expect(report.unreached).toEqual([]);
  // Nobody meets the boar alone: his sister waits until the bear is free.
  expect(report.battles.find(battle => battle.fight.startsWith('boar'))!.party).toContain('bear');
});
