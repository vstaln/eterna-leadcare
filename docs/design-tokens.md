# Design tokens — Eterna Ops Command Center

Source of truth for the design DNA (plan Global Constraints §3). Tokens are defined in `app/globals.css` under the Tailwind v4 `@theme` block and are available as utilities (`bg-base`, `text-muted`, `border-border`, `font-mono`, ...). Utility CSS classes `.bg-grid`, `.scanlines`, `.led-*` are also defined there.

## Colors

| Token | Value | Usage |
| --- | --- | --- |
| `base` | `#09090b` | Page background |
| `surface` | `#18181b` | Cards, panels, nav |
| `border` | `#27272a` | Hairlines, dividers, node outlines |
| `text` | `#f4f4f5` | Primary text |
| `muted` | `#c6c6cc` | Secondary/labels/eyebrows (WCAG AA 4.5:1 on `base` and `surface`) |
| `ok` | `#4ade80` | Positive/primary-action semantic |
| `warn` | `#fbbf24` | Warning semantic |
| `err` | `#f87171` | Error/failure semantic |
| `live` | `#34d399` | Live/streaming state |

## Fonts

Both families are loaded at build time via `next/font/google` (self-hosted woff2, no external `<link>`) in `app/layout.tsx` and exposed on `<body>` as CSS variables.

| Token | Value | Usage |
| --- | --- | --- |
| `sans` | `--font-sans` = Space Grotesk (400/500/600/700), next/font metric-compatible fallback | Display, headings, body |
| `mono` | `--font-mono` = JetBrains Mono (400/500/600/700), next/font metric-compatible fallback | Data, labels, eyebrows, status lines, code |

## Type scale

| Role | Spec |
| --- | --- |
| Display | `clamp(2.5rem, 6vw, 4.5rem)` (ops: `clamp(2.25rem, 5vw, 3.75rem)`), sans weight 600, letter-spacing `-0.05em` (tracking-tighter) |
| h2 / section | `1.5rem`, sans weight 600 |
| Body | `1rem` (16px floor), sans weight 400, line-height 1.625 (relaxed), prose measure 45-75ch via the `measure` utility (`max-width: 65ch`) |
| Data / labels | `0.875rem` and below, mono; uppercase labels `0.625-0.75rem` + `tracking-widest`; numeric surfaces use `tabular-nums` (hero data panel, ops dashboard) |

## Spacing & layout

- 4px grid; section vertical padding `4rem`; max content width `72rem`, centered.
- Hero: top padding `pt-20` / `sm:pt-24` (96px cap), bottom `pb-16`; clears the 64px fixed nav.
- Shape system: interactive controls are sharp (radius 0), data-viz nodes are 8px (`rx=8`), status LEDs are full-round. Documented rule, applied everywhere.

## Motion

- Micro `150ms ease-out`; standard `300ms`.
- Status LEDs pulse `2s` (CSS keyframes `led-pulse`); disabled under `prefers-reduced-motion: reduce`.

## Utility classes

| Class | Effect |
| --- | --- |
| `.bg-grid` | 1px grid lines every 32px, `rgba(255,255,255,0.04)` |
| `.scanlines` | Repeating 1px lines at `rgba(255,255,255,0.03)` |
| `.led-ok` / `.led-warn` / `.led-err` / `.led-live` | 12px status dot, token color, glow `0 0 8px` @ 25%; live pulses |

## Art direction

The hero hierarchy is a single read: a mono status line (machine voice: `ETERNA LEADCARE // BUILD PHASE 1`), then a large display headline naming the system, then one short body paragraph, then one primary action, with a real-data terminal panel (last 5 executions from `lib/store.ts`) as the hero visual. Nothing competes with that line; everything below it is structured, labelled data. The palette is zinc neutrals plus traffic-light semantics — the interface speaks the language of an operations console, where color is information (ok/warn/err/live), not decoration; that is also why there is no purple and no gradients: this is not a marketing gradient page, it is a control room. The two-face system is deliberate: Space Grotesk carries display/headings/body, JetBrains Mono gives data and status lines their instrument-panel identity, both self-hosted at build time via `next/font/google` — no external font requests, no invisible-text window (`display: swap`), and on Android the mono stack now resolves to real JetBrains Mono instead of a generic monospace fallback.
