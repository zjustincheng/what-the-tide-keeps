import { memories } from '../content/memories';
import { ANCHOR_SLOTS, canRemind, held, PERKS, PERK_BONUS } from '../rules/memory';
import type { Companion, Memory, MemoryId } from '../rules/memory';
import { canRemindCompanion, COMPANION_MEMORY_IDS, INITIAL_MINDS, remembers } from '../rules/companionMemory';
import type { CompanionMemoryId } from '../rules/companionMemory';
import { companionMemory } from '../content/companionMemories';

// At a fire, before sleeping: write down the one memory the tide must not take, and let a companion remind you of something lost.
// The tide takes a memory at random each time you die, from whatever isn't written down.
export class AnchorView {
  private root: HTMLElement;
  private cleanup = new AbortController();

  constructor(memory: Memory, companions: readonly { id: Companion; name: string }[], onDone: (anchor: MemoryId | null, reminder: { by: Companion; id: MemoryId } | null, given?: { to: Companion; id: CompanionMemoryId } | null) => void, joined: readonly { id: Companion; name: string }[] = companions) {
    const written = memory.anchors ?? [];
    const reminded = memory.reminded ?? [];
    const bound = memory.keepsakeMemories ?? [];
    // Who can remind him of what: each companion he still remembers, for each thing he has lost.
    const offers = companions.flatMap(({ id: by, name }) => memory.lost.filter(id => canRemind(memory, by, id)).map(id => ({ by, name, id })));
    // And what he can give back to them: whatever they lost that he still holds himself.
    const minds = memory.companions ?? INITIAL_MINDS;
    // Friends who don't know him can't remind him of anything: say so, rather than leave them out without a word.
    const strangers = companions.filter(({ id }) => !remembers(minds, id, 'hero')).map(({ name }) => name.toLowerCase());
    const gifts = joined.flatMap(({ id: to, name }) => COMPANION_MEMORY_IDS.filter(id => canRemindCompanion(held(memory), minds, to, id)).map(id => ({ to, name, id })));
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
        <label class="memory-choice"><input type="radio" name="anchor" value="${id}" ${bound.includes(id) ? 'disabled' : ''} ${written.includes(id) ? 'checked' : ''} />
          <span><strong>${memories[id].name}${reminded.includes(id) ? ' · reminded' : ''}</strong>${bound.includes(id) ? '<small class="perk">Held permanently by a keepsake · no anchor slot needed</small>' : written.includes(id) ? '<small class="perk">Written down</small>' : ''}<small>${bound.includes(id) ? 'The tide cannot take this memory. Equipping the keepsake is not required.' : `Losing it: ${memories[id].cost}`}${reminded.includes(id) ? ' Write it down and it stays yours after the next death; otherwise the tide takes it back.' : ''}</small></span></label>`).join('')}
      </fieldset>
      ${offers.length ? `<fieldset class="memory-choices reminders"><legend>Ask a friend to remind you</legend>${offers.map(({ by, name, id }) => `
        <label class="memory-choice"><input type="radio" name="remind" value="${by}:${id}" />
          <span><strong>${name}: ${memories[id].name}</strong><small>Yours again until the next time you die.</small></span></label>`).join('')}
        <label class="memory-choice reminder-anchor" hidden><input type="radio" name="anchor" disabled /><span><strong></strong><small>Write this reminder down now. It will remain yours after the next death.</small></span></label>
      </fieldset>` : ''}
      ${strangers.length ? `<p class="memories-lost strangers">The ${strangers.join(' and the ')} ${strangers.length > 1 ? 'don’t' : 'doesn’t'} know you, and can’t remind you of anything until you remind them who you are.</p>` : ''}
      ${gifts.length ? `<fieldset class="memory-choices reminders gifts"><legend>Remind a friend</legend>${gifts.map(({ to, name, id }) => `
        <label class="memory-choice"><input type="radio" name="give" value="${to}:${id}" />
          <span><strong>${name}: ${companionMemory(to, id).name}</strong><small>Theirs again until the next time the party falls.</small></span></label>`).join('')}
      </fieldset>` : ''}
      <p class="anchor-summary" role="status"></p>
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
    const update = () => {
      const offer = reminder(); const extra = this.root.querySelector<HTMLElement>('.reminder-anchor');
      if (extra && offer) {
        const input = extra.querySelector<HTMLInputElement>('input')!;
        extra.hidden = false; input.disabled = false; input.value = offer.id;
        extra.querySelector('strong')!.textContent = `Write down ${memories[offer.id].name}`;
      }
      const id = chosen()?.value as MemoryId | undefined;
      const protection = id ? `${memories[id].name} will be protected through your next death. The page is used up afterward.${written.length && !written.includes(id) ? ' This replaces the page for ' + written.map(old => memories[old].name).join(', ') + '.' : ''}` : 'Choose a memory to protect through your next death.';
      const bonus = offer ? PERKS[offer.id] === 'mana' ? `+${PERK_BONUS.mana} mana` : `+${PERK_BONUS.force} damage` : '';
      this.root.querySelector('.anchor-summary')!.textContent = `${protection}${offer ? ` Restoring ${memories[offer.id].name} removes its Hollow bonus (${bonus}).${id !== offer.id ? ' This reminder fades at death unless you write it down.' : ''}` : ''}`;
    };
    this.root.addEventListener('change', update, { signal }); update();
    const given = () => {
      const value = this.root.querySelector<HTMLInputElement>('input[name="give"]:checked')?.value;
      if (!value) return null;
      const [to, id] = value.split(':') as [Companion, CompanionMemoryId];
      return { to, id };
    };
    write.addEventListener('click', () => onDone((chosen()?.value ?? null) as MemoryId | null, reminder(), given()), { signal });
    this.root.querySelector('#skip')!.addEventListener('click', () => onDone(null, null), { signal });
    this.root.addEventListener('keydown', event => {
      if (event.key === 'Escape') { event.preventDefault(); onDone(null, null); return; }
      if (event.key !== 'Tab') return;
      const radios = ['anchor', 'remind', 'give'].map(name => this.root.querySelector<HTMLInputElement>(`input[name="${name}"]:checked:not(:disabled)`) ?? this.root.querySelector<HTMLInputElement>(`input[name="${name}"]:not(:disabled)`));
      const controls = [...radios, write, this.root.querySelector<HTMLButtonElement>('#skip')].filter((control): control is HTMLInputElement | HTMLButtonElement => Boolean(control));
      event.preventDefault();
      const index = controls.indexOf(document.activeElement as HTMLInputElement);
      controls[(index + (event.shiftKey ? -1 : 1) + controls.length) % controls.length]?.focus();
    }, { signal });
    (chosen() ?? this.root.querySelector<HTMLInputElement>('input[name="anchor"]:not(:disabled)') ?? this.root).focus({ preventScroll: true });
  }

  destroy() {
    this.cleanup.abort(); this.root.remove();
  }
}
