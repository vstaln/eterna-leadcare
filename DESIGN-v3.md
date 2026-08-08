# DESIGN-v3 — The Operations Ledger

v3 of Eterna LeadCare. A different visual world over the same pipeline, the same real data, and the same honesty promise.

## Why a second version

- v2 is the terminal: dark console, LEDs, scanlines — the honest report card.
- v3 is the ledger: a light, print identity. An ops command room that keeps its records on paper. Same five stages, same store, same captions.

## World

- **Paper** — base `#f2efe7`, surface `#faf8f2`, hairline borders `#d8d2c4`, ink text `#17150f`, muted ink `#5d5847`.
- **Ink stamps** — traffic-light semantics kept as rubber stamps, rotated `-2deg`: red `#b3261e` (fail/blocked), green `#15803d` (live/ok), amber `#b45309` (warn). Color is still information; the form factor just changed from LED to stamp.
- **Type** — same stack: Space Grotesk display, JetBrains Mono data. Ledger numbers are huge (`text-4xl md:text-5xl`, tabular).
- **Texture** — `ledger-lines` (32px hairline rules) instead of grid + scanlines.
- **Corners** — sharp, like v2. Corner `+` ticks on cards.
- **The one dark element** — the CAPTURE TERMINAL: the form card restores the dark console vars (`.capture-terminal` scope). Data enters the ledger through the one terminal left on the desk.

## Mechanics

- Theme is a **scoped CSS variable override**: `.v3 { --color-base: ... }` etc. in `app/globals.css`. Every component consumes `var(--color-*)`, so one wrapper restyles the whole page — no v3-specific component forks. `.v3 .capture-terminal { ... }` restores the dark vars for the form.
- Nav + footer detect the version via `usePathname()` and add the `v3` class to their own root; wordmark flips to `ET-48 // OPERATIONS LEDGER`.
- Version switcher (`v2` ⇄ `v3`) in nav and footer, `aria-current` on the active one. `/` redirects to `/v3`.
- All data is store-derived (same as v2): totals from the retained ring, shield counts from `data/shield.json`, stages from env + store.

## Motion

- Headline: SplitText words, 30ms stagger, 0.45s, `--ease-out`, distance 10px (emil discipline; reduced-motion → static h1).
- Numbers: `number-pop` staggered 40ms (existing token).
- Receipts strip: linear 45s marquee, pauses on hover, static under reduced-motion.
- Stamps: rotate `-2deg` at rest, straighten on hover (pointer:fine only); no `scale(0)` anywhere.

## Bans

- No new dependencies. No emojis. No images. No fake data — captions about the retained ring, N/R, DEGRADED, and CONFIGURED stay exactly as they are.
- v2 must not regress: it keeps every class and behavior; only the nav gained the switcher.
