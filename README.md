# ManwhaSite

A personal tracker for manhwa, sorted into Reading, Caught Up, Completed, Plan to Read and Dropped. Each entry has:

- a rating out of 10
- chapters read, and the total if known
- a cover image
- a "where I left off" note

It is a static React site with no backend. The data lives in [`src/data/manhwa.json`](src/data/manhwa.json) and is baked into the build.

Live site is currently hosted on Cloudflare here ```https://manwhasite.askoularsen.workers.dev/```


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

### Quick add from PowerShell

[`scripts/add-manhwa.ps1`](scripts/add-manhwa.ps1) adds a manhwa without starting the dev server. It does four things:

1. Pulls the latest `main`.
2. Adds the entry to `manhwa.json`.
3. Commits that file.
4. Pushes, so Cloudflare deploys the change.

Ask for each field:

```powershell
.\scripts\add-manhwa.ps1
```

Or pass the fields directly:

```powershell
.\scripts\add-manhwa.ps1 -Title "Solo Leveling" -Status completed -Chapters 179 -Total 179 -Rating 9 -Notes "Finished!"
```

- `-Status` is one of `reading`, `caught-up`, `completed`, `plan-to-read` or `dropped`. It defaults to `reading`.
- Use `-Chapters ?` if you don't remember the chapter. This also works in the site's edit form.
- Leave out `-Total` for ongoing series, and `-Rating` for unrated ones.
- Add `-NoPush` to only update the file.

The script must be run from `main`. It refuses titles that are already on the shelf. See `Get-Help .\scripts\add-manhwa.ps1 -Examples` for more.


