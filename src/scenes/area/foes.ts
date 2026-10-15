import { stride } from './stride';
import Phaser from 'phaser';
import { characterDepth } from '../../presentation/townsfolk';
import { createBattle, enemyMana, ENEMIES } from '../../rules/battle';
import type { Encounter, Escort } from '../../rules/battle';
import { holds } from '../../rules/world';
import type { Context, Effect } from '../../rules/world';
import { loadWorld } from '../../storage/world';
import { music } from '../../audio/music';
import type { Area } from '../areas';
import type { AreaScene } from '../AreaScene';
import type { Point } from './shared';

export type Foe = { encounter: Encounter; defeat?: Effect; fledAt?: number; ambush?: boolean; lurks?: boolean; hidden?: boolean; decoy?: boolean; sprite: Phaser.Physics.Arcade.Sprite; signature: Phaser.GameObjects.Container;
  home: { x: number; y: number }; feet: { x: number; y: number }; phase: number; point: string; waves?: number; company?: readonly Escort[]; pursuer?: boolean };
// Ordinary enemies come after the hero once he is in sight, a little slower than he walks; bosses and guardians hold their ground.
// sight and speed are in pixels and pixels per second. The hero walks at 70.
const CHASE: Partial<Record<Encounter, { sight: number; speed: number }>> = {
  locust: { sight: 90, speed: 44 }, weevil: { sight: 80, speed: 36 }, acolyte: { sight: 96, speed: 40 }, hound: { sight: 120, speed: 58 },
  wisp: { sight: 100, speed: 50 }, raider: { sight: 110, speed: 52 }, ghoul: { sight: 90, speed: 34 }, inquisitor: { sight: 170, speed: 40 },
  harrier: { sight: 140, speed: 62 }, hornet: { sight: 130, speed: 60 }, cricket: { sight: 110, speed: 56 }, barracuda: { sight: 120, speed: 66 }, jelly: { sight: 80, speed: 26 },
};
// How far a chaser will follow from where it stands before giving up and going back.
const LEASH = 200;
// How near the hero must be to see a signature through fog.
const FOG_SIGHT = 120;
// Physics bodies sized to each enemy's drawn silhouette: width, height, x offset, y offset.
const BODY: Record<Encounter, [number, number, number, number]> = { locust: [22, 20, 5, 8], acolyte: [20, 20, 6, 9], weevil: [22, 16, 5, 10], boar: [30, 22, 5, 10], swarm: [30, 24, 9, 8], warden: [22, 26, 5, 4], leech: [28, 24, 2, 4], hound: [20, 22, 6, 8], pack: [22, 24, 5, 6], wisp: [14, 14, 9, 9], drowned: [20, 26, 6, 4], kraken: [48, 40, 0, 0],
  raider: [20, 20, 6, 9], ghoul: [20, 22, 6, 7], vulture: [22, 22, 5, 8], pair: [22, 22, 5, 8], hyena: [24, 20, 4, 10], inquisitor: [22, 26, 5, 4], captain: [22, 24, 5, 6], harrier: [22, 18, 5, 8], mosquito: [20, 16, 6, 8], scorpion: [24, 16, 4, 12], brood: [26, 20, 3, 8], apprentice: [22, 22, 5, 8], viper: [26, 20, 3, 10], hornet: [20, 16, 6, 8], spider: [26, 16, 3, 12], duellist: [20, 22, 6, 8], cuckoo: [22, 22, 5, 8], warder: [26, 18, 3, 12], cricket: [22, 14, 5, 14], flight: [26, 20, 3, 8], champion: [22, 22, 5, 8], shark: [26, 18, 3, 10], barracuda: [24, 12, 4, 12], jelly: [22, 20, 5, 8], eel: [26, 14, 3, 12], cuttlefish: [28, 22, 2, 8], human: [24, 30, 4, 2] };

