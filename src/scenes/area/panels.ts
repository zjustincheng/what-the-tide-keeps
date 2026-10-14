import { MEMBERS } from '../../rules/battle';
import { anchor, forgetAll, held, hollow, remind, tideTakesAll } from '../../rules/memory';
import type { Companion } from '../../rules/memory';
import { roster, techniques } from '../../rules/world';
import type { ShopId } from '../../rules/world';
import { endingStory } from '../../rules/ending';
import { settle } from '../../rules/spells';
import { addCatch } from '../../rules/fishing';
import type { SpotId } from '../../rules/fishing';
import { leads, orders } from '../../rules/orders';
import { SHOPS } from '../../content/shops';
import { memories } from '../../content/memories';
import { loadGrimoire } from '../../storage/grimoire';
import { loadMemory, saveMemory } from '../../storage/memory';
import { loadWorld, saveWorld } from '../../storage/world';
import { KEEPSAKES } from '../../rules/gear';
import { companionTakes, forgetCompanions, INITIAL_MINDS, remindCompanion } from '../../rules/companionMemory';
import type { CompanionMemoryId } from '../../rules/companionMemory';
import { companionMemory } from '../../content/companionMemories';
import { loadGear, saveGear } from '../../storage/gear';
import { loadBooks, saveBooks } from '../../storage/books';
import { loadBestiary } from '../../storage/bestiary';
import { loadJournal } from '../../storage/journal';
import { seenStories } from '../../storage/presentation';
import { STORY_FLAGS, resurrectionStory } from '../../presentation/stories';
import { ShopView } from '../../ui/ShopView';
import { FishingView } from '../../ui/FishingView';
import { SettingsView } from '../../ui/SettingsView';
import { EquipmentView } from '../../ui/EquipmentView';
import { PartyView } from '../../ui/PartyView';
import { MemoriesView } from '../../ui/MemoriesView';
import { JournalView } from '../../ui/JournalView';
import { BestiaryView } from '../../ui/BestiaryView';
import { SoundtrackView } from '../../ui/SoundtrackView';
import { hunting } from '../../rules/pursuit';
import { loadPursuit } from '../../storage/pursuit';
import { AnchorView } from '../../ui/AnchorView';
import { PieceView } from '../../ui/PieceView';
import { FRAGMENTS } from '../../content/piecing';
import type { Remindable } from '../../content/piecing';
import { ResurrectionView } from '../../ui/ResurrectionView';
import { music } from '../../audio/music';
import type { AreaScene } from '../AreaScene';
import { save } from './shared';

// A shop opens after its keeper has spoken, if there is anything left to sell.
export function openShop(scene: AreaScene, shop: ShopId) {
  const world = loadWorld();
  if (scene.overlay || scene.leaving || SHOPS[shop].wares.every(ware => 'deed' in ware && world.flags.includes(ware.deed))) return;
  scene.halt();
  music.effect('open');
  scene.overlay = new ShopView(shop, world,
    next => { save.ok = saveWorld(next); scene.renderMemory(); },
    () => { scene.overlay?.destroy(); scene.overlay = undefined; scene.refreshProps(); scene.resumeExploration(); });
}

export function openFishing(scene: AreaScene, spot: SpotId) {
  if (scene.overlay || scene.leaving) return;
  scene.halt();
  scene.overlay = new FishingView(spot,
    fish => { const world = loadWorld(); save.ok = saveWorld({ ...world, fish: addCatch(world.fish, fish) }); },
    () => { scene.overlay?.destroy(); scene.overlay = undefined; scene.resumeExploration(); });
}

export const openJournal = (scene: AreaScene) => scene.openPanel(() => new JournalView(loadJournal(), () => scene.closePanel(), orders(loadWorld()), leads(loadWorld())));
export const openBestiary = (scene: AreaScene) => scene.openPanel(() => new BestiaryView(loadBestiary(), loadGrimoire(), () => scene.closePanel()));

// Who goes into the next fight.
export function openParty(scene: AreaScene) {
  scene.openPanel(() => new PartyView(loadWorld(), scene.partyOptions(), scene.textures.getBase64('hero'), world => { save.ok = saveWorld(world); }, () => scene.closePanel()));
}

export function openEquipment(scene: AreaScene) {
  if (scene.overlay || scene.leaving) return;
  scene.halt();
  music.effect('open');
  scene.overlay = new EquipmentView(loadGear(), settle(loadBooks(), roster(loadWorld())), loadWorld().found, roster(loadWorld()), hollow(loadMemory()), scene.textures.getBase64('hero'),
    (gear, books) => { save.ok = saveGear(gear) && saveBooks(books); },
    () => { scene.overlay?.destroy(); scene.overlay = undefined; scene.renderMemory(); scene.resumeExploration(); }, loadWorld().tempered ?? [], techniques(loadWorld()));
}

