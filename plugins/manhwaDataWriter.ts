import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';
import { validateList } from '../src/lib/manhwa.ts';

export const SAVE_ENDPOINT = '/__manhwa';
const DATA_FILE = fileURLToPath(new URL('../src/data/manhwa.json', import.meta.url));

/**
 * Dev-server-only endpoint that writes the edited list back to src/data/manhwa.json.
 * `apply: 'serve'` keeps it out of production builds, so the deployed site stays fully static.
 */
export function manhwaDataWriter(): Plugin {
  return {
    name: 'manhwa-data-writer',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(SAVE_ENDPOINT, async (req, res) => {
        const reply = (status: number, body: object) => {
          res.statusCode = status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(body));
        };

        if (req.method !== 'POST') return reply(405, { errors: ['Method not allowed.'] });

        try {
          let raw = '';
          for await (const chunk of req) raw += chunk;
          const data: unknown = JSON.parse(raw);

          const errors = validateList(data);
          if (errors.length) return reply(400, { errors });

          await writeFile(DATA_FILE, JSON.stringify(data, null, 2) + '\n', 'utf8');
          reply(200, { ok: true });
        } catch (err) {
          reply(500, { errors: [String(err)] });
        }
      });
    },
  };
}
