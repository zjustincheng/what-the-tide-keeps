import Phaser from 'phaser';

// Keep people in front of the ground and below mana signatures and scene effects.
export function characterDepth(sprite: Phaser.GameObjects.Sprite) {
  return 4 + (sprite.y + sprite.height / 2 - 2) / 10000;
}

// Collision follows the feet, so the player can walk behind a character's head.
export function characterFootprint(sprite: Phaser.Physics.Arcade.Sprite) {
  const width = Math.min(16, sprite.displayWidth / 2);
  const body = sprite.body as Phaser.Physics.Arcade.StaticBody;
  body.setSize(width, 8, false).setOffset((sprite.displayWidth - width) / 2, sprite.displayHeight - 10);
  body.reset(sprite.x, sprite.y);
}

export class Townsperson {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  private shadow: Phaser.GameObjects.Ellipse;
  private collider: Phaser.Physics.Arcade.Collider;
  private idle?: Phaser.Tweens.Tween;

  constructor(scene: Phaser.Scene, hero: Phaser.Physics.Arcade.Sprite, x: number, y: number, texture: string, tint = 0xffffff) {
    this.shadow = scene.add.ellipse(x, y + 9, 14, 5, 0x142322, .6).setDepth(3.5);
    this.sprite = scene.physics.add.staticSprite(x, y, texture).setTint(tint);
    this.sprite.setDepth(characterDepth(this.sprite));
    characterFootprint(this.sprite);
    this.collider = scene.physics.add.collider(hero, this.sprite);
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.idle = scene.tweens.add({targets:this.sprite,scaleY:1.025,duration:1600+(x*7)%500,delay:(x+y*3)%1300,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
    }
  }

  setVisible(visible: boolean) {
    this.sprite.setVisible(visible);
    this.sprite.body!.enable = visible;
    this.shadow.setVisible(visible);
    if (visible) this.idle?.resume(); else this.idle?.pause();
  }

  setPosition(x: number, y: number) {
    // Static bodies must be moved in the physics tree as well as on screen.
    // Breathing stretches the artwork; it must not shift the collision footprint.
    const scaleY = this.sprite.scaleY;
    this.sprite.setScale(1, 1);
    (this.sprite.body as Phaser.Physics.Arcade.StaticBody).reset(x, y);
    this.sprite.setScale(1, scaleY);
    this.shadow.setPosition(x, y + 9);
    this.sprite.setDepth(characterDepth(this.sprite));
  }

  update(hero: {x:number;y:number}, speaking: boolean) {
    if (this.sprite.visible && !speaking && Phaser.Math.Distance.Between(hero.x,hero.y,this.sprite.x,this.sprite.y)<72) {
      this.sprite.setFlipX(hero.x<this.sprite.x);
    }
  }

  destroy() {
    this.collider.destroy();
    this.idle?.remove();
    this.sprite.destroy();
    this.shadow.destroy();
  }
}
