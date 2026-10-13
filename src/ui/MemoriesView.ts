import { STORIES } from '../presentation/stories';
import type { Story, StoryId } from '../presentation/stories';
import { CinematicView } from './CinematicView';

export class MemoriesView {
  private root = document.createElement('section');
  private cleanup = new AbortController();
  private scene?: CinematicView;
  constructor(ids: readonly StoryId[], close: () => void, ending?: Story) {
    this.root.className = 'battle memory-gallery';
    this.root.setAttribute('role', 'dialog'); this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-label', 'Revisit memories');
    this.root.innerHTML = '<p class="eyebrow">WHAT REMAINS</p><h2>Revisit memories</h2><p class="gallery-intro">Echoes of the journey. Replaying a scene does not change your save.</p><div class="memory-scenes"></div><button type="button" class="gallery-close">Close</button>';
    const signal = this.cleanup.signal;
    const stories: Story[] = [...(['waking', ...ids.filter(id => id !== 'waking')] as StoryId[]).map(id => STORIES[id]), ...(ending ? [ending] : [])];
    for (const story of stories) {
      const button = document.createElement('button');
      button.type = 'button'; button.textContent = story.title; button.setAttribute('aria-label', story.title);
      button.addEventListener('click', () => {
        this.root.inert = true; this.root.hidden = true;
        this.scene = new CinematicView(story, () => {
          this.scene?.destroy(); this.scene = undefined;
          this.root.inert = false; this.root.hidden = false; button.focus();
        });
      }, { signal });
      this.root.querySelector('.memory-scenes')!.append(button);
    }
    this.root.querySelector('.gallery-close')!.addEventListener('click', close, { signal });
    this.root.addEventListener('keydown', event => {
      if (event.key === 'Escape') { event.preventDefault(); close(); }
      if (event.key === 'Tab') {
        event.preventDefault();
        const buttons = Array.from(this.root.querySelectorAll<HTMLButtonElement>('button'));
        const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
        buttons[(index + (event.shiftKey ? -1 : 1) + buttons.length) % buttons.length].focus();
      }
    }, { signal });
    document.querySelector('.game-frame')!.append(this.root);
    this.root.querySelector<HTMLButtonElement>('button')!.focus();
  }
  destroy() { this.scene?.destroy(); this.cleanup.abort(); this.root.remove(); }
}
