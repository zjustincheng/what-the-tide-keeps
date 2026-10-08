import type { Condition, Effect } from '../rules/world';

// A reply the hero can choose once the speaker is done. It may only be offered under a condition,
// such as still remembering the feast, and may lead to further replies.
export type Choice = { text: string; if?: Condition; lines: string[]; then?: Effect; choices?: Choice[] };
export type Conversation = { speaker: string; lines: string[]; then?: Effect; choices?: Choice[] };
type Variant = { if: Condition; lines: string[]; then?: Effect; choices?: Choice[] };
// The first variant whose condition holds replaces the usual lines.
// A point whose hiddenIf condition holds can no longer be interacted with, like a bell already picked up.
// portrait names the texture to show beside the speaker when it is not the NPC standing at that point.
export type Dialogue = Record<string, Conversation & { prompt?: string; variants?: Variant[]; hiddenIf?: Condition[]; portrait?: string }>;
