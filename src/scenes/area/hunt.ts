import Phaser from 'phaser';
import { loadWorld } from '../../storage/world';
import { loadMemory } from '../../storage/memory';
import { advancePursuit, CHASE_TIME, endPursuit, hunting, initialPursuit, pursuitAllowed, pursuitPath } from '../../rules/pursuit';
import type { Cell } from '../../rules/pursuit';
import { keepPursuit, loadPursuit, savePursuit } from '../../storage/pursuit';
import { music } from '../../audio/music';
import type { AreaScene } from '../AreaScene';
import { createFoe } from './foes';
import type { Foe } from './foes';

// The Inquisitor's hunt: once he has the hero's trail, he follows for a while, through doors and between areas.
export class Hunt {
  hunter?: Foe;
  // How long before he comes through after the hero; and whether he is following the hero in from the last area.
  delay: number;
  private following: boolean;
  private route: Cell[] = [];
  private routeAt = 0;
  private savedAt = 0;
  private label = '';
  private hud?: HTMLElement;

  constructor(private scene: AreaScene) {
    this.following = loadPursuit().phase === 'chasing';
    this.delay = this.following ? 2500 : 0;
  }

  prepare() {
    const scene = this.scene;
    const state = loadPursuit();
    const flags = loadWorld().flags;
    if (loadMemory().pending) { keepPursuit(endPursuit()); savePursuit(); }
    else if (!flags.includes('hyena-slain')) { keepPursuit(initialPursuit()); }
    else if (!pursuitAllowed(flags, scene.area.region) && hunting(state)) {
      keepPursuit(endPursuit()); savePursuit();
      if (scene.area.region === 'THE OCEAN') scene.notice('The Inquisitor cannot follow you to sea.', 4000);
    }
    this.hud = document.createElement('aside');
    this.hud.className = 'hunt-hud';
    this.hud.hidden = true;
    this.hud.innerHTML = '<strong>THE INQUISITOR</strong><span class="hunt-time" role="status"></span><p></p><progress max="45" value="45" aria-label="Time left to evade the Inquisitor"></progress>';
    document.querySelector('.game-frame')!.append(this.hud);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { savePursuit(); this.hunter?.sprite.setVelocity(0); }
    }, { signal: scene.cleanup.signal });
    this.render();
    if (hunting(loadPursuit())) music.play('boss-inquisitor');
  }

  destroy() {
    savePursuit(); this.hud?.remove(); this.hud = undefined;
  }

  private render() {
    if (!this.hud) return;
    const state = loadPursuit();
    this.hud.hidden = !hunting(state);
    if (!hunting(state)) return;
    const seconds = Math.ceil(state.remaining / 1000);
    const label = `${state.phase}:${seconds}`;
    if (label === this.label) return;
    this.label = label;
    this.hud.dataset.phase = state.phase;
    this.hud.querySelector('.hunt-time')!.textContent = state.phase === 'warning' ? `Spotted · ${seconds}s` : `Escape · ${seconds}s`;
    this.hud.querySelector('p')!.textContent = state.phase === 'warning' ? 'Get moving. He is coming for you.' : 'Keep running. He follows through doors.';
    const progress = this.hud.querySelector('progress')!;
    progress.max = state.phase === 'warning' ? 5 : CHASE_TIME / 1000;
    progress.value = state.remaining / 1000;
  }

  finish(message?: string) {
    keepPursuit(endPursuit()); savePursuit();
    if (this.hunter?.sprite.active) {
      this.hunter.sprite.disableBody(true, true); this.hunter.signature.setVisible(false);
    }
    this.hunter = undefined; this.route = [];
    this.render();
    music.play(this.scene.area.music);
    if (message) this.scene.notice(message, 4500);
  }

  private walkable(x: number, y: number) {
    const { floor, walls, area, traversal } = this.scene;
    const ground = floor.getTileAt(x, y);
    const wall = walls.getTileAt(x, y);
    const px = (x + .5) * floor.tilemap.tileWidth, py = (y + .5) * floor.tilemap.tileHeight;
    const [left, top, width, height] = area.bounds ?? [0, 0, floor.tilemap.widthInPixels, floor.tilemap.heightInPixels];
    return Boolean(ground && ground.index !== -1 && !ground.collides && !wall?.collides && (traversal.gapTile === undefined || wall?.index !== traversal.gapTile)
      && px >= left && px < left + width && py >= top && py < top + height);
  }

  private cell(x: number, y: number): Cell {
    const map = this.scene.floor.tilemap;
    return { x: Math.floor(x / map.tileWidth), y: Math.floor(y / map.tileHeight) };
  }

  private spawn() {
    const scene = this.scene;
    const map = scene.floor.tilemap;
    const target = this.cell(scene.player.x, scene.player.y + 8);
    const canWalk = (x: number, y: number) => this.walkable(x, y);
    let spawn: Cell | undefined;
    // A pursuer crosses the same doorway after the hero, with a short head start.
    if (this.following) {
      const entrance = scene.point(scene.arrival);
      const cell = this.cell(entrance.x, entrance.y + 8);
      if (canWalk(cell.x, cell.y) && (cell.x === target.x && cell.y === target.y || pursuitPath(cell, target, map.width, map.height, canWalk).length)) spawn = cell;
    }
    if (!spawn) {
      const candidates: Cell[] = [];
      for (let y = Math.max(0, target.y - 14); y < Math.min(map.height, target.y + 15); y++)
        for (let x = Math.max(0, target.x - 14); x < Math.min(map.width, target.x + 15); x++) {
          const distance = Math.hypot(x - target.x, y - target.y);
          if (canWalk(x, y) && distance >= 3 && distance <= 14) candidates.push({ x, y });
        }
      // Try several distant, reachable positions; never spawn on the player's tile.
      const distant = candidates.filter(cell => Math.hypot(cell.x - target.x, cell.y - target.y) >= 7);
      const close = candidates.filter(cell => Math.hypot(cell.x - target.x, cell.y - target.y) < 7);
      for (const cell of [...Phaser.Utils.Array.Shuffle(distant).slice(0, 24), ...Phaser.Utils.Array.Shuffle(close).slice(0, 12)]) {
        if (pursuitPath(cell, target, map.width, map.height, canWalk).length) { spawn = cell; break; }
      }
    }
    if (!spawn) return;
    const hunter = createFoe(scene, { name: '__hunter', x: (spawn.x + .5) * map.tileWidth, y: (spawn.y + .5) * map.tileHeight - 9 }, { point: '__hunter', encounter: 'inquisitor' });
    this.hunter = hunter;
    hunter.pursuer = true; hunter.ambush = false; hunter.hidden = false;
    // Fit the same narrow paths as the hero; his broad robe is only visual.
    hunter.sprite.setSize(10, 8).setOffset(11, 21).setAlpha(1);
    hunter.signature.setAlpha(1);
    hunter.signature.list.filter(child => child instanceof Phaser.GameObjects.Text).forEach(child => (child as Phaser.GameObjects.Text).setColor('#f5b1a0'));
    music.play('boss-inquisitor');
  }

  update(time: number, elapsed: number) {
    const scene = this.scene;
    if (document.hidden || scene.talking) { this.hunter?.sprite.setVelocity(0); return; }
    if (!pursuitAllowed(loadWorld().flags, scene.area.region)) {
      if (hunting(loadPursuit())) this.finish();
      return;
    }
    const delta = Math.min(250, Math.max(0, elapsed));
    const before = loadPursuit();
    const next = advancePursuit(before, delta);
    keepPursuit(next);
    if (before.phase !== next.phase) {
      savePursuit();
      if (next.phase === 'warning') {
        if (scene.sneaking) scene.toggleSneak();
        music.effect('toll'); music.play('boss-inquisitor');
        scene.notice('The Inquisitor has your trail. Run for 45 seconds. He follows between areas.', 5000);
        this.following = false;
      } else if (next.phase === 'idle') { this.finish('You lost the Inquisitor. For now.'); return; }
    }
    if (time - this.savedAt > 5000) { savePursuit(); this.savedAt = time; }
    this.render();
    if (next.phase !== 'chasing') return;
    this.delay = Math.max(0, this.delay - delta);
    if (!this.hunter && this.delay === 0) { this.spawn(); if (!this.hunter) this.delay = 1000; }
    const hunter = this.hunter;
    if (!hunter?.sprite.active) return;
    if (hunter.fledAt !== undefined && time - hunter.fledAt < 2500) { hunter.sprite.setVelocity(0); return; }
    const map = scene.floor.tilemap;
    const player = scene.player;
    const from = this.cell(hunter.sprite.x, hunter.sprite.y + 9);
    const to = this.cell(player.x, player.y + 8);
    if (time >= this.routeAt) {
      this.route = pursuitPath(from, to, map.width, map.height, (x, y) => this.walkable(x, y));
      this.routeAt = time + 350;
    }
    let waypoint = this.route[0];
    if (waypoint && Phaser.Math.Distance.Between(hunter.sprite.x, hunter.sprite.y + 9, (waypoint.x + .5) * map.tileWidth, (waypoint.y + .5) * map.tileHeight) < 2) { this.route.shift(); waypoint = this.route[0]; }
    if (waypoint) scene.physics.moveTo(hunter.sprite, (waypoint.x + .5) * map.tileWidth, (waypoint.y + .5) * map.tileHeight - 9, 64);
    else if (from.x === to.x && from.y === to.y) scene.physics.moveTo(hunter.sprite, player.x, player.y - 1, 64);
    else hunter.sprite.setVelocity(0);
    hunter.sprite.setFlipX(player.x < hunter.sprite.x);
    hunter.signature.setPosition(hunter.sprite.x, hunter.sprite.y);
  }
}
