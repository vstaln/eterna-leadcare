# Eterna Rebrand + Functionalization Plan (LeadCare)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebrand the eterna-ops-command-center from a jargon dossier ("APPLICATION DOSSIER // HMAC GATE // RDAP // N/R flags") into a product story any HR person can understand in 30 seconds — while keeping every line of working infrastructure (HMAC-signed intake, n8n, execution store, ops dashboard) intact underneath.

**Architecture:** Problem-first product framing on top of the existing pipeline. Jargon becomes the *internals*; plain English becomes the *surface*. One-line pitch: "Every form submission gets checked, looked up, logged, and shown live — so a client always knows where their leads go."

**Tech Stack:** Next.js 16 (unchanged), n8n (unchanged), Google Apps Script (unchanged), Webflow one-pager (new, per JD), Oracle Cloud (unchanged).

## Global Constraints

- DO NOT touch: the pipeline internals (`app/api/lead`, `lib/crypto`, `lib/store`, n8n workflow, execution store) — the rebrand is surface + docs, the engine stays.
- Never remove the honesty principle: no fake "live" claims, no invented numbers. `live-badge` already fetches `/api/health` — keep that pattern.
- All existing routes/APIs keep working (`/api/lead`, `/api/executions`, `/api/health`, `/ops`, `/behind-the-scenes`).
- Copy: plain English on the surface; engineering detail demoted to small print / docs.
- Webflow one-pager stays a separate artifact (locked decision in ARCHITECTURE.md — no iframe).

---

## Task 1: Decision gate — pick the direction

The Zed thread ended on this question. THIS MUST BE ANSWERED BY THE USER BEFORE EXECUTION:

- **A — Full LeadCare rebrand:** product presented as "what Eterna could ship to clients" (strongest for hiring team)
- **B — "The demo is the pitch":** keep it as an application, every section leads with problem + plain-English value, jargon in small print
- **C — Blend:** product framing but explicitly labeled "built as my application for Eterna"

- [ ] **Step 1:** Ask user A/B/C. Record the choice in `ARCHITECTURE.md` (replace the current "Phase 3 of ET-48" status intro with the chosen framing).
- [ ] **Step 2:** Commit nothing yet — wait for Task 2 to bundle the copy change.

---

## Task 2: Home page — problem-first copy rewrite

**Files:**
- Modify: `app/page.tsx`
- Modify: `components/hero.tsx`, `components/hero-animated.tsx` (only the copy strings, NOT animation logic)

**Interfaces:** unchanged — same sections, same components, same ids (tour steps depend on `#hero #about #role #fit #demo #ops-link #contact`).

- [ ] **Step 1:** Hero — replace "APPLICATION DOSSIER // ETERNA INDONESIA" eyebrow and headline with the LeadCare framing per chosen direction:
  - Eyebrow (A): `ET-48 // ETERNA LEADCARE — DEMO PRODUCT`
  - Headline (A): "Never lose a lead to the void again." (SplitText animation stays)
  - Eyebrow (B): `ET-48 // LEAD HANDLING, PROVEN LIVE`
  - Headline (B): "Every lead, accounted for — here's how."
  - Sub-line: "When a visitor fills a form on a client's site, does anyone actually know what happened to that lead? This system answers that — automatically, for every submission."
- [ ] **Step 2:** About section — replace skill-list cards with the problem story (3 cards, plain English):
  1. "The problem" — agencies lose leads between form-submitted and follow-up
  2. "The fix" — every submission checked, looked up, logged, shown live
  3. "The proof" — the whole thing runs right here, real data, nothing simulated
- [ ] **Step 3:** Role section — keep the facts (role title, salary, remote, U.S. client) but retitle from "The role I am applying for" per direction A: "Why this demo exists" (A) or keep as-is (B).
- [ ] **Step 4:** Fit section — retitle "Why I am a strong fit" → keep the JD-mapping cards BUT rewrite each "The role asks" copy to plain-English product sentences (spam shield, lead intelligence, the receipt, the ping, client view — from the jargon→value table).
- [ ] **Step 5:** Demo/Contact sections — update `ApplicationForm` caption ("This form is a live demo" → "This form IS the pipeline — submit it and watch a real lead flow through"). Keep the form itself untouched.
- [ ] **Step 6: Verify** — `npm run typecheck` + `npm run lint` on the laptop; `npm run build` must pass; the tour (`components/driver-tour.tsx`) step copy must still match the section ids (update driver-tour copy text if any section title changed, but NOT the ids).

---

## Task 3: Ops dashboard — rename stages, keep honesty

**Files:**
- Modify: `app/ops/page.tsx`
- Modify: `app/ops/page.tsx` stage data (stageStates function only)

**Interfaces:** route, URL, and response shapes unchanged. `/ops` must still render the REAL store data.

