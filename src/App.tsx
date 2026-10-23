import { useMemo, useState } from 'react';
import { saveAll } from './api.ts';
import { ManhwaCard } from './components/ManhwaCard.tsx';
import { ManhwaForm } from './components/ManhwaForm.tsx';
import { StatusTabs } from './components/StatusTabs.tsx';
import data from './data/manhwa.json';
import { filterByStatus, newEntry, search, sortList, STATUS_LABEL } from './lib/manhwa.ts';
import type { Manhwa, SortKey, Status } from './types.ts';

/** Editing is only possible on the local dev server, which can write the data file. */
const canEdit = import.meta.env.DEV;

const SORTS: { value: SortKey; label: string }[] = [
  { value: 'updated', label: 'Recently updated' },
  { value: 'title', label: 'Title' },
  { value: 'rating', label: 'Rating' },
  { value: 'chapters', label: 'Chapters read' },
];

export default function App() {
  const [list, setList] = useState<Manhwa[]>(data as Manhwa[]);
  const [tab, setTab] = useState<Status | 'all'>('reading');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('updated');
  const [editing, setEditing] = useState<{ entry: Manhwa; isNew: boolean } | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const visible = useMemo(() => sortList(search(filterByStatus(list, tab), query), sort), [list, tab, query, sort]);

  function commit(next: Manhwa[]) {
    const previous = list;
    setList(next);
    setSaveError(null);
    saveAll(next).catch((err: Error) => {
      setList(previous);
      setSaveError(`Couldn't save to manhwa.json, so the change was undone. ${err.message}`);
    });
  }

  function upsert(entry: Manhwa) {
    const exists = list.some((m) => m.id === entry.id);
    commit(exists ? list.map((m) => (m.id === entry.id ? entry : m)) : [...list, entry]);
    setEditing(null);
  }

  function addChapter(entry: Manhwa) {
    upsert({ ...entry, chaptersRead: entry.chaptersRead + 1, updatedAt: new Date().toISOString() });
  }

  function remove(entry: Manhwa) {
    if (confirm(`Delete "${entry.title}"? This removes it from manhwa.json.`)) {
      commit(list.filter((m) => m.id !== entry.id));
    }
  }

  return (
    <div className="page">
      <header className="masthead">
        <h1 className="brand">
          <span className="brand-hangul" aria-hidden>만화책장</span>
          Manhwa shelf
        </h1>
        <div className="toolbar">
          <input
            type="search"
            className="search"
            placeholder="Search titles"
            aria-label="Search titles"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select className="sort" aria-label="Sort by" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          {canEdit && (
            <button type="button" className="button" onClick={() => setEditing({ entry: newEntry(), isNew: true })}>
              Add manhwa
            </button>
          )}
        </div>
      </header>

      <StatusTabs list={list} active={tab} onChange={setTab} />

      {saveError && (
        <p className="banner" role="alert">
          {saveError}
        </p>
      )}

      {visible.length > 0 ? (
        <main className="entries">
          {visible.map((m, i) => (
            <ManhwaCard
              key={m.id}
              manhwa={m}
              index={i}
              canEdit={canEdit}
              onEdit={() => setEditing({ entry: m, isNew: false })}
              onAddChapter={() => addChapter(m)}
              onDelete={() => remove(m)}
            />
          ))}
        </main>
      ) : (
        <main className="empty">
          <p>
            {query
              ? `No titles match "${query}".`
              : tab === 'all'
                ? 'Your shelf is empty.'
                : `Nothing in ${STATUS_LABEL[tab]} yet.`}
          </p>
          {canEdit && !query && (
            <button type="button" className="button" onClick={() => setEditing({ entry: newEntry(), isNew: true })}>
              Add manhwa
            </button>
          )}
        </main>
      )}

      {canEdit && (
        <footer className="dev-note">
          Editing locally. Changes are saved to <code>src/data/manhwa.json</code>. Commit and push to publish them.
        </footer>
      )}

      {editing && (
        <ManhwaForm
          key={editing.entry.id}
          initial={editing.entry}
          isNew={editing.isNew}
          onSave={upsert}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
