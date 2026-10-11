import { STORIES } from '../presentation/stories';
import type { StoryId } from '../presentation/stories';

const KEY = 'tide-keeps.scenes.v1';
const seen = new Set<StoryId>();
export function seenStories(): StoryId[] {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    if (Array.isArray(saved)) for (const id of Object.keys(STORIES) as StoryId[]) if (saved.includes(id)) seen.add(id);
  } catch { /* Presentation still works without browser storage. */ }
  return [...seen];
}
export function rememberStory(id: StoryId) {
  seenStories(); seen.add(id);
  try { localStorage.setItem(KEY, JSON.stringify([...seen])); } catch { /* Keep it for this visit. */ }
}
