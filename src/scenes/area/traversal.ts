import Phaser from 'phaser';
import { createBattle } from '../../rules/battle';
import { roster } from '../../rules/world';
import { landing } from '../../rules/leap';
import type { Ground } from '../../rules/leap';
import { loadWorld, saveWorld } from '../../storage/world';
import { HERO_BODY, place } from './stride';
import { ClimbView } from '../../ui/ClimbView';
import { music } from '../../audio/music';
import type { AreaScene } from '../AreaScene';
import { save } from './shared';

// Falling into a gap costs the hero this much health. Crumbling ground cracks after this long underfoot, gives way after this long, and comes back after this long.
const FALL_WOUND = 3, CRACKS = 450, GIVES = 800, COMES_BACK = 3000;

// Getting about off the flat: leaping gaps, falling into them, ground that crumbles, walls to climb, and sliding round corners.
export class Traversal {
  // Whether the hero is in the air, which way he faces, how high the arc has him, and where he last stood on firm ground.
  leaping = false;
  facing = { dx: 0, dy: 1 };
  lift = 0;
  private safe: { x: number; y: number };
  // When each crumbling tile was first stood on.
  private crumbling = new Map<string, number>();

  // gapTile: the tileset's leapable gap tile, which crumbling ground turns into when it goes.
  constructor(private scene: AreaScene, readonly gapTile: number | undefined, spawn: { x: number; y: number }) {
    this.safe = { x: spawn.x, y: spawn.y };
  }

  // What the ground is at a tile, for leaping: open, a gap that can be leapt, or a wall.
  private ground(tx: number, ty: number): Ground {
    const { walls, physics } = this.scene;
    const tile = walls.getTileAt(tx, ty);
    if (tx < 0 || ty < 0 || tx >= walls.layer.width || ty >= walls.layer.height) return 'wall';
    const size = walls.tilemap.tileWidth, height = walls.tilemap.tileHeight;
    const left = tx * size, top = ty * height;
    // Leaps obey the same solid people and story gates as walking. Hidden props
    // remain in Arcade's search tree but must not leave an invisible obstacle.
    if (physics.overlapRect(left, top, size, height, false, true).some(body => body.enable && body.left < left + size && body.right > left && body.top < top + height && body.bottom > top)) return 'wall';
    if (!tile || !tile.collides) return 'open';
    return (tile.tileset?.getTileProperties(tile.index) as { gap?: boolean } | null)?.gap ? 'gap' : 'wall';
  }

  private feet(): { tx: number; ty: number } {
    const body = this.scene.player.body as Phaser.Physics.Arcade.Body;
    return { tx: Math.floor(body.center.x / 16), ty: Math.floor(body.center.y / 16) };
  }

  // A fall or a slip costs the hero some health, but never the last of it.
  private hurt(): number {
    const world = loadWorld();
    const hero = createBattle('locust', [], { ...this.scene.partyOptions(), roster: roster(world) }).party.find(member => member.id === 'chameleon');
    const hurt = hero ? Math.min(FALL_WOUND, Math.max(0, hero.health - 1)) : 0;
    if (hurt) save.ok = saveWorld({ ...world, wounds: { ...world.wounds, chameleon: (world.wounds.chameleon ?? 0) + hurt } });
    this.scene.renderMemory();
    return hurt;
  }

  // The foot of the climb whose top is this point, if it is one.
  climbDown(point: string): string | undefined {
    return Object.entries(this.scene.area.climbs ?? {}).find(([, climb]) => climb.top === point)?.[0];
  }

