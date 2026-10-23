import { useEffect, useRef, useState } from 'react';
import { STATUSES, validate } from '../lib/manhwa.ts';
import type { Manhwa, Status } from '../types.ts';
import { RatingInput } from './RatingInput.tsx';

interface Props {
  initial: Manhwa;
  isNew: boolean;
  onSave: (m: Manhwa) => void;
  onClose: () => void;
}

/** Number inputs are kept as strings so the fields can be empty while typing. */
const toNumber = (s: string): number | null => (s.trim() === '' ? null : Number(s));

export function ManhwaForm({ initial, isNew, onSave, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [title, setTitle] = useState(initial.title);
  const [status, setStatus] = useState<Status>(initial.status);
  const [rating, setRating] = useState(initial.rating);
  const [chaptersRead, setChaptersRead] = useState(String(initial.chaptersRead));
  const [totalChapters, setTotalChapters] = useState(initial.totalChapters?.toString() ?? '');
  const [coverUrl, setCoverUrl] = useState(initial.coverUrl ?? '');
  const [notes, setNotes] = useState(initial.notes);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const entry: Manhwa = {
      ...initial,
      title: title.trim(),
      status,
      rating,
      chaptersRead: toNumber(chaptersRead) ?? 0,
      totalChapters: toNumber(totalChapters),
      coverUrl: coverUrl.trim() || null,
      notes: notes.trim(),
      updatedAt: new Date().toISOString(),
    };
    const problems = validate(entry);
    if (problems.length) return setErrors(problems);
    onSave(entry);
  }

  return (
    <dialog ref={dialogRef} className="dialog" onClose={onClose} aria-labelledby="form-title">
      <form className="form" onSubmit={handleSubmit} noValidate>
        <h2 id="form-title" className="form-title">{isNew ? 'Add a manhwa' : `Edit ${initial.title}`}</h2>

        <label className="field">
          <span>Title</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus />
        </label>

        <fieldset className="field">
          <legend>Status</legend>
          <div className="segmented">
            {STATUSES.map((s) => (
              <label key={s.value} data-status={s.value}>
                <input
                  type="radio"
                  name="status"
                  value={s.value}
                  checked={status === s.value}
                  onChange={() => setStatus(s.value)}
                />
                <span>{s.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="field-row">
          <label className="field">
            <span>Chapters read</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={chaptersRead}
              onChange={(e) => setChaptersRead(e.target.value)}
            />
          </label>
          <label className="field">
            <span>Total chapters</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="Ongoing"
              value={totalChapters}
              onChange={(e) => setTotalChapters(e.target.value)}
            />
          </label>
        </div>

        <fieldset className="field">
          <legend>Rating</legend>
          <RatingInput value={rating} onChange={setRating} />
        </fieldset>

        <label className="field">
          <span>Where I left off</span>
          <textarea
            rows={6}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What's happening in the story right now, who's who, what you were waiting for…"
          />
        </label>

        <label className="field">
          <span>Cover image URL</span>
          <input type="url" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} placeholder="https://…" />
        </label>

        {errors.length > 0 && (
          <ul className="form-errors" role="alert">
            {errors.map((err) => <li key={err}>{err}</li>)}
          </ul>
        )}

        <div className="form-actions">
          <button type="button" className="button button-ghost" onClick={() => dialogRef.current?.close()}>
            Cancel
          </button>
          <button type="submit" className="button">
            {isNew ? 'Add manhwa' : 'Save changes'}
          </button>
        </div>
      </form>
    </dialog>
  );
}
