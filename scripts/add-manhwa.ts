/**
 * Adds one manhwa to src/data/manhwa.json. Called by add-manhwa.ps1, which passes the
 * entry as JSON in the MANHWA_ENTRY environment variable (avoids PowerShell's argument
 * quoting and encoding quirks). Runs directly with Node's built-in TypeScript support.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { newEntry, serialize, STATUS_LABEL, validate, validateList } from '../src/lib/manhwa.ts';
import type { Manhwa } from '../src/types.ts';

const DATA_FILE = fileURLToPath(new URL('../src/data/manhwa.json', import.meta.url));

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

const raw = process.env.MANHWA_ENTRY;
if (!raw) fail('MANHWA_ENTRY is not set. Run scripts/add-manhwa.ps1 instead of this file.');

let input: Partial<Manhwa>;
try {
  input = JSON.parse(raw);
} catch {
  fail('MANHWA_ENTRY is not valid JSON.');
}

const entry: Manhwa = { ...newEntry(), ...input, title: input.title?.trim() ?? '' };
const errors = validate(entry);
if (errors.length) fail(`Can't add this manhwa:\n- ${errors.join('\n- ')}`);

const list: unknown = JSON.parse(await readFile(DATA_FILE, 'utf8'));
const fileErrors = validateList(list);
if (fileErrors.length) fail(`manhwa.json is invalid, so nothing was changed:\n- ${fileErrors.join('\n- ')}`);

const existing = (list as Manhwa[]).find((m) => m.title.trim().toLowerCase() === entry.title.toLowerCase());
if (existing) fail(`"${existing.title}" is already on the shelf (${STATUS_LABEL[existing.status]}).`);

await writeFile(DATA_FILE, serialize([...(list as Manhwa[]), entry]), 'utf8');

const chapters = entry.totalChapters === null ? `ch. ${entry.chaptersRead}` : `ch. ${entry.chaptersRead}/${entry.totalChapters}`;
const rating = entry.rating === null ? 'unrated' : `${entry.rating}/10`;
console.log(`Added "${entry.title}" to ${STATUS_LABEL[entry.status]} (${chapters}, ${rating}).`);
