# Agent Context — Eterna LeadCare (vstaln/eterna-leadcare)

You are joining a live product that is already deployed and receiving real traffic.
Read this fully before changing anything. The system is in production — treat every
commit and deploy like a release.

## What this is

A demo site for a job application ("Lead Automation & Web Engineer" at Eterna
Indonesia): **Eterna LeadCare** — a lead-capture pipeline with an honest ops
dashboard. Selling point: *nothing simulated*. Every number on the page comes from
a real store file, every stage state is live-probed, failures are named (N/R,
PENDING, DEGRADED) instead of hidden.

## Current state (source of truth: `main`)

- The v2/v3 split is **gone** — one unified page at `/` ("The Operations Ledger"):
  paper world (light palette), ledger lines, rubber-stamp motifs, capture-terminal
  form (kept dark on purpose). `/v2` and `/v3` are 404s/redirects — do not recreate
  a version switcher.
- React Bits effects were added: DecryptedText headline, CountUp totals, ShinyText,
  Magnet CTAs, FaultyTerminal, ScrollStack, FallingText, ascii-art.
- `/ops` = the honest report card (stages, totals, shield counts, tracking column).
- CI on push to `main`: lint + typecheck + build + gitleaks. Keep it green.

## Infrastructure map (Oracle box, `oracle-old`, 168.110.203.180)

| Thing | Where |
|---|---|
| App container | `deploy-app-1`, `127.0.0.1:3101`, compose `deploy/app-compose.yml` in `/opt/eterna-leadcare` |
| App env | `/opt/eterna-leadcare/.env` — plain `KEY=value`, no spaces around `=` |
| Store (executions + shield) | `/opt/eterna-leadcare/data/` (`executions.json`, `shield.json`) |
| n8n | `eterna-n8n-1`, compose `/opt/eterna/compose.yml`, image `n8nio/n8n:1.123.69` |
| n8n data | Docker volume `eterna_n8n_data` (SQLite) — never delete/recreate it |
| nginx | `/etc/nginx/sites-enabled/eterna.vstal.in.conf` — let's-encrypt, proxies `eterna.vstal.in` → app, and `/n8n/…` → n8n |

### n8n is now HTTPS-only behind nginx
- Public URL: `https://eterna.vstal.in/n8n` (editor + `/n8n/rest/*`).
- n8n runs with `N8N_PATH=/n8n/`, `N8N_HOST=eterna.vstal.in`, `N8N_PROTOCOL=https`,
  `N8N_PORT=443` → it **listens on 443 inside the container**, published as
  `127.0.0.1:5678:443` (localhost only — the old public `:5678` exposure is closed).
- n8n mounts **only the editor + `/rest/*` under `/n8n/`**. The public JSON API,
  healthz, webhooks and static assets live at the **root** (`/api/v1/...`,
  `/healthz`, `/webhook/...`, `/static/...`, `/assets/...`). nginx compensates with
  prefix-stripping locations (already in place — do not remove):
  `/n8n/api/`, `/n8n/healthz`, `/n8n/webhook/`, `/n8n/static/`, `/n8n/assets/`.
- Owner account exists (created programmatically): email `admin@vstal.in`,
  password shared in chat by the user — tell them to change it in
  Settings → Users. An API key with full owner scopes exists: it lives in the app
  `.env` as `N8N_API_KEY` (a JWT). Do not mint another unless it is deleted.
- The dispatch webhook path is **not** `/webhook/lead` — it is the full
  `N8N_WEBHOOK_PATH=/webhook/e5336198-9ef1-46e5-8746-4681e17aba1f/lead/lead`
  (n8n's production webhook for workflow "ET-48 lead pipeline"). Never shorten it.

## CRITICAL — do not break these

1. **Never change ownership/perms of `/opt/eterna-leadcare/data`.** The app
   container runs as uid 100 / gid 101 (`nextjs`). If the dir ends up owned by
   `ubuntu` or mode 700, store writes fail with `EACCES` on
   `executions.json.tmp` → lead submissions 500, the app reports
   "error connecting to n8n". Correct: owned `100:101`, mode `770`.
   If you ever recreate the staging dir, re-apply:
   `sudo chown -R 100:101 /opt/eterna-leadcare/data && sudo chmod 770 /opt/eterna-leadcare/data`
2. **Never delete or recreate the `eterna_n8n_data` volume** — it holds the
   workflow, executions, and the owner account.
3. **Keep the stage states honest** (`lib/stages.ts` probes n8n live:
   `/healthz` + `/api/v1/executions` with `X-N8N-API-KEY`). No hardcoded greens.
   Vocabulary: LIVE / CONFIGURED / N/R / PENDING / DEGRADED.
4. `.env` edits: plain `KEY=value`. After editing, recreate the app container:
   `cd /opt/eterna-leadcare && sudo docker compose -f deploy/app-compose.yml up -d`.

## Deploy procedure (releases)

From the repo (on any machine with ssh access to the box):
```sh
rsync -a --delete --exclude .git --exclude .next --exclude node_modules \
  --exclude .rebuild --exclude '*.tsbuildinfo' --exclude data --exclude .env \
  ./ oracle-old:/home/ubuntu/eterna-leadcare/
ssh oracle-old 'sudo cp -a /home/ubuntu/eterna-leadcare/. /opt/eterna-leadcare/ && \
  cd /opt/eterna-leadcare && sudo docker compose -f deploy/app-compose.yml up -d --build'
```
- The rsync **must exclude `data`** — the store lives only on the box.
- Verify after deploy: `curl -s https://eterna.vstal.in/ops` (stages) and submit
  a test lead (`POST https://eterna.vstal.in/api/lead`, `website` field empty =
  honeypot must be empty) → expect a tracking number, then see it on `/ops`.

## Remaining work (do these, in order)

1. **Stage 05 (LIVE → LIVE)** — `APPS_SCRIPT_URL` is still empty. The user must
   deploy a Google Apps Script (docs/apps-script-setup.md) and paste the URL;
   set it in `/opt/eterna-leadcare/.env` and recreate the app container.
2. **`/live` tracking page** — nav shows "Live — soon". Build a page where a
   visitor enters their tracking number (`ELC-…`) and sees their lead's path.
   Reuse `lib/store.ts` + the tracking column logic from `/ops`. Wire the form
   success message to link to it.
3. Optional polish only after 1–2: anything else must keep the honest-ledger
   concept and the paper/terminal duality intact. No ET-48, no "PRODUCT DEMO"
   jargon, no simulated lights.

## Conventions

- Next.js App Router, Tailwind v4, TS strict (typecheck must pass), no comments
  in code unless asked.
- Palette is theme-token driven in `app/globals.css` (`:root` + `.v3` overrides;
  the capture-terminal restores dark vars locally). Keep it that way.
- Commit on `main` with identity `vstaln <vstaln@users.noreply.github.com>`.
- If you change anything about n8n paths or nginx, test all five prefixes:
  `/n8n/`, `/n8n/healthz`, `/n8n/api/v1/executions` (needs key),
  `/n8n/webhook/...`, `/n8n/static/...`.
