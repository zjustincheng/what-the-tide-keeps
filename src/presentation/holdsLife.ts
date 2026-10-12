import Phaser from 'phaser';
import type {Context} from '../rules/world';
import {holdsState} from '../rules/holdsLife';

export class HoldsAtmosphere {
  private scenery:Phaser.GameObjects.Graphics;
  private workers:Phaser.GameObjects.Container[]=[];
  private state!:ReturnType<typeof holdsState>;
  private key='';
  private elapsed=0;
  private nextBark=7000;
  private bark=0;
  private bubble?:Phaser.GameObjects.Text;
  constructor(private scene:Phaser.Scene,context:Context) {
    this.scenery=scene.add.graphics().setDepth(3);
    for(const [x,y,texture] of [[600,376,'pigeon'],[624,376,'sparrow']] as const) {
      const shadow=scene.add.ellipse(0,10,14,5,0x111719,.6);
      this.workers.push(scene.add.container(x,y,[shadow,scene.add.image(0,0,texture)]).setDepth(4));
    }
    this.refresh(context);
  }
  refresh(context:Context) {
    this.state=holdsState(context);
    const frame=document.querySelector<HTMLElement>('.game-frame');
    if(frame)frame.dataset.holdsRoutes=this.state.open?'open':'closed';
    const key=String(this.state.open);
    if(key===this.key)return;
    this.key=key;this.bubble?.destroy();this.bubble=undefined;
    const g=this.scenery.clear();
    // Letter sacks and a sorting bench sit on the broad lower terrace.
    for(const x of [572,592,612]) {
      g.fillStyle(0x10191b,.5).fillEllipse(x+7,397,18,5);
      g.fillStyle(0x8b8069).fillRect(x,383,14,12).fillRect(x+3,379,8,5);
      g.fillStyle(0x48473e).fillRect(x+4,382,6,2);
      g.fillStyle(this.state.open?0xd7cfaa:0x655f50).fillRect(x+3,387,8,4);
    }
    g.fillStyle(0x5c5040).fillRect(632,381,30,6).fillRect(634,387,3,10).fillRect(657,387,3,10);
    g.fillStyle(0xc8bd9e).fillRect(635,378,9,3).fillRect(648,379,10,2);
    // The gate is attached to the existing rookery doorway, never over an NPC.
    if(!this.state.open) {
      g.fillStyle(0x676b65).fillRect(598,324,3,16).fillRect(614,324,3,16);
      for(let x=598;x<616;x+=4)g.fillStyle(0x929589).fillRect(x,330,5,3);
      g.fillStyle(0xa09476).fillRect(603,335,7,5);
    } else {
      g.fillStyle(0x676b65).fillRect(596,337,4,3).fillRect(598,340,4,3);
      g.fillStyle(0xc5b18b).fillRect(603,327,11,2);
    }
    this.workers.forEach(worker=>worker.setVisible(this.state.open));
  }
  update(delta:number,speaking:boolean,hero:{x:number;y:number}) {
    if(speaking){this.bubble?.setVisible(false);return;}
    this.bubble?.setVisible(true);this.elapsed+=Math.min(delta,100);
    if(this.elapsed<this.nextBark)return;
    this.nextBark=this.elapsed+17000;
    if(Phaser.Math.Distance.Between(hero.x,hero.y,584,376)>150)return;
    const words=this.state.open?['Oldest letters first.','Someone is still waiting for this.','Coast flight leaves at dawn.']:['No departures. By order of the house.','Another sack. No bird to carry it.'];
    this.bubble?.destroy();
    this.bubble=this.scene.add.text(584,360,words[this.bark++%words.length],{fontFamily:'monospace',fontSize:'8px',color:'#e1dcc8',backgroundColor:'#202729ee',padding:{x:5,y:4}}).setOrigin(.5,1).setDepth(8);
    const bubble=this.bubble;this.scene.time.delayedCall(5000,()=>{if(bubble.active)bubble.destroy();});
  }
  destroy(){this.scenery.destroy();this.workers.forEach(worker=>worker.destroy());this.bubble?.destroy();}
}
