// Pure data for the grimoires each hero carries and the spell each one teaches.
// These are distinct from the shared grimoire of studied enemy spells.
import type { MemberId } from './battle';

export type BookId = 'thornwork' | 'riverstone' | 'windward' | 'pond-primer' | 'snare-primer' | 'drowned-psalter' | 'banned-hymnal' | 'hospice-litany';
export type SpellId = 'thorn-volley' | 'stone-ward' | 'gale-quill' | 'still-water' | 'bramble-snare' | 'undertow' | 'hush' | 'bitter-tonic';
export type Books = Readonly<Record<MemberId, BookId | null>>;

// Casting means typing a shown sequence of 1–4 within the time limit. One wrong key and the spell fizzles.
// cooldown: rounds before the same hero can cast again; a grimoire needs time to settle.
export const SPELLS: Record<SpellId, { name: string; cost: number; length: number; seconds: number; kind: 'damage' | 'ward' | 'heal' | 'snare'; power: number; cooldown: number; text: string }> = {
  'thorn-volley': { name: 'Thorn volley', cost: 4, length: 5, seconds: 3, kind: 'damage', power: 12, cooldown: 2, text: 'A spray of thorns at one enemy.' },
  'stone-ward': { name: 'Stone ward', cost: 4, length: 4, seconds: 2.6, kind: 'ward', power: 0, cooldown: 3, text: 'Every standing hero guards against physical blows this enemy turn.' },
  'gale-quill': { name: 'Gale quill', cost: 5, length: 6, seconds: 3.2, kind: 'damage', power: 16, cooldown: 2, text: 'One quill on a gale, at one enemy.' },
  'still-water': { name: 'Still water', cost: 4, length: 5, seconds: 3, kind: 'heal', power: 8, cooldown: 3, text: 'Every standing hero recovers 8 health.' },
  'bramble-snare': { name: 'Bramble snare', cost: 5, length: 6, seconds: 3.2, kind: 'snare', power: 0, cooldown: 3, text: 'The main enemy loses its next move. Followers still act.' },
  // Hard to cast quickly, and it hits harder than anything a hero starts with.
  // A banned hymn that stops a thing in its tracks: a snare that is quick to cast and quick to settle.
  hush: { name: 'Hush', cost: 4, length: 4, seconds: 2.2, kind: 'snare', power: 0, cooldown: 2, text: 'The main enemy loses its next move. Quick to cast, quick to settle.' },
  // The frog's own: a little mending for everyone, and the poison drawn out of them.
  'bitter-tonic': { name: 'Bitter tonic', cost: 4, length: 5, seconds: 3, kind: 'heal', power: 5, cooldown: 2, text: 'Every standing hero recovers 5 health, and the poison comes out of them.' },
  undertow: { name: 'Undertow', cost: 6, length: 7, seconds: 3, kind: 'damage', power: 20, cooldown: 3, text: 'Black water drags at one enemy.' },
};

export const BOOKS: Record<BookId, { name: string; spell: SpellId }> = {
  thornwork: { name: 'Thornwork', spell: 'thorn-volley' },
  riverstone: { name: 'Riverstone', spell: 'stone-ward' },
  windward: { name: 'Windward', spell: 'gale-quill' },
  'pond-primer': { name: "Pond-keeper's primer", spell: 'still-water' },
  'snare-primer': { name: "Hedge-witch's primer", spell: 'bramble-snare' },
  'drowned-psalter': { name: 'Drowned psalter', spell: 'undertow' },
  'banned-hymnal': { name: 'Banned hymnal', spell: 'hush' },
  'hospice-litany': { name: 'Hospice litany', spell: 'bitter-tonic' },
};
export const BOOK_IDS = Object.keys(BOOKS) as BookId[];
// Each hero starts with their own grimoire; others are found and can be carried by anyone.
export const STARTING_BOOKS: Books = { chameleon: 'thornwork', bear: 'riverstone', vulture: 'windward', frog: 'hospice-litany' };

// Give a hero a grimoire. A grimoire carried by someone else moves; null leaves the hero without one.
export function carry(books: Books, owned: readonly BookId[], member: MemberId, id: BookId | null): Books {
  if (id && !owned.includes(id)) return books;
  const next = Object.fromEntries(Object.entries(books).map(([other, book]) => [other, id && book === id ? null : book])) as Record<MemberId, BookId | null>;
  next[member] = id;
  return next;
}

// A companion's own grimoire stays theirs until they join, so nobody can borrow it first.
// Once they have joined, a companion left without a grimoire gets their own back if nobody is carrying it.
export function settle(books: Books, roster: readonly MemberId[]): Books {
  const reserved = (Object.keys(STARTING_BOOKS) as MemberId[]).filter(member => !roster.includes(member));
  const held = Object.fromEntries((Object.entries(books) as [MemberId, BookId | null][]).map(([member, book]) =>
    [member, reserved.includes(member) ? STARTING_BOOKS[member] : book && reserved.some(other => STARTING_BOOKS[other] === book) ? null : book])) as Record<MemberId, BookId | null>;
  for (const member of roster) {
    const own = STARTING_BOOKS[member];
    if (!held[member] && own && !Object.values(held).includes(own)) held[member] = own;
  }
  return held;
}

// A companion who has just joined takes their own grimoire back, whoever was carrying it; that hero gets their own back if it is free.
export function reclaim(books: Books, member: MemberId): Books {
  const own = STARTING_BOOKS[member];
  if (!own || books[member] === own) return books;
  const holder = (Object.keys(books) as MemberId[]).find(other => books[other] === own);
  const next = { ...books, [member]: own } as Record<MemberId, BookId | null>;
  if (holder) next[holder] = STARTING_BOOKS[holder] && !Object.values(next).includes(STARTING_BOOKS[holder]) ? STARTING_BOOKS[holder] : null;
  return next;
}

// What a player must type: the sequence is fixed for the attempt and checked key by key.
export function checkSequence(sequence: readonly number[], typed: readonly number[]): 'typing' | 'cast' | 'fizzle' {
  if (typed.some((key, index) => key !== sequence[index])) return 'fizzle';
  return typed.length === sequence.length ? 'cast' : 'typing';
}
