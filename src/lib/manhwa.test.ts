import { describe, expect, it } from 'vitest';
import type { Manhwa } from '../types.ts';
import { filterByStatus, newEntry, search, sortList, validate, validateList } from './manhwa.ts';

const make = (over: Partial<Manhwa>): Manhwa => ({ ...newEntry(), title: 'X', ...over });

const a = make({ title: 'Solo Leveling', status: 'completed', rating: 9, chaptersRead: 200, updatedAt: '2026-01-01T00:00:00Z' });
const b = make({ title: 'Omniscient Reader', status: 'reading', rating: null, chaptersRead: 150, updatedAt: '2026-03-01T00:00:00Z' });
const c = make({ title: 'Tower of God', status: 'dropped', rating: 7, chaptersRead: 300, updatedAt: '2026-02-01T00:00:00Z' });
const list = [a, b, c];
const titles = (l: Manhwa[]) => l.map((m) => m.title);

describe('filterByStatus', () => {
  it('returns everything for "all"', () => expect(filterByStatus(list, 'all')).toEqual(list));
  it('filters by status', () => expect(filterByStatus(list, 'reading')).toEqual([b]));
});

describe('search', () => {
  it('matches case-insensitively on title', () => expect(search(list, '  tower ')).toEqual([c]));
  it('returns everything for an empty query', () => expect(search(list, '')).toEqual(list));
});

describe('sortList', () => {
  it('sorts by most recently updated', () =>
    expect(titles(sortList(list, 'updated'))).toEqual(['Omniscient Reader', 'Tower of God', 'Solo Leveling']));
  it('sorts by title', () =>
    expect(titles(sortList(list, 'title'))).toEqual(['Omniscient Reader', 'Solo Leveling', 'Tower of God']));
  it('sorts by rating with unrated last', () =>
    expect(titles(sortList(list, 'rating'))).toEqual(['Solo Leveling', 'Tower of God', 'Omniscient Reader']));
  it('sorts by chapters read', () =>
    expect(titles(sortList(list, 'chapters'))).toEqual(['Tower of God', 'Solo Leveling', 'Omniscient Reader']));
  it('does not mutate the input', () => {
    const copy = [...list];
    sortList(list, 'title');
    expect(list).toEqual(copy);
  });
});

describe('validate', () => {
  it('accepts a valid entry', () => expect(validate(a)).toEqual([]));
  it('requires a title', () => expect(validate({ ...a, title: '  ' })).toContain('Title is required.'));
  it('rejects ratings outside 0–10', () => {
    expect(validate({ ...a, rating: 11 })).toHaveLength(1);
    expect(validate({ ...a, rating: -1 })).toHaveLength(1);
  });
  it('rejects negative or fractional chapters', () => {
    expect(validate({ ...a, chaptersRead: -1 })).toHaveLength(1);
    expect(validate({ ...a, chaptersRead: 1.5 })).toHaveLength(1);
  });
  it('rejects chaptersRead > totalChapters', () =>
    expect(validate({ ...a, chaptersRead: 10, totalChapters: 5 })).toContain(
      'Chapters read cannot exceed total chapters.',
    ));
  it('accepts every status', () => {
    for (const status of ['reading', 'caught-up', 'completed', 'plan-to-read', 'dropped'] as const) {
      expect(validate({ ...a, status })).toEqual([]);
    }
  });
  it('rejects an unknown status', () =>
    expect(validate({ ...a, status: 'paused' as never })).toContain('Status is invalid.'));
});

describe('validateList', () => {
  it('accepts a valid list', () => expect(validateList(list)).toEqual([]));
  it('rejects non-arrays', () => expect(validateList({})).toEqual(['Data must be an array.']));
  it('rejects duplicate ids', () => expect(validateList([a, a])).toContain('Duplicate IDs found.'));
});
