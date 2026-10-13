export type CombatEffect = 'hit' | 'spell' | 'heal' | 'mana' | 'ward' | 'dodge' | 'guard' | 'graze' | 'poison' | 'fizzle';
const COLORS: Record<CombatEffect, string> = { hit: '#e9b77f', spell: '#b8a7f1', heal: '#a2dfab', mana: '#8ad0e2', ward: '#b9d7ef', dodge: '#c8ede5', guard: '#e3ca81', graze: '#d5b28d', poison: '#a9c66b', fizzle: '#ba92a5' };

// Effects are decorative and never delay the turn or change the battle state.
export function combatEffect(target: Element | null, kind: CombatEffect, word?: string) {
  if (!target || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const make = (className: string) => {
    const node = document.createElement('span'); node.className = className;
    node.dataset.effect = kind;
    node.setAttribute('aria-hidden', 'true'); node.style.setProperty('--spark', COLORS[kind]);
    node.addEventListener('animationend', () => node.remove(), { once: true });
    target.append(node); return node;
  };
  if (word) make('combat-word').textContent = word;
  if (kind === 'heal' || kind === 'ward' || kind === 'mana' || kind === 'dodge' || kind === 'guard' || kind === 'poison') make('combat-aura');
  const count = kind === 'graze' || kind === 'fizzle' ? 4 : 9;
  for (let i = 0; i < count; i++) {
    const node = make('combat-particle');
    const angle = i / count * Math.PI * 2;
    node.style.setProperty('--dx', `${Math.cos(angle) * (26 + i * 3)}px`);
    node.style.setProperty('--dy', `${Math.sin(angle) * 36 - (kind === 'heal' || kind === 'mana' ? 22 : 0)}px`);
  }
}
