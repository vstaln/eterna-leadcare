# Eternanew Code Simplification Plan (Ponytail Method)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Simplify the eterna-ops-command-center codebase by ~30-40% (LOC and complexity) while preserving exact visual behavior and all API contracts.

**Architecture:** Ponytail method — one parallel agent per file-disjoint slice of the codebase. The controller creates the shared contract file (`lib/time.ts`) first; agents then work in parallel without touching each other's files. Integration syncs to the laptop and verifies with lint/typecheck/build.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript 5, Tailwind 4, GSAP, motion, radix-ui.

## Global Constraints

- DO NOT modify: `.env`, `data/executions.json`, `public/`, `docs/`, `deploy/`, `webflow/`, `Dockerfile`, CI workflows, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`.
- DO NOT read or print `.env` contents (secrets). Never commit secrets.
- All exports already imported elsewhere must keep their exact signatures (external API freeze). Only internal/private helpers may change.
- Preserve exact rendered output: same copy, same classes, same structure. This is a refactor, not a redesign.
- After every slice: files must still typecheck (`npx tsc --noEmit`) against the rest of the tree.
- One agent per slice; slices own disjoint files. Never edit a file another slice owns.

---

## Task 0 (controller, not a subagent): Baseline contract + repo state

**Files:**
- Create: `lib/time.ts` (new shared helpers — extracted verbatim from existing code, zero behavior change)
- Verify: `git status` clean-ish on laptop, node/npm availability

- [ ] **Step 1: Create `lib/time.ts`** with these exports (exact names, used by Agents 1-2):

```ts
export function relativeAge(iso: string, now: number): string; // "now" | "5m ago" | "3h ago" | "2d ago"
export function shortIso(iso: string): string;                 // "2026-08-07 22:03:11"
export function clock(): { now: number; iso: string };         // { now: Date.now(), iso: new Date().toISOString() }
export const statusLed: Record<string, string>;                // received/dispatched/failed -> led-*
export const statusColor: Record<string, string>;              // received/dispatched/failed -> text-*
```

Source of truth (verbatim from existing files): `components/hero-data-panel.tsx:4-29` and `app/ops/page.tsx:88-105`.

- [ ] **Step 2: Confirm laptop toolchain.** `sudo xbps-install -Sy nodejs` if node is missing (needed for verification). Ask user before installing.
- [ ] **Step 3: Create git branch** `simplify-eternanew` in `/home/vstaln/eternanew/app` (never work on main without explicit consent).

---

### Task 1: Ops dashboard dedup (Agent 1)

**Files:**
- Modify: `app/ops/page.tsx`

**Interfaces:**
- Consumes: `relativeAge`, `shortIso`, `clock`, `statusColor` from `lib/time.ts` (Task 0)
- Produces: nothing new — same component, same output

- [ ] **Step 1: Replace duplicated helpers.** Delete the inline `relativeAge`/`shortIso`/`clock`/`stateColor` definitions (lines ~79-105) and import from `@/lib/time`. Note: `stateColor` map must move into `lib/time.ts` as `statusColor` only if keys match exactly (`"STATIC PREVIEW"`, `ENABLED`, `CONFIGURED`, `N/R`, `PENDING`, `DEGRADED` differ from hero panel keys) — if keys differ, keep a local `stateColor` map but delete `relativeAge`/`shortIso`/`clock` imports (shared parts only).
- [ ] **Step 2: Data-drive the ledger section.** The four `<li>` blocks in `#ledger` (5678 EXPOSURE, APPS SCRIPT DEPLOY, N8N OWNER API KEY, TELEGRAM NOTIFY) are near-identical (title, status element, statusLabel, note, description). Replace with a `ledgerItems` array + one `map()` render. Same for the two "user-gated items" rows in `#signal` (identical structure).
- [ ] **Step 3: Verify** — `npx tsc --noEmit` clean; `npm run lint` clean; build output identical structure (spot-check rendered classes).

---

### Task 2: Hero data panel dedup (Agent 2)

**Files:**
- Modify: `components/hero-data-panel.tsx`

**Interfaces:**
- Consumes: `relativeAge`, `clock`, `statusLed`, `statusColor` from `lib/time.ts` (Task 0)
- Produces: nothing new

- [ ] **Step 1: Replace inline helpers** (lines 4-29) with imports from `@/lib/time`. Delete the now-empty local `relativeAge`, `clock`, `statusLed`, `statusColor` definitions.
- [ ] **Step 2: Verify** — `npx tsc --noEmit` clean; `npm run lint` clean.

---

### Task 3: Animation components trim (Agent 3)

