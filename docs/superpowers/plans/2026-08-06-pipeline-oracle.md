# Plan: Pipeline Core — Eterna Ops Command Center (P2, ET-48 v2) — v2 (post-critique)

Plan file: docs/superpowers/plans/2026-08-06-pipeline-oracle.md
Branch: feat/pipeline-core · Worktree: .worktrees/pipeline-core · Window: ~8h slice
Process: subagent-driven development + PR flow (push branch → PR → CI green → merge)
Critique round 1: 3 independent critics → v2 incorporates all consensus fixes.

## Overview

Build the real pipeline behind the front door: visitor lead form → hardened Next.js proxy → self-hosted N8N on the existing Oracle box (`oracle-old`, x86_64, Ubuntu 24.04, Docker) → N8N does RDAP enrichment directly → Google Apps Script logs to Sheets ([DEMO] prefix) → report card, with execution records in a gitignored local store. Phase 2 of ET-48 v2; deploy (P5), the animated dashboard (P3), stage callbacks, and Telegram are LATER plans.

## Architecture decisions (v2 — changed from ET-48 v2 assumptions, after critique)

1. **No Postgres this slice.** N8N runs with its default sqlite on the box; the app's execution records live in a gitignored JSON file store (`data/executions.json`, atomic writes, 100-row cap). Rationale: zero exposed DB ports (5432 stays firewalled), zero native deps (`pg` removed), still honest — a real audit trail the /ops page will read. P5 (deploy) migrates to Postgres on the box when the app is publicly hosted. Documented in ARCHITECTURE.md.
2. **HMAC over canonical fields, not raw bodies.** No JSON-canonicalization footgun: `/api/lead` sends headers `X-Nonce`, `X-Ts`, `X-HMAC` where HMAC = HMAC-SHA256(WEBHOOK_TOKEN, `${executionId}.${nonce}.${ts}`); n8n Code node recomputes the same string from the JSON body. Timing-safe compare. 5-minute freshness window; replay within the window is an ACCEPTED, DOCUMENTED demo tradeoff (n8n could dedupe by executionId — a "check executions seen set" node is optional; skip unless time allows).
3. **Apps Script is a single `log` endpoint.** RDAP enrichment is done by n8n's HTTP node (public data, no secrets — Apps Script doesn't proxy RDAP). The script appends a [DEMO] row and REQUIRES a shared token (`APPS_SCRIPT_TOKEN` in Script Properties) in the POST body — the "anyone with link" capability URL is thus bounded; token never in repo.
4. **Port exposure is minimal and labeled.** Only TCP 5678 opens to the internet (n8n login + workflow HMAC). 5432 closed. This tradeoff is explicitly labeled in README (not just ARCHITECTURE). Cloudflare proxy + IP allowlisting = P5 hardening.
5. **n8n import is headless.** `docker exec <container> n8n import:workflow --input=...` + `n8n update:workflow --id=... --active=true` run from the phone over SSH — no browser needed for import/activation.
6. **User browser checklist (explicit, gated):** (a) OCI security list: open TCP 5678; (b) n8n first-login owner account + API key; (c) Apps Script deploy. These gate only the "user-gated DoD" below, never the controller-core DoD.

## Global Constraints (binding)

