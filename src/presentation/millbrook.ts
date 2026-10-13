import Phaser from 'phaser';
import { Townsperson } from './townsfolk';
import { Scenery } from './scenery';
import { millbrookState } from '../rules/millbrook';
import type { Context } from '../rules/world';

export class MillbrookAtmosphere {
  private scenery: Phaser.GameObjects.Graphics;
  private structures: Scenery;
  private queue: Townsperson[] = [];
  private bubble?: Phaser.GameObjects.Text;
  private key = '';
  private state!: ReturnType<typeof millbrookState>;
  private elapsed = 0;
  private nextBark = 6500;
  private bark = 0;

  constructor(private scene: Phaser.Scene, context: Context, hero: Phaser.Physics.Arcade.Sprite) {
    this.scenery = scene.add.graphics().setDepth(3);
    this.structures=new Scenery(scene,hero);
    for (const [x,y] of [[424,192],[440,200],[456,192],[472,200]]) {
      this.queue.push(new Townsperson(scene,hero,x,y,'fox',this.queue.length%2 ? 0xc8c4ba : 0xffffff));
    }
    this.refresh(context);
  }

  refresh(context: Context) {
    this.state = millbrookState(context);
    const frame=document.querySelector<HTMLElement>('.game-frame');
    if(frame) {frame.dataset.millbrookGrain=this.state.grain?'moving':'stalled';frame.dataset.millbrookFish=this.state.fish;}
    const night=Boolean(context.world.night);
    const key=`${this.state.grain}:${this.state.fish}:${night}`;
    if(key===this.key)return;
    this.key=key;this.bubble?.destroy();this.bubble=undefined;
    this.scenery.clear();this.structures.clear();
    // Match the timber and plaster of the surrounding market fronts.
    {const g=this.structures.add('bread-stall',132,239,40,14);
      g.fillStyle(0x263026,.45).fillRect(130,250,44,4);
      g.fillStyle(0x504938).fillRect(132,235,40,17);
      g.fillStyle(0x837956).fillRect(130,229,44,6);
      g.fillStyle(0x332e25).fillRect(134,236,36,13);
      for(const x of [136,147,158,169])g.fillStyle(0x62573f).fillRect(x,236,1,13);
      if(this.state.grain && !night) {
        for(const x of [138,150,162]) {
          g.fillStyle(0xb59b62).fillRect(x,239,7,5);
          g.fillStyle(0xd2bc87).fillRect(x+1,239,4,1);
          g.fillStyle(0x887149).fillRect(x+3,241,1,2);
        }
      } else {
        g.fillStyle(0x76694e).fillRect(134,236,36,13);
        for(const x of [144,158])g.fillStyle(0x474332).fillRect(x,236,2,13);
        g.fillStyle(0x514931).fillRect(133,241,38,3);
      }
      g.fillStyle(0x393d30).fillRect(132,250,40,2);
    }
    {const g=this.structures.add('fish-table',384,172,16,8);
      g.fillStyle(0x43392e).fillRect(386,173,12,7);
      g.fillStyle(0x9b9477).fillRect(384,169,16,4);
      if(this.state.fish!=='stopped')g.fillStyle(0x8eaa9f).fillRect(386,170,this.state.fish==='scarce'?4:10,2);
    }
    {const g=this.structures.add('town-sign',157,65,7,8);
      g.fillStyle(0x594733).fillRect(159,58,3,14).fillRect(143,52,34,8);
      g.fillStyle(0xb7a478).fillRect(146,54,25,1).fillRect(146,57,17,1);
    }
    if(!this.state.grain) {const g=this.structures.add('flour-sacks',184,290,18,10);
      g.fillStyle(0x918467).fillRect(192,285,10,12).fillRect(184,290,9,10);
      g.fillStyle(0xaba07e).fillRect(193,286,8,1).fillRect(185,291,7,1);
    }
    // A parked wagon stays beside the hauler instead of drifting through traffic.
    {const g=this.structures.add('grain-wagon',210,295,30,14);
      g.fillStyle(0x18221c,.6).fillRect(207,306,36,6);
      g.fillStyle(0x292b28).fillRect(207,298,5,11).fillRect(238,298,5,11);
      g.fillStyle(0x5e513d).fillRect(210,286,30,17);
      g.fillStyle(0x8a7757).fillRect(210,286,30,2);
      for(const x of [214,224,234])g.fillStyle(0x413c30).fillRect(x,289,1,11);
      g.fillStyle(0x38362b).fillRect(210,301,30,2);
      if(this.state.grain)for(const x of [214,226]) {
        g.fillStyle(0x9c9171).fillRect(x,278,10,12);
        g.fillStyle(0xb0a17c).fillRect(x+1,279,8,2);
        g.fillStyle(0x766e56).fillRect(x+2,283,6,1);
      }
    }
    const count=this.state.fish==='rationed'?1:this.state.fish==='scarce'?3:4;
    this.queue.forEach((citizen,index)=>citizen.setVisible(index<count));
  }

  update(delta: number, speaking: boolean, hero: { x: number; y: number }) {
    this.queue.forEach(person=>person.update(hero,speaking));
    if(speaking) {if(this.bubble?.active)this.bubble.setVisible(false);return;}
    if(this.bubble?.active)this.bubble.setVisible(true);
    this.elapsed+=Math.min(delta,100);
    if(this.elapsed<this.nextBark)return;
    this.nextBark=this.elapsed+15000;
    const east=hero.x>360;
    const words=east ? this.state.fish==='stopped' ? ['No boat again.','They said tomorrow.'] : this.state.fish==='scarce' ? ['Same token. Half a portion.','Keep the line moving.'] : ['Have your token ready.','We are still waiting.'] :
      this.state.grain ? ['The first wagon got through.','Bread is warm today.','Empty carts coming home.'] : ['Turned back. Again.','The grain is going damp.','Nobody signed the order.'];
    this.bubble?.destroy();
    const x=east?408:208,y=east?151:278;
    if(Phaser.Math.Distance.Between(hero.x,hero.y,x,y)>155)return;
    this.bubble=this.scene.add.text(x,y,words[this.bark++%words.length],{fontFamily:'monospace',fontSize:'8px',color:'#e5dcc4',backgroundColor:'#17231fee',padding:{x:5,y:4}}).setOrigin(.5,1).setDepth(8);
    const bubble=this.bubble;this.scene.time.delayedCall(5200,()=>{if(bubble.active)bubble.destroy();});
  }

  destroy(){this.structures.destroy();this.scenery.destroy();this.queue.forEach(citizen=>citizen.destroy());this.bubble?.destroy();}
}
