# Design tokens — Eterna Ops Command Center

Source of truth for the design DNA (plan Global Constraints §3). Tokens are defined in `app/globals.css` under the Tailwind v4 `@theme` block and are available as utilities (`bg-base`, `text-muted`, `border-border`, `font-mono`, ...). Utility CSS classes `.bg-grid`, `.scanlines`, `.led-*` are also defined there.

## Colors

| Token | Value | Usage |
| --- | --- | --- |
| `base` | `#09090b` | Page background |
| `surface` | `#18181b` | Cards, panels, nav |
| `border` | `#27272a` | Hairlines, dividers, node outlines |
| `text` | `#f4f4f5` | Primary text |
| `muted` | `#a1a1aa` | Secondary/labels/eyebrows |
| `ok` | `#4ade80` | Positive/primary-action semantic |
| `warn` | `#fbbf24` | Warning semantic |
| `err` | `#f87171` | Error/failure semantic |
| `live` | `#34d399` | Live/streaming state |

## Fonts

| Token | Value | Usage |
| --- | --- | --- |
| `sans` | `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` | Body, headings |
| `mono` | `ui-monospace, "SF Mono", "Cascadia Code", "JetBrains Mono", Menlo, monospace` | Data, labels, status lines, code |

## Type scale

| Role | Spec |
| --- | --- |
| Display | `clamp(2.5rem, 6vw, 4.5rem)`, weight 700, letter-spacing `-0.03em` |
| h2 / section | `1.5rem`, weight 600 |
| Body | `1rem`, line-height 1.6 |
| Data / labels | `0.875rem`, mono |

## Spacing & layout

- 4px grid; section vertical padding `4rem`; max content width `72rem`, centered.

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

The hero hierarchy is a single read: a mono status line (machine voice: `ET-48 // BUILD PHASE 1`), then a large display headline naming the system, then one short body paragraph, then one primary action. Nothing competes with that line; everything below it is structured, labelled data. The palette is zinc neutrals plus traffic-light semantics — the interface speaks the language of an operations console, where color is information (ok/warn/err/live), not decoration; that is also why there is no purple and no gradients: this is not a marketing gradient page, it is a control room. The system font stack is deliberate too — no Inter, no custom webfont: it keeps the page fast and honest on any device, and the monospace stack gives data and status lines their instrument-panel identity against the sans body.
