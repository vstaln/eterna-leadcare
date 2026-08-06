# Plan: Scaffold & Foundation — Eterna Ops Command Center

Plan file: docs/superpowers/plans/2026-08-06-scaffold-foundation.md
Branch: feat/scaffold-nextjs · Worktree: .worktrees/scaffold-nextjs · Window: 48h (this slice: ~8-10h)
Process: subagent-driven-development (fresh implementer per task, task review after each, final branch review)

## Overview

Build the foundation of "Eterna Ops Command Center" — the Next.js app that will become the front door (Branch B: phone-only operator, hand-coded Next.js landing, NO Webflow iframe) and the ops layer (live pipeline demo, Live Ops, Behind the Scenes) for the Eterna Indonesia Lead Automation & Web Engineer hiring showcase. This plan covers: scaffold, design tokens, layout/nav/hero shell, health endpoint + env stub, CI, docs. The N8N pipeline, Oracle VM, Apps Script, and deploy are LATER plans — do not build them here.

## Global Constraints (binding — reviewers check against these)

1. Environment: Termux aarch64, Node 26, npm 11. All commands must run headless (no GUI browser). Never require interactive prompts; use flags. Local Docker does NOT exist — no Docker work in this plan.
2. Stack (locked): Next.js 16 (App Router, TypeScript strict, Turbopack), Tailwind CSS v4, lucide-react, next-themes, motion, sonner, recharts, @xyflow/react, dialkit (devDependency). NO other new dependencies without a plan-level ruling. Use npm only.
3. Design DNA (exact tokens, enforced):
   - Colors: base #09090b (zinc-950), surface #18181b (zinc-900), border #27272a (zinc-800), text #f4f4f5 (zinc-100), muted #a1a1aa (zinc-400), ok #4ade80, warn #fbbf24, err #f87171, live #34d399.
   - NO purple/violet gradients anywhere. NO Inter font. Fonts: display/body use system stack `system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`; mono/data uses `ui-monospace, 'SF Mono', 'Cascadia Code', 'JetBrains Mono', Menlo, monospace`. (Geist self-hosting deferred — offline-safe.)
   - Texture: subtle background grid (1px lines at 32px, color rgba(255,255,255,0.04)) + optional scanline overlay (repeating-linear-gradient, opacity 0.03) via CSS classes in globals.css.
   - Type scale: display = clamp(2.5rem, 6vw, 4.5rem) weight 700 letter-spacing -0.03em; h2 = 1.5rem weight 600; body = 1rem line-height 1.6; data/labels = 0.875rem mono.
   - Spacing: 4px grid; section vertical padding 4rem; max content width 72rem, centered.
   - Motion: micro 150ms ease-out, standard 300ms; status LEDs pulse 2s (CSS keyframes); respect prefers-reduced-motion (disable pulse).
4. Repo rules: conventional commits with AI-pairing tag (e.g. `feat(ui): nav shell (paired with OpenCode)`); work ONLY in the worktree at .worktrees/scaffold-nextjs; never touch main; no secrets in files; no comments in code unless required by a task (repo rule: no gratuitous comments).
5. Component/UI expectations: dark theme only in this slice (theme toggle later); every page must render server-side with no runtime errors (`next build` green); TypeScript strict with zero `any` escapes; ESLint clean.
6. Files may only live under: app/, components/, lib/, public/, docs/superpowers/plans/, plus root config files (package.json, next.config.ts, tsconfig.json, postcss config, eslint config, .gitignore, .env.example, .github/). Anything else requires a ruling.
7. Honesty rule: no mock data presented as real; placeholder UI must be visibly labeled placeholder (e.g. "demo data" badges).

---

## Task 1: Next.js 16 scaffold + locked dependencies

Goal: A working Next.js 16 app at the worktree root, with the locked dependencies installed, buildable and type-clean.

Files: everything create-next-app generates (package.json, app/, components/, lib/, public/, config files), plus .env.example and lib/env.ts stub (see Task 4 for the real env validation — here only create .env.example with N8N_BASE_URL, N8N_API_KEY, WEBHOOK_TOKEN, EXECUTIONS_AUTH_TOKEN as empty placeholders and a comment-free README section note).