export function createFoe(scene: AreaScene, at: Point, { encounter, defeat, ambush: lurks, point, waves, decoy, shows, company }: Area['enemies'][number]): Foe {
  // At night every ordinary enemy hunts unseen.
  const ambush = lurks || (Boolean(loadWorld().night) && Boolean(CHASE[encounter]) && !decoy);
  const [width, height, x, y] = BODY[encounter];
  // Chasers move, so they need a body that collides with the walls; the rest stand where they are.
  const sprite = (CHASE[encounter] ? scene.physics.add.sprite(at.x, at.y, encounter) : scene.physics.add.staticSprite(at.x, at.y, encounter)).setDepth(4);
  sprite.setSize(width, height).setOffset(x, y);
  if (CHASE[encounter]) { sprite.setImmovable(true).setCollideWorldBounds(true); scene.physics.add.collider(sprite, scene.walls); }
  // Veiled mana reads as a faint, cool shimmer; open mana as a warm ring.
  const veiled = ENEMIES[encounter].veiled;
  const ring = scene.add.ellipse(0, veiled ? 5 : 4, veiled ? 34 : 37, veiled ? 18 : 20).setStrokeStyle(1, veiled ? 0x9dbbb4 : 0xd2b675, veiled ? 0.65 : 0.7);
  const mana = scene.add.text(0, veiled ? -24 : -23, `◇ ${shows ?? enemyMana(createBattle(encounter))}${company?.length ? ` ×${company.length + 1}` : ''}`, { fontFamily: 'monospace', fontSize: '8px', color: veiled ? '#b7d3c7' : '#dbc58b' }).setOrigin(0.5);
  const signature = scene.add.container(at.x, at.y, [ring, mana]).setDepth(5);
  scene.tweens.add({ targets: ring, alpha: veiled ? 0.15 : 0.35, duration: veiled ? 1400 : 1000, yoyo: true, repeat: -1 });
  const foe: Foe = { encounter, sprite, signature, defeat, ambush, lurks, decoy, home: { x: at.x, y: at.y }, feet: { x, y }, phase: scene.foes.length * 1.7, point, waves, company };
  scene.foes.push(foe);
  // A decoy is a signature and nothing else: walk into it and it comes apart.
  if (decoy) {
    sprite.setAlpha(0);
    scene.physics.add.overlap(scene.player, sprite, () => {
      if (!sprite.active) return;
      sprite.disableBody(true, true);
      scene.tweens.add({ targets: signature, alpha: 0, scale: 1.6, duration: 500, onComplete: () => signature.destroy() });
      music.effect('barrier');
      scene.notice('A DECOY');
    });
    return foe;
  }
  scene.physics.add.overlap(scene.player, sprite, () => scene.beginBattle(foe));
  return foe;
}

// Enemies the story now allows, such as a boss the hero has just challenged, step out; each point holds one.
// One that steps out mid-visit, right beside the hero, is returned, to fight as soon as the conversation ends.
export function refreshFoes(scene: AreaScene, context: Context, midVisit = false): Foe | undefined {
  let near: Foe | undefined;
  for (const enemy of scene.area.enemies)
    if (enemy.encounter !== 'inquisitor' && !scene.foes.some(foe => foe.point === enemy.point) && !enemy.hiddenIf?.some(condition => holds(context, condition))) {
      const foe = createFoe(scene, scene.point(enemy.point), enemy);
      if (midVisit && Phaser.Math.Distance.Between(scene.player.x, scene.player.y, foe.sprite.x, foe.sprite.y) < 80) near = foe;
    }
  return near;
}

// When night falls every ordinary enemy hunts unseen; at dawn they show again.
export function nightTurns(scene: AreaScene, night: boolean) {
  for (const foe of scene.foes) {
    foe.ambush = foe.lurks || (night && Boolean(CHASE[foe.encounter]) && !foe.decoy);
    if (!foe.ambush && foe.hidden) { foe.hidden = false; scene.tweens.killTweensOf([foe.sprite]); foe.sprite.setAlpha(1); foe.signature.setAlpha(1); }
  }
}

