# DESIGN — The Operations Ledger

The visual world of Eterna LeadCare: a light, print identity — an ops command
room that keeps its records on paper. One world over the same pipeline, the
same real data, and the same honesty promise.

## World

- **Paper** — base `#f2efe7`, surface `#faf8f2`, hairline borders `#d8d2c4`, ink text `#17150f`, muted ink `#5d5847`.
- **Ink stamps** — traffic-light semantics kept as rubber stamps, rotated `-2deg`: red `#b3261e` (fail/blocked), green `#15803d` (live/ok), amber `#b45309` (warn). Color is still information; the form factor is stamp, not LED.
- **Type** — same stack: Space Grotesk display, JetBrains Mono data. Ledger numbers are huge (`text-4xl md:text-5xl`, tabular).
- **Texture** — `ledger-lines` (32px hairline rules).
- **Corners** — sharp. Corner `+` ticks on cards.
- **The one dark element** — the CAPTURE TERMINAL: the form card restores the dark console vars (`.capture-terminal` scope). Data enters the ledger through the one terminal left on the desk.

## Mechanics

- Palette is theme-token driven in `app/globals.css`: `:root` holds the ledger tokens, `.capture-terminal` restores the dark vars locally for the form. Every component consumes `var(--color-*)`, so one token set styles the whole page — no per-version forks.
- Single page at `/`; nav and footer share the same vocabulary. No version switcher.
- All data is store-derived: totals from the retained ring, shield counts from `data/shield.json`, stages from env + store.

## Motion

- Headline: SplitText words, 30ms stagger, 0.45s, `--ease-out`, distance 10px (emil discipline; reduced-motion → static h1).
- Numbers: `number-pop` staggered 40ms (existing token).
- Receipts strip: linear 45s marquee, pauses on hover, static under reduced-motion.
- Stamps: rotate `-2deg` at rest, straighten on hover (pointer:fine only); no `scale(0)` anywhere.

## Bans

- No new dependencies. No emojis. No images. No fake data — captions about the retained ring, N/R, DEGRADED, and CONFIGURED stay exactly as they are.
