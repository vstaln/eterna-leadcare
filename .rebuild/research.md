# RESEARCH.md — Eterna rebuild (lead + research findings)

## 1. React Bits (shadcn registry) — CONFIRMED
- Registry URL: https://www.reactbits.dev/r/registry.json
- components.json entry: "registries": { "@react-bits": "https://www.reactbits.dev/r/{name}" }
- Add via: npx shadcn@latest add "@react-bits/SplitText-TS-TW" (or plain "SplitText-TS-TW" once registry is set)
- Component names use -TS-TW suffix for TypeScript + Tailwind v4 variants:
  - SplitText-TS-TW        → deps: gsap@^3.13.0, @gsap/react@^2.1.2
  - BlurText-TS-TW         → deps: motion@^12.23.12
  - AnimatedContent-TS-TW  → deps: gsap@^3.13.0
  - SpotlightCard-TS-TW    → deps: none
  - TiltedCard-TS-TW       → deps: motion@^12.23.12
  - CountUp-TS-TW          → deps: motion@^12.23.12
  - Aurora-TS-TW           → deps: ogl@^1.0.11  (HEAVY ~100kb — SKIPPED, CSS aurora instead)
  - Particles-TS-TW        → deps: ogl@^1.0.11  (HEAVY — SKIPPED, CSS aurora instead)
- All -TS-TW variants have empty registryDependencies (single self-contained .tsx file).
- SSR caveat: all are client components ("use client"); wrap them in client wrapper components and import the wrappers from server components.

## 2. Tailark OSS blocks — CONFIRMED (inspiration only; hand-rolled fallback used)
- Registry URL: https://oss.tailark.com/r/registry.json (namespace "Tailark Base", homepage tailark.com)
- components.json entry: "registries": { "@tailark-oss": "https://oss.tailark.com/r/{name}" }
- Add via: npx shadcn@latest add @tailark-oss/<block-name>
- 259 items; kits by prefix: veil-* (71), dusk-* (84), mist-* (72), core-* (27). NO free/pro marker in the registry file.
- Block names verified:
  - hero: veil-hero-section-1..5, dusk-hero-section-1..10, mist-hero-section-1..6 (+ -header parts)
  - features: veil-features-1..3, dusk-features-1..7, mist-features-1..11
  - stats: veil-stats-1..4, dusk-stats-1..2, mist-stats-1..4
  - cta: veil-call-to-action-1..4, dusk-call-to-action-1..2, mist-call-to-action-1..3
  - testimonials: veil-1..4 / dusk-1..2 / mist-1..5; logo clouds: veil-1..2 / dusk-1..4 / mist-1..2; footer: veil-1..6 / dusk-1..2 / mist-1..4
  - No "badge" or "spotlight" items; card primitives: veil-card, dusk-card, mist-card, mist-hover-card
- DECISION: blocks pull many registryDependencies (headers, logo-clouds, etc.) that risk Tailwind v4/registry failures and bloat. Per SPEC fallback clause, structure is hand-rolled following Tailark block patterns (hero grid, features grid, stat strip, CTA split) using shadcn primitives. Look stays consistent with the zinc/emerald tokens.

## 3. shadcn/ui CLI — CONFIRMED
- npx shadcn@latest add ... installs components into components/ui/ per components.json aliases (components: @/components, ui: @/components/ui, utils: @/lib/utils).
- Base color neutral, new-york style, RSC true, icons lucide.

## 4. driver.js — CONFIRMED
- v1.8.0 installed. Lazy-load ONLY on click via dynamic(() => import("driver.js")) in a "use client" component; CSS via static import 'driver.js/dist/driver.css' at module top.
- API: createDriver({ showProgress, showButtons, popoverClass, overlayColor, stagePadding, allowClose, disableActiveInteraction, nextBtnText, prevBtnText, doneBtnText }).drive().
- driver.js handles Escape/overlay-click close; add aria-label + focus-visible on trigger.
