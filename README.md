# tr1xdev — TRX-01 datasheet

Personal portfolio styled as an engineering IC datasheet. React 19 + TypeScript + Vite.

Live: **https://tr1xdev.github.io**

## Run

```bash
npm install
npm run dev
```

## Deploy

Every push to `main` builds the site and publishes it to GitHub Pages via `.github/workflows/deploy.yml`.
One-time setup: **Settings → Pages → Source: GitHub Actions**.

## Edit

All content lives in `src/data/profile.ts`:

- `profile` — handle, role, links (email / telegram stay hidden while empty)
- `featured` — hand-picked projects for §02 (stars, last push and language mix are loaded live)
- `pins` — skills shown in §03
- `sections` — navigation

§02 and §05 read the public GitHub API (cached per session). The language mix is measured in bytes of code
across public, non-fork repositories, this site excluded. If the API is rate-limited, both sections degrade gracefully.

## Keys

- `⌘K` / `Ctrl K` or `/` — command palette
- `Esc` — close palette / menu
