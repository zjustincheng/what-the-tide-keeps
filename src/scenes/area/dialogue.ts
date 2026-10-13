import type Phaser from 'phaser';
import type { Choice, Conversation } from '../../content/dialogue';
import { fill, replies } from '../../rules/world';
import { writeDown as record } from '../../storage/journal';
import { music } from '../../audio/music';
import type { AreaScene } from '../AreaScene';
import { element } from './shared';

// The way out of a conversation, offered whenever the hero comes back to the replies.
const LEAVE: Choice = { text: 'Leave.', lines: [], ends: true };
// Speaker portraits, cut once from each sprite.
const PORTRAITS = new Map<string, string>();

// A bust cut from the sprite: the head and shoulders, scaled up with hard pixels. Cached per texture.
export function portrait(textures: Phaser.Textures.TextureManager, key: string): string {
  const cached = PORTRAITS.get(key);
  if (cached) return cached;
  const source = textures.get(key).getSourceImage() as CanvasImageSource & { width: number; height: number };
  const width = source.width, height = Math.round(source.height * 0.6);
  const scale = Math.max(1, Math.floor(96 / width));
  const canvas = document.createElement('canvas');
  canvas.width = width * scale; canvas.height = height * scale;
  const context = canvas.getContext('2d')!;
  context.imageSmoothingEnabled = false;
  context.drawImage(source, 0, 0, width, height, 0, 0, canvas.width, canvas.height);
  const url = canvas.toDataURL();
  PORTRAITS.set(key, url);
  return url;
}

// Speak with a portrait in its own box above the text, as in Omori; objects and places show only a name.
export class Dialogue {
  active?: Conversation;
  // Replies on offer under the speaker's last line.
  options: Choice[] = [];
  // What has been asked in this conversation.
  asked = new Set<string>();
  private line = 0;
  private portraitKey?: string;
  private basePortrait?: string;
  // The replies to return to after an answer.
  private menu?: Choice[];
  private returning = false;
  private blips: ReturnType<typeof setTimeout>[] = [];

  constructor(private scene: AreaScene) {}

  say(conversation: Conversation, portrait = this.portraitKey, returning = false) {
    this.active = conversation; this.line = 0; this.portraitKey = portrait; this.returning = returning;
    this.basePortrait = portrait;
    element('dialogue').hidden = false;
    this.showLine();
  }

  // On to the next line, or closed after the last.
  next() {
    this.line++;
    if (this.line >= this.active!.lines.length) this.scene.closeDialogue();
    else this.showLine();
  }

  // Hides the box, and forgets the conversation.
  clear() {
    this.active = undefined; this.options = []; this.portraitKey = undefined; this.basePortrait = undefined; this.menu = undefined; this.returning = false;
    element('dialogue').hidden = true; element('choices').hidden = true; element('continue').hidden = false;
  }

  // Show the current line; under the last one, offer whatever replies the hero can still give.
  private showLine() {
    const active = this.active!;
    const context = this.scene.context();
    const voice = active.voices?.[this.line];
    this.portraitKey = voice ? voice.portrait : this.basePortrait;
    element('speaker').textContent = voice?.speaker ?? active.speaker;
    const frame = element('portrait'); frame.hidden = !this.portraitKey;
    element('dialogue').classList.toggle('with-portrait', Boolean(this.portraitKey));
    if (this.portraitKey) (frame.querySelector('img') as HTMLImageElement).src = portrait(this.scene.textures, this.portraitKey);
    const text = fill(active.lines[this.line], context);
    element('dialogue-text').textContent = text;
    this.speak(text);
    this.options = this.line === active.lines.length - 1 ? replies(active.choices, context) : [];
    if (this.options.length) {
      if (!this.returning || !this.menu) this.menu = active.choices;
      // Coming back to the replies always offers a way out.
      if (this.returning && !this.options.some(option => option.ends)) this.options = [...this.options, LEAVE];
    }
    const box = element('choices');
    box.replaceChildren(...this.options.map((option, index) => {
      const button = document.createElement('button');
      button.type = 'button'; button.textContent = `${index + 1}. ${option.text}`;
      // Questions already asked this visit are dimmed, not removed.
      if (this.asked.has(`${active.speaker}:${option.text}`)) button.dataset.asked = 'true';
      button.addEventListener('click', () => this.choose(option));
      return button;
    }));
    box.hidden = !this.options.length;
    element('continue').hidden = this.options.length > 0;
    (box.querySelector('button') as HTMLButtonElement | null)?.focus({ preventScroll: true });
  }

  choose(option: Choice) {
    const scene = this.scene;
    music.effect('select');
    scene.effect(option.then);
    if (!option.lines.length) { scene.closeDialogue(); return; }
    const speaker = this.active!.speaker;
    this.asked.add(`${speaker}:${option.text}`);
    // Answers that tell the hero something are written down in the journal; answers that do something are not.
    if (!option.then && record({ speaker, topic: option.text, lines: option.lines.map(line => fill(line, scene.context())), place: scene.area.place })) music.effect('key', 7);
    // After an answer, the hero can ask something else from the same replies, unless this one ends it.
    const back = option.choices ?? (option.ends ? undefined : this.menu);
    this.say({ speaker, lines: option.lines, voices: option.voices, choices: back }, this.basePortrait, Boolean(back && !option.choices));
  }

  // People blip as they talk, a few blips per line, each voice at its own pitch. Objects just click.
  private speak(text: string) {
    for (const timer of this.blips) clearTimeout(timer);
    this.blips = [];
    if (!this.portraitKey) { music.effect('select'); return; }
    const voice = [...element('speaker').textContent!].reduce((sum, letter) => sum + letter.charCodeAt(0), 0) % 12 - 6;
    const count = Math.min(6, Math.max(2, Math.ceil(text.length / 22)));
    for (let i = 0; i < count; i++) this.blips.push(setTimeout(() => music.effect('blip', voice + [0, 2, -1, 3, 1, -2][i]), i * 75));
  }
}
