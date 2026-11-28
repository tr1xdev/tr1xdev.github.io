# tr1xdev.github.io

Personal portfolio of **tr1xdev**, backend & systems developer.
Live at **https://tr1xdev.github.io**.

![Desktop preview: dithered hero with the tr1xdev wordmark](docs/preview-desktop.png)

A dark, dithered site built with React 19, TypeScript, Vite and Tailwind CSS v4. The background uses
one small WebGL shader and the project covers are drawn on tiny canvases.

## What's inside

- **Dithered WebGL background.** Domain-warped noise quantised to four colours with an 8×8 Bayer matrix.
  It follows the mouse, shifts with scroll, runs at 30 fps, pauses in hidden tabs, and backs off on
  machines without a GPU (bigger cells first, then a still frame).
- **Generative project covers.** A lit orb, contour dunes, interfering ripples and a horizon grid,
  each a pure function of position and time, dithered on a 4×4 Bayer matrix. They animate on hover.
- **Live GitHub data.** Stars, last push and the real language mix (bytes of code per repository)
  come from the public GitHub API, cached per session, with graceful fallbacks when rate-limited.
- **Interactive stack.** Skills drawn as a 22-pin chip; hover a pin or filter by group.
- **Command palette.** `⌘K` / `Ctrl K` or `/`.
- **Accessible by default.** Keyboard navigation, skip link, visible focus, screen-reader text for every
  animated heading, and `prefers-reduced-motion` turns every animation into a still frame.
- **Shareable.** Open Graph card, `summary_large_image` Twitter card and schema.org `Person` data.

<img src="docs/preview-mobile.png" alt="Mobile preview" width="300" />

## Run it

Needs Node 20.19+ (22 recommended, see [`.nvmrc`](.nvmrc)).

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build into dist/
npm run preview    # serve dist/
```

## Make it yours

All content lives in [`src/data/profile.ts`](src/data/profile.ts):

| Field | What it does |
| --- | --- |
| `profile` | Handle, role, one-line pitch, availability line, time zone, links. `email` and `telegram` stay hidden while empty. |
| `profile.portrait` | Optional path to a photo in `public/`. It is dithered in the browser to match the site. |
| `specs`, `about` | Quick facts under the hero and the About section. |
| `featured` | Hand-picked repositories for "Selected work"; `cover` picks the dither artwork. |
| `pins`, `groups` | The skills chip. |

### Time zone and location

`profile.timezone` takes any IANA zone name such as `Asia/Tokyo`, and the browser works out the clock
from it, so daylight saving time stays right without any work. `profile.location` and
`profile.tzLabel` are plain text. Each of the three can be left as `''`, which hides the clock, the
hero line, the About rows and the status bar item that would have shown it.

This site shows Moscow because that is where its author lives, not because the layout needs a city.
If you fork it, set your own zone and city, or clear them.

Colours live in [`src/styles/theme.css`](src/styles/theme.css) and, for the dither, in
[`src/dither/palette.ts`](src/dither/palette.ts).

## Reusing the dither

The dither code in [`src/dither`](src/dither) has no dependencies besides React for the two components.

```ts
import { createDitherField } from './dither/field'

const field = createDitherField(canvas, {
  palette: ['#0a0a0b', '#19191d', '#34343b', '#ff5a1f'], // darkest → brightest
  cellSize: 3,                                            // CSS px per dither cell
})
field?.resize()
field?.start()
```

```tsx
import { DitherCanvas } from './dither/DitherCanvas'
import { orb } from './dither/patterns'

<DitherCanvas field={orb} width={160} height={90} play />
```

A `Field` is just `(u, v, t, aspect) => brightness`, so new patterns are a few lines each.
`imageField()` turns any loaded image into a field.

How it works, briefly: each pixel's brightness is compared against a threshold taken from a Bayer
matrix at that pixel's position. Because neighbouring thresholds are spread as far apart as possible,
smooth gradients turn into the regular cross-hatched dot patterns of ordered dithering. The canvas is
rendered at a fraction of its CSS size and scaled up with `image-rendering: pixelated`, which keeps
every cell a crisp square and makes the effect cheap.

## Project layout

```
src/
  App.tsx            page composition, keyboard shortcuts, command list
  components/        one file per section + Nav, StatusBar, CommandPalette, Scramble
  dither/            WebGL background, canvas renderer, patterns, Bayer matrices
  data/profile.ts    all content
  github.ts          GitHub API hooks with session cache
  hooks.ts           reduced motion, in-view, reveal, scramble, clock
  ui.ts              shared Tailwind utility strings
  styles/            theme, base, keyframes and print styles
```

## Deploy

Every push to `main` builds the site and publishes it to GitHub Pages via
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).
One-time setup: **Settings → Pages → Source: GitHub Actions**.
Pull requests and feature branches are typechecked and built by
[`.github/workflows/ci.yml`](.github/workflows/ci.yml).

## Credits

Typefaces: [Geist and Geist Mono](https://vercel.com/font) by Vercel, SIL Open Font License, self-hosted via Fontsource.
