import Phaser from 'phaser';
import { millbrookState } from '../rules/millbrook';
import type { Context } from '../rules/world';

// Pixel scenery stays on the ground and leaves exits and the quarter gate clear.
export class MillbrookAtmosphere {
  private scenery: Phaser.GameObjects.Graphics;
  private cart: Phaser.GameObjects.Container;
  private queue: Phaser.GameObjects.Container[] = [];
  private bubble?: Phaser.GameObjects.Text;
  private key = '';
  private state!: ReturnType<typeof millbrookState>;
  private night = false;
  private elapsed = 0;
  private nextBark = 6500;
  private bark = 0;
  private reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  constructor(private scene: Phaser.Scene, context: Context) {
    this.scenery = scene.add.graphics().setDepth(3);
    const cart = scene.add.graphics();
    cart.fillStyle(0x18221c,.6).fillEllipse(0,12,36,8);
    cart.fillStyle(0x3a3026).fillRect(-16,0,32,10);
    cart.fillStyle(0x8c7050).fillRect(-14,-2,28,9);
    cart.fillStyle(0x292b28).fillRect(-17,5,5,10).fillRect(12,5,5,10);
    cart.fillStyle(0xc1aa72).fillRect(-11,-11,10,10).fillRect(1,-8,10,9);
    cart.fillStyle(0x78613f).fillRect(-10,-9,8,2).fillRect(2,-6,8,2);
    cart.fillStyle(0x6d583d).fillRect(-2,9,4,12);
    this.cart = scene.add.container(224,292,[cart]).setDepth(3);
    for (const [x,y] of [[424,192],[440,200],[456,192],[472,200]]) {
      const shadow = scene.add.ellipse(0,9,14,5,0x142a23,.6);
      const citizen = scene.add.image(0,0,'fox').setTint(this.queue.length%2 ? 0xc8c4ba : 0xffffff);
      this.queue.push(scene.add.container(x,y,[shadow,citizen]).setDepth(4));
    }
    this.refresh(context);
  }

  refresh(context: Context) {
    this.state = millbrookState(context);
    const frame=document.querySelector<HTMLElement>('.game-frame');
    if(frame) { frame.dataset.millbrookGrain=this.state.grain?'moving':'stalled'; frame.dataset.millbrookFish=this.state.fish; }
    this.night = Boolean(context.world.night);
    const key = `${this.state.grain}:${this.state.fish}:${this.night}`;
    if(key===this.key) return;
    this.key=key;
    this.bubble?.destroy(); this.bubble=undefined;
    const g=this.scenery.clear();
    // A small bread stall: barred shutters become a counter of fresh loaves.
    g.fillStyle(0x17231d,.5).fillEllipse(152,255,38,8);
    g.fillStyle(0x594936).fillRect(132,235,40,17);
    g.fillStyle(this.state.grain ? 0xb2a278 : 0x6a6559).fillRect(130,229,44,6);
    if(this.state.grain && !this.night) {
      g.fillStyle(0x332b23).fillRect(134,236,36,13);
      g.fillStyle(0xcaaa6d).fillRect(138,239,8,5).fillRect(150,239,8,5).fillRect(162,239,5,5);
      g.fillStyle(0xf0ddaa).fillRect(139,239,2,1).fillRect(151,239,2,1);
    } else {
      g.fillStyle(0x8c7758).fillRect(134,236,36,13);
      g.fillStyle(0x574633).fillRect(144,236,2,13).fillRect(158,236,2,13).fillRect(133,241,38,3);
    }
    // Weighing table: fewer pieces of fish as the wider supply fails.
    g.fillStyle(0x43392e).fillRect(386,173,12,7);
    g.fillStyle(0xb0a17d).fillRect(384,169,16,4);
    if(this.state.fish!=='stopped') {
      g.fillStyle(0x8eaa9f).fillRect(386,170,this.state.fish==='scarce'?4:10,2);
    }
    // A grounded signpost, and flour sacks awaiting or arriving with the wagons.
    g.fillStyle(0x594733).fillRect(159,58,3,14).fillRect(143,52,34,8);
    g.fillStyle(0xb7a478).fillRect(146,54,25,1).fillRect(146,57,17,1);
    if(!this.state.grain) {
      g.fillStyle(0x918467).fillRect(192,285,10,12).fillRect(184,290,9,10).fillRect(191,285,10,2);
    }
    const count=this.state.fish==='rationed'?1:this.state.fish==='scarce'?3:4;
    this.queue.forEach((citizen,index)=>citizen.setVisible(index<count));
    this.cart.setPosition(this.state.grain?256:224,this.state.grain?312:292);
  }

  update(delta: number, speaking: boolean, hero: { x: number; y: number }) {
    if(speaking) { if(this.bubble?.active) this.bubble.setVisible(false); return; }
    if(this.bubble?.active) this.bubble.setVisible(true);
    this.elapsed+=Math.min(delta,100);
    if(this.state.grain && !this.night && !this.reduced) {
      const distance=(this.elapsed/130)%60;
      this.cart.y=300+distance;
      this.cart.setAlpha(Math.min(1,distance/6,(60-distance)/6));
    } else this.cart.setAlpha(1);
    if(this.elapsed<this.nextBark) return;
    this.nextBark=this.elapsed+15000;
    const east = hero.x>360;
    const words=east ? this.state.fish==='stopped' ? ['No boat again.','They said tomorrow.'] : this.state.fish==='scarce' ? ['Same token. Half a portion.','Keep the line moving.'] : ['Have your token ready.','We are still waiting.'] :
      this.state.grain ? ['The first wagon got through.','Bread is warm today.','Empty carts coming home.'] : ['Turned back. Again.','The grain is going damp.','Nobody signed the order.'];
    this.bubble?.destroy();
    const x=east?408:208, y=east?151:278;
    if(Phaser.Math.Distance.Between(hero.x,hero.y,x,y)>155) return;
    this.bubble=this.scene.add.text(x,y,words[this.bark++%words.length],{fontFamily:'monospace',fontSize:'8px',color:'#e5dcc4',backgroundColor:'#17231fee',padding:{x:5,y:4}}).setOrigin(.5,1).setDepth(8);
    const bubble=this.bubble;
    this.scene.time.delayedCall(5200,()=>{ if(bubble.active) bubble.destroy(); });
  }

  destroy() {
    this.scenery.destroy(); this.cart.destroy(); this.queue.forEach(citizen=>citizen.destroy()); this.bubble?.destroy();
  }
}
