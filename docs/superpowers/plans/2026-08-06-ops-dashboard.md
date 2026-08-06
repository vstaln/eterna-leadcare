# P3 — Ops dashboard + /ops page (ET-48 v2, final slice)

Branch: feat/ops-dashboard · Worktree: .worktrees/ops-dashboard · Base: main (3f38d0d) · Window: one session (finish everything feasible)

## Goal
Showcase an honest, phone-built "automation command center": an ops dashboard page (`/ops`) that turns the execution store into a live report card, plus final story polish. This is the last buildable slice; P5 (Telegram notify, stage callbacks, Postgres, public deploy) stays documented-deferred.

## Global Constraints (inherited from P1/P2, binding)
1. Honesty-first: real data only or explicitly labeled; `[DEMO]`/`pending` labels; no fake rows, no fake uptime.
2. $0 budget, phone-only (Termux aarch64, headless): build must run with `node node_modules/next/dist/bin/next build --webpack` (Turbopack has no android bindings) + `export LD_PRELOAD=/data/data/com.termux/files/usr/lib/libtermux-exec.so`; no new native deps; no images/analytics/embeds that need a browser to verify.
3. Secrets never in the repo; reuse lib/env.ts REQUIRED/OPTIONAL pattern; `.env.local` untouched by this slice.
4. No gratuitous comments; conventional commits with AI-pairing tag (`feat(ops): … (paired with OpenCode)`); TypeScript strict, eslint clean, no `any`.
5. Dark terminal-chrome design language from the P1 redesign pass; every page renders server-side with no runtime errors.
6. Public endpoints strip PII: `/ops` shows only what `/api/executions/public` already exposes (first-8 ids + last 10) — no names/emails/payloads beyond the store's public shape.

## Tasks

### Task 1 — Concept (divergent pass)
Apply the installed thinking skills (s4h-analogy-domain-transfer, thinking-triz, s4h-creativity-lateral-thinking, thinking-pre-mortem) to the ops dashboard and the final README/story. Output a short concept doc: the dashboard's core metaphor (e.g., mission-control, hangar, logbook — pick via analogy transfer), KPI set derived from the execution store's honest fields, layout direction matching the terminal chrome, and a pre-mortem risk list for the final showcase. No code.

### Task 2 — /ops page (server-rendered, no auth)
`app/ops/page.tsx` (route group or page — follow existing app/ layout conventions): renders from `/api/executions/public` shape (call `lib/store.ts` directly server-side — no fetch loop to self), sections:
- Pipeline status strip: n8n state is NOT live-known from the phone (n8n has no public status endpoint reachable here) → render an honest "configured/not-yet-public" badge driven by `N8N_BASE_URL`/`N8N_WEBHOOK_PATH` presence, with labeled `pending` for the user-gated items (5678 exposure, Apps Script URL, owner API key). No fake green lights.
- Last-10 execution report card: id slice, status, timestamps, error summary (already stripped of PII by the store).
- Pipeline legend: the 5 honest stages (Form → HMAC gate → N8N → RDAP → Apps Script) with current state per stage, `pending` labels.
- Divergent-pass sections the concept doc lands (keep them honest and small).
`/ops` must be linked from the home page nav (match existing nav conventions from P1 redesign).

### Task 3 — QA sweep (subagent-driven, route-level + E2E)
No headless browser on the phone → QA = (a) `next build --webpack` + eslint + tsc green; (b) dev-server curl suite: all public routes 200 (/, /ops, /api/executions/public), /api/lead validation paths (missing fields 400, honeypot 200-decoy, bad HMAC forward path 502 with stub down), /api/executions 401 without bearer; (c) local n8n-stub E2E (reuse /data/data/com.termux/files/usr/tmp/p2-test/n8n-stub.js): submit lead → store row appears → /ops HTML contains it (grep rendered HTML); (d) edge cases: store 100-cap, public endpoint never leaks email/name/payload. Fix everything found. Document results in QA report.

### Task 4 — Final polish (story + migration docs)
- README: final "what this proves" story pass (EMPWR webhook pattern; honest slice matrix: shipped vs pending vs P5); link /ops.
- `docs/webflow-migration.md`: template one-pager plan + migration checklist (locked decision: Webflow = template one-pager + migration plan only; NO Webflow iframe on the Next.js site). Honest: Webflow build itself is a browser task, documented as user-gated.
- AI_LOG S004 entry in the S001-S003 format.

### Task 5 — Whole-repo final review + ship
Reviewer subagent over the full branch diff (base 3f38d0d..HEAD): spec compliance, honesty, security, a11y (basic: labels, contrast, semantic HTML), no-PII, YAGNI. One fix wave, scoped re-review. Then: push → PR #3 → CI green → squash-merge → delete branch + worktree → verification summary (verification-before-completion: evidence for every claim).

## Verification (DoD)
- `next build --webpack` exit 0, eslint 0, tsc 0.
- QA sweep table: every route+case with status/body, E2E row visible in rendered /ops HTML.
- No PII in public surfaces; no secrets in diff (gitleaks CI green).
- PR #3 merged to main; branch/worktree cleaned; user-gated checklist summarized in the final report.
