import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { STORIES } from '../../src/presentation/stories.ts';

// Styles aimed at one shot of one scene must land on a shot that is there and has what they animate.
// The kraken's fall once played a shot late, on the heroes; this keeps every other scene from doing the same.
const css = ['src/style.css', ...readdirSync('src/presentation').filter(f => f.endsWith('.css')).map(f => `src/presentation/${f}`)].map(f => readFileSync(f, 'utf8')).join('\n');
const selectors = [...css.matchAll(/([^{}]*data-shot="\d+"[^{}]*)\{/g)].flatMap(([, list]) => list.split(',')).map(s => s.trim()).filter(s => s.includes('data-shot='));

test('every style aimed at one shot of a scene lands on a shot that has what it animates', () => {
  assert.ok(selectors.length > 0, "the styles were found");
  const problems: string[] = [];
  for (const selector of selectors) {
    const story = selector.match(/data-story="(\w+)"/)?.[1];
    const shotIndex = Number(selector.match(/data-shot="(\d+)"/)![1]);
    const art = selector.match(/data-art="([\w-]+)"/)?.[1] ?? (selector.includes('.cinema-trial') ? 'trial' : undefined);
    const stories = story ? [STORIES[story as keyof typeof STORIES]] : Object.values(STORIES).filter(s => !art || s.shots.some(shot => shot.art === art));
    if (stories.some(s => !s)) { problems.push(`${selector}: no scene "${story}"`); continue; }
    // A rule that names a scene must fit it; one that only names an art must fit at least one scene with that art.
    const fits = stories.some(s => {
      const shot = s.shots[shotIndex];
      if (!shot || (art && shot.art !== art)) return false;
      const actors = shot.actors?.length ?? 0;
      const nth = Number(selector.match(/nth-child\((\d+)\)/)?.[1] ?? (/(:first-child|:last-child)/.test(selector) ? 1 : 0));
      const named = selector.match(/data-actor="(\w+)"/)?.[1];
      if (/cinema-actors img|cinema-actors::|cinema-actors\s*$/.test(selector) && !actors) return false;
      if (nth > actors) return false;
      if (named && !shot.actors?.includes(named)) return false;
      return true;
    });
    if (!fits) problems.push(selector);
  }
  assert.deepEqual(problems, []);
});
