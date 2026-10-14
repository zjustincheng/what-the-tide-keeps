import { MEMBERS } from '../../rules/battle';
import { forgetAll, held, keepMemory, MEMORY_IDS, recall, tideTakesAll, wipe } from '../../rules/memory';
import { apply, rest, roster } from '../../rules/world';
import type { Effect, Flag, ShopId } from '../../rules/world';
import { equip, KEEPSAKE_IDS, KEEPSAKES, SLOTS } from '../../rules/gear';
import type { KeepsakeId } from '../../rules/gear';
import { endingStory } from '../../rules/ending';
import type { Ending } from '../../rules/ending';
import { reclaim } from '../../rules/spells';
import { WAYSTONES } from '../../rules/waystones';
import { saveGrimoire } from '../../storage/grimoire';
import { loadMemory, saveMemory } from '../../storage/memory';
import { loadWorld, saveWorld } from '../../storage/world';
import { loadGear, saveGear } from '../../storage/gear';
import { loadBooks, saveBooks } from '../../storage/books';
import { seenStories } from '../../storage/presentation';
import { STORIES, STORY_FLAGS } from '../../presentation/stories';
import type { StoryId } from '../../presentation/stories';
import { memories } from '../../content/memories';
import { CookView } from '../../ui/CookView';
import { EndingView } from '../../ui/EndingView';
import { KeepsakeView } from '../../ui/KeepsakeView';
import { ShellView } from '../../ui/ShellView';
import { ArmView } from '../../ui/ArmView';
import { DiceView } from '../../ui/DiceView';
import { music } from '../../audio/music';
import type { AreaScene } from '../AreaScene';
import type { Foe } from './foes';
import { refreshFoes } from './foes';
import { fightBout } from './battles';
import { openShop, writeDown } from './panels';
import { PICKED, save } from './shared';

// What a conversation sets in motion: its effects land as it opens, and what it leads to, a shop, a rest, a fight, a road,
// waits until it closes.
export class Aftermath {
  stories: StoryId[] = [];
  // A fight with an enemy that stepped out beside the hero mid-conversation.
  fight?: Foe;
  // The campfire being talked at.
  campPoint?: string;
  private shop?: ShopId;
  private rest?: string;
  private campTalk?: NonNullable<Effect['campTalk']>;
  private keepsake?: KeepsakeId;
  private cook = false;
  private road?: keyof typeof WAYSTONES;
  private church = false;
  // What the church took, in memories, to raise one of the fallen.
  private tithe?: string[];
  private ending?: Ending;
  // A bout in the Talon Ring, or a stake at the shells, the arm-wrestling, or the bones.
  private bout?: number;
  private sail?: 'out' | 'home';
  private shells?: number;
  private arm?: number;
  private dice?: { stake: number; opponent: string };

  constructor(private scene: AreaScene) {}

  // Nothing waits once the hero has gone.
  drop() { this.stories = []; this.shop = undefined; this.rest = undefined; }

