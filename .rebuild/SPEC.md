# ETERNA REBUILD — IMPLEMENTATION SPEC

## Goal
Rebuild the homepage of /opt/eterna/app (Next.js 16 App Router, React 19, Tailwind v4, TypeScript) as a first-person job application for the **Lead Automation & Web Engineer** role at **Eterna Indonesia**, using **Tailark free OSS blocks** (structure), **shadcn/ui** (primitives), **React Bits** (motion), and **driver.js** (60-second HR tour). The site must read as THE CANDIDATE applying to Eterna — never as a job board or recruiting page.

## Design Read
"Personal job-application portfolio for a recruiter/hiring team at Eterna Indonesia, with a premium dark-tech editorial language (Linear x Stripe), leaning on the existing Space Grotesk + JetBrains Mono + zinc/emerald tokens."
- DESIGN_VARIANCE 5, MOTION_INTENSITY 4 (purposeful, HR-safe), VISUAL_DENSITY 4.
- No AI-purple gradients, no 3-equal-boring-cards, no animation-everywhere. Motion concentrated in hero + live data panel.

## Tokens (already in app/globals.css)
- Colors: --color-base #09090b, --surface #18181b, --border #27272a, --text #f4f4f5, --muted #c6c6cc, --ok #4ade80, --warn #fbbf24, --err #f87171, --live #34d399.
- shadcn CSS vars already merged into :root (dark-only). Utilities: bg-background, text-foreground, border-border, bg-card, text-muted-foreground, bg-primary, text-primary-foreground, ring etc. work.
- Fonts: Space Grotesk (sans) + JetBrains Mono (mono) via next/font in app/layout.tsx.
- Helpers already present: lib/utils.ts (cn), components.json (with @tailark-oss registry; add @react-bits registry when research confirms the URL).

## Already installed / do NOT reinstall
- deps: driver.js, clsx, tailwind-merge, class-variance-authority, lucide-react, tw-animate-css (npm i done). motion is already a dependency.
- shadcn CLI is available via npx. Components installed by the lead (list will be provided in .rebuild/installed.txt) — check that file first.

