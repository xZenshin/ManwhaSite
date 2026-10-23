/** 'caught-up' = read everything released so far, waiting for new chapters. */
export type Status = 'reading' | 'caught-up' | 'completed' | 'plan-to-read' | 'dropped';

export interface Manhwa {
  id: string;
  title: string;
  status: Status;
  /** 0–10, null = unrated */
  rating: number | null;
  chaptersRead: number;
  /** null = ongoing / unknown */
  totalChapters: number | null;
  coverUrl: string | null;
  /** Recap of the current situation, to make it easy to pick up again. */
  notes: string;
  /** ISO timestamp of the last change */
  updatedAt: string;
}

export type SortKey = 'updated' | 'title' | 'rating' | 'chapters';
