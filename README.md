# Eterna Ops Command Center

Live automation showcase at **[https://eterna.vstal.in](https://eterna.vstal.in)** — a working miniature of the EMPWR-style webhook integrations Eterna ships for US clients: visitor lead form → Next.js API → HMAC-verified webhook → self-hosted N8N → RDAP enrichment → Google Apps Script audit trail in Sheets → live report card. Telegram notify: pending (later phase).

Built in 48 hours, $0/month free tier, with Cursor + OpenCode. Every step's story is in `AI_LOG.md`.

## Live links

- Main app: https://eterna.vstal.in
- Live Ops dashboard (real executions): https://eterna.vstal.in/ops
- Behind the Scenes (git log + CI + AI_LOG + $0 cost): /behind-the-scenes
- Webflow no-code landing: https://eterna-ops.webflow.io

## What it proves

The command center's /ops page is the honest report card: every row comes from the real execution store, nothing is simulated. Each light on the panel carries its own source and state — unreadable instruments show N/R flags, not green lights. The 200-degraded path is part of the demo, showing what exists before the user-gated Apps Script deploy and how the pipeline upgrades honestly. Open the LEDGER for exactly what is pending and why, then watch the LOG fill with real rows. Here "live" means real data, honestly labeled.

Stack proven: Webflow / N8N / Google Apps Script / React / Next.js / Node.js / type-safe TypeScript / Docker / CI/CD / GCP Cloud Run / Oracle Cloud · Git / version control / Cursor + OpenCode AI workflow / k3s stretch. Mapping table in `ARCHITECTURE.md`.

## Pipeline (shipped state — P1 home · P2 pipeline-core · P3 ops dashboard)

What the shipped build proves, end to end:

- **Home page (P1)** — the terminal-chrome front door: hero and the numbered five-stage pipeline diagram (Form → API → N8N → Apps Script → Report Card); the nav's Ops link is live.
- **Form → HMAC-verified webhook** — `/api/lead` signs the payload (HMAC-SHA256 over `executionId.nonce.ts`, 5-minute freshness window) before calling N8N; unverifiable requests get 401.
- **Self-hosted N8N** — n8n 1.123.69 on the Oracle box (`oracle-old`, x86_64, Ubuntu 24.04, Docker Compose, sqlite) verifies the HMAC, enriches the domain via RDAP, and answers 200 through Respond-to-Webhook nodes.
- **Apps Script audit trail** — N8N logs every execution to a Google Sheet via the token-gated endpoint documented in `docs/apps-script-setup.md` (deploy is a user-gated browser step; not yet deployed).
- **Ops dashboard (P3)** — [the report card](https://eterna.vstal.in/ops): SIGNAL renders every stage with its own source and state (N/R flags instead of fake green lights), LEDGER lists exactly what is pending and why, LOG shows the last 10 executions straight from the store with totals and the last failure.

Business value: RDAP enrichment is free lead qualification (registrar, nameservers, registration dates — signal before any sales touch), and the Sheets log is the client-facing compliance audit trail of every execution — the EMPWR pattern Eterna ships for US clients.

### Port exposure

N8N listens on TCP 5678 on the Oracle box, currently bound to localhost (127.0.0.1). Public exposure requires opening the OCI security-list rule for TCP 5678; only then is the workflow reachable from outside the box, and `N8N_BASE_URL` in `.env.local` can point at the public URL. Until the rule is open, end-to-end behavior is validated against the local stub. All other ports (including 5432) stay closed; Cloudflare proxy and IP allowlisting are P5 hardening.

## Stack

- Next.js 16 (App Router, TypeScript, Tailwind) — deployed via GitHub Actions → GHCR → GCP Cloud Run (free tier; Vercel fallback documented)
- N8N (community, self-hosted) — Docker Compose on the Oracle box (`oracle-old`, x86_64, Ubuntu 24.04)
- Google Apps Script + Google Sheets — RDAP/domain enrichment + lead audit trail
- Webflow free plan — no-code landing proof
- CI/CD: `deploy.yml` on push to `main`

## Quickstart

```sh
# app
npm ci
cp .env.example .env.local   # then fill in the four vars below
npm run dev            # http://localhost:3000
npm run build
npm run lint
npm run typecheck

# N8N (on the Oracle VM — see docker-compose.yml)
docker compose up -d
```

## Environment variables

Defined (empty) in `.env.example` — copy to `.env.local` (phone) and fill:

| Variable | Required | Purpose |
| --- | --- | --- |
| `N8N_BASE_URL` | yes | N8N base URL (box) |
| `WEBHOOK_TOKEN` | yes | shared secret for the lead-webhook HMAC |
| `EXECUTIONS_AUTH_TOKEN` | yes | bearer token for `/api/executions` |
| `N8N_API_KEY` | no | N8N API key (needed P5) |

`N8N_WEBHOOK_PATH` is also accepted (optional; defaults to `/webhook/lead`).

On the box, `/opt/eterna/.env` (outside the repo, passed to the n8n container) holds:

| Variable | Purpose |
| --- | --- |
| `WEBHOOK_TOKEN` | shared with the phone |
| `APPS_SCRIPT_URL` | deployed Apps Script web-app URL |
| `APPS_SCRIPT_TOKEN` | shared with the script's Script Properties |
| `N8N_ENCRYPTION_KEY` | n8n encryption |
| `N8N_USER_MANAGEMENT_JWT_SECRET` | n8n user management |

## Repo layout

- `ARCHITECTURE.md` — data-flow diagram, decision log, security notes, runbook.
- `AI_LOG.md` — per-session Cursor/OpenCode prompt log.
- `docs/design-tokens.md` — design tokens + art direction (source of truth for the UI layer).
- `docs/n8n-workflow.json` — "ET-48 lead pipeline" workflow export (HMAC verify → RDAP enrich → Apps Script log → respond).
- `docs/n8n-workflow.md` — workflow notes + response contract + ASCII diagram.
- `docs/apps-script-setup.md` — Apps Script log endpoint: script, deploy checklist, token setup, curl examples.
- `docs/webflow-migration.md` — Webflow one-pager template + migration plan (no iframe; the build itself is a user-gated browser task).

## Cost

$0/month. Itemized on /behind-the-scenes.