**Files:**
- Modify: `components/AnimatedContent.tsx`
- Modify: `components/SpotlightCard.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: none new
- Produces: `AnimatedContent` and `SpotlightCard` keep their existing props signatures (page.tsx uses `distance={24} duration={0.7} className="h-full"` and `spotlightColor` + `className`)

- [ ] **Step 1: Slim `AnimatedContent.tsx` (137 lines).** `app/page.tsx` is its only consumer and only passes `distance`, `duration`, `className`. Remove unused props and behavior: `container`, `direction`, `reverse`, `scale`, `initialOpacity`, `animateOpacity`, `delay`, `disappearAfter`, `disappearDuration`, `disappearEase`, `onComplete`, `onDisappearanceComplete`. Keep the scroll-triggered fade-up (ScrollTrigger + timeline) as a simple component. Target: ~50 lines, same visual result.
- [ ] **Step 2: Slim `SpotlightCard.tsx` (71 lines).** Merge `handleFocus`/`handleBlur`/`handleMouseEnter`/`handleMouseLeave` into one enter/leave pair (focus state can derive from mouse events; keep keyboard focus behavior). Keep the spotlight gradient. Target: ~45 lines, same behavior.
- [ ] **Step 3: Update `app/page.tsx`** only if prop names changed — prefer keeping prop names so no consumer edit is needed.
- [ ] **Step 4: Verify** — `npx tsc --noEmit` clean; `npm run lint` clean.

---

### Task 4: API routes + lib cleanup (Agent 4)

**Files:**
- Modify: `app/api/lead/route.ts`
- Modify: `app/api/executions/route.ts`
- Modify: `app/api/executions/public/route.ts`
- Modify: `app/api/health/route.ts`
- Modify: `lib/env.ts`
- Modify: `lib/store.ts`
- Modify: `lib/crypto.ts`

**Interfaces:**
- Consumes: nothing new
- Produces: existing exports unchanged (`POST`/`GET` handlers, `createExecution`, `updateExecution`, `listExecutions`, `hmacHex`, `verifyHmac`, `env`, `validateEnv`)

- [ ] **Step 1: `lib/env.ts`** — remove the duplication between `REQUIRED` and the hardcoded object in `readEnv()`: build the values object from a single `ENV_DEFS` map. `validateEnv` keeps exact behavior.
- [ ] **Step 2: `lib/crypto.ts`** — `verifyHmac` is used by `api/executions/route.ts` (keep it). Simplify the buffer dance: `timingSafeEqual(Buffer.from(hmacHex(secret, message), "utf8"), Buffer.from(provided, "utf8"))` — one line, guard length mismatch.
- [ ] **Step 3: `lib/store.ts`** — simplify `persist()`/`load()` (cache + tmp-file write is fine but can be tightened); keep the 100-row CAP and all exports.
- [ ] **Step 4: API routes** — remove duplicated bearer-token parsing if it appears twice; keep exact status codes and JSON shapes (they are API contracts: 200/400/401/502/503).
- [ ] **Step 5: Verify** — `npx tsc --noEmit` clean; `npm run lint` clean.

---

### Task 5: Dead files + dependency audit (Agent 5)

**Files:**
- Delete: all `*.bak-*` files in `app/` and `components/` (7 files: `app/layout.tsx.bak-app|hr|role`, `app/page.tsx.bak-app|hr|role`, `components/hero.tsx.bak-app|hr|role`, `components/application-form.tsx.bak-app`, `components/site-footer.tsx.bak-app`)
- Delete: `tsconfig.tsbuildinfo` (build artifact; confirm gitignored first — check `.gitignore`)
- Modify: `package.json`

**Interfaces:**
- Consumes: none
- Produces: cleaned dependency list

- [ ] **Step 1: Delete all `.bak-*` files** after confirming no imports reference them (`grep -r "bak-" app components lib` must return nothing).
- [ ] **Step 2: Dependency audit** — for each runtime dep in `package.json`, verify at least one import exists in `app/`+`components/`+`lib/` (excluding `node_modules`). Candidates for removal if unused: `tw-animate-css` (check globals.css usage), `clsx`/`tailwind-merge` (kept — used by `lib/utils.ts`), `class-variance-authority` (check `ui/*`), `lucide-react` (used in `components/tour.tsx` — keep), `@phosphor-icons/react` (used in hero — keep). Remove only deps with zero imports.
- [ ] **Step 3: Verify** — `npm ls --depth=0` no longer errors; `npx tsc --noEmit` clean.

---

### Task 6: SplitText conservative simplification (Agent 6)

**Files:**
- Modify: `components/SplitText.tsx`

**Interfaces:**
- Consumes: none new
- Produces: same props as before (used by `components/hero-animated.tsx` with `text/tag/textAlign/className/splitType/delay/duration/from/to/threshold`)

- [ ] **Step 1: Simplify without behavior change.** Keep GSAP SplitText + ScrollTrigger char/word animation. Removals: the `animationCompletedRef` re-animation guard may stay, but remove `fontsLoaded` state (wait via `document.fonts.ready.then(...)` directly), collapse the `assignTargets` ladder, and inline `renderTag()`. `ease`/`onLetterAnimationComplete` props stay in the interface (API freeze).
- [ ] **Step 2: Verify** — `npx tsc --noEmit` clean; `npm run lint` clean.

---

## Integration (controller)

- [ ] Sync all changed files from the phone working copy to `/home/vstaln/eternanew/app` on the laptop (scp/rsync over SSH).
- [ ] `cd /home/vstaln/eternanew/app && git add -A && git status` — confirm only intended files changed.
- [ ] Run `npm ci` (or `npm install` if no lockfile change), `npm run lint`, `npm run typecheck`, `npm run build` on the laptop.
- [ ] Fix integration errors (import mismatches between slices) — one fix dispatch, then re-verify.
- [ ] Final review: confirm no slice touched another's files; diff must be strictly deletions + imports + data-driven arrays.
- [ ] Commit per slice on branch `simplify-eternanew` (or one squashed commit), report LOC delta (before/after from `wc -l`).
