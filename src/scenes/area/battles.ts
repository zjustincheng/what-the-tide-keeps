import Phaser from 'phaser';
import { downed, drainedAfter, LIEUTENANTS, MEMBERS, woundsAfter } from '../../rules/battle';
import type { Battle } from '../../rules/battle';
import { recall, wipe } from '../../rules/memory';
import { apply, conversation, drop, fell, fleeing } from '../../rules/world';
import { boutAfter, boutWon, BOUTS } from '../../rules/ring';
import { BOUNTY } from '../../rules/economy';
import { hunting } from '../../rules/pursuit';
import { loadMemory, saveMemory } from '../../storage/memory';
import { loadWorld, saveWorld } from '../../storage/world';
import { loadPursuit } from '../../storage/pursuit';
import { seenStories } from '../../storage/presentation';
import { STORIES, BOSS_STORIES, BOSS_AFTERMATH } from '../../presentation/stories';
import { BattleView } from '../../ui/BattleView';
import { music } from '../../audio/music';
import { battleTheme } from '../../audio/themes';
import type { AreaScene } from '../AreaScene';
import type { Foe } from './foes';
import { save } from './shared';

// The first fight, before the feast: all five against the kraken. Losing it only starts it again.
export function beginKrakenTutorial(scene: AreaScene) {
  scene.halt();
  music.play(battleTheme('kraken'));
  scene.overlay = new BattleView(scene.textures.getBase64('hero'), won => {
    scene.overlay = undefined;
    if (won) {
      scene.showStory(STORIES.krakenSlain, () => {
        scene.showStory(STORIES.waking, () => {
          music.play(scene.area.music);
          scene.showAreaTitle('The Church');
        });
      }, true);
    } else {
      beginKrakenTutorial(scene);
    }
  }, 'kraken', { roster: ['chameleon', 'bear', 'vulture', 'frog', 'octopus'] }, true);
}

export function beginBattle(scene: AreaScene, foe: Foe, introduced = false) {
  // A foe just fled from gives the party a moment to get clear.
  if (scene.overlay || scene.talking || scene.leaving || !foe.sprite.active || (foe.fledAt !== undefined && scene.time.now - foe.fledAt < 2500)) return;
  // A hunt stays an escape sequence: ordinary encounters cannot interrupt it.
  if (hunting(loadPursuit()) && !foe.pursuer) return;
  const introduction = BOSS_STORIES[foe.encounter];
  if (!introduced && introduction && !seenStories().includes(introduction)) {
    scene.showStory(STORIES[introduction], () => beginBattle(scene, foe, true));
    return;
  }
  scene.input.keyboard?.resetKeys();
  scene.halt();
  music.play(battleTheme(foe.encounter));
  scene.overlay = new BattleView(scene.textures.getBase64('hero'), (won, battle) => {
    scene.overlay = undefined;
    if (foe.encounter === 'human' && battle.recoveredMemories.length) save.ok = saveMemory(battle.recoveredMemories.reduce((memory, id) => recall(memory, id), loadMemory())) && save.ok;
    if (won) {
      if (foe.pursuer) scene.hunt.finish('You drove him back. His hunt is over.');
      foe.sprite.disableBody(true, true);
      foe.signature.setVisible(false);
      music.play(scene.area.music);
      // The spoils, and whatever supplies were not used up.
      save.ok = saveWorld(fell({ ...loadWorld(), coins: loadWorld().coins + (foe.encounter === 'human' ? 0 : BOUNTY[foe.encounter]), supplies: battle.supplies, wounds: woundsAfter(battle), drained: drainedAfter(battle) }, downed(battle)));
      scene.renderMemory();
      if (foe.encounter !== 'human') mourn(scene, battle);
      if (foe.defeat) {
        const next = apply(scene.context(), foe.defeat);
        save.ok = saveWorld(next.world);
        scene.refreshProps();
      }
      // A region's lieutenant down: the brand knows, and the church will have new orders.
      const reportVictory = () => {
        if (foe.encounter === 'human') { scene.say(conversation(scene.area.dialogue, 'stranger', scene.context()), 'human'); return; }
        if (LIEUTENANTS.includes(foe.encounter)) scene.say({ speaker: 'THE BRAND', lines: [
          'The brand on your wrist goes warm, the way it does when the church wants you.',
          'It is done here. The priest will have new orders.',
        ], choices: [
          { text: 'Go back to the priest.', ends: true, lines: [], then: { church: true } },
          { text: 'Not yet.', ends: true, lines: ['There is still the region to walk. The church can wait. It always does.'] },
        ] }, 'hero');
      };
      const aftermath = BOSS_AFTERMATH[foe.encounter];
      if (aftermath && !seenStories().includes(aftermath)) {
        scene.showStory(STORIES[aftermath], reportVictory);
      } else {
        scene.resumeExploration();
        reportVictory();
      }
    } else if (battle.phase === 'fled') {
      // A getaway: half the coins dropped, the parting blow's wound kept, and some distance put between them.
      music.play(scene.area.music);
      save.ok = saveWorld(fell({ ...fleeing(loadWorld()), supplies: battle.supplies, wounds: woundsAfter(battle), drained: drainedAfter(battle) }, downed(battle)));
      mourn(scene, battle);
      const away = new Phaser.Math.Vector2(scene.player.x - foe.sprite.x, scene.player.y - foe.sprite.y).normalize().scale(36);
      scene.player.setPosition(scene.player.x + (away.x || 0), scene.player.y + (away.y || 36));
      foe.fledAt = scene.time.now;
      scene.renderMemory();
      scene.resumeExploration();
    } else {
      // Every wipe wakes the party at the church, wherever it fell.
      // At sea the church can't fetch you back cleanly: the tide takes two.
      scene.hunt.finish();
      save.ok = saveMemory(wipe(loadMemory(), scene.area.region === 'THE OCEAN' ? 2 : 1)) && saveWorld(drop(loadWorld()));
      scene.scene.start('church');
    }
  }, foe.encounter, { ...scene.partyOptions(true, LIEUTENANTS.includes(foe.encounter) || foe.encounter === 'human'), ambush: Boolean(foe.ambush && foe.hidden), surprise: scene.sneaking, waves: foe.waves, company: foe.company });
}

