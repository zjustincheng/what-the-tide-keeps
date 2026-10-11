export type CombatEffect = 'hit' | 'spell' | 'heal' | 'mana' | 'ward' | 'dodge';
const COLORS: Record<CombatEffect, string> = { hit: '#e9b77f', spell: '#b8a7f1', heal: '#a2dfab', mana: '#8ad0e2', ward: '#b9d7ef', dodge: '#c8ede5' };

// Effects are decorative and never delay the turn or change the battle state.
export function combatEffect(target: Element | null, kind: CombatEffect, word?: string) {
  if (!target || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const make = (className: string) => {
    const node = document.createElement('span'); node.className = className;
    node.setAttribute('aria-hidden', 'true'); node.style.setProperty('--spark', COLORS[kind]);
    node.addEventListener('animationend', () => node.remove(), { once: true });
    target.append(node); return node;
  };
  if (word) make('combat-word').textContent = word;
  if (kind === 'heal' || kind === 'ward' || kind === 'mana' || kind === 'dodge') make('combat-aura');
  for (let i = 0; i < 9; i++) {
    const node = make('combat-particle');
    const angle = i / 9 * Math.PI * 2;
    node.style.setProperty('--dx', `${Math.cos(angle) * (26 + i * 3)}px`);
    node.style.setProperty('--dy', `${Math.sin(angle) * 36 - (kind === 'heal' || kind === 'mana' ? 22 : 0)}px`);
  }
}
