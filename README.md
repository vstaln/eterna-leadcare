# Eterna LeadCare

Live product demo at **[https://eterna.vstal.in](https://eterna.vstal.in)** — automatic lead handling for client websites: block the spam, save who they are, log the lead, and show every step live with a tracking number on every lead.

> **What problem does this solve?** When a visitor fills a form on a client's website, does anyone actually know what happened to that lead? Agencies lose leads between form-submit and follow-up: spam floods, no SLA, no proof for the client. LeadCare answers: every submission is checked (spam shield), researched (who is contacting you), logged (permanent receipt), and shown live (client dashboard) — nothing hidden, nothing simulated.

Built in 48 hours, $0/month free tier, from a phone, with AI pair-programming. Every step's story is in `AI_LOG.md`.

## Live links

- Main app: https://eterna.vstal.in
- Live ops dashboard (real executions): https://eterna.vstal.in/ops
- Behind the Scenes (git log + CI + AI_LOG + $0 cost): /behind-the-scenes
- Webflow one-pager: `webflow/one-pager.html` (template; designer build is a user-gated browser step — see docs/webflow-migration.md)

## The pipeline (one vocabulary everywhere)

```
CAPTURED → SPAM SHIELD → RESEARCHED → LOGGED → LIVE
```

| Stage | What it is technically | What it does | Honest state |
|-------|------------------------|--------------|--------------|
| **Captured** | Web form + typed `/api/lead` | The lead arrives with a timestamp | LIVE |
| **Spam Shield** | Honeypot trap + signed dispatch | Bots are caught and *counted* (data/shield.json) | ENABLED |
| **Researched** | n8n workflow + RDAP lookup | Who is contacting you — real company, real domain | CONFIGURED / PENDING |
| **Logged** | Execution store + Apps Script → Sheets | Permanent, client-visible record | N/R / DEGRADED |
| **Live** | Ops dashboard | Watch every lead move, honestly | DEGRADED until deploy |

These five names are **lockstep** across the home page diagram, the ops dashboard, the ASCII art, and the Webflow one-pager — one vocabulary, never mixed.

## What it proves

- **Every claim is verifiable.** The `/ops` page renders the real execution store; every other datum is a labeled env reading — nothing is simulated. Unreadable instruments show **N/R**, never green lights; pending pieces show **PENDING**; the pre-deploy state shows **DEGRADED** honestly.
- **Every accepted lead gets a tracking number** (`ELC-2026-XXXXX`) shown in the form's success message and on the ops dashboard — the "like J&T tracking, but for leads" promise.
- **The shield records, it doesn't pretend.** Honeypot hits, malformed requests, and n8n rejections are logged to `data/shield.json` and shown in the SHIELD LOG section with honest counts.
- **The chart never fabricates history.** The per-day stacked bar is bucketed from the retained ring (last 100), zero-filled, labeled "not all-time".

## Pipeline mechanics (for engineers)

- **Intake** — `/api/lead` validates, honeypot-traps (hidden `website` field → 200 decoy, never a store row), signs the dispatch (HMAC-SHA256 over `executionId.nonce.ts`, 5-min freshness), and records rejections in the shield sidecar.
- **Dispatch** — self-hosted N8N (1.123.69 on the Oracle box) verifies the signature, enriches the domain via RDAP, answers 200 through Respond-to-Webhook nodes. A 401 from n8n is recorded as `n8n_rejected`, not "unreachable".
- **Receipt** — Apps Script logs every execution to a Google Sheet via the token-gated endpoint in `docs/apps-script-setup.md` (user-gated deploy).
- **Ops dashboard** — the report card: SIGNAL (stages + states), TRAFFIC (recharts per-day bars), SHIELD LOG, LEDGER (known unknowns), LOG (last 10 executions + totals), LEGEND (state vocabulary).

## Stack proven

N8N / Google Apps Script / React / Next.js / Node.js / TypeScript / Recharts / Docker / CI/CD / GCP Cloud Run / Oracle Cloud · Git / AI-assisted workflow (Cursor + OpenCode) · Webflow (one-pager template). Mapping table in `ARCHITECTURE.md`.

## Docs

- `docs/leadcare-hr-script.md` — the 60-second pitch + objection handling (HR-safe)
- `docs/design-tokens.md` — tokens (only `led-live` pulses; ok/warn/err LEDs are static)
- `docs/n8n-workflow.md` — the workflow definition
- `docs/apps-script-setup.md` — Apps Script deploy (user-gated)
- `docs/webflow-migration.md` — Webflow one-pager build plan
