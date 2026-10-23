# ManwhaSite

A personal tracker for manhwa, sorted into Reading, Caught Up, Completed, Plan to Read and Dropped. Each entry has:

- a rating out of 10
- chapters read, and the total if known
- a cover image
- a "where I left off" note

It is a static React site with no backend. The data lives in [`src/data/manhwa.json`](src/data/manhwa.json) and is baked into the build.

## Editing the list

```sh
npm install
npm run dev
```

On the local dev server the site shows **Add manhwa**, **Edit**, **+1 chapter** and **Delete** controls. Every change is written straight to `src/data/manhwa.json` by a small dev-only Vite plugin ([`plugins/manhwaDataWriter.ts`](plugins/manhwaDataWriter.ts)). To publish:

```sh
git commit -am "Update reading list"
git push
```

The deployed site is read-only and shows no edit controls. You can also edit `manhwa.json` by hand.

## Deploying to Cloudflare Pages

1. In the Cloudflare dashboard, go to **Workers & Pages → Create → Pages → Connect to Git** and pick this repo.
2. Set the framework preset to **None** (or Vite).
3. Set the build command to `npm run build`.
4. Set the build output directory to `dist`.
5. The Node version comes from `.nvmrc`.

Every push to `main` triggers a new deploy. The site is public to anyone with the URL, notes included.

## Scripts

| Command           | What it does                                      |
| ----------------- | ------------------------------------------------- |
| `npm run dev`     | Local dev server with editing                     |
| `npm run build`   | Type-check and build to `dist/`                   |
| `npm run preview` | Serve the production build (read-only)            |
| `npm test`        | Unit tests for filtering, sorting and validation  |
