import type { Manhwa, SortKey, Status } from '../types.ts';

export const STATUSES: { value: Status; label: string }[] = [
  { value: 'reading', label: 'Reading' },
  { value: 'caught-up', label: 'Caught Up' },
  { value: 'completed', label: 'Completed' },
  { value: 'plan-to-read', label: 'Plan to Read' },
  { value: 'dropped', label: 'Dropped' },
];

export const STATUS_LABEL = Object.fromEntries(STATUSES.map((s) => [s.value, s.label])) as Record<Status, string>;

export function filterByStatus(list: Manhwa[], status: Status | 'all'): Manhwa[] {
  return status === 'all' ? list : list.filter((m) => m.status === status);
}

export function search(list: Manhwa[], query: string): Manhwa[] {
  const q = query.trim().toLowerCase();
  return q ? list.filter((m) => m.title.toLowerCase().includes(q)) : list;
}

export function sortList(list: Manhwa[], key: SortKey): Manhwa[] {
  const byTitle = (a: Manhwa, b: Manhwa) => a.title.localeCompare(b.title);
  const sorted = [...list];
  switch (key) {
    case 'title':
      return sorted.sort(byTitle);
    case 'rating':
      // Unrated entries go last
      return sorted.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1) || byTitle(a, b));
    case 'chapters':
      return sorted.sort((a, b) => b.chaptersRead - a.chaptersRead || byTitle(a, b));
    case 'updated':
      return sorted.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || byTitle(a, b));
  }
}

const isNonNegInt = (n: unknown): n is number => typeof n === 'number' && Number.isInteger(n) && n >= 0;

/** Returns a list of problems with the entry; empty means valid. */
export function validate(m: Partial<Manhwa>): string[] {
  const errors: string[] = [];
  if (typeof m.id !== 'string' || !m.id) errors.push('ID is missing.');
  if (typeof m.title !== 'string' || !m.title.trim()) errors.push('Title is required.');
  if (!STATUSES.some((s) => s.value === m.status)) errors.push('Status is invalid.');
  if (m.rating !== null && !(typeof m.rating === 'number' && m.rating >= 0 && m.rating <= 10))
    errors.push('Rating must be between 0 and 10.');
  if (!isNonNegInt(m.chaptersRead)) errors.push('Chapters read must be a whole number ≥ 0.');
  if (m.totalChapters !== null && !isNonNegInt(m.totalChapters))
    errors.push('Total chapters must be a whole number ≥ 0.');
  if (isNonNegInt(m.chaptersRead) && isNonNegInt(m.totalChapters) && m.chaptersRead > m.totalChapters)
    errors.push('Chapters read cannot exceed total chapters.');
  if (m.coverUrl !== null && typeof m.coverUrl !== 'string') errors.push('Cover URL is invalid.');
  if (typeof m.notes !== 'string') errors.push('Notes are invalid.');
  if (typeof m.updatedAt !== 'string' || Number.isNaN(Date.parse(m.updatedAt)))
    errors.push('Updated date is invalid.');
  return errors;
}

/** Validates a whole data file; empty means valid. */
export function validateList(data: unknown): string[] {
  if (!Array.isArray(data)) return ['Data must be an array.'];
  const errors = data.flatMap((m, i) =>
    validate(m ?? {}).map((e) => `#${i} (${m?.title || 'untitled'}): ${e}`),
  );
  const ids = new Set(data.map((m) => m?.id));
  if (ids.size !== data.length) errors.push('Duplicate IDs found.');
  return errors;
}

export function newEntry(): Manhwa {
  return {
    id: crypto.randomUUID(),
    title: '',
    status: 'reading',
    rating: null,
    chaptersRead: 0,
    totalChapters: null,
    coverUrl: null,
    notes: '',
    updatedAt: new Date().toISOString(),
  };
}