## Hard constraints
1. DO NOT modify these files: app/api/* (lead, executions, executions/public, health), app/ops/page.tsx, app/behind-the-scenes/page.tsx, lib/store.ts, lib/crypto.ts, lib/env.ts, next.config.ts, Dockerfile, deploy/, package.json (unless a new dep is truly required — ask first).
2. /ops and /behind-the-scenes must keep working.
3. Keep the site framed as the candidate applying: first-person copy. NO "explore more opportunities", NO "requirements match" as a JD checklist, NO "apply here" as a job offer. The form is a way for the hiring team to reach the candidate.
4. Homepage stays a server component at app/page.tsx; only animation/tour/form components get "use client".
5. Respect prefers-reduced-motion (React Bits components support reducedMotion via props or wrap in MotionConfig reducedMotion="user").

## File plan (create/modify)
- app/page.tsx — server component composing sections below (update imports only).
- components/hero.tsx — server component: hero copy + Tailark hero block pattern (adapted) + <HeroDataPanel/> inside a React Bits TiltedCard wrapper. IMPORTANT: React Bits components are client; wrap them in client wrapper components and import those wrappers from the server hero. Put animated hero pieces in components/hero-animated.tsx ("use client").
- components/hero-data-panel.tsx — keep as server component (reads lib/store), no change to data logic.
- components/application-form.tsx — "use client": rebuild with shadcn Input/Textarea/Button + Label. Same fetch to /api/lead as today. Company field = "Eterna hiring team". Button "Send me a message". Heading inside: "Reach me directly".
- components/section-heading.tsx — small shared heading (kicker + title), server-compatible.
- components/tour.tsx — "use client": driver.js tour. Lazy-load driver.js ONLY on first click (dynamic import). Button labeled "60-second tour" (with Compass or MapPin lucide icon). Steps target element ids: #hero, #about, #role, #fit, #demo, #ops-link, #contact, plus the live panel #live-panel.
- components/pipeline-diagram.tsx — keep visual; you may restyle using shadcn Card but keep the same step labels (Form, API/HMAC, N8N, Store, Report Card).
- components/nav.tsx — keep Home/Ops/Behind the Scenes; add a "Tour" trigger (renders components/tour.tsx trigger) + primary CTA "Contact me" linking #contact. Keep "Live" as disabled soon.
- components/site-footer.tsx — keep, maybe restyle with shadcn Separator; keep text: "ETERNA APPLICATION // eterna.vstal.in" and "© <year> Vstalin — application for Lead Automation & Web Engineer at Eterna Indonesia".
- app/layout.tsx — only metadata changes allowed (title/description/OG). Do NOT change fonts or structure.

## Exact copy (first-person, HR-first)
### Hero (#hero)
- kicker: APPLICATION DOSSIER // ETERNA INDONESIA
- H1: I am applying for the Lead Automation & Web Engineer role.
- sub: My application for Eterna Indonesia, with live, working automation as evidence. I build web experiences, connect systems, and ship faster with AI tools.
- meta badges: Fully remote · Full time · U.S.-based client · Rp13M–Rp18M
- primary CTA: About my application (href #about)
- secondary CTA: 60-second tour (driver.js)
- ghost CTA: See the live automation (href #demo)
### About me (#about)
- title: About me
- body: I am Vstalin, a developer who ships. I build with Next.js, React, and TypeScript, connect systems with automation, and use AI coding tools every day to learn faster. I am applying for the Lead Automation & Web Engineer role because it is exactly the work I want to grow into at Eterna Indonesia: Webflow experiences, N8N automations, cloud infrastructure, and AI-enhanced delivery for global clients.
- 3 cards: Web engineering / Automation / Cloud & AI with the copy already on the current page (check current app/page.tsx).
### The role I am applying for (#role)
- title: The role I am applying for
- lead: This application targets the Lead Automation & Web Engineer position at Eterna Indonesia.
- facts: Role: Lead Automation & Web Engineer · Salary: Rp13.000.000 – Rp18.000.000 · Employment: Full time · Fully remote · Client: U.S.-based client
- note: I am applying through Eterna’s official process; this site is my supporting evidence.
- link: See the official job posting → https://www.eternaindonesia.com/jobs/lead-automation-web-engineer (target _blank rel noreferrer)
### Why I am a strong fit (#fit)
- title: Why I am a strong fit
- 6 cards, each labeled "The role asks" + heading + "What I bring" paragraph (copy on current page; keep verbatim).
### My automation, live (#demo)
- title: My automation, live
- body: This is the kind of workflow I would build and maintain for Eterna, and it is running on this site right now. Every submission follows a visible path with named states.
- PipelineDiagram + links to /ops ("View the ops dashboard") and /behind-the-scenes ("Behind the scenes").
### Contact me about this role (#contact)
- title: Contact me about this role
- body: I have submitted through Eterna’s official application. If you are on the hiring team, I would welcome the chance to talk. Send a note below and it flows through the same visible pipeline this site demonstrates.
- link: See the official job posting ↗
- note: This form is a live demo, not Eterna’s official application.
- form (ApplicationForm)

## React Bits usage (add via shadcn registry — if not yet installed, run the installs first)
- Hero headline: SplitText or BlurText (TS-TW variant), animation on mount, reducedMotion prop on.
- Hero background: Aurora (or Particles) — keep subtle, behind content, pointer-events-none.
- Hero right panel: TiltedCard around HeroDataPanel (fixed aspect container to avoid CLS).
- Section cards (#about, #fit, #role facts): AnimatedContent (fade/translate on scroll) — moderate. SpotlightCard on #fit cards (mouse-follow spotlight).
- Stats (#role facts): CountUp is optional; static text is fine (avoid over-animation).

## Tailark usage
- Use the free OSS blocks (Mist/Dusk/Veil kits from @tailark-oss registry) as structural inspiration: adapt a hero section block, a features grid block for #about, a stats block for #role, a CTA block for #contact. Do NOT copy pro/Quartz blocks. If a block pulls registryDependencies that fail to install, fall back to hand-rolled sections using shadcn primitives — the look must stay consistent with the tokens above.

## Driver.js tour spec
- File components/tour.tsx ("use client").
- On click: dynamic import("driver.js") + import("driver.js/dist/driver.css"), create driver({ showProgress: true, showButtons: true, popoverClass: "driver-popover", overlayColor: "rgba(9,9,11,0.85)", stagePadding: 8, allowClose: true, disableActiveInteraction: false, nextBtnText: "Next", prevBtnText: "Back", doneBtnText: "Done" });
- Steps (element selector → plain-English popover):
  1. #hero — "This is my application. I am Vstalin, and I am applying for Eterna Indonesia's Lead Automation & Web Engineer role."
  2. #live-panel — "This panel is real data from the live automation pipeline — every execution, state, and timestamp is genuine."
  3. #about — "Who I am and the three skill areas I would bring: web engineering, automation, and cloud + AI."
  4. #role — "The exact role and terms I am applying for: fully remote, full-time, U.S.-based client, Rp13M–Rp18M."
  5. #fit — "Each responsibility in the job description mapped to something I can point at as evidence."
  6. #demo — "A working automation pipeline: intake, verification, dispatch, storage, and a report card. Every step is visible."
  7. #ops-link — "This opens the live report card of every submission — real states, honest failures, nothing simulated."
  8. #contact — "If you are on the hiring team, you can reach me here. It runs through the same pipeline this site demonstrates."
- Accessibility: driver.js handles Escape/close; ensure the trigger button has aria-label "Start guided tour of this application". Add focus-visible styles.

## Accessibility (WCAG 2.2 AA)
- All interactive elements keyboard-reachable, visible focus ring (use focus-visible:outline-2 focus-visible:outline-live).
- Forms: <label htmlFor> wired to inputs; role="status" for the submit status line.
- Contrast: muted text on base must be >= 4.5:1 (existing #c6c6cc on #09090b is fine).
- Reduced motion: respect it.

## Performance
- driver.js lazy-loaded only on click.
- No layout shift: give TiltedCard / animated wrappers fixed min-heights.
- Keep hero fast: no large images (site is text/CSS heavy; fine).

## Verification before handoff
1. cd /opt/eterna/app && npm run typecheck
2. npm run lint
3. npm run build
Report the exact command output summaries. Do NOT deploy (lead deploys).