  // A climb: the wall side on, hold to hold, dodging what falls. At the top, the hero stands on the ledge above.
  // Knocked off, he lands at the foot of it, hurt; letting go costs nothing.
  climb(point: string) {
    const scene = this.scene;
    const climb = scene.area.climbs![point];
    // A new wall every time.
    const seed = Math.floor(Math.random() * 0x7fffffff) + 1;
    scene.openPanel(() => new ClimbView(scene.textures.getBase64('hero'), climb.title, climb.height, seed, climb.hazard, climb.every ?? 1500, (reached, gaveUp) => {
      scene.closePanel();
      if (reached) {
        const top = scene.point(climb.top);
        scene.player.setPosition(top.x, top.y);
        (scene.player.body as Phaser.Physics.Arcade.Body).reset(top.x, top.y);
        this.safe = { x: top.x, y: top.y };
      } else if (!gaveUp) {
        const hurt = this.hurt();
        scene.cameras.main.shake(180, 0.004);
        scene.notice(hurt ? `You come off the wall and land hard. (−${hurt} health)` : 'You come off the wall and land hard.', 2500);
      }
    }));
  }

  // Down is easy: you came up it.
  descend(point: string) {
    const scene = this.scene;
    const foot = scene.point(this.climbDown(point)!);
    music.effect('step-stone');
    scene.cameras.main.fadeOut(180, 16, 27, 24);
    scene.cameras.main.once('camerafadeoutcomplete', () => { scene.player.setPosition(foot.x, foot.y); (scene.player.body as Phaser.Physics.Arcade.Body).reset(foot.x, foot.y); scene.cameras.main.fadeIn(220, 16, 27, 24); });
  }

  // A leap the way the hero faces: over a gap of up to two tiles, or a hop forward on open ground. Short of the far side, he falls.
  leap() {
    const scene = this.scene, player = scene.player;
    if (this.leaping || scene.overlay || scene.leaving || scene.talking) return;
    // The visual arc changes the sprite origin. Sample and land with the normal
    // origin so the physics feet cannot end up a tile above the landing point.
    place(player, HERO_BODY, 0); player.setAngle(0);
    const body = player.body as Phaser.Physics.Arcade.Body;
    body.reset(player.x, player.y);
    body.updateFromGameObject();
    const from = this.feet();
    const { dx, dy } = this.facing;
    const lands = landing((tx, ty) => this.ground(tx, ty), from, dx, dy);
    if (!lands) { scene.notice('There is no room to leap that way.', 1200); return; }
    const below = body.center.y - player.y;
    this.leaping = true;
    player.setVelocity(0);
    body.checkCollision.none = true;
    this.safe = { x: player.x, y: player.y };
    music.effect('dodge');
    const steps = Math.abs(lands.tx - from.tx) + Math.abs(lands.ty - from.ty);
    const to = { x: dx ? lands.tx * 16 + 8 : player.x, y: dy ? lands.ty * 16 + 8 - below : player.y };
    const duration = 180 + steps * 90;
    scene.tweens.add({ targets: player, x: to.x, y: to.y, duration, ease: 'Linear' });
    scene.tweens.addCounter({ from: 0, to: 1, duration, onUpdate: tween => { this.lift = Math.sin(tween.getValue()! * Math.PI) * (steps ? 0.55 : 0.3); },
      onComplete: () => {
        this.lift = 0;
        place(player, HERO_BODY, 0); player.setAngle(0);
        body.checkCollision.none = false;
        body.reset(player.x, player.y);
        body.updateFromGameObject();
        this.leaping = false;
        const at = this.feet();
        if (lands.falls || this.ground(at.tx, at.ty) === 'gap') this.fall();
        else music.effect(`step-${scene.surface()}`);
      } });
  }

  // A fall: down into the gap, and back up where he last stood firm, a little hurt. It never takes the last of his health.
  private fall() {
    const scene = this.scene, player = scene.player;
    this.leaping = true;
    player.setVelocity(0);
    (player.body as Phaser.Physics.Arcade.Body).checkCollision.none = true;
    music.effect('hit');
    scene.cameras.main.shake(180, 0.004);
    scene.tweens.add({ targets: player, scale: 0.3, alpha: 0, duration: 420, ease: 'Quad.easeIn', onComplete: () => {
      player.setPosition(this.safe.x, this.safe.y).setScale(1).setAlpha(1);
      const body = player.body as Phaser.Physics.Arcade.Body;
      body.reset(this.safe.x, this.safe.y);
      body.checkCollision.none = false;
      this.leaping = false;
      const hurt = this.hurt();
      scene.notice(hurt ? `You fall, and climb back out. (−${hurt} health)` : 'You fall, and climb back out.', 2500);
    } });
  }

