import { KEEPSAKES, keepsakeMods } from '../rules/gear.ts';
import type { KeepsakeId } from '../rules/gear';

// Use the modifiers the fight actually applies, including rounded tempering.
export function keepsakeDescription(id: KeepsakeId, tempered = false) {
  const mods = keepsakeMods(id, tempered), benefits: string[] = [], drawbacks: string[] = [];
  for (const [key, value] of Object.entries(mods)) {
    const n = Math.abs(value); if (!n) continue;
    if (key === 'guardAll') { benefits.push('Protect guards the whole party against physical blows.'); drawbacks.push('Protect costs 3 mana and his action.'); continue; }
    const positive = key === 'shown' || key === 'suppressCost' ? value < 0 : value > 0;
    const text = key === 'health' ? `${n} ${value > 0 ? 'more' : 'less'} health.`
      : key === 'damage' ? `Attacks hit ${n} ${value > 0 ? 'harder' : 'softer'}.`
      : key === 'reveal' ? `Revealing hidden mana hits ${n} ${value > 0 ? 'harder' : 'softer'}.`
      : key === 'shown' ? `Shows ${n} ${value > 0 ? 'more' : 'less'} mana.`
      : key === 'suppressCost' ? `Hiding costs ${n} ${value > 0 ? 'extra' : 'less'} mana.`
      : `Dodge timing windows are ${n}% ${value > 0 ? 'wider' : 'narrower'}.`;
    (positive ? benefits : drawbacks).push(text);
  }
  return { benefit: benefits.join(' '), drawback: drawbacks.join(' '), memory: id === 'broken-link' ? 'Permanently holds the hero’s memory of the bear, even when kept in the pack.' : '' };
}
