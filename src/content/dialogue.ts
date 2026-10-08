import type { MemoryId } from '../rules/memory';

export type Conversation = { speaker: string; lines: string[] };
export type Dialogue = Record<string, Conversation & { prompt?: string; forgotten?: Partial<Record<MemoryId, string[]>> }>;

// The world remembers what the hero cannot: a forgotten memory changes what he hears.
export function conversation(dialogue: Dialogue, name: string, lost: readonly MemoryId[]): Conversation {
  const { speaker, lines, forgotten = {} } = dialogue[name];
  const memory = lost.find(id => id in forgotten);
  return { speaker, lines: memory ? forgotten[memory]! : lines };
}