  effect(then?: Effect) {
    if (!then) return;
    const scene = this.scene;
    if (then.cook) this.cook = true;
    if (then.camp) this.rest = this.campPoint;
    if (then.campTalk) this.campTalk = then.campTalk;
    if (then.travel) this.road = then.travel;
    if (then.church) this.church = true;
    if (then.bout !== undefined) this.bout = then.bout;
    if (then.sail) this.sail = then.sail;
    if (then.shells) this.shells = then.shells;
    if (then.arm) this.arm = then.arm;
    if (then.dice) this.dice = { stake: then.dice, opponent: (scene.dialogue.active?.speaker ?? 'the house').toLowerCase().replace(/^(a|an|the) /, 'the ') };
    if (then.shop) this.shop = then.shop;
    // A companion's own keepsake comes with a receipt that offers to put it on them.
    if (then.find && KEEPSAKE_IDS.includes(then.find as KeepsakeId) && KEEPSAKES[then.find as KeepsakeId].keeps && !loadWorld().found.includes(then.find)) this.keepsake = then.find as KeepsakeId;
    if (then.find || then.learn || then.give) music.effect('find');
    if (then.earn || then.pay) music.effect('coins');
    if (then.rest) music.effect('rest');
    // A memory found again, written down where he could read it.
    if (then.recall) { save.ok = saveMemory(recall(loadMemory(), then.recall)) && save.ok; music.effect('find'); }
    if (then.keepMemory) { save.ok = saveMemory(keepMemory(loadMemory(), then.keepMemory)) && save.ok; music.effect('memory'); }
    if (then.recallAll) { save.ok = saveMemory(MEMORY_IDS.reduce((memory, id) => recall(memory, id), loadMemory())) && save.ok; music.effect('find'); }
    if (then.ending) this.ending = then.ending;
    // Raised for a memory instead of coins: the tide chooses which, as it does at a death.
    if (then.tithe) {
      const owing = wipe(loadMemory(), 1);
      const taken = tideTakesAll(owing, loadWorld().deaths + 101 * ((loadWorld().fallen ?? []).length + 1));
      if (taken.length) { save.ok = saveMemory(forgetAll(owing, taken)) && save.ok; this.tithe = taken.map(id => memories[id].name); }
    }
    const before = roster(loadWorld());
    const next = apply(scene.context(), then);
    for (const flag of next.world.flags) {
      const story = STORY_FLAGS[flag];
      if (story === 'transfer' && next.world.flags.includes('house-seen')) continue;
      if (story && !loadWorld().flags.includes(flag) && !seenStories().includes(story) && !this.stories.includes(story)) this.stories.push(story);
    }
    save.ok = saveWorld(next.world) && saveGrimoire(next.studied);
    this.fight = refreshFoes(scene, scene.context(), true) ?? this.fight;
    // A companion who has just joined takes their own grimoire back.
    for (const member of roster(next.world).filter(member => !before.includes(member))) save.ok = saveBooks(reclaim(loadBooks(), member)) && save.ok;
    scene.refreshProps();
    scene.renderMemory();
  }

