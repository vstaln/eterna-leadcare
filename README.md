# Eterna LeadCare

<p align="center">
  <img src="public/eterna-logo-light.png" alt="Eterna LeadCare" width="420">
</p>

<p align="center">
  <strong><a href="https://eterna.vstal.in">→ Live site: eterna.vstal.in ←</a></strong><br>
  <em>Submit a test lead and watch it move through the pipeline on the dashboard.</em>
</p>

Automatic lead handling for client websites: **block the spam, save who they are, log the lead, and show every step live** with a tracking number on every lead — like J&T tracking, but for leads.

> **The problem:** when a visitor fills a form on a client's website, does anyone actually know what happened to that lead? Agencies lose leads between form-submit and follow-up: spam floods, no SLA, no proof for the client. LeadCare answers: every submission is checked (spam shield), researched (who is contacting you), logged (permanent receipt), and shown live (client dashboard) — nothing hidden, nothing simulated.

Built in 48 hours, **$0/month free tier**, from a phone, with AI pair-programming. Every step's story is in `AI_LOG.md`.

## The pipeline (one vocabulary everywhere)

```
CAPTURED → SPAM SHIELD → RESEARCHED → LOGGED → LIVE
```

| Stage | What it is technically | What it does | Honest state |
|-------|------------------------|--------------|--------------|
| **Captured** | Web form + typed `/api/lead` | The lead arrives with a timestamp | LIVE |
| **Spam Shield** | Honeypot trap + signed dispatch | Bots are caught and *counted* (`data/shield.json`) | ENABLED |
| **Researched** | N8N workflow + RDAP lookup | Who is contacting you — real company, real domain | LIVE / CONFIGURED / PENDING |
| **Logged** | Execution store + Apps Script → Sheets | Permanent, client-visible record | LIVE / N/R |
| **Live** | Ops dashboard | Watch every lead move, honestly | LIVE / DEGRADED |

These five names are **lockstep** across the dashboard, the ASCII art, and the Webflow one-pager — one vocabulary, never mixed.

## Live links

- Main app: **https://eterna.vstal.in**
- Live dashboard (real executions, on the home page): **https://eterna.vstal.in/#dashboard**
- Lead tracking lookup: **https://eterna.vstal.in/live** — enter `ELC-2026-XXXXX` and see the lead's state
- Webflow one-pager: `webflow/one-pager.html` (template; designer build is a user-gated browser step — see `docs/webflow-migration.md`)

## What it proves

- **Every claim is verifiable.** The dashboard renders the real execution store; every other datum is a labeled env reading — nothing is simulated. Unreadable instruments show **N/R**, never green lights; pending pieces show **PENDING**; the pre-deploy state shows **DEGRADED** honestly.
- **Every accepted lead gets a tracking number** (`ELC-2026-XXXXX`) — shown in the form's success message, on the dashboard, and resolvable on the `/live` page.
- **The shield records, it doesn't pretend.** Honeypot hits, malformed requests, and N8N rejections are logged to `data/shield.json` and shown in the SHIELD LOG with honest counts.
- **The chart never fabricates history.** The per-day stacked bar is bucketed from the retained ring (last 100), zero-filled, labeled "not all-time".
- **The N8N workflow is embedded, view-only** — the live demo section on the site shows the real workflow canvas (auto-login via `/api/demo-session`, no login box).
- **The LOG updates live** — the home page polls the PII-stripped public mirror every 5s; watch leads land in real time.

## Pipeline mechanics (for engineers)

- **Intake** — `/api/lead` validates, honeypot-traps (hidden `website` field → 200 decoy with a fake UUID, never a store row), signs the dispatch (HMAC-SHA256 over `executionId.nonce.ts`, 5-min freshness window), and records rejections in the shield sidecar.
- **Dispatch** — self-hosted N8N (1.123.69 on the Oracle box) verifies the signature, enriches the domain via RDAP, answers 200 through Respond-to-Webhook nodes. A 401 from N8N is recorded as `n8n_rejected`, never collapsed into "unreachable".
- **Receipt** — Apps Script logs every execution to a Google Sheet via the token-gated endpoint in `docs/apps-script-setup.md` (user-gated deploy).
- **Ops dashboard** — the report card: SIGNAL (stages + live probes), TRAFFIC (Recharts per-day bars), SHIELD LOG, LOG (last 10 executions + totals), LEGEND (state vocabulary).
- **Live probes** — the RESEARCHED and LOGGED stages probe N8N's `/healthz` and the executions API on every render; probes fail soft (N/R), never a fake green light.

## Stack proven

<p align="center">
  <img src="public/built-with/blossom.svg" width="56" alt="OpenAI">&nbsp;&nbsp;
  <img src="public/built-with/opencode.svg" width="64" alt="OpenCode">&nbsp;&nbsp;
  <img src="public/built-with/zed.png" width="64" alt="Zed">
</p>

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · GSAP + React Bits · Recharts · DialKit · N8N (self-hosted) · Google Apps Script + Sheets · RDAP · Docker · GitHub Actions + gitleaks · GCP Cloud Run · Oracle Cloud · Webflow (one-pager template). Full mapping table in `ARCHITECTURE.md`.

## Quickstart

```sh
npm ci
cp .env.example .env.local   # fill N8N_BASE_URL, WEBHOOK_TOKEN, EXECUTIONS_AUTH_TOKEN
npm run dev                  # http://localhost:3000
npm run lint && npm run typecheck
```

N8N on the box: `docker compose up -d` (see `compose.yml`). CI gates every PR: lint + typecheck + build + gitleaks (`.github/workflows/ci.yml`).

## Docs

- `ARCHITECTURE.md` — data flow, security model, decision log, deploy
- `DESIGN.md` — the art direction (paper world, stamps, motion, bans)
- `docs/leadcare-hr-script.md` — the 60-second pitch + objection handling (HR-safe)
- `docs/design-tokens.md` — design tokens (only `led-live` pulses; ok/warn/err LEDs are static)
- `docs/n8n-workflow.md` + `docs/n8n-workflow.json` — the workflow definition
- `docs/apps-script-setup.md` — Apps Script deploy (user-gated)
- `docs/webflow-migration.md` — Webflow one-pager build plan
- `AI_LOG.md` — the full build story, session by session

---

<p align="center">
  <a href="https://eterna.vstal.in">eterna.vstal.in</a> · built in 48 hours · $0/month
</p>
