# ARCHITECTURE.md

## Status

**Phase 2 of ET-48 v2 — pipeline-core (this slice).** The real pipeline ships: visitor lead form → `/api/lead` (HMAC-signed proxy) → self-hosted N8N on the Oracle box (`oracle-old`, x86_64, Ubuntu 24.04, Docker Compose, sqlite) → RDAP enrichment → Apps Script log → `[DEMO]` Sheets audit trail → report card. Telegram notify, stage callbacks, Postgres, and public deploy are LATER phases (P3/P5).

## Branch B — front door (phone-only operator decision)

The operator runs this build phone-only (Termux, no GUI browser, no local Docker). The front door is therefore a **hand-coded Next.js app** — the interactive dashboard, `/live`, `/ops`, and `/behind-the-scenes` will live inside it. **Webflow = a template one-pager + written migration plan only, no iframe.** (The JD is Webflow-first; the one-pager proves the Webflow leg, the hand-coded app is the automation depth.)

## Data flow (this slice)

```
Browser → Next.js API (/api/lead, HMAC-SHA256 over executionId.nonce.ts, 5-min freshness)
        → N8N webhook (path configurable via `N8N_WEBHOOK_PATH`; default `/webhook/lead` for the local stub, the real value is set in `.env.local` — verify HMAC → RDAP enrich → token-gated Apps Script log)
        → [DEMO] row in Sheets → Respond 200 → execution store (data/executions.json, gitignored)
        → frontend polls /api/executions (authed) + /api/executions/public (PII-stripped mirror)
```

Callbacks, Postgres, and Telegram are P3/P5.

## Security

- HMAC over canonical fields (`executionId.nonce.ts`), timing-safe compare, 5-minute freshness window; replay within the window is an accepted, documented demo tradeoff.
- `/api/executions` is bearer-gated (`EXECUTIONS_AUTH_TOKEN`); the public mirror exposes only id prefix, status, stage, created_at — no PII.
- Apps Script endpoint is token-gated (`APPS_SCRIPT_TOKEN` in Script Properties); the "anyone with link" deployment is bounded by that token, which never lives in the repo.
- Only TCP 5678 is intended for exposure and is currently bound to localhost on the box; opening the OCI security-list rule is a user-gated step. 5432 stays closed. P5 hardening: Cloudflare proxy + IP allowlisting.

## Deploy

GitHub Actions → multi-arch Docker (GHCR) → GCP Cloud Run → eterna.vstal.in. (CI gates every PR today: lint + typecheck + build + gitleaks — see `.github/workflows/ci.yml`.)

## P5 migration note

Public hosting migrates the box to Postgres (replacing sqlite + the JSON store) and lands stage callbacks; n8n's 5678 exposure gets Cloudflare proxy + IP allowlisting.

## Job-requirement mapping table

Lands here when the build reaches the packet phase (maps the JD's six priorities to concrete artifacts).

## Plans & design

- Build plan: `docs/superpowers/plans/2026-08-06-scaffold-foundation.md`
- Design tokens & art direction: `docs/design-tokens.md`
- Lead pipeline workflow notes + diagram: `docs/n8n-workflow.md`
