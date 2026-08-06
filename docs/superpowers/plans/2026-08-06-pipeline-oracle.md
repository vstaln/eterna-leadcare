# Plan: Pipeline Core — Eterna Ops Command Center (P2, ET-48 v2)

Plan file: docs/superpowers/plans/2026-08-06-pipeline-oracle.md
Branch: feat/pipeline-core · Worktree: .worktrees/pipeline-core · Window: ~8h slice
Process: subagent-driven development + PR flow (push branch → PR → CI green → merge)

## Overview

Build the real pipeline behind the front door: visitor lead form → hardened Next.js proxy → self-hosted N8N on the existing Oracle box (`oracle-old`, x86_64, Ubuntu 24.04, Docker) → Google Apps Script enrichment + Sheets logging → report card, with execution-stage tracking the dashboard (P3) will poll. Phase 2 of ET-48 v2; deploy (P5) and the animated live dashboard (P3) are LATER plans.

## Infrastructure decision (changed from ET-48 v2 assumptions)

- N8N + Postgres run on `oracle-old` (168.110.203.180, x86_64) via Docker Compose — NOT a new Oracle Always-Free ARM VM. x86 changes nothing for N8N/Caddy. ARCHITECTURE.md updated to match.
- N8N is exposed on the box's public IP:5678 (n8n login enabled + workflow-level HMAC verification). Hardening (Cloudflare proxy, IP allowlisting) is a later phase; documented in ARCHITECTURE.md.
- Apps Script cannot be deployed from this phone (needs the user's Google account) — the plan delivers the script + a 5-minute browser setup checklist; the pipeline goes live the moment the user pastes the deployed URL.

## Global Constraints (binding — reviewers check against these)

1. Environment: Termux phone-only controller; `oracle-old` = ubuntu@168.110.203.180 (key ~/.ssh/oracle-old.key). All phone commands headless, non-interactive; Docker exists ONLY on the box, never locally.
2. Stack (locked): existing Next.js 16 app deps + NEW dep `pg` (plan ruling: needed for Postgres executions; nothing else). N8N community (Docker) + Postgres 16 (Docker) on the box. Apps Script vanilla (no deps).
3. Secrets: never commit values. Generate `WEBHOOK_TOKEN` + `EXECUTIONS_AUTH_TOKEN` with `openssl rand -hex 32`, keep in phone `.env.local` (gitignored) AND box `.env` (in the compose dir, gitignored, outside repo). .env.example stays empty. HMAC-SHA256 on every webhook payload (nonce + timestamp, timing-safe compare). No secret in any browser-visible payload.
4. Honesty rule (extends §7): everything shown to visitors is real or explicitly labeled. The demo pipeline is REAL (real webhook, real N8N, real Apps Script enrichment via RDAP). "Telegram notify" is NOT included in this slice (needs a bot token) — it appears only as an honest "pending" label if mentioned anywhere. Execution rows show stage, never fake data. A [DEMO] prefix in Sheets tabs marks demo records.
5. Repo rules (unchanged): conventional commits + AI-pairing tag; work only in the worktree; PR flow: every slice merges via PR with CI green (gitleaks must stay green — box .env must never touch the repo).
6. App behavior: `/api/*` routes typed, strict TS, no `any`; build/lint/typecheck green; existing pages unchanged except where a task says so.
7. Files may only live under: app/, components/, lib/, public/, docs/, .github/, plus root config files. The N8N workflow export + Apps Script code live in `docs/` (importable artifacts are docs).
8. oracle-old disk is 88% full (5.7G free) — plan a `docker system prune`/image audit step in Task 1; N8N image is ~1.5G.

## Task 1: Provision oracle-old — Docker Compose (Postgres + N8N) + connectivity

Goal: N8N + Postgres running on the box, reachable from the phone, secured with n8n login.

Files: none in repo (box-side: /opt/eterna/docker-compose.yml, .env — documented in docs/).

Requirements:
1. SSH audit + free disk: `df -h /`, `docker system df`, prune unused images/volumes if needed (target ≥ 8G free).
2. Create /opt/eterna/{compose.yml, .env}; postgres:16-alpine + n8nio/n8n (latest community). n8n uses the Postgres DB (external, not sqlite): env DB_TYPE=postgresdb, DB_POSTGRESDB_*, N8N_USER_MANAGEMENT_JWT_SECRET, N8N_BASIC_AUTH_ACTIVE=true + user/pass (box .env only).
3. `docker compose up -d`; wait for healthy; verify: `curl -s http://localhost:5678/healthz` = ok (from the box).
4. Firewall: open TCP 5678 from 0.0.0.0 (Oracle security list + ufw if active). Verify from the phone: `curl -sI http://168.110.203.180:5678` returns n8n HTML.
5. Create n8n login (via API with BASIC_AUTH or documented in first browser login) — actual UI login is user's browser step: checklist item. Create an N8N **API key** (Workflow > Settings > API key... actually: n8n > user settings > API keys) — user step, paste into phone .env.local as N8N_API_KEY.
6. Verification from phone: compose ps (via ssh), healthz 200, public 5678 reachable.

DoD: box runs postgres+n8n, reachable, disk cleaned, .env on box never committed.

## Task 2: Apps Script — RDAP enrichment + Sheets logging (code + setup checklist)

Goal: a single Apps Script project exposing two endpoints: `doPost('enrich')` (RDAP lookup → JSON) and `doPost('log')` (append to Sheet, [DEMO] prefix). Deployable in ~5 browser minutes by the user.

Files: docs/apps-script-setup.md (code + step-by-step), no code in repo besides the doc (single-file script embedded in the doc).

Requirements:
1. Script: `doPost(e)` reads action from path; enrich: fetch `https://rdap.org/domain/<domain>` (or registry fallback), return {domain, registrar, created, updated, status, nameservers} as JSON; log: append [DEMO] row to spreadsheet "ET-48 OPS — leads" (tab "DEMO leads"), return row id. No secrets in script (execution as user, access: anyone with link — honest tradeoff documented; RDAP data is public info).
2. Setup checklist doc: create project → paste code → deploy web app (Execute as: me; Access: anyone) → copy URL → save to phone .env.local APPS_SCRIPT_URL.
3. Verification: README of the doc includes curl examples against the deployed URL; user confirms one test call (or reports the URL and we test from the phone).

DoD: doc complete with code + checklist; env var documented; pipeline unblocks when user deploys.

## Task 3: Next.js — pg dependency, executions store, /api/lead proxy (HMAC), /api/executions + /api/execution-status

Goal: hardened ingestion + real execution records.

Files: package.json (+pg), lib/db.ts, lib/crypto.ts, lib/env.ts (wire validateEnv), app/api/lead/route.ts, app/api/executions/route.ts, app/api/execution-status/route.ts, app/api/health/route.ts (no change), .env.local (local, gitignored).

Requirements:
1. Ruling: add `pg` dependency. `npm i pg` + `npm i -D @types/pg`. lockfile committed.
2. lib/db.ts: pg Pool; `ensureSchema()` runs at module init (CREATE TABLE IF NOT EXISTS executions: id uuid PK, status text, stage text, payload jsonb, error text, created_at timestamptz, updated_at timestamptz). Connection string from env (DATABASE_URL — new var, add to .env.example empty + README). Pool created lazily; routes must not crash when DB is down (500 with honest message).
3. lib/crypto.ts: hmac(payload, token) → hex; verify with timingSafeEqual; nonce+timestamp window (≤5min) — all in /api/lead (inbound) and /api/execution-status (inbound from n8n).
4. POST /api/lead: JSON {name, email, company?, message, nonce, ts}; validate (email regex, lengths), honeypot field `website` must be empty; id = crypto.randomUUID(); insert execution row (status received); HMAC-sign {executionId, ...} with WEBHOOK_TOKEN; POST to `${N8N_BASE_URL}/webhook/lead` (fetch, 10s timeout, non-2xx → row status failed + honest error); return {ok:true, executionId}. Never echo secrets.
5. GET /api/executions: Bearer EXECUTIONS_AUTH_TOKEN; SELECT whitelisted columns only (id, status, stage, created_at, updated_at), LIMIT 50 newest first. 401 on bad/missing token.
6. POST /api/execution-status: Bearer EXECUTIONS_AUTH_TOKEN + HMAC header verified against WEBHOOK_TOKEN; body {executionId, status, stage, error?}; upsert stage/status; 200 ok. (n8n calls this per stage.)
7. lib/env.ts: add APPS_SCRIPT_URL + DATABASE_URL to REQUIRED; validateEnv() wired (production throws; dev returns empties — routes guard on empties with honest 503).
8. Verification: build/lint/typecheck green; curl tests: lead → row created; executions → 401 without token, 200 with; execution-status → stage updated. Postgres reachable from phone? (No: app on phone dev server; DATABASE_URL should target the box's postgres port 5432 — open 5432 from phone IP? Simpler: tunnel via ssh -L for dev, or run pg port open to world with password auth — decide: open 5432 with strong password + note hardening; document in ARCHITECTURE.) Choose: expose 5432 with md5/scram password auth (strong random password) — honest demo tradeoff, hardening later.

DoD: real ingestion works end-to-end to DB; all endpoints verified with curl; secrets in .env.local only.

## Task 4: N8N workflow — HMAC verify → enrich → log → callback

Goal: the workflow that makes the pipeline real.

Files: docs/n8n-workflow.json (export, importable), docs/ — workflow notes. Box: workflow imported by user OR via API (n8n API key + workflows API if available in community — checklist if not).

Requirements:
1. Workflow "ET-48 lead pipeline": Webhook node (POST /webhook/lead) → Code node "verify-hmac" (recompute HMAC over raw payload with WEBHOOK_TOKEN, timing-safe; reject 401) → HTTP node → `${APPS_SCRIPT_URL}?action=enrich` (domain from email) → Code node "stage" (set stage=enriching, callback via HTTP to `${N8N_BASE_URL_EXTERNAL?}`... NOTE: callback goes to the NEXT.JS app — dev mode: phone. Use an env var WEBHOOK_CALLBACK_URL set on the box to the phone's LAN URL during dev? Phone reachable from box? Yes if same network — box is public IP; phone behind NAT → box cannot reach phone. HONEST PROBLEM: n8n callback → Next.js only works when Next.js is deployed publicly (P5). For this slice: skip live stage-callbacks; stage column updates via direct phone→DB (Task 3 step 6 exists for P5) — REDUCE scope: Task 4 does HMAC→enrich→log→respond 200; stage updates happen on the next deploy phase. Mark execution-status route as "wired for P5". This keeps honesty: no fake callbacks.)
2. Workflow response: 200 {ok:true, executionId} echo.
3. Import: user browser step (Import from file) — checklist; or API import if community supports (verify; if not, manual). Verification from phone: curl POST the box's webhook with a signed payload → 200; Apps Script URL set on box env (user pasted after Task 2); sheet gets a [DEMO] row — USER confirms or shares URL; we verify via phone curl to the Apps Script log endpoint? Apps Script "anyone with link" allows POST → we can verify ourselves from the phone. Good.
4. Box env vars: APPS_SCRIPT_URL, WEBHOOK_TOKEN (same as phone).

DoD: end-to-end: phone curl → box n8n → enrich → [DEMO] sheet row → 200. Workflow file committed.

## Task 5: Docs + AI_LOG

Files: ARCHITECTURE.md (x86 note, real endpoints, hardening notes), README.md (env vars section: DATABASE_URL, APPS_SCRIPT_URL; pipeline quickstart), docs/apps-script-setup.md (from Task 2 — verify), AI_LOG.md S003.

Requirements:
1. ARCHITECTURE.md: replace "Ampere A1 ARM64" with oracle-old x86_64; data-flow diagram updated (webhook → n8n → apps script → sheets; callbacks deferred to P5); security notes section (HMAC, nonce window, bearer tokens, DB password auth, port exposure + hardening roadmap).
2. README: env table complete (8 vars), quickstart gains "pipeline" section.
3. AI_LOG S003: this slice, incl. honest blockers (Apps Script needs user's browser; callbacks deferred; Telegram pending).
4. Verification: no dangling refs; all docs' referenced files exist.

DoD: docs accurate; AI_LOG S003 present.

## Task 6: Final branch review (controller-run) + PR

Controller: build+lint+typecheck, git log check, whole-branch review dispatch, fix cycle, then push branch → open PR → CI green → merge (fast-forward via GitHub UI/API). PR body: summary + verification evidence + honest "not yet" list.

## Definition of Done (whole plan)

- Real lead → [DEMO] sheet row path works from the phone (curl), with HMAC verified by n8n.
- Execution rows in Postgres; /api/executions authed.
- Docs + AI_LOG updated; secrets never committed; CI green incl. gitleaks; merged via PR.
