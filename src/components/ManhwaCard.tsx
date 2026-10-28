import { useState } from 'react';
import { STATUS_LABEL } from '../lib/manhwa.ts';
import type { Manhwa } from '../types.ts';
import { Cover } from './Cover.tsx';

interface Props {
  manhwa: Manhwa;
  /** Position in the list, used to stagger the load-in animation */
  index: number;
  canEdit: boolean;
  onEdit: () => void;
  onAddChapter: () => void;
  onDelete: () => void;
}

const LONG_NOTES = 240;
const relative = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

function timeAgo(iso: string): string {
  const days = Math.round((Date.parse(iso) - Date.now()) / 86_400_000);
  if (days > -1) return 'today';
  if (days > -30) return relative.format(days, 'day');
  if (days > -365) return relative.format(Math.round(days / 30), 'month');
  return relative.format(Math.round(days / 365), 'year');
}

export function ManhwaCard({ manhwa: m, index, canEdit, onEdit, onAddChapter, onDelete }: Props) {
  const [expanded, setExpanded] = useState(false);
  const isLong = m.notes.length > LONG_NOTES;
  const unknownChapter = m.chaptersRead === null;
  const progress =
    m.totalChapters && m.chaptersRead !== null ? Math.min(100, (m.chaptersRead / m.totalChapters) * 100) : null;
  const atEnd = m.totalChapters !== null && m.chaptersRead !== null && m.chaptersRead >= m.totalChapters;

  return (
    <article className="entry" data-status={m.status} style={{ '--i': Math.min(index, 12) } as React.CSSProperties}>
      <div className="cover-frame">
        <Cover title={m.title} url={m.coverUrl} />
        {m.rating === null ? (
          <span className="stamp stamp-empty" title="Not rated">
            <span aria-hidden>?</span>
            <span className="sr-only">Not rated</span>
          </span>
        ) : (
          <span className="stamp" title={`Rated ${m.rating} out of 10`}>
            <span className="sr-only">Rated </span>
            {m.rating}
            <span className="stamp-scale">/10</span>
          </span>
        )}
      </div>

      <div className="entry-body">
        <h2 className="entry-title">{m.title}</h2>

        <p className="chapter">
          <span className="chapter-label">Ch.</span>
          {unknownChapter ? (
            <span className="chapter-number" title="Don't remember the chapter">
              <span aria-hidden>?</span>
              <span className="sr-only">unknown</span>
            </span>
          ) : (
            <span className="chapter-number">{m.chaptersRead}</span>
          )}
          {m.totalChapters !== null && <span className="chapter-total">/ {m.totalChapters}</span>}
        </p>
        {progress !== null && (
          <div
            className="progress"
            role="progressbar"
            aria-label="Chapters read"
            aria-valuemin={0}
            aria-valuemax={m.totalChapters!}
            aria-valuenow={m.chaptersRead!}
          >
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        )}

        {m.notes ? (
          <div className="notes">
            <p className={isLong && !expanded ? 'notes-text clamped' : 'notes-text'}>{m.notes}</p>
            {isLong && (
              <button type="button" className="link-button" onClick={() => setExpanded(!expanded)}>
                {expanded ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        ) : (
          <p className="notes-empty"></p>
        )}

        <footer className="entry-foot">
          <span className="meta">
            <span className="status-dot" />
            {STATUS_LABEL[m.status]}, updated {timeAgo(m.updatedAt)}
          </span>
          {canEdit && (
            <span className="actions">
              <button
                type="button"
                className="button button-small"
                onClick={onAddChapter}
                disabled={atEnd || unknownChapter}
                title={unknownChapter ? 'Set the chapter with Edit first' : undefined}
              >
                +1 chapter
              </button>
              <button type="button" className="button button-small button-ghost" onClick={onEdit}>
                Edit
              </button>
              <button type="button" className="button button-small button-ghost button-danger" onClick={onDelete}>
                Delete
              </button>
            </span>
          )}
        </footer>
      </div>
    </article>
  );
}
