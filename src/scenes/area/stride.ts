import Phaser from 'phaser';

// How a body moves on the map: a hop with each step and a sway from foot to foot while walking, slow breathing when still.
// Only the picture moves. Raising a sprite's origin would carry its physics body with it, so the body's offset is moved
// the other way by the same amount, and walls and gaps meet the feet exactly where they were.
export type Stride = { moving: boolean; step?: number; lift?: number; quiet?: boolean; lean?: number; phase?: number };

// Where the hero's feet are, within his picture: what collides with walls and gaps.
export const HERO_BODY = { x: 5, y: 17 };

// One footstep, in milliseconds: the hero's footsteps sound on the same beat.
export const STEP = 290;

export function stride(sprite: Phaser.Physics.Arcade.Sprite, offset: { x: number; y: number }, time: number, { moving, step = STEP, lift = 0, quiet = false, lean = 0, phase = 0 }: Stride) {
  const beat = Math.sin((time / step) * Math.PI + phase);
  // A hop off each foot, lower when creeping; a slow rise and fall of breath when standing.
  const hop = moving ? Math.abs(beat) * (quiet ? 0.035 : 0.075) : Math.sin(time / 520 + phase) * 0.012;
  place(sprite, offset, hop + lift);
  // Rolling from foot to foot, and leaning a little into the way it is going; easing back upright when it stops.
  const angle = moving ? beat * (quiet ? 1.5 : 3.5) + lean * 3 : 0;
  sprite.setAngle(sprite.angle + (angle - sprite.angle) * 0.35);
}

// Raise the picture by a share of its height, holding the body where it stands.
export function place(sprite: Phaser.Physics.Arcade.Sprite, offset: { x: number; y: number }, raised: number) {
  sprite.setOrigin(0.5, 0.5 + raised);
  const body = sprite.body as Phaser.Physics.Arcade.Body | null;
  if (body && !(body instanceof Phaser.Physics.Arcade.StaticBody)) body.setOffset(offset.x, offset.y + raised * sprite.height);
}
