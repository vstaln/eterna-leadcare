# ARCHITECTURE.md

## Status

**Phase 1 of ET-48 v2 — scaffold & foundation (this slice).** The pipeline, Webflow migration plan, and deployment are later phases; nothing below beyond the foundation exists yet. The front door currently renders a static preview of the pipeline — live execution arrives in build phase 2.

## Branch B — front door (phone-only operator decision)

The operator runs this build phone-only (Termux, no GUI browser, no local Docker). The front door is therefore a **hand-coded Next.js app** — the interactive dashboard, `/live`, `/ops`, and `/behind-the-scenes` will live inside it. **Webflow = a template one-pager + written migration plan only, no iframe.** (The JD is Webflow-first; the one-pager proves the Webflow leg, the hand-coded app is the automation depth.)

## Data flow (target architecture)

```
Browser → Next.js API route (/api/lead) → webhook → N8N (Oracle VM, Docker)
        → Google Apps Script (RDAP enrich + Sheets log) + Telegram → report card
        → frontend polls /api/executions → animated pipeline diagram
```

## Deploy

GitHub Actions → multi-arch Docker (GHCR) → GCP Cloud Run → eterna.vstal.in. (CI gates every PR today: lint + typecheck + build + gitleaks — see `.github/workflows/ci.yml`.)

## Job-requirement mapping table

Lands here when the build reaches the packet phase (maps the JD's six priorities to concrete artifacts).

## Plans & design

- Build plan: `docs/superpowers/plans/2026-08-06-scaffold-foundation.md`
- Design tokens & art direction: `docs/design-tokens.md`