- [ ] **Step 1:** Rename stage names + notes in `stageStates()` (internal labels only, per the jargon→value table):
  - `FORM` → `INTAKE` (note: "the form on the landing page posts here")
  - `HMAC GATE` → `SPAM SHIELD` (note: "proves each submission is genuine; rejects bots")
  - `N8N` → `ASSEMBLY LINE` (note: "routes every lead: shield → lookup → receipt → ping")
  - `RDAP` → `LEAD LOOKUP` (note: "who is this? real company, real domain, how old")
  - `APPS SCRIPT` → `RECEIPT` (note: "every lead auto-logged to the spreadsheet")
- [ ] **Step 2:** Section headings: "Is it real?" stays; "What's still missing?" stays; add one plain-English explainer line under the page title: "Every row below is a real submission that went through this pipeline. Nothing here is simulated."
- [ ] **Step 3:** Keep all LED colors, state vocabulary, N/R flags, DEGRADED banner — honesty is the differentiator, do not touch.
- [ ] **Step 4: Verify** — typecheck + lint + build; spot-check `/ops` renders the same data.

---

## Task 4: Webflow one-pager — the LeadCare landing page

**Files:**
- Modify: `webflow/one-pager.html` (the standalone artifact)
- Modify: `docs/webflow-migration.md` (update copy outline to the rebrand)

**Interfaces:** none — standalone HTML, imported into Webflow by the user.

- [ ] **Step 1:** Rewrite `one-pager.html` copy to LeadCare:
  - Hero: eyebrow `ETERNA LEADCARE`, headline "Where did that lead go?" + status strip using the same vocabulary as `/ops` (CONFIGURED/PENDING/N/R)
  - What it is: one paragraph — "a demo product: every form submission is checked for bots, looked up for intelligence, logged to a spreadsheet, and shown live on a dashboard"
  - Pipeline: five stages as horizontal step row — `INTAKE → SPAM SHIELD → ASSEMBLY LINE → LEAD LOOKUP → RECEIPT` (MUST match ops dashboard names verbatim)
  - Proof: link to `eterna.vstal.in/ops` (the live report card) + GitHub + one screenshot placeholder
  - CTA: "Try it — submit a demo lead" → links to the Next.js site intake + mailto. No Webflow forms (the intake lives in the app).
- [ ] **Step 2:** Update `docs/webflow-migration.md` — replace the old outline with the LeadCare outline + the jargon→value table; keep the migration checklist (export assets, rebuild sections, staging preview, check links).
- [ ] **Step 3:** Note in the doc: stage names must stay verbatim across Webflow and `/ops` — one source of truth for the five names lives in `app/ops/page.tsx`.

---

## Task 5: Docs — README + behind-the-scenes + ARCHITECTURE

**Files:**
- Modify: `README.md`
- Modify: `app/behind-the-scenes/page.tsx` (copy only)
- Modify: `ARCHITECTURE.md`

**Interfaces:** none.

- [ ] **Step 1:** README — new first section: "What problem does this solve?" (3 sentences, HR-safe, from the plan header). The jargon (HMAC, RDAP, N/R) moves below as "How it works — for engineers."
- [ ] **Step 2:** behind-the-scenes page — the page's intro should lead with the problem story; keep the build-log sections (git/CI/cost) but retitle the heading to fit the product framing.
- [ ] **Step 3:** ARCHITECTURE.md — record the chosen direction (A/B/C), keep the technical architecture, add the jargon→value table as the "naming map".
- [ ] **Step 4: Verify** — typecheck + lint + build.

---

## Task 6: The HR script + final verification

**Files:**
- Create: `docs/hr-script.md`
- Verify: full app

- [ ] **Step 1:** Write `docs/hr-script.md` — the literal script the user can read to HR:
  - 1-line pitch
  - 3-sentence story
  - The jargon→value table (what you built → what it's called → what it does)
  - "Why every skill fits": Webflow (client page), Next.js (dashboard), n8n (assembly line), Apps Script (receipt), Oracle Cloud (always-on), AI-assisted (built with AI, about automating human work)
  - Suggested answers to likely questions ("is it live? yes — eterna.vstal.in/ops", "did you build this alone? yes, in 48 hours, from a phone, $0")
- [ ] **Step 2:** Full verification on laptop: `npm run typecheck`, `npm run lint`, `npm run build` — all pass.
- [ ] **Step 3:** `git add -A` + commit on `simplify-eternanew` (or new branch `rebrand-leadcare`), message: `feat: leadcare rebrand — problem-first copy, ops stage renames, webflow one-pager, hr script`.
- [ ] **Step 4:** Report LOC/copy delta + the final HR script to the user.

---

## Follow-ups (not in this plan)

- Webflow designer session (user-gated — the one-pager HTML is the handoff)
- Telegram ping (P5, documented, deferred)
- N8N owner API key (P5, user-gated)
- 5678 exposure (user-gated, OCI security list)
