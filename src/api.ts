import type { Manhwa } from './types.ts';

/** Persists the whole list to src/data/manhwa.json via the dev-only Vite endpoint. */
export async function saveAll(list: Manhwa[]): Promise<void> {
  const res = await fetch('/__manhwa', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(list),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.errors?.join('\n') ?? `Save failed (${res.status})`);
  }
}
