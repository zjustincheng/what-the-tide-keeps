import { MEMBER_IDS } from '../rules/gear';
import { BOOK_IDS, STARTING_BOOKS } from '../rules/spells';
import type { BookId, Books } from '../rules/spells';

// Which grimoire each hero carries.
const KEY = 'tide-keeps.books.v1';
let session: Books | undefined;

function parse(raw: string | null): Books | undefined {
  if (raw === null) return undefined;
  const saved: unknown = JSON.parse(raw);
  if (typeof saved !== 'object' || saved === null) return undefined;
  const record = saved as Record<string, unknown>;
  return Object.fromEntries(MEMBER_IDS.map(id => [id, BOOK_IDS.includes(record[id] as BookId) ? record[id] : null])) as unknown as Books;
}

export function loadBooks(): Books {
  if (!session) {
    try { session = parse(localStorage.getItem(KEY)); } catch { /* Unavailable or malformed storage must not prevent play. */ }
    session ??= STARTING_BOOKS;
  }
  return session;
}

export function saveBooks(books: Books): boolean {
  session = books;
  try { localStorage.setItem(KEY, JSON.stringify(books)); return true; }
  catch { return false; }
}
