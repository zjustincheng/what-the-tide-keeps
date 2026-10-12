import Phaser from 'phaser';
import {marshState} from '../rules/marshLife';
import type {Context} from '../rules/world';

export class MarshAtmosphere {
  private scenery:Phaser.GameObjects.Graphics;
  private queue:Phaser.GameObjects.Container[]=[];
  private bubble?:Phaser.GameObjects.Text;
  private key='';
  private state!:ReturnType<typeof marshState>;
  private elapsed=0;
  private nextBark=6500;
  private bark=0;
  constructor(private scene:Phaser.Scene,private room:'wickmere'|'hospice',context:Context) {
    this.scenery=scene.add.graphics().setDepth(3);
    if(room==='wickmere') for(const [index,[x,y]] of [[504,200],[528,200],[544,216]].entries()) {
      const shadow=scene.add.ellipse(0,9,14,5,0x112322,.6);
      const relative=scene.add.image(0,0,index%2?'widow':'water-rat');
      this.queue.push(scene.add.container(x,y,[shadow,relative]).setDepth(4));
    }
    this.refresh(context);
  }
  refresh(context:Context) {
    this.state=marshState(context);
    const frame=document.querySelector<HTMLElement>('.game-frame');
    if(frame){frame.dataset.marshCare=this.state.care;frame.dataset.marshFish=this.state.fish;}
    const key=`${this.state.care}:${this.state.fish}:${Boolean(context.world.night)}`;
    if(key===this.key)return;
    this.key=key;this.bubble?.destroy();this.bubble=undefined;
    const g=this.scenery.clear();
    const recovered=this.state.care==='recovering';
    if(this.room==='wickmere') {
      // Cloths attach to a low rack with two posts planted on the deck.
      g.fillStyle(0x13231f,.5).fillEllipse(466,299,48,7);
      g.fillStyle(0x685643).fillRect(450,268,3,28).fillRect(488,268,3,28).fillRect(450,270,41,2);
      g.fillStyle(recovered?0xd7d9bc:0x969d83).fillRect(456,272,10,13).fillRect(474,272,10,10);
      g.fillStyle(0x5a5845).fillRect(458,291,18,9);
      g.fillStyle(recovered?0x9dbbb0:0x657f6c).fillRect(460,292,14,3);
      // Landing barrels remain on the broad planks, clear of the channel exit.
      for(const x of [520,544]) {
        g.fillStyle(0x13231f,.5).fillEllipse(x+8,346,20,6);
        g.fillStyle(0x665339).fillRect(x,324,16,20);
        g.fillStyle(0x8a7653).fillRect(x+2,325,12,2);
        g.fillStyle(0x353e37).fillRect(x,331,16,2).fillRect(x,339,16,2);
        if(this.state.fish==='stopped') g.fillStyle(0x18201d).fillRect(x+2,324,12,4);
        else g.fillStyle(recovered?0xbfcfbc:0xa77761).fillRect(x+5,326,5,4);
      }
      // The official warning remains; recovery adds a small corrected notice.
      g.fillStyle(0xbaa986).fillRect(317,199,20,11);
      g.fillStyle(0x564a3c).fillRect(320,202,14,1).fillRect(320,205,10,1);
      if(this.state.care!=='feared') {
        g.fillStyle(0xd2cab0).fillRect(327,207,15,10);
        g.fillStyle(0x62766b).fillRect(330,210,9,1).fillRect(330,213,7,1);
      }
      g.fillStyle(0x68563f).fillRect(268,68,3,14).fillRect(252,62,18,7);
      g.fillStyle(0xc1b595).fillRect(255,64,11,1);
      this.queue.forEach((person,index)=>person.setVisible(!recovered || index===0 && Boolean(context.world.night)));
    } else {
      // A checked meal and clean water show care improving, not instant cures.
      g.fillStyle(0x14211e,.5).fillEllipse(120,180,38,7);
      g.fillStyle(0x61523c).fillRect(101,161,38,13);
      g.fillStyle(0xaaa083).fillRect(102,160,36,3);
      for(const x of [106,119,132]) {
        g.fillStyle(0xc0bfa6).fillRect(x,163,7,5);
        g.fillStyle(recovered?0x6c7768:this.state.care==='poison'?0x9fb9ad:0x9e894e).fillRect(x+1,163,5,2);
      }
      if(this.state.care!=='feared') g.fillStyle(0xc5b07d).fillRect(112,157,8,4).fillRect(125,157,8,4);
      g.fillStyle(recovered?0xd4d7bb:0x9faaa1).fillRect(285,65,21,12);
      g.fillStyle(0x659288).fillRect(288,67,15,7);
      g.fillStyle(recovered?0xe1dec2:0xa9ad94).fillRect(305,72,9,5);
      for(const [x,y] of [[104,72],[200,136]]) {
        g.fillStyle(recovered?0xc4ceb7:0x849484).fillRect(x-9,y+8,18,5);
        g.fillStyle(0x484d3e).fillRect(x-9,y+14,18,2);
      }
      // Small windows in the existing upper wall; the ward stays dim at night.
      const light=recovered && !context.world.night?0xc5d4bc:0x546e65;
      g.fillStyle(0x333f36).fillRect(76,24,36,7).fillRect(186,24,36,7);
      g.fillStyle(light).fillRect(78,25,15,4).fillRect(96,25,14,4).fillRect(188,25,15,4).fillRect(206,25,14,4);
    }
  }
  update(delta:number,speaking:boolean,hero:{x:number;y:number}) {
    if(speaking){if(this.bubble?.active)this.bubble.setVisible(false);return;}
    if(this.bubble?.active)this.bubble.setVisible(true);
    this.elapsed+=Math.min(delta,100);
    if(this.elapsed<this.nextBark)return;
    this.nextBark=this.elapsed+16000;
    const landing=this.room==='wickmere' && hero.y>300;
    const [x,y]=this.room==='hospice'?[140,146]:landing?[480,308]:[488,158];
    if(Phaser.Math.Distance.Between(hero.x,hero.y,x,y)>155)return;
    const words=this.room==='hospice'?this.state.care==='recovering'?['No new admissions.','She kept breakfast down.']:this.state.care==='poison'?['Keep the seal.','Plain water for this bed.']:['It began after supper.','They say it is catching.']:
      landing?this.state.fish==='stopped'?['No boats today.','Coil the landing ropes.']:this.state.care==='recovering'?['Open it before we stamp it.','Clean cloth on this one.']:['Fresh wax over old wax.','Hold that barrel.']:
      this.state.care==='recovering'?['They let me bring her shawl.','The door is open to families.']:this.state.care==='poison'?['Not from breath to breath.','Keep your meal token.']:['They will not let us in.','Only she ate the soup.'];
    this.bubble?.destroy();
    this.bubble=this.scene.add.text(x,y,words[this.bark++%words.length],{fontFamily:'monospace',fontSize:'8px',color:'#dce6d1',backgroundColor:'#132923ee',padding:{x:5,y:4}}).setOrigin(.5,1).setDepth(8);
    const bubble=this.bubble;this.scene.time.delayedCall(5200,()=>{if(bubble.active)bubble.destroy();});
  }
  destroy(){this.scenery.destroy();this.queue.forEach(person=>person.destroy());this.bubble?.destroy();}
}
