import Phaser from 'phaser';

// Raised scenery uses the same foot ordering as characters. Its painted upper
// edge can cover a hero behind it; its ground footprint blocks walking/leaping.
export class Scenery {
  readonly pieces: {id:string; art:Phaser.GameObjects.Graphics; footprint:Phaser.GameObjects.Zone; collider:Phaser.Physics.Arcade.Collider}[] = [];
  constructor(private scene:Phaser.Scene,private hero:Phaser.Physics.Arcade.Sprite) {}

  add(id:string,x:number,y:number,width:number,height:number) {
    const art=this.scene.add.graphics().setDepth(4+(y+height)/10000);
    const footprint=this.scene.add.zone(x+width/2,y+height/2,width,height);
    this.scene.physics.add.existing(footprint,true);
    const collider=this.scene.physics.add.collider(this.hero,footprint);
    this.pieces.push({id,art,footprint,collider});
    return art;
  }

  clear() {
    for(const piece of this.pieces) {piece.collider.destroy();piece.footprint.destroy();piece.art.destroy();}
    this.pieces.length=0;
  }
  destroy(){this.clear();}
}