  // Ground that crumbles: it holds a moment, cracks, and goes. It comes back a while later.
  footing(time: number) {
    const { floor, walls, player } = this.scene;
    const at = this.feet();
    const tile = floor.getTileAt(at.tx, at.ty);
    const crumbles = Boolean(tile && (tile.tileset?.getTileProperties(tile.index) as { crumble?: boolean } | null)?.crumble) && !walls.getTileAt(at.tx, at.ty);
    const key = `${at.tx},${at.ty}`;
    for (const other of [...this.crumbling.keys()]) if (other !== key) this.crumbling.delete(other);
    if (!crumbles) { if (!walls.getTileAt(at.tx, at.ty)) this.safe = { x: player.x, y: player.y }; return; }
    const since = this.crumbling.get(key) ?? time;
    this.crumbling.set(key, since);
    if (time - since > CRACKS) tile!.tint = 0x8a7a6a;
    if (time - since > GIVES || this.gapTile === undefined) {
      this.crumbling.delete(key);
      if (this.gapTile === undefined) return;
      walls.putTileAt(this.gapTile, at.tx, at.ty).setCollision(true);
      for (let i = 0; i < 6; i++) {
        const bit = this.scene.add.rectangle(at.tx * 16 + 3 + (i * 5) % 11, at.ty * 16 + 4 + (i * 3) % 9, 2, 2, 0x6a5a4a).setDepth(5);
        this.scene.tweens.add({ targets: bit, y: bit.y + 14, alpha: 0, duration: 500, delay: i * 40, onComplete: () => bit.destroy() });
      }
      this.fall();
      this.scene.time.delayedCall(COMES_BACK, () => { walls.removeTileAt(at.tx, at.ty); tile!.tint = 0xffffff; });
    }
  }

  // Corner assist: walking straight into a wall that the hero only clips by a few pixels slides him along it,
  // so narrow bridges and boardwalks don't need pixel-perfect lining up.
  slideAroundCorners(x: number, y: number) {
    const { player, walls, physics } = this.scene;
    const body = player.body as Phaser.Physics.Arcade.Body;
    // Walls, and anything solid standing on the map: dark water, barricades, people.
    const solid = (wx: number, wy: number) => Boolean(walls.getTileAtWorldXY(wx, wy)?.collides) || physics.overlapRect(wx, wy, 1, 1, false, true).some(body => body.enable);
    const reach = 7, speed = this.scene.sneaking ? 42 : 70;
    if (y && !x && (body.blocked.up || body.blocked.down || body.touching.up || body.touching.down)) {
      const ahead = y < 0 ? body.top - 2 : body.bottom + 2;
      for (let shift = 1; shift <= reach; shift++) for (const side of [-1, 1]) {
        const left = body.left + side * shift, right = body.right - 1 + side * shift;
        if (!solid(left, ahead) && !solid(right, ahead) && !solid(left, body.top) && !solid(right, body.bottom - 1)) { player.setVelocity(side * speed, 0); return; }
      }
    }
    if (x && !y && (body.blocked.left || body.blocked.right || body.touching.left || body.touching.right)) {
      const ahead = x < 0 ? body.left - 2 : body.right + 2;
      for (let shift = 1; shift <= reach; shift++) for (const side of [-1, 1]) {
        const top = body.top + side * shift, bottom = body.bottom - 1 + side * shift;
        if (!solid(ahead, top) && !solid(ahead, bottom) && !solid(body.left, top) && !solid(body.right - 1, bottom)) { player.setVelocity(0, side * speed); return; }
      }
    }
  }
}
