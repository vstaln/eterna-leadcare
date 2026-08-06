# Webflow migration — template one-pager + plan

## Locked decision

Webflow = **a template one-pager + this migration plan**. There is **no Webflow iframe on the Next.js site** — the two artifacts stay separate (decision logged in `ARCHITECTURE.md`).

## Why (honest)

Eterna is a Webflow-first studio: the JD's stack is Webflow / N8N / Google Apps Script. The Next.js app in this repo proves engineering depth — hand-coded API, execution store, ops dashboard, built phone-only at $0. The one-pager proves the other leg: Webflow literacy on the exact tool the employer asks for. Each artifact proves one thing; an iframe would blur both (a framed page proves neither authorship nor no-code skill).

## What is done vs user-gated

**Done from the phone (this repo):** the copy outline below (with drafts), the section plan, the asset list, and this migration checklist. Everything a builder session needs is written down here.

**User-gated (browser task — documented, not done):** the Webflow build itself. Webflow's designer is a browser/account product; a headless phone cannot run it. This doc is the handoff for that session.

## Template one-pager outline

One page, five sections, ~400 words total. The one-pager mirrors the Next.js home page so both artifacts tell the same story.

### 1. Hero

- Eyebrow (optional, mono type): `vstal@eterna:~/front-door`
- Headline: "ET-48 OPS — automation command center"
- One line: "Visitor lead form → HMAC-verified webhook → N8N → RDAP → Apps Script → live report card."
- Status strip: a small line using the same vocabulary as `/ops` — CONFIGURED / PENDING / N/R — driven by the same facts as the live page. No fake liveness, no "live" claims the report card cannot back.

### 2. What it is

One paragraph: a 48-hour, phone-built, $0/month demo of the EMPWR-pattern webhook integrations Eterna ships for US clients. Real execution store, nothing simulated; every row on the ops dashboard is a real dispatch.

### 3. Pipeline

The five stages as a horizontal step row (Form → API → N8N → Apps Script → Report Card), matching the site's numbered diagram and the `/ops` legend. One line per stage, honestly labeled: PENDING for user-gated items, P5 for deferred phases, N/R where no runtime readout exists.

### 4. Proof

- Link: live report card — `eterna.vstal.in/ops`
- Link: GitHub repo + `AI_LOG.md` (the per-session evidence log)
- One screenshot placeholder (of `/ops`, taken from a real browser during the build session)

### 5. Contact / CTA

Plain CTA: "Submit a demo lead" pointing at the Next.js site's intake, plus a mailto. No forms built in Webflow for this page — the intake endpoint lives in the Next.js app, and the one-pager should not pretend otherwise.

## Copy direction and brand fit

**Copy direction:** short, factual, engineering-credible — "signal, not lights". No marketing puff ("revolutionary", "seamless"), no invented numbers. Every claim must be true of the shipped build; reuse the exact labels from `/ops` so the one-pager cannot overstate. Honesty is the brand here, on both artifacts.

**Brand fit:** Eterna Indonesia BPO — clean layout, one accent color, mono type for data lines and stage labels. Dark terminal-chrome crossover is optional: it matches the Next.js site, but if the one-pager goes light, keeping the mono data lines is enough to read as one family. Steal the tokens from `docs/design-tokens.md` (colors, mono font, spacing) rather than inventing new ones.

**Asset list (export before building):** hero headline + eyebrow, the five stage labels (verbatim from the pipeline diagram), the status vocabulary (CONFIGURED / PENDING / N/R / P5), one `/ops` screenshot, the two links above. No images are needed beyond the screenshot.

## Migration plan (step by step)

1. **Export copy and assets from the Next.js site** — pull the copy drafts above, the five stage labels, the status vocabulary, and the color/font tokens from `docs/design-tokens.md`. Copy the stage names verbatim so both artifacts name the stages identically.
2. **Rebuild sections in Webflow** — create one blank page; build Section > Container > Div per the outline above. Use classes (`.eyebrow`, `.stage`, `.status`) so the style guide stays small. No custom code beyond a single font link if the terminal font is kept.
3. **Staging preview** — publish to the free `webflow.io` staging domain, then check:
   - every link resolves (`eterna.vstal.in/ops`, repo, `AI_LOG.md`);
   - every state label matches `/ops` as rendered today;
   - phone / tablet / desktop breakpoints hold the five-stage row without bad wrapping;
   - the screenshot alt text is descriptive ("Eterna ops dashboard — SIGNAL, LEDGER, LOG").
4. **CMS / hosting** — a one-pager needs no CMS collection; host on Webflow's free plan. If a custom domain is wanted later (P5), attach it then; keep `eterna-ops.webflow.io` as the canonical URL for now.
5. **Launch checklist** — verify the status strip's labels are still true on launch day (PENDING items may have moved since this doc was written); check meta title/description, favicon, screenshot alt text, and that `/ops` loads from the one-pager link.

## Time budget (rough, one page)

| Step | Time |
| --- | --- |
| Export copy/assets from this repo | ~30 min |
| Rebuild the five sections in Webflow | ~2-3 h |
| Staging preview + responsive pass | ~1 h |
| Launch checklist + publish | ~30 min |
| **Total** | **~4-5 h** |

## Honest notes

- The one-pager is a proof of no-code skill, not the product — the product is `eterna.vstal.in` and its `/ops` report card.
- Anything the one-pager claims must stay verifiable against the live site; if the pipeline state changes (e.g. the Apps Script deploys), update the status strip in the same session that makes the claim true.