1. Environment: Termux phone-only controller; `oracle-old` = ubuntu@168.110.203.180 (key ~/.ssh/oracle-old.key). Headless, non-interactive on the phone; Docker exists ONLY on the box. Box disk ~88% full (5.7G free) — audit before pulling images; target ≥3G free after compose.
2. Stack (locked): existing Next.js 16 deps; NO new deps this slice (JSON store replaces pg — critique ruling). N8N community (Docker, sqlite, pinned image tag recorded in AI_LOG) on the box. Apps Script vanilla.
3. Secrets: never committed. Generate `WEBHOOK_TOKEN`, `EXECUTIONS_AUTH_TOKEN` via `openssl rand -hex 32`; phone `.env.local` (gitignored) and box `/opt/eterna/.env` (outside repo). `.env.example` stays empty (existing 4 vars; `N8N_API_KEY` becomes OPTIONAL — REQUIRED list = N8N_BASE_URL, WEBHOOK_TOKEN, EXECUTIONS_AUTH_TOKEN; documented in lib/env.ts comments? No comments — in README env table).
4. Honesty: real data only, or explicitly labeled. "Telegram notify" appears ONLY as "pending" labels. `[DEMO]` prefix in Sheets. Public endpoints strip PII (no names/emails/payloads).
5. Repo rules: conventional commits + AI-pairing tag; worktree only; PR flow with CI green (gitleaks included) before merge; no code comments; TS strict.
6. Files may live under: app/, components/, lib/, public/, docs/, .github/, root configs. `data/` is runtime state: gitignored (add to .gitignore in Task 3).
7. DoD split (v2): **Controller-core DoD** (must pass without user): phone curl → n8n 200 with HMAC; execution row in JSON store (received→dispatched on 200); authed /api/executions works; public mirror renders; build/lint/typecheck green; CI green; merged via PR. **User-gated DoD** (passes once user completes browser checklist): workflow actually imported+active, [DEMO] sheet row exists (verified by phone curl to the log endpoint with the shared token), enrichment data in the sheet. The slice PR is honest about which DoD is met.

## Task 1: Provision oracle-old — N8N (sqlite) + connectivity + firewall checklist

Goal: N8N running on the box, reachable from the phone, owner login + API key set (user step), 5678 open (user step via OCI console).

Files: none in repo (box: /opt/eterna/{compose.yml, .env}; documented in docs/). Pin image tag; record exact tag in AI_LOG.

Requirements:
1. Disk audit first: `df -h /`, `docker system df`, `du -sh /var/lib/docker/*` (find the 88%); prune ONLY unused images/volumes with explicit filters; never remove containers other than ours; record before/after in AI_LOG. Target ≥3G free.
2. /opt/eterna/compose.yml: n8nio/n8n:<pinned tag> (community), volumes for ~/.n8n, env: N8N_ENCRYPTION_KEY (generated), N8N_USER_MANAGEMENT_JWT_SECRET (generated), N8N_TASK_RUNNERS_ENABLED=false (small box, honesty: keep simple), GENERIC_TIMEZONE=Asia/Jakarta. sqlite (default) — no DB service.
3. `docker compose up -d`; from the box: `curl -s localhost:5678/healthz` = ok.
4. User checklist item A (OCI console): security list inbound TCP 5678. Verify from phone: `curl -sI http://168.110.203.180:5678` → 200/302 (n8n responds).
5. User checklist item B: open n8n in browser, create owner account, generate an API key (Settings → API keys) — paste into phone .env.local as N8N_API_KEY (optional this slice; required P5).

DoD (controller): compose up, healthz 200 via ssh, 5678 reachable from phone, disk audited + logged.

## Task 2: Apps Script — log endpoint (code + setup checklist)

Goal: single `doPost` endpoint appending [DEMO] rows, token-gated; user-deployable in ~5 browser minutes.

Files: docs/apps-script-setup.md (full script + checklist + example-row markdown table), no other repo code.