// Anyone carried off the field: rest won't bring them back. Only the church can.
function mourn(scene: AreaScene, battle: Battle) {
  const down = downed(battle);
  if (down.length) scene.notice(`${down.map(id => MEMBERS[id].name).join(' and ')} ${down.length > 1 ? 'are' : 'is'} down, and won't get up by a fire. Carry them to the church.`, 5000);
}

// A run in the Talon Ring: every bout, one straight after another. Each win pays its prize and sends the next one in at once,
// with no rest: wounds and spent mana carry. Losing or yielding walks the party out hurt, but nobody dies in the ring.
export function fightBout(scene: AreaScene, index: number, earned = 0) {
  const bout = BOUTS[index];
  if (scene.overlay || scene.leaving || !bout) return;
  scene.halt();
  music.play(battleTheme(bout.encounter));
  const herald = index === 0 ? `"${bout.name}!" The gate goes up. ${bout.text}`
    : `No water, no rest. The gate goes up again before the last one is dragged out. "${bout.name}!" ${bout.text}`;
  scene.overlay = new BattleView(scene.textures.getBase64('hero'), (won, battle) => {
    scene.overlay = undefined;
    const next = won ? boutAfter(index) : undefined;
    // Between bouts, wounds carry as they are. At the end, nobody leaves the ring dead: the fallen are carried out with a little life left.
    const wounds = next !== undefined ? woundsAfter(battle)
      : Object.fromEntries(Object.entries(woundsAfter(battle)).map(([id, wound]) => [id, Math.min(wound, (battle.party.find(member => member.id === id)?.maxHealth ?? 1) - 1)]));
    const world = loadWorld();
    const kept = { ...world, supplies: battle.supplies, wounds, drained: drainedAfter(battle) };
    save.ok = saveWorld(won ? boutWon(kept, index) : kept);
    scene.renderMemory();
    const total = earned + (won ? bout.prize : 0);
    if (next !== undefined) { scene.time.delayedCall(300, () => fightBout(scene, next, total)); return; }
    music.play(scene.area.music);
    scene.resumeExploration();
    scene.say({ speaker: 'THE RINGMASTER', lines: won
      ? [`"The champion is down!" The stands come apart. He counts out ${bout.prize} coins, ${total} in all tonight, without looking at you.${bout.find && !world.found.includes(bout.find) ? ' Then he puts the champion\'s torc round your neck, as if hanging something on a thorn.' : ''}`]
      : [`"Called!" He waves the attendants in. They drag you out by the feet${total ? `, with ${total} coins in prize money for what you won before it` : ''}. The crowd is already looking at the next thing.`] }, 'shrike');
  }, bout.encounter, { ...scene.partyOptions(true), company: bout.company, arena: true, herald });
}