// Enemies come alive: they bob where they stand, turn to face the hero, and the ordinary ones give chase.
export function moveFoes(scene: AreaScene, time: number) {
  const { player, area } = scene;
  const talking = scene.talking;
  for (const foe of scene.foes) {
    if (!foe.sprite.active) continue;
    foe.sprite.setDepth(characterDepth(foe.sprite));
    if (foe.pursuer) continue;
    const toHero = Phaser.Math.Distance.Between(player.x, player.y, foe.sprite.x, foe.sprite.y);
    const chase = foe.decoy ? undefined : CHASE[foe.encounter];
    if (chase) {
      const fromHome = Phaser.Math.Distance.Between(foe.sprite.x, foe.sprite.y, foe.home.x, foe.home.y);
      // Talking stops the world; a foe just fled from gives the hero a moment and goes home.
      const resting = talking || (foe.fledAt !== undefined && scene.time.now - foe.fledAt < 2500);
      // A hero with hidden mana is only noticed when he is almost on top of them.
      const sight = chase.sight * (loadWorld().night ? 1.3 : 1) * (area.fog ? 0.6 : 1);
      const hunting = !resting && toHero < (scene.sneaking ? 22 : sight) && fromHome < LEASH;
      if (hunting) scene.physics.moveTo(foe.sprite, player.x, player.y, chase.speed);
      else if (!talking && fromHome > 3) scene.physics.moveTo(foe.sprite, foe.home.x, foe.home.y, chase.speed * 0.6);
      else foe.sprite.setVelocity(0);
      foe.signature.setPosition(foe.sprite.x, foe.sprite.y);
    }
    if (toHero < 150) foe.sprite.setFlipX(player.x < foe.sprite.x);
    // It walks when it moves, with its own gait; standing, it breathes.
    const body = foe.sprite.body as Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody;
    const vx = 'velocity' in body ? body.velocity.x : 0, vy = 'velocity' in body ? body.velocity.y : 0;
    stride(foe.sprite, foe.feet, time, { moving: Math.hypot(vx, vy) > 2, step: 240, lean: Math.sign(vx), phase: foe.phase });
  }
}

// What can be seen of the enemies: some only surface now and then, fog hides others, and ambushers vanish as the hero comes near.
export function revealFoes(scene: AreaScene, time: number) {
  const { player, area } = scene;
  // At sea, things live under the water: they show only when they come up to breathe, and then go down again.
  if (area.deep) for (const foe of scene.foes) if (!foe.ambush && foe.sprite.active) {
    const up = Math.sin(time / 1400 + foe.phase * 2.3) > 0.2;
    foe.signature.setAlpha(up ? 1 : 0);
    foe.sprite.setAlpha(up ? 1 : 0.18);
  }
  // In fog, an open signature can't be seen from far off.
  if (area.fog) for (const foe of scene.foes) if (!foe.ambush && foe.sprite.active) {
    const seen = Phaser.Math.Distance.Between(player.x, player.y, foe.sprite.x, foe.sprite.y) < FOG_SIGHT;
    foe.signature.setAlpha(seen ? 1 : 0);
  }
  // Ambushers' signatures flicker out as the hero comes near, and come back once he is clear.
  for (const foe of scene.foes) {
    if (!foe.ambush || !foe.sprite.active) continue;
    // Hiding his own mana, the hero sees an ambusher before it can vanish.
    const near = !scene.sneaking && Phaser.Math.Distance.Between(player.x, player.y, foe.sprite.x, foe.sprite.y) < 110;
    if (near === Boolean(foe.hidden)) continue;
    foe.hidden = near;
    scene.tweens.killTweensOf([foe.sprite]);
    scene.tweens.add({ targets: [foe.sprite, foe.signature], alpha: near ? { from: 0.3, to: 0 } : 1, duration: near ? 500 : 700, ease: near ? 'Stepped' : 'Linear', easeParams: near ? [4] : undefined });
  }
}