Requirements:
1. Script: `doPost(e)`: require `e.parameter.token` === PropertiesService.getScriptProperties().getProperty("APPS_SCRIPT_TOKEN") (401 otherwise); require action=log; append row [DEMO, ts, executionId, name, email, company, domain, registrar, created, updated, status, nameservers] to spreadsheet "ET-48 OPS — leads" tab "DEMO leads"; return {ok:true, row}. Set the token property during deploy (checklist step).
2. Doc contains: script, step-by-step deploy (Extensions → Apps Script, paste, deploy web app: Execute as me, Access anyone), token setup, **curl examples with `Content-Type: text/plain`** (JSON content-type triggers Apps Script's 302-reject) incl. a failing-token example, and a rendered example row table (visible without sheet access).
3. Verification (user-gated): phone curl to deployed URL with token → {ok:true}; row appears in sheet (user confirms or shares URL).

DoD: doc complete; endpoint verified once user deploys (user-gated).

## Task 3: Next.js — JSON store, /api/lead proxy (HMAC), /api/executions + public mirror

Goal: hardened ingestion + real execution records.

Files: lib/store.ts (new), lib/crypto.ts (new), lib/env.ts (REQUIRED = N8N_BASE_URL, WEBHOOK_TOKEN, EXECUTIONS_AUTH_TOKEN; N8N_API_KEY + APPS_SCRIPT_URL optional), app/api/lead/route.ts (new), app/api/executions/route.ts (new), app/api/executions/public/route.ts (new), .gitignore (add data/), .env.local (local, gitignored).

Requirements:
1. lib/store.ts: JSON file store at data/executions.json (gitignored); `listExecutions(limit)`, `createExecution(row)`, `updateExecution(id, patch)`; atomic write (tmp file + rename); 100-row cap (drop oldest); lazy load; module import safe (no I/O at import — CI build must not need the file).
2. lib/crypto.ts: `hmacHex(secret, message)`, `verifyHmac(secret, message, provided)` with `crypto.timingSafeEqual`; `nowMin()`/window helper (5 min).
3. POST /api/lead: validate {name, email, company?, message} (email regex, length caps), honeypot `website` must be empty; executionId = crypto.randomUUID(); createExecution(status=received, stage="queued"); HMAC = hmacHex(WEBHOOK_TOKEN, `${executionId}.${nonce}.${ts}`) with fresh nonce/ts; POST `${N8N_BASE_URL}/webhook/lead` JSON {executionId, name, email, company, message} + headers X-Nonce/X-Ts/X-HMAC; 10s timeout; 2xx → updateExecution(status=dispatched, stage="dispatched"), return {ok:true, executionId}; non-2xx → status=failed + honest error, return 502 {ok:false, error:"pipeline unavailable"}. If env empty (dev without .env.local): honest 503 {ok:false, error:"pipeline not configured"}.
4. GET /api/executions: Bearer EXECUTIONS_AUTH_TOKEN (401 otherwise); whitelist: id, status, stage, created_at, updated_at (no payload); LIMIT 50 newest first.
5. GET /api/executions/public: NO auth; last 10 rows: id (first 8 chars), status, stage, created_at; NO names/emails/company/payload. Honest public telemetry for the demo/README.
6. lib/env.ts: REQUIRED shrinks to 3 (documented in README env table); validateEnv still prod-throws.
7. Verification: build/lint/typecheck green; curl: /api/lead → row created (status received then dispatched when n8n answers 2xx — with real workflow absent, expect failed until Task 4; use a stub? NO — honest: verify received+failed path first, dispatched path lands with Task 4); /api/executions 401/200; /api/executions/public 200 without auth; store file created under data/ and NOT tracked by git (git check-ignore).

DoD: all endpoints verified; store gitignored; build green.

## Task 4: N8N workflow — HMAC verify → enrich (RDAP) → log → 200 (headless import)

Goal: the workflow that makes the pipeline real.

Files: docs/n8n-workflow.json (export), docs/n8n-workflow.md (notes + ASCII diagram: webhook → verify-hmac → enrich → log → 200).

Requirements:
1. Workflow "ET-48 lead pipeline": Webhook node POST /webhook/lead (respond: 200) → Code node "verify-hmac": recompute hmacHex(WEBHOOK_TOKEN, `${body.executionId}.${header.X-Nonce}.${header.X-Ts}`), timing-safe, reject 401; freshness ≤5 min. (Webhook node exposes headers to Code node in n8n community — verify in the import test; if headers aren't exposed, fallback: sign over body fields only and document — adapt, don't block.) → HTTP node GET `https://rdap.org/domain/<domain-from-email>` (public, no secrets) → Code node "map": pick registrar/created/updated/status/nameservers → HTTP node POST `${APPS_SCRIPT_URL}?action=log` body {token: APPS_SCRIPT_TOKEN, executionId, name, email, company, domain, enrich...} with `Content-Type: text/plain` (Apps Script quirk) → Respond 200 {ok:true, executionId}. Error path: log error node (console) + 200 with {ok:false, error} (no retry loops this slice).
2. Box env (/opt/eterna/.env, not repo): WEBHOOK_TOKEN, APPS_SCRIPT_URL, APPS_SCRIPT_TOKEN — same values as phone/script properties. compose passes them to the container.
3. Import (headless, phone): `docker exec <c> n8n import:workflow --input=/home/node/workflow.json` (volume-mount the export) + `n8n update:workflow --id=<id> --active=true`; record workflow id in AI_LOG.
4. Verification (controller-core): phone curl POST 5678/webhook/lead WITH valid HMAC headers → 200 {ok:true}; without/with-wrong HMAC → 401. (Apps Script URL may be absent pre-deploy → expect 500-on-log path; curl a second time AFTER user deploys to confirm sheet row — user-gated.)
5. Verification (user-gated): sheet row appears (phone curl to log endpoint with token; user confirms).

DoD: workflow imported+active on the box (controller verifies via `n8n list:workflow`), HMAC 401/200 behavior proven, [DEMO] row confirmed when user deploys.

## Task 5: Docs + AI_LOG

Files: ARCHITECTURE.md, README.md, AI_LOG.md (S003).

Requirements:
1. ARCHITECTURE.md: oracle-old x86_64 replaces "Ampere A1 ARM64"; data flow updated (lead → HMAC proxy → n8n sqlite → RDAP → Apps Script log → [DEMO] sheet; callbacks/Postgres/Telegram = P3/P5); security notes (HMAC canonical fields + freshness, bearer tokens, token-gated Apps Script, 5678-only exposure + hardening roadmap); P5 migration note (Postgres + stage callbacks).
2. README: SCRUB front-matter claims — replace "Telegram notify → live report card" with slice-accurate copy ("Telegram: pending"); add "what this slice proves" 3 bullets (real EMPWR-pattern pipeline: form → HMAC-verified webhook → self-hosted N8N → RDAP enrichment → Apps Script audit trail); business-value paragraph (RDAP = lead qualification, Sheets = client compliance audit trail — the EMPWR pattern); env tables split PHONE vs BOX with counts correct (phone 4: N8N_BASE_URL, WEBHOOK_TOKEN, EXECUTIONS_AUTH_TOKEN, N8N_API_KEY-optional; box: WEBHOOK_TOKEN, APPS_SCRIPT_URL, APPS_SCRIPT_TOKEN, N8N_ENCRYPTION_KEY, N8N_USER_MANAGEMENT_JWT_SECRET); port-exposure labeled tradeoff (5678 public, 5432 closed).
3. AI_LOG S003: this slice incl. adaptations (sqlite+JSON store decision, HMAC canonical-fields fix, headless import, disk audit numbers, pinned n8n tag).
4. Verification: no dangling refs; grep README for "Telegram" shows only "pending" context.

DoD: docs accurate + honest; AI_LOG S003 present.

## Task 6: Final branch review + PR merge

Controller: build/lint/typecheck, conventional-commit check, whole-branch review dispatch, fix cycle, push → PR → CI green → merge (GitHub UI/API). PR body: summary, verification evidence (curl transcripts), honest not-yet list (user-gated items, P3/P5 deferrals).

## Definition of Done (split, per Global Constraint 7)

- Controller-core: lead → HMAC-verified n8n 200; JSON store rows (received/dispatched/failed); authed + public execution endpoints; build/lint/typecheck + CI green; merged via PR with the honest not-yet list.
- User-gated: n8n owner login + API key set; workflow active; [DEMO] sheet row verified.