Requirements:
1. Scaffold into a temp dir OUTSIDE the repo (e.g. /data/data/com.termux/files/usr/tmp/next-scaffold) with: `npx --yes create-next-app@latest <dir> --ts --tailwind --eslint --app --src-dir=false --import-alias "@/*" --use-npm --yes --turbopack` (adjust flags to whatever current create-next-app accepts non-interactively; if a flag is rejected, adapt — the goal is a non-interactive scaffold of the latest Next 16 with TS+Tailwind+ESLint+App Router).
2. Move ALL generated files (including dotfiles: .gitignore, .eslintrc*, next.config.ts, postcss.config.mjs, etc.) into the worktree root (override conflicts with existing repo files: KEEP the repo's README.md, AI_LOG.md, ARCHITECTURE.md, .gitignore entries — merge .gitignore by appending anything new the scaffold added that is not already present; the scaffold's README.md must NOT replace the repo's).
3. Install locked deps: `npm i lucide-react next-themes motion sonner recharts @xyflow/react` and `npm i -D dialkit`. Verify they appear in package.json.
4. Delete create-next-app boilerplate artifacts: public/next.svg, public/vercel.svg, public/file.svg, public/globe.svg, public/window.svg (keep favicon if present); app/page.tsx default content will be replaced in Task 3 (leave a minimal placeholder heading "Eterna Ops Command Center — scaffold" with an explicit visible "placeholder" label); remove the default fonts usage in app/layout.tsx ONLY if it references next/font/google (see Task 2 for fonts) — otherwise leave layout as generated.
5. Set app/page.tsx to be a server component rendering a single `<main>` with the placeholder heading + a `<p>placeholder — being built</p>`.
6. Verification: `npm run build` exits 0; `npm run lint` exits 0; `npm run dev` starts and serves / (check with curl in a background process, then kill it); `npm test` does NOT exist — no test framework this slice (skip; CI uses typecheck+lint+build).

Definition of Done: build+lint green, deps installed, boilerplate cleaned, conflicts resolved, .env.example present, committed as 1-2 conventional commits.

## Task 2: Design tokens + globals.css + font stack

Goal: One shared design-token layer implementing Global Constraints §3, consumed by Tailwind v4 and components.

Files: app/globals.css (rewrite), docs/design-tokens.md (new), optionally tailwind config if v4 needs it (v4 is CSS-first: use @theme in globals.css).

Requirements:
1. globals.css: Tailwind v4 import (`@import "tailwindcss"`), @theme block defining tokens with EXACT values from §3: colors --color-base/surface/border/text/muted/ok/warn/err/live; fonts --font-sans (system stack from §3) and --font-mono; spacing/type/motion notes in docs/design-tokens.md (not in CSS comments — see repo rule).
2. CSS utility classes in globals.css: `.bg-grid` (background-image: linear-gradient lines 32px, rgba(255,255,255,0.04)), `.scanlines` (repeating-linear-gradient, opacity 0.03), `.led-ok/.led-warn/.led-err/.led-live` (12px dot, background = token color, border-radius 9999px, box-shadow glow 0 0 8px <color>40), `.led-live` pulses via @keyframes led-pulse (2s) with `@media (prefers-reduced-motion: reduce)` disabling it.
3. html/body: background base, color text, font-sans, antialiased; `color-scheme: dark`.
4. docs/design-tokens.md: table of every token (name, value, usage) + one-paragraph ART DIRECTION statement (hero hierarchy: display headline + mono status line + CTA; palette rationale: zinc neutrals + traffic-light semantics; why no purple/Inter).
5. Verification: `npm run build` green; grep proof that Inter appears nowhere; tokens referenced by Task 3 components exist (grep class names led-ok, bg-grid).

Definition of Done: tokens applied, docs written, build green, committed.

## Task 3: Root layout + Nav + LiveBadge + hero shell with static SVG pipeline

Goal: The app shell — dark ops-terminal chrome the whole showcase will live in, plus a placeholder hero with a static SVG pipeline diagram (the real react-flow/live version is a LATER plan; here: static SVG, labeled "demo diagram").

Files: app/layout.tsx (rewrite), app/page.tsx (rewrite), components/nav.tsx, components/live-badge.tsx, components/site-footer.tsx, components/hero.tsx, components/pipeline-diagram.tsx, components/section-heading.tsx.

Requirements:
1. layout.tsx: root layout with metadata title "Eterna Ops Command Center" + description (one line: live automation showcase — EMPWR-pattern webhook pipeline), lang="en", dark color-scheme; renders Nav, {children}, SiteFooter; imports globals.css.
2. Nav: fixed top, base bg with 80% opacity + backdrop blur, bottom border border; links: Home (/), Live (/live), Ops (/ops), Behind the Scenes (/behind-the-scenes) — /live, /ops, /behind-the-scenes do NOT exist yet: render them as disabled Nav items with `aria-disabled` + a "soon" mono tag (do NOT create those pages in this task); right side: LiveBadge component.
3. LiveBadge: mono 0.75rem uppercase "SYSTEM: BUILD" in muted + a led-live dot (pulse). Pure server component, no state.
4. hero.tsx (in page.tsx): section with bg-grid + scanlines; mono status line (e.g. "ET-48 // BUILD PHASE 1"), display headline "Eterna Ops Command Center", body copy (2 sentences: what it is — a live, honest automation showcase replicating Eterna's EMPWR webhook pattern; built in 48h on a $0 budget), two buttons: primary (bg ok, base text, hover brightness) "See the pipeline" linking to #pipeline, ghost button "Hire me" disabled with "soon" tag. NO mock stats.
5. pipeline-diagram.tsx: static inline SVG, 5 labeled nodes in a row (Form → API → N8N → Apps Script → Report Card) with connector lines; each node = rect (rounded, border border, surface bg, text mono 0.75rem, muted), Form node border-ok, API node border-live, N8N node border-warn, Apps Script node border-err? NO — status colors are semantic: keep all nodes border + muted labels, connectors muted; add a visible "STATIC PREVIEW — live execution coming in build phase 2" mono tag under it (honesty rule §7). ViewBox 800x160, responsive width 100%, height auto.
6. section-heading.tsx: heading component (mono eyebrow + h2) used by hero ("The Pipeline" section).
7. All components typed, server components by default (no "use client" unless a task explicitly needs it — none do here).
8. Verification: `npm run build` + `npm run lint` green; curl the dev server home page and grep for "Eterna Ops Command Center" and "STATIC PREVIEW".

Definition of Done: shell renders, honest placeholder labels everywhere, build+lint green, committed.

## Task 4: /api/health + env validation stub + CI workflow (ci.yml + gitleaks)

Goal: A health endpoint proving the app runs in production-like conditions, env-var validation infrastructure (stub — wired for real in the pipeline plan), and CI that gates every PR: typecheck, lint, build, secret scan.

Files: app/api/health/route.ts, lib/env.ts, .env.example (exists from Task 1 — ensure all four vars present), .github/workflows/ci.yml.

Requirements:
1. app/api/health/route.ts: GET handler returning 200 JSON `{ status: "ok", uptime: <seconds since process start as number>, ts: <ISO string> }`. Compute uptime from a module-level `const started = Date.now()`.
2. lib/env.ts: export `env` object + `validateEnv()` that reads process.env for N8N_BASE_URL, N8N_API_KEY, WEBHOOK_TOKEN, EXECUTIONS_AUTH_TOKEN; when any is missing: if NODE_ENV === "production" throw Error listing missing vars; else return the object with empty strings. Export `NODE_ENV`. Do NOT log values. TypeScript strict-safe.
3. .env.example: all four vars, empty values, one-line comments (comments allowed here — it is a docs file).
4. .github/workflows/ci.yml: trigger on pull_request + push to main; jobs: ci — runs on ubuntu-latest; steps: checkout@v4, setup-node@v4 with node 26? (GitHub runners have node 22/24 — use "22" — plan-safe: Node 22 works for Next 16), npm ci (requires package-lock committed — ensure it is), `npm run lint`, `npx tsc --noEmit` (if no dedicated typecheck script, add "typecheck": "tsc --noEmit" to package.json scripts), `npm run build`; then a secret-scan step using gitleaks/gitleaks-action@v2 (fail on any finding).
5. Verification: from the worktree, `npx tsc --noEmit` green, `npm run build` green; simulate prod env check: `NODE_ENV=production node -e "require('./lib/env')"` — NOTE: lib/env.ts is TS; instead verify via `npx tsx -e` if tsx is present, else assert the logic by reading (state in report that prod-throw was verified by unit reasoning + one tsx run if available — do not add tsx as a dependency).

Definition of Done: CI file valid (use `npx actionlint`? not installed — validate by careful review + yaml parse via node if available), health route works, env stub behaves, committed.

## Task 5: Docs + AI_LOG + commit convention

Goal: Repo documentation reflects the branch-B direction; AI_LOG gets the session entry; README quickstart updated for the scaffold.

Files: README.md (edit), ARCHITECTURE.md (edit), AI_LOG.md (append), .gitmessage (exists — no change).

Requirements:
1. README: update Quickstart to reflect the scaffold (npm ci, npm run dev, npm run build, npm run lint); update "Repo layout" to include docs/design-tokens.md; no other rewrites.
2. ARCHITECTURE.md: replace the stub with: current slice status ("Phase 1 of ET-48 v2 — scaffold & foundation; pipeline/Webflow/deploy in later phases"), the Branch B note (phone-only operator: Next.js front door, Webflow = template one-pager + migration plan, no iframe), pointer to docs/superpowers/plans/2026-08-06-scaffold-foundation.md and docs/design-tokens.md. Keep the existing ASCII flow diagram (it describes the target architecture — still accurate).
3. AI_LOG.md: append entry S002 — scaffold & foundation slice (tool: OpenCode; goal: scaffold + design tokens + shell + CI; prompt: one-line summary of the driver prompt; changed: list files; verified: build/lint/typecheck green, CI committed). Follow the existing S001 format. Log the failure/adaptation if create-next-app flags needed adjusting (honesty rule).
4. Verification: docs render consistent (no dangling references — grep that referenced files exist).

Definition of Done: docs accurate, AI_LOG S002 present, committed.

---

## Task 6: Final branch self-check (controller-run after reviews)

Controller runs `npm run build && npm run lint && npx tsc --noEmit` in the worktree, verifies `git log` conventional commits, then requests the final whole-branch code review. No implementer dispatch.
