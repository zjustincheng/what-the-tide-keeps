import type Phaser from 'phaser';
import type { Choice, Conversation } from '../../content/dialogue';
import type { Context, Effect } from '../../rules/world';
import { hunting } from '../../rules/pursuit';
import { loadPursuit } from '../../storage/pursuit';
import { loadWorld } from '../../storage/world';
import { music } from '../../audio/music';
import { bearAtCamp, millbrookState } from '../../rules/millbrook';
import { MillbrookAtmosphere } from '../../presentation/millbrook';
import { fortState, vultureAtCamp } from '../../rules/highlandLife';
import { FortAtmosphere } from '../../presentation/fortLife';
import { frogAtCamp, marshState } from '../../rules/marshLife';
import { MarshAtmosphere } from '../../presentation/marshLife';
import { heroAtCamp, holdsState } from '../../rules/holdsLife';
import { HoldsAtmosphere } from '../../presentation/holdsLife';
import { octopusAtCamp, oceanState } from '../../rules/oceanLife';
import { OceanAtmosphere } from '../../presentation/oceanLife';
import type { AreaScene } from '../AreaScene';

type Life = { refresh(context: Context): void; update(delta: number, speaking: boolean, hero: { x: number; y: number }): void; destroy(): void };
type CampTalk = NonNullable<Effect['campTalk']>;

// The towns: what each is called as the story changes it, and the memory that stirs the first time the hero walks in after a death.
const TOWNS: Record<string, { state: (context: Context) => { name: string; familiar: boolean }; echo: { title: string; text: string } }> = {
  town: { state: millbrookState, echo: { title: 'A road you should know', text: 'Your feet turn toward the mill. You cannot remember who taught them the way.' } },
  fort: { state: fortState, echo: { title: 'A place kept on paper', text: 'You turn toward the barracks. A long bunk, a folded note. You cannot remember whose handwriting you were looking for.' } },
  wickmere: { state: marshState, echo: { title: 'A pair of careful hands', text: 'You reach for a basin that is not there. Someone used to steady it for you. You cannot remember who.' } },
  hold: { state: holdsState, echo: { title: 'A watch you cannot keep', text: 'Your hands begin an old guard’s drill, then stop. You know there should be another movement. You cannot remember it.' } },
  'outlaw-port': { state: oceanState, echo: { title: 'A voice beneath the hood', text: 'You listen for a voice that once said your name. The deck ropes creak. You cannot remember who you are waiting to hear.' } },
};
// Places named outright, whatever happens in them.
const NAMES: Record<string, string> = { square: 'Covenhithe', harbour: 'Covenhithe harbour' };
// Who sits with the hero at a fire, region by region, once they will.
const CAMP_TALKS: Record<CampTalk, { region: string; text: string; moment: (context: Context) => Conversation | undefined }> = {
  bear: { region: 'THE FARMLAND', text: 'Sit with the bear.', moment: bearAtCamp },
  vulture: { region: 'THE HIGHLANDS', text: 'Sit with the vulture.', moment: vultureAtCamp },
  hero: { region: 'THE MOUNTAIN HOLDS', text: 'Sit quietly by the fire.', moment: heroAtCamp },
  octopus: { region: 'THE OCEAN', text: 'Sit with the octopus.', moment: octopusAtCamp },
  frog: { region: 'THE MARSH', text: 'Sit with the frog.', moment: frogAtCamp },
};
// The page marks each town's state for its styling; they go when the hero leaves.
const MARKS = ['seaReception', 'seaPens', 'seaTrade', 'holdsRoutes', 'millbrookGrain', 'millbrookFish', 'fortGraves', 'fortFish', 'marshCare', 'marshFish'];
// Echoes already heard, by death and town.
const ECHOES = new Set<string>();

// The people of a town going about their lives, which change with what the hero has done.
export class TownLife {
  life?: Life;
  private echo?: HTMLElement;

  constructor(private scene: AreaScene) {}

  begin(furniture: Phaser.Tilemaps.TilemapLayer) {
    const scene = this.scene, key = scene.area.key, context = scene.context(), hero = scene.player;
    if (key === 'town') this.life = new MillbrookAtmosphere(scene, context, hero);
    if (key === 'fort') this.life = new FortAtmosphere(scene, context, hero);
    if (key === 'outlaw-port' || key === 'sea-pens') this.life = new OceanAtmosphere(scene, key, context, furniture, hero);
    if (key === 'hold') this.life = new HoldsAtmosphere(scene, context, hero);
    if (key === 'wickmere' || key === 'hospice') this.life = new MarshAtmosphere(scene, key, context, hero);
  }

  // What the place is called now.
  title(context: Context): string {
    const key = this.scene.area.key;
    return TOWNS[key]?.state(context).name ?? NAMES[key] ?? this.scene.area.place;
  }

  get isTown() { return this.scene.area.key in TOWNS; }

  refresh(context: Context) { this.life?.refresh(context); }

  update(delta: number, speaking: boolean) { this.life?.update(delta, speaking, this.scene.player); }

  destroy() {
    this.life?.destroy(); this.life = undefined;
    this.echo?.remove();
    const frame = document.querySelector<HTMLElement>('.game-frame');
    if (frame) for (const mark of MARKS) delete frame.dataset[mark];
  }

  // In a town the hero no longer knows, a little of what he lost stirs, once each death.
  remember(context: Context) {
    const scene = this.scene, town = TOWNS[scene.area.key];
    if (!town || town.state(context).familiar) return;
    const key = `${loadWorld().deaths}:${scene.area.key}`;
    if (ECHOES.has(key)) return;
    ECHOES.add(key);
    scene.time.delayedCall(2800, () => {
      if (scene.leaving || hunting(loadPursuit())) return;
      const echo = this.echo = document.createElement('aside');
      echo.className = 'memory-echo';
      echo.setAttribute('role', 'status');
      echo.innerHTML = `<button type="button" aria-label="Dismiss memory echo">×</button><strong>${town.echo.title}</strong><p>${town.echo.text}</p>`;
      document.querySelector('.game-frame')!.append(echo);
      echo.querySelector('button')!.addEventListener('click', () => echo.remove(), { signal: scene.cleanup.signal });
      music.effect('memory');
      scene.time.delayedCall(10000, () => echo.remove());
    });
  }

  // Sitting with whoever in this region will sit with the hero at a fire.
  campChoices(context: Context): Choice[] {
    return Object.entries(CAMP_TALKS).filter(([, talk]) => talk.region === this.scene.area.region && talk.moment(context))
      .map(([who, talk]) => ({ text: talk.text, ends: true, lines: [], then: { campTalk: who as CampTalk } }));
  }

  campMoment(who: CampTalk, context: Context) {
    return CAMP_TALKS[who].moment(context);
  }
}