export function openSettings(scene: AreaScene) {
  if (scene.overlay || scene.leaving) return;
  scene.closeDialogue();
  if (scene.overlay || scene.leaving) return;
  scene.halt();
  const close = () => { scene.overlay?.destroy(); scene.overlay = undefined; scene.resumeExploration(); };
  music.effect('open');
  scene.overlay = new SettingsView({
    close,
    memories: () => {
      close();
      const ids = new Set(seenStories());
      for (const flag of loadWorld().flags) { const id = STORY_FLAGS[flag]; if (id) ids.add(id); }
      const world = loadWorld();
      const ending = world.flags.includes('human-spared') ? 'good' : world.flags.includes('human-seated') ? 'bad' : undefined;
      scene.openPanel(() => new MemoriesView([...ids], () => scene.closePanel(), ending ? endingStory(world, ending, held(loadMemory()).includes('name')) : undefined));
    },
    equipment: () => { close(); openEquipment(scene); },
    party: () => { close(); openParty(scene); },
    journal: () => { close(); openJournal(scene); },
    bestiary: () => { close(); openBestiary(scene); },
    // Not during a hunt: the player stops the music, and the hunt's theme is the warning.
    soundtracks: hunting(loadPursuit()) ? undefined : () => { close(); scene.openPanel(() => new SoundtrackView(() => scene.closePanel())); },
    // Returning to the cot always restarts the church, which also resets its encounters.
    restart: () => { close(); scene.scene.start('church'); },
  });
}

// Before sleeping, a memory written down, which the next death can't take; and a companion's reminder of one already lost.
export function writeDown(scene: AreaScene, then: () => void) {
  scene.halt();
  // Companions who joined can remind him of what he lost; the frog won't until she trusts him again.
  const world = loadWorld();
  const friends = roster(world).flatMap(member => member !== 'chameleon' && (member !== 'frog' || world.flags.includes('viper-slain')) ? [{ id: member as Companion, name: MEMBERS[member].name }] : []);
  // He can remind any of them who have joined.
  const joined = roster(world).flatMap(member => member !== 'chameleon' ? [{ id: member as Companion, name: MEMBERS[member].name }] : []);
  scene.overlay = new AnchorView(loadMemory(), friends, (id, reminder, given) => {
    scene.overlay?.destroy();
    scene.overlay = undefined;
    const settle = () => {
      if (reminder) { save.ok = saveMemory(remind(loadMemory(), reminder.by, reminder.id)); music.effect('find'); }
      if (id) { save.ok = saveMemory(anchor(loadMemory(), id)); music.effect('select'); }
      if (given) { const memory = loadMemory(); save.ok = saveMemory({ ...memory, companions: remindCompanion(held(memory), memory.companions ?? INITIAL_MINDS, given.to, given.id) }); music.effect('find'); }
      scene.renderMemory();
      scene.setExplorationEnabled(true);
      scene.physics.resume();
      then();
    };
    // A friend's reminder isn't handed over: they tell it in pieces, and he puts it back together.
    if (reminder && reminder.id in FRAGMENTS) scene.overlay = new PieceView(reminder.by, reminder.id as Remindable, () => { scene.overlay?.destroy(); scene.overlay = undefined; settle(); });
    else settle();
  }, joined);
}

// Waking at the church after a death, and finding out what the tide took.
export function wake(scene: AreaScene) {
  scene.halt();
  music.play('wake');
  // The tide chooses: the same memory however often the game is reloaded, until he stands.
  const taken = tideTakesAll(loadMemory(), loadWorld().deaths);
  // Each companion who fought loses one memory too, chosen the same way; every reminder the hero gave them fades.
  const minds = loadMemory().companions ?? INITIAL_MINDS;
  const lostBy = companionTakes(minds, loadMemory().fought ?? [], loadWorld().deaths);
  const settle = () => { save.ok = saveMemory({ ...loadMemory(), companions: forgetCompanions(minds, lostBy), fought: [] }) && save.ok; };
  const friends = (Object.entries(lostBy) as [Companion, CompanionMemoryId][]).map(([who, id]) => ({ who, id }));
  // Fragile keepsakes that broke in the fall: told once, on waking.
  const broken = loadWorld().broke ?? [];
  const told = () => { if (broken.length) save.ok = saveWorld({ ...loadWorld(), broke: [] }) && save.ok; };
  if (!taken.length) {
    const written = Boolean(loadMemory().anchors?.length);
    save.ok = saveMemory(forgetAll(loadMemory(), [])); told(); settle(); scene.renderMemory(); music.play(scene.area.music); scene.resumeExploration();
    if (friends.length) scene.notice(friends.map(({ who, id }) => `The ${who} forgets ${companionMemory(who, id).name.toLowerCase()}.`).join(' '), 6000);
    else if (broken.length) scene.notice(`${broken.map(id => KEEPSAKES[id].name).join(' and ')} broke in the fall.`, 5000);
    else if (written) scene.notice('Your written memory survived. Write it down again before the next death.', 5000);
    return;
  }
  scene.showStory(resurrectionStory(taken.map(id => memories[id].name)), () => {
    scene.physics.pause(); scene.setExplorationEnabled(false);
    scene.overlay = new ResurrectionView(loadMemory(), taken, () => {
      scene.overlay?.destroy();
      scene.overlay = undefined;
      save.ok = saveMemory(forgetAll(loadMemory(), taken));
      told(); settle();
      scene.renderMemory();
      scene.cameras.main.fadeIn(900, 16, 27, 24);
      music.play(scene.area.music);
      scene.resumeExploration();
    }, broken, friends);
  });
}
