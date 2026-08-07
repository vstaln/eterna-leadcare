# ARCHITECTURE.md

## Status

**Eterna LeadCare (rebrand of ET-48).** The real pipeline ships: web form → `/api/lead` (honeypot shield + signed dispatch) → self-hosted N8N on the Oracle box (`oracle-old`, x86_64, Ubuntu 24.04, Docker Compose, sqlite) → RDAP enrichment → Apps Script log → `[DEMO]` Sheets audit trail → live ops dashboard. Telegram notify, stage callbacks, Postgres, and public deploy are LATER phases (P5).

## Product framing

LeadCare is presented as a lead-handling product Eterna could ship: every form submission gets checked (SPAM SHIELD), researched (RESEARCHED), logged (LOGGED), and shown live (LIVE) with a tracking number (ELC-2026-XXXXX) on every lead. Honesty is the brand: every claim on the site is backed by the store or a labeled env reading — nothing simulated. The jargon→plain-English map lives in `docs/leadcare-hr-script.md`.

## Branch B — front door (phone-only operator decision)

The operator runs this build phone-only (Termux, no GUI browser, no local Docker). The front door is therefore a **hand-coded Next.js app** — the interactive dashboard, `/ops`, and `/behind-the-scenes` live inside it. **Webflow = a template one-pager + written migration plan only, no iframe.** (The JD is Webflow-first; the one-pager proves the Webflow leg, the hand-coded app is the automation depth.)

## Data flow (this slice)

```
Browser → Next.js API (/api/lead: honeypot trap → validate → sign HMAC-SHA256
        over executionId.nonce.ts, 5-min freshness)
        → N8N webhook (path configurable via `N8N_WEBHOOK_PATH`; default `/webhook/lead`;
        verify HMAC → RDAP enrich → token-gated Apps Script log)
        → [DEMO] row in Sheets → Respond 200 → execution store (data/executions.json, gitignored)
        → rejections sidecar: data/shield.json (honeypot hits, malformed requests, n8n 401s)
        → frontend reads the execution store (authed `/api/executions` + `/api/executions/public`
        PII-stripped mirror) and the public `/api/shield` counts
```

Callbacks, Postgres, and Telegram are P5.

## Security

- Honeypot trap on `/api/lead` (hidden `website` field → 200 decoy with fake UUID, recorded in the shield sidecar — fire-and-forget so the decoy is never slower than the real path).
- HMAC over canonical fields (`executionId.nonce.ts`), timing-safe compare, 5-minute freshness window; replay within the window is an accepted, documented demo tradeoff. A 401 from n8n is recorded as `n8n_rejected`, never collapsed into "unreachable".
- `/api/executions` is bearer-gated (`EXECUTIONS_AUTH_TOKEN`); the public mirror exposes only id prefix, tracking, status, stage, created_at — no PII.
- `/api/shield` is public by design: it returns only counts + reason codes, never payload data.
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
