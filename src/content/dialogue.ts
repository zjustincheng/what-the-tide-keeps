import type { Condition, Effect } from '../rules/world';

export type Conversation = { speaker: string; lines: string[]; then?: Effect };
type Variant = { if: Condition; lines: string[]; then?: Effect };
// The first variant whose condition holds replaces the usual lines.
// A point whose hiddenIf condition holds can no longer be interacted with, like a bell already picked up.
export type Dialogue = Record<string, Conversation & { prompt?: string; variants?: Variant[]; hiddenIf?: Condition[] }>;
