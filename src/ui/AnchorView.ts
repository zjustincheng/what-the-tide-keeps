import { memories } from '../content/memories';
import { ANCHOR_SLOTS, canRemind, held } from '../rules/memory';
import type { Companion, Memory, MemoryId } from '../rules/memory';

// At a fire, before sleeping: write down the one memory the tide must not take, and let a companion remind you of something lost.
// The tide takes a memory at random each time you die, from whatever isn't written down.
export class AnchorView {
  private root: HTMLElement;
  private cleanup = new AbortController();

  constructor(memory: Memory, companions: readonly { id: Companion; name: string }[], onDone: (anchor: MemoryId | null, reminder: { by: Companion; id: MemoryId } | null) => void) {
    const written = memory.anchors ?? [];
    const reminded = memory.reminded ?? [];
    // Who can remind him of what: each companion he still remembers, for each thing he has lost.
    const offers = companions.flatMap(({ id: by, name }) => memory.lost.filter(id => canRemind(memory, by, id)).map(id => ({ by, name, id })));
    this.root = document.createElement('section');
    this.root.className = 'battle resurrection anchor';
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-labelledby', 'anchor-title');
    this.root.tabIndex = -1;
    this.root.innerHTML = `
      <div class="battle-heading"><p class="eyebrow">BY THE FIRE</p><h2 id="anchor-title">Write something down.</h2>
      <p class="resurrection-intro">Each time you die, the tide takes one memory, and you don't choose which. It can't take what is written down. You have room for ${ANCHOR_SLOTS === 1 ? 'one' : ANCHOR_SLOTS}; after a death it has to be written again.</p></div>
      <fieldset class="memory-choices"><legend>Memories you still hold</legend>${held(memory).map(id => `
        <label class="memory-choice"><input type="radio" name="anchor" value="${id}" ${written.includes(id) ? 'checked' : ''} />
          <span><strong>${memories[id].name}${reminded.includes(id) ? ' · reminded' : ''}</strong>${written.includes(id) ? '<small class="perk">Written down</small>' : ''}<small>Losing it: ${memories[id].cost}${reminded.includes(id) ? ' Write it down and it stays yours after the next death; otherwise the tide takes it back.' : ''}</small></span></label>`).join('')}
      </fieldset>
      ${offers.length ? `<fieldset class="memory-choices reminders"><legend>Ask a friend to remind you</legend>${offers.map(({ by, name, id }) => `
        <label class="memory-choice"><input type="radio" name="remind" value="${by}:${id}" />
          <span><strong>${name}: ${memories[id].name}</strong><small>Yours again until the next time you die.</small></span></label>`).join('')}
      </fieldset>` : ''}
      <div class="anchor-actions"><button id="write" type="button">Done</button><button id="skip" type="button">Not tonight</button></div>`;
    document.querySelector('.game-frame')!.append(this.root);
    const signal = this.cleanup.signal;
    const write = this.root.querySelector<HTMLButtonElement>('#write')!;
    const chosen = () => this.root.querySelector<HTMLInputElement>('input[name="anchor"]:checked');
    const reminder = () => {
      const value = this.root.querySelector<HTMLInputElement>('input[name="remind"]:checked')?.value;
      if (!value) return null;
      const [by, id] = value.split(':') as [Companion, MemoryId];
      return { by, id };
    };
    write.addEventListener('click', () => onDone((chosen()?.value ?? null) as MemoryId | null, reminder()), { signal });
    this.root.querySelector('#skip')!.addEventListener('click', () => onDone(null, null), { signal });
    this.root.addEventListener('keydown', event => {
      if (event.key === 'Escape') { event.preventDefault(); onDone(null, null); return; }
      if (event.key !== 'Tab') return;
      const radios = ['anchor', 'remind'].map(name => this.root.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`) ?? this.root.querySelector<HTMLInputElement>(`input[name="${name}"]`));
      const controls = [...radios, write, this.root.querySelector<HTMLButtonElement>('#skip')].filter((control): control is HTMLInputElement | HTMLButtonElement => Boolean(control));
      event.preventDefault();
      const index = controls.indexOf(document.activeElement as HTMLInputElement);
      controls[(index + (event.shiftKey ? -1 : 1) + controls.length) % controls.length]?.focus();
    }, { signal });
    (chosen() ?? this.root.querySelector<HTMLInputElement>('input[name="anchor"]') ?? this.root).focus({ preventScroll: true });
  }

  destroy() {
    this.cleanup.abort(); this.root.remove();
  }
}