  // Once the conversation has closed, whatever it led to.
  run() {
    const scene = this.scene;
    if (this.stories.length && !scene.leaving) {
      scene.showStory(STORIES[this.stories.shift()!], () => scene.closeDialogue());
      return;
    }
    if (this.campTalk && !scene.leaving) {
      const companion = this.campTalk;
      this.campTalk = undefined;
      const moment = scene.town.campMoment(companion, scene.context());
      if (moment) { scene.say(moment, companion); return; }
    }
    if (this.keepsake && !scene.leaving) {
      const id = this.keepsake, holder = KEEPSAKES[id].keeps!;
      this.keepsake = undefined;
      const slot = loadGear()[holder].length < SLOTS ? loadGear()[holder].length : -1;
      scene.openPanel(() => new KeepsakeView(id, slot >= 0, () => {
        if (slot >= 0) { save.ok = saveGear(equip(loadGear(), loadWorld().found.filter((found): found is KeepsakeId => found === id), holder, slot, id)) && save.ok; scene.closePanel(); }
        else { scene.closePanel(); scene.openEquipment(); }
      }, () => scene.closePanel()));
      return;
    }
    const fight = this.fight; this.fight = undefined;
    if (fight && !scene.leaving) { scene.time.delayedCall(250, () => scene.beginBattle(fight)); }
    const shop = this.shop; this.shop = undefined;
    if (shop) openShop(scene, shop);
    if (this.cook) { this.cook = false; scene.openPanel(() => new CookView(loadWorld(), world => { save.ok = saveWorld(world); scene.renderMemory(); }, () => scene.closePanel())); }
    // Back to the priest for the next orders: the same pale road the church wakes you by.
    if (this.church && !scene.leaving) {
      this.church = false;
      music.effect('barrier');
      scene.leaving = true; scene.cameras.main.fadeOut(700, 16, 27, 24);
      scene.cameras.main.once('camerafadeoutcomplete', () => scene.scene.start('church'));
      return;
    }
    // Out to sea on the seal's boat, in the dark.
    const sail = this.sail; this.sail = undefined;
    if (sail && !scene.leaving) {
      music.effect('step-water');
      scene.leaving = true; scene.cameras.main.fadeOut(900, 8, 14, 20);
      scene.cameras.main.once('camerafadeoutcomplete', () => scene.scene.start(sail === 'out' ? 'outlaw-port' : 'creek', { spawn: sail === 'out' ? 'from-creek' : 'from-causeway' }));
      return;
    }
    const ending = this.ending; this.ending = undefined;
    if (ending && !scene.leaving) {
      scene.time.delayedCall(400, () => scene.openPanel(() => new EndingView(endingStory(loadWorld(), ending, held(loadMemory()).includes('name')), () => {
        scene.closePanel();
        if (ending === 'good') scene.travel({ to: 'harbour', spawn: 'from-square' }); else music.play(scene.area.music);
      })));
      return;
    }
    const tithe = this.tithe; this.tithe = undefined;
    if (tithe && !scene.leaving) {
      scene.time.delayedCall(250, () => scene.say({ speaker: 'THE PRIEST', lines: [
        'He doesn\'t ask for coins. He puts his hand on your head instead, and holds it there until something goes.',
        `You don\'t remember what it was. The ledger does: ${tithe.join(', ')}.`,
      ] }, 'priest'));
      return;
    }
    const bout = this.bout; this.bout = undefined;
    if (bout !== undefined && !scene.leaving) { scene.time.delayedCall(250, () => fightBout(scene, bout)); return; }
    // A game for coins: whatever is won or lost is kept, and a first win is remembered.
    const stake = (won?: Flag) => (coins: number) => {
      const world = loadWorld();
      save.ok = saveWorld({ ...world, coins: Math.max(0, world.coins + coins), flags: won && coins > 0 && !world.flags.includes(won) ? [...world.flags, won] : world.flags });
      scene.renderMemory();
    };
    const shells = this.shells; this.shells = undefined;
    if (shells) { scene.openPanel(() => new ShellView(shells, stake('shells-won'), () => scene.closePanel())); return; }
    const arm = this.arm; this.arm = undefined;
    if (arm) { scene.openPanel(() => new ArmView(arm, stake('arm-won'), () => scene.closePanel())); return; }
    const road = this.road; this.road = undefined;
    if (road && !scene.leaving) {
      // The old road: a fade to pale light, and out at the other stone.
      music.effect('barrier');
      scene.leaving = true; scene.cameras.main.fadeOut(600, 168, 216, 224);
      scene.cameras.main.once('camerafadeoutcomplete', () => scene.scene.start(WAYSTONES[road].area, { spawn: 'from-waystone' }));
    }
    const dice = this.dice; this.dice = undefined;
    if (dice) scene.openPanel(() => new DiceView(dice.opponent, dice.stake, stake(), () => scene.closePanel()));
    const camp = this.rest; this.rest = undefined;
    // Resting heals every wound and brings the area's enemies back, so the area starts over around the fire.
    if (camp && !scene.leaving) {
      PICKED.clear();
      music.effect('rest');
      const cost = scene.area.camps?.[camp]?.cost ?? 0;
      save.ok = saveWorld(rest({ ...loadWorld(), coins: Math.max(0, loadWorld().coins - cost) }));
      const fallen = loadWorld().fallen ?? [];
      if (fallen.length) scene.time.delayedCall(1200, () => scene.notice(`${fallen.map(id => MEMBERS[id].name).join(' and ')} ${fallen.length > 1 ? 'do' : 'does'} not wake. Rest won't raise the fallen: only the church can.`, 5000));
      const sleep = () => { scene.leaving = true; scene.cameras.main.fadeOut(400, 16, 27, 24); scene.cameras.main.once('camerafadeoutcomplete', () => scene.scene.restart({ spawn: camp })); };
      // Once the vulture has shown how, a memory can be written down before sleeping.
      if (loadWorld().flags.includes('anchors-known')) writeDown(scene, sleep); else sleep();
    }
  }
}
