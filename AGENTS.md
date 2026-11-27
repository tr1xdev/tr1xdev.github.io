# AGENTS.md

Notes for coding agents and people working on this repository.

## Project

Personal portfolio of tr1xdev, built with React 19, TypeScript and Vite. No UI framework and no
animation library. Every push to `main` is deployed to GitHub Pages.

- Content: `src/data/profile.ts`. The page text and the metadata in `index.html` come from it.
- Dither: `src/dither`. The WebGL background is `shader.ts` and `field.ts`; the canvas artwork is
  `DitherCanvas.tsx` and `patterns.ts`.
- Styles: `src/styles`, one file per section, design tokens in `tokens.css`.

## Commands

```bash
npm ci
npm run dev       # http://localhost:5173
npm run build     # tsc --noEmit, then vite build; must pass before every commit
npm run preview   # serve dist/
```

## Workflow

- Work on a branch, never directly on `main`.
- Use Conventional Commits (`feat:`, `fix:`, `refactor:`, `style:`, `perf:`, `docs:`, `ci:`): one
  change per commit, imperative mood, lower case after the colon.
- Open a pull request and wait for CI (`.github/workflows/ci.yml`) to pass. Then fast-forward `main`
  to the branch. No merge commits.
- For visual changes, check 1440 px and 390 px widths, 125 % display scaling and
  `prefers-reduced-motion` before merging.

## Design rules

The site must not look generated. Do not add any of the following, not even as a small touch:

- Status pills or badges with a pulsing or blinking dot ("Available for work", "Open to ...").
  Availability is a plain sentence.
- Fake terminals or code windows with red, yellow and green dots, typing effects, blinking carets.
- Text scramble, decode or typewriter effects. Marquee or ticker strips.
- Fade-up or slide-in on scroll. Motion lives in the dither only and stops under
  `prefers-reduced-motion`.
- Glow, neon shadows, gradient text, frosted glass, backdrop blur.
- Bento grids, stat tiles, key/value strips under the hero, three feature cards in a row.
- Uppercase eyebrow labels above headings, `01 / 02 / 03` section or step numbers, "fig. 01"
  badges, fake part numbers outside the Stack chip.
- Corners rounder than `--radius` (2 px). Coloured left stripes on cards.
- Hover effects that move things (lift, slide, scale). A colour or border change is enough.
- Emoji or sparkle icons in the interface.
- Inter, Geist or Space Grotesk. The type is IBM Plex Sans and IBM Plex Mono.
- Slogans, taglines, three-part lists for rhythm, em dashes, invented metrics or testimonials.
  Say what was built and with what, in plain sentences.

Instead: one accent colour (`--accent`) used sparingly, thin rules and white space between
blocks, real data from the GitHub API rather than decoration, and the dither as the only
expressive element.

## Dither

- Keep cells pixel-exact: one cell is `round(cell * devicePixelRatio)` device pixels and every
  canvas is sized to whole cells. Never scale a canvas by a fractional factor.
- The background is capped at 30 fps, pauses in hidden tabs and backs off on slow GPUs
  (`field.ts`). Canvas artwork animates only while hovered or on screen.
- Colours are in `src/dither/palette.ts`. The accent appears only at the brightest level.
