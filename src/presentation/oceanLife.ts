import Phaser from 'phaser';
import type {Context} from '../rules/world';
import {oceanState} from '../rules/oceanLife';

export class OceanAtmosphere {
  private scenery:Phaser.GameObjects.Graphics;
  private state!:ReturnType<typeof oceanState>;
  private key='';
  private bubble?:Phaser.GameObjects.Text;
  private elapsed=0;
  private nextBark=7500;
  private bark=0;
  constructor(private scene:Phaser.Scene,private room:'outlaw-port'|'sea-pens',context:Context,private furniture:Phaser.Tilemaps.TilemapLayer) {
    this.scenery=scene.add.graphics().setDepth(3);this.refresh(context);
  }
  refresh(context:Context) {
    this.state=oceanState(context);
    const frame=document.querySelector<HTMLElement>('.game-frame');
    if(frame){frame.dataset.seaReception=this.state.reception;frame.dataset.seaPens=this.state.pens;frame.dataset.seaTrade=this.state.trade;}
    const key=`${this.state.reception}:${this.state.pens}:${this.state.trade}`;
    if(key===this.key)return;
    this.key=key;this.bubble?.destroy();this.bubble=undefined;
    const g=this.scenery.clear();
    if(this.room==='outlaw-port') {
      // Low mooring board and coiled lines sit on the broad deck beside the rail.
      g.fillStyle(0x171c1c,.55).fillEllipse(480,349,42,7);
      g.fillStyle(0x695643).fillRect(467,318,3,27).fillRect(492,318,3,27).fillRect(464,316,34,19);
      g.fillStyle(0xb9aa88).fillRect(468,319,26,12);
      g.fillStyle(0x5b5143).fillRect(471,322,19,2).fillRect(471,326,13,2);
      if(this.state.trade==='truce')g.fillStyle(0xcbd2b8).fillRect(488,328,12,10);
      for(const [x,y] of [[424,350],[448,350]]) {
        g.lineStyle(2,0x9b875e).strokeEllipse(x,y,17,7).strokeEllipse(x,y,10,4);
      }
      // A little shared table: welcoming deeds are shown by a second place setting.
      g.fillStyle(0x171c1c,.5).fillEllipse(192,163,32,6);
      g.fillStyle(0x695643).fillRect(180,147,26,10).fillRect(182,157,3,6).fillRect(201,157,3,6);
      g.fillStyle(0xa8a28a).fillRect(184,145,7,3);
      if(this.state.reception!=='wary')g.fillStyle(0xa8a28a).fillRect(195,145,7,3);
      if(this.state.reception==='welcomed')g.fillStyle(0xc4a274).fillRect(192,149,5,3);
    } else {
      // Every enclosure opens toward the water, with torn net still on the posts.
      for(const [left,top] of [[96,80],[272,80],[96,224],[272,224]]) {
        g.fillStyle(0x67543f).fillRect(left+2,top+8,4,68).fillRect(left+108,top+8,4,68);
        g.lineStyle(1,0x9b9275,.8);
        if(this.state.pens==='held') {
          for(let x=left+6;x<left+109;x+=8)g.lineBetween(x,top+11,x,top+73);
          for(let y=top+11;y<top+74;y+=8)g.lineBetween(left+6,y,left+110,y);
          for(const [dx,dy] of [[24,30],[58,48],[76,26]]) {
            const x=left+dx,y=top+dy;
            g.fillStyle(0x91a9a0,.75).fillRect(x,y,7,3).fillTriangle(x+7,y+1,x+10,y-1,x+10,y+4);
          }
        } else {
          g.lineBetween(left+4,top+12,left+15,top+41);g.lineBetween(left+15,top+41,left+22,top+48);
          g.lineBetween(left+110,top+12,left+102,top+51);g.lineBetween(left+102,top+51,left+95,top+54);
        }
        // Keep the water collision; remove only the enclosing artwork at the cut.
        for(let col=left/16+2;col<left/16+5;col++) {
          const tile=this.furniture.getTileAt(col,top/16+4);
          if(tile)tile.alpha=this.state.pens==='empty'?0:1;
        }
      }
      // Cut rope remains on planks rather than floating over the sea.
      if(this.state.pens==='empty') {g.lineStyle(2,0x9b9275).strokeEllipse(234,188,14,5);g.lineBetween(238,188,246,191);}
    }
  }
  update(delta:number,speaking:boolean,hero:{x:number;y:number}) {
    if(speaking){this.bubble?.setVisible(false);return;}
    this.bubble?.setVisible(true);this.elapsed+=Math.min(delta,100);
    if(this.elapsed<this.nextBark)return;
    this.nextBark=this.elapsed+18000;
    const [x,y]=this.room==='outlaw-port'?[216,137]:[88,22];
    if(Phaser.Math.Distance.Between(hero.x,hero.y,x,y)>135)return;
    const words=this.room==='sea-pens'?this.state.pens==='empty'?['Nothing left in that net.','Let the water take them home.']:['They are still alive in there.','Another boat at night.']:
      this.state.trade==='truce'?['Passage. No live cargo.','The crews must sign too.']:this.state.reception==='welcomed'?['Make room at the table.','They opened cages on the land.']:this.state.reception==='recognized'?['Someone knows what you did.','Word travels with the current.']:['Keep your cargo on your own deck.','No boats for the land.'];
    this.bubble?.destroy();
    this.bubble=this.scene.add.text(x,y,words[this.bark++%words.length],{fontFamily:'monospace',fontSize:'8px',color:'#dce3d5',backgroundColor:'#172b2bee',padding:{x:5,y:4}}).setOrigin(.5,1).setDepth(8);
    const bubble=this.bubble;this.scene.time.delayedCall(5000,()=>{if(bubble.active)bubble.destroy();});
  }
  destroy(){this.scenery.destroy();this.bubble?.destroy();}
}
