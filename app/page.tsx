import SectionHeading from "@/components/section-heading";
import LiveTicker from "@/components/live-ticker";
import ApplicationForm from "@/components/application-form";
import LedgerHeadline from "@/components/ledger-headline";
import CountUp from "@/components/CountUp";
import ShinyText from "@/components/ShinyText";
import Magnet from "@/components/Magnet";
import PipelineDemo from "@/components/pipeline-demo";
import AnimatedContent from "@/components/AnimatedContent";
import Beams from "@/components/Beams";
import LiveDemo from "@/components/live-demo";
import { listExecutions } from "@/lib/store";
import { shieldCounts } from "@/lib/shield";
import { stageStates } from "@/lib/stages";
import { shortIso } from "@/lib/time";
import { trackingId } from "@/lib/tracking";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Eterna LeadCare — every lead, checked, logged, shown live | Vstalin's application",
  description:
    "Eterna LeadCare, live: every submission checked by a spam shield, logged with a tracking number, and shown on a real dashboard. Built by Vstalin as an application for Eterna Indonesia.",
};

const stateColor: Record<string, string> = {
  ENABLED: "text-ok",
  CONFIGURED: "text-ok",
  LIVE: "text-ok",
  "N/R": "text-warn",
  PENDING: "text-warn",
  DEGRADED: "text-err",
};


const officialUrl = "https://www.eternaindonesia.com/jobs/lead-automation-web-engineer";
const roleFacts = [
  ["Role", "Lead Automation & Web Engineer"],
  ["Salary", "Rp13.000.000 – Rp18.000.000"],
  ["Employment", "Full time · Fully remote"],
  ["Client", "U.S.-based client"],
];

const skillCards: [string, string, string, string][] = [
  [
    "01",
    "WEB ENGINEERING",
    "Sites that ship",
    "Next.js, React, TypeScript, responsive, accessible, fast — the standard I'd bring to Webflow.",
  ],
  [
    "02",
    "AUTOMATION",
    "Workflows that run",
    "Signed webhook intake, n8n orchestration, API integrations, auditable states — live on this page.",
  ],
  [
    "03",
    "CLOUD & AI",
    "Evidence, not claims",
    "Docker on Oracle Cloud, production delivery, Git workflows, daily AI-assisted build.",
  ],
];

const fitItems = [
  ["Build stunning, high-performance websites, primarily in Webflow", "I ship fast, polished web apps with Next.js and React — ready to bring that standard to Webflow."],
  ["Design intelligent workflows with N8N and Google Apps Script", "This site runs the pattern live: intake, honeypot shield, signed dispatch, storage, report card."],
  ["Manage cloud hosting and lead initiatives on Google Cloud / AWS", "I deploy and operate this production site myself, Docker on Oracle Cloud."],
  ["Use AI-enhanced systems to accelerate development", "I build with AI tools daily — this codebase is the evidence."],
  ["Translate business needs into automated solutions", "This page explains the pipeline in plain English for a non-technical reader."],
  ["Explore new tools and present innovative solutions", "Self-directed learner — Behind the Scenes documents how this site was built."],
];

const aboutCards: [string, string, string, string][] = [
  [
    "01",
    "CAPTURE",
    "Lead capture",
    "Typed intake API. Every submission is checked by a honeypot shield that counts each blocked bot.",
  ],
  [
    "02",
    "DISPATCH",
    "Automation",
    "Accepted leads go through a signed n8n workflow — every state recorded.",
  ],
  [
    "03",
    "REPORT",
    "Live reporting",
    "The ops dashboard renders the real store: per-day chart, stages, and a tracking number per lead.",
  ],
];

const trustItems = [
  ["Real store, not a mockup", "Every row on the dashboard is a real submission that went through this pipeline.", "VERIFIED", "stamp-green"],
  ["Failures are named, not hidden", "Can't report? It says N/R. Pending? PENDING. Degraded? DEGRADED — never a fake green light.", "HONEST", "stamp-green"],
  ["Open build", "Pipeline, workflow, and build log are all documented behind the scenes.", "OPEN", "stamp-red"],
];

const cornerPositions = [
  "top-0 left-0",
  "top-0 right-0",
  "bottom-0 left-0",
  "bottom-0 right-0",
];

export default async function HomePage() {
  const ring = await listExecutions(100);
  const shield = await shieldCounts();
  const stages = await stageStates();

  const latestAccepted = ring.find((r) => r.status !== "failed") ?? ring[0] ?? null;
  const tracking = latestAccepted ? trackingId(latestAccepted.id) : null;
  const lastLeadText = latestAccepted
    ? `${trackingId(latestAccepted.id)} · ${latestAccepted.status} · ${shortIso(latestAccepted.created_at)}`
    : null;

  const totals = {
    n: ring.length,
    received: ring.filter((r) => r.status === "received").length,
    dispatched: ring.filter((r) => r.status === "dispatched").length,
    failed: ring.filter((r) => r.status === "failed").length,
  };

  const statCells = [
    { label: "TOTAL ENTRIES", value: totals.n, tone: "text-text", stamp: null },
    { label: "RECEIVED", value: totals.received, tone: "text-ok", stamp: ["stamp-green", "RECEIVED"] },
    { label: "DISPATCHED", value: totals.dispatched, tone: "text-ok", stamp: ["stamp-green", "DISPATCHED"] },
    { label: "FAILED", value: totals.failed, tone: "text-err", stamp: ["stamp-red", "FAILED"] },
  ];

  return (
    <div>
      <section id="hero" className="ledger-lines relative overflow-hidden pt-24 pb-20 sm:pt-32 sm:pb-24">
        <Beams className="absolute inset-0" />
        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-14 lg:items-start">
            <div>
              <p className="mb-6 flex items-center gap-3 font-mono text-sm font-semibold uppercase tracking-widest text-text">
                <span className="stamp stamp-red !p-0.5 !px-2 !text-[0.625rem]">LIVE</span>
                <ShinyText text="Eterna LeadCare" />
              </p>
              <LedgerHeadline />
              <p className="mt-8 max-w-2xl text-balance text-lg leading-relaxed text-muted">
                Every submission is checked by a spam shield, logged with a tracking
                number, and shown live on the ops dashboard — every row real, nothing simulated.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Magnet className="inline-flex" padding={10} activeStrength={2}>
                  <a href="/ops" className="stamp stamp-red press text-sm">View live dashboard</a>
                </Magnet>
                <Magnet className="inline-flex" padding={10} activeStrength={2}>
                  <a href="#about" className="press inline-flex items-center gap-2 border border-border px-5 py-3 text-sm font-medium text-text transition hover:border-live focus-visible:outline-2 focus-visible:outline-live">
                    How it works
                  </a>
                </Magnet>
              </div>
              <p className="mt-6 font-mono text-xs text-muted">
                ONE PIPELINE · ONE REAL DATA SET · APPLICATION FOR ETERNA&apos;S LEAD AUTOMATION &amp; WEB ENGINEER ROLE
              </p>
            </div>

            <div id="try" className="flex flex-col border border-border bg-surface">
              <div className="flex items-center gap-2 border-b border-border px-4 py-2 font-mono text-xs text-muted">
                <span className="led-warn" aria-hidden="true" />
                <span>DROP A LEAD — IT RUNS THE PIPELINE FOR REAL</span>
                <span className="caret" aria-hidden="true" />
              </div>
              <div className="flex-1 p-4 sm:p-6">
                <ApplicationForm />
              </div>
              <div className="border-t border-border px-4 py-3 font-mono text-xs leading-relaxed text-muted">
                Every submission hits POST /api/lead → n8n webhook and moves through the
                flow chart at the bottom of this page. Follow the tracking number on{" "}
                <a href="/ops" className="underline decoration-ok underline-offset-4 hover:text-text">
                  /ops
                </a>
                .
                <div className="mt-3">
                  <a
                    href={officialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="stamp stamp-red press text-sm"
                  >
                    OFFICIAL POSTING
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="dossier" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <SectionHeading eyebrow="THE APPLICATION" title="About me" />
        <p className="measure text-base leading-relaxed text-muted">
          I&apos;m Vstalin — I build web experiences, connect them with automation, and ship with AI
          tools. This site is my application for the Lead Automation &amp; Web Engineer role at
          Eterna Indonesia; the live pipeline below is the evidence.
        </p>
        <AnimatedContent distance={16} duration={0.6}>
          <div className="mt-10 grid grid-cols-2 gap-px border border-border bg-border lg:grid-cols-4">
            {roleFacts.map(([label, value]) => (
              <div key={label} className="relative bg-surface p-6">
                <p className="font-mono text-xs uppercase tracking-widest text-muted">{label}</p>
                <p className="mt-2 font-semibold text-text">{value}</p>
              </div>
            ))}
          </div>
        </AnimatedContent>
        <AnimatedContent distance={16} duration={0.6}>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
          {skillCards.map(([num, module, title, text]) => (
            <article key={module} className="relative border border-border bg-surface p-8">
              {cornerPositions.map((pos) => (
                <span key={pos} aria-hidden="true" className={`pointer-events-none absolute ${pos} px-1 font-mono text-xs text-muted/40`}>
                  +
                </span>
              ))}
              <span className="ledger-no" aria-hidden="true">{num}</span>
              <p className="mt-4 font-mono text-xs uppercase tracking-widest text-muted">{module}</p>
              <h3 className="mt-2 font-semibold text-text">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{text}</p>
            </article>
          ))}
          </div>
        </AnimatedContent>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Magnet className="inline-flex" padding={10} activeStrength={2}>
            <a href={officialUrl} target="_blank" rel="noreferrer" className="stamp stamp-red press text-sm">
              OFFICIAL POSTING
            </a>
          </Magnet>
          <span className="font-mono text-xs text-muted">
            submitted through Eterna&apos;s official process — this site is the supporting evidence
          </span>
        </div>
      </section>

      <section id="about" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <SectionHeading eyebrow="WHAT LEADCARE DOES" title="How it works" />
        <AnimatedContent distance={16} duration={0.6}>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
          {aboutCards.map(([num, module, title, text]) => (
            <article key={module} className="relative border border-border bg-surface p-8">
              {cornerPositions.map((pos) => (
                <span key={pos} aria-hidden="true" className={`pointer-events-none absolute ${pos} px-1 font-mono text-xs text-muted/40`}>
                  +
                </span>
              ))}
              <span className="ledger-no" aria-hidden="true">{num}</span>
              <p className="mt-4 font-mono text-xs uppercase tracking-widest text-muted">{module}</p>
              <h3 className="mt-2 font-semibold text-text">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{text}</p>
            </article>
          ))}
          </div>
        </AnimatedContent>
      </section>

      <LiveTicker />

      <section id="totals" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <SectionHeading eyebrow="REAL FIGURES" title="Live figures" />
        <AnimatedContent distance={16} duration={0.6}>
          <div className="grid grid-cols-2 gap-px border border-border bg-border lg:grid-cols-4">
          {statCells.map((cell, i) => (
            <div key={cell.label} className="relative bg-surface p-6 md:p-8">
              <p className="font-mono text-xs uppercase tracking-widest text-muted">{cell.label}</p>
              <p
                className="number-pop mt-2 font-mono text-4xl font-medium tabular-nums md:text-5xl"
                style={{ animationDelay: `calc(${i} * var(--duration-stagger))` }}
              >
                <CountUp to={cell.value} className={cell.tone} />
              </p>
              {cell.stamp && (
                <span className={`stamp mt-4 ${cell.stamp[0]}`} aria-hidden="true">
                  {cell.stamp[1]}
                </span>
              )}
            </div>
          ))}
          </div>
        </AnimatedContent>
        <AnimatedContent distance={16} duration={0.6}>
          <div className="mt-2 flex flex-col gap-2 border border-border bg-surface px-5 py-4 font-mono text-xs tabular-nums text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>
            <span className="text-text">SHIELD</span> — honeypot: {shield.honeypot} · malformed:{" "}
            {shield.intake_400} · signed-dispatch rejected: {shield.n8n_rejected}
          </span>
          <span className="stamp stamp-red" aria-hidden="true">BLOCKED, COUNTED</span>
        </div>
        </AnimatedContent>
        <p className="mt-3 font-mono text-xs text-muted">
          RETAINED RING (LAST 100) — counts of retained rows only, not all-time · every figure store-derived.
        </p>
      </section>

      <section id="stages" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <SectionHeading eyebrow="THE FIVE STAGES" title="The five stages, honestly" />
        <AnimatedContent distance={16} duration={0.6}>
          <div className="border border-border bg-surface">
          <div className="flex items-center gap-2 border-b border-border px-4 py-2 font-mono text-xs text-muted">
            <span className="led-live" aria-hidden="true" />
            <span>STATUS — LIVE</span>
            <span className="caret" aria-hidden="true" />
          </div>
          <ul className="divide-y divide-border">
            {stages.map((stage) => (
              <li key={stage.num} className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6 tabular-nums">
                <span className="flex items-center gap-3 font-mono text-sm">
                  <span className={`led-${stage.led}`} aria-hidden="true" />
                  <span className="text-text">{stage.num} {stage.name}</span>
                  <span className={stateColor[stage.state]}>{stage.state}</span>
                </span>
                <span className="font-mono text-xs text-muted">source={stage.source} · {stage.note}</span>
              </li>
            ))}
          </ul>
          </div>
        </AnimatedContent>
        <p className="mt-3 font-mono text-xs leading-relaxed text-muted">
          STATE VOCABULARY — PENDING awaiting an action · N/R no reading available · CONFIGURED env
          present, never live-verified · DEGRADED the log leg answers 200-degraded while APPS_SCRIPT_URL is empty.
        </p>
      </section>

      <section id="fit" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <SectionHeading eyebrow="WHY THE FIT" title="Why I&apos;m a strong fit" />
        <AnimatedContent distance={16} duration={0.6}>
          <div className="grid gap-4 md:grid-cols-2">
          {fitItems.map(([ask, mine]) => (
            <article key={ask} className="relative border border-border bg-surface p-8">
              {cornerPositions.map((pos) => (
                <span key={pos} aria-hidden="true" className={`pointer-events-none absolute ${pos} px-1 font-mono text-xs text-muted/40`}>
                  +
                </span>
              ))}
              <p className="font-mono text-[0.65rem] uppercase tracking-widest text-muted">THE ROLE ASKS</p>
              <h3 className="mt-2 font-semibold text-text">{ask}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{mine}</p>
            </article>
          ))}
          </div>
        </AnimatedContent>
      </section>

      <section id="trust" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <SectionHeading eyebrow="WHY IT CAN BE TRUSTED" title="Stamped, not claimed" />
        <AnimatedContent distance={16} duration={0.6}>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
          {trustItems.map(([title, text, seal, sealTone]) => (
            <article key={title} className="relative border border-border bg-surface p-8">
              {cornerPositions.map((pos) => (
                <span key={pos} aria-hidden="true" className={`pointer-events-none absolute ${pos} px-1 font-mono text-xs text-muted/40`}>
                  +
                </span>
              ))}
              <h3 className="font-semibold text-text">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{text}</p>
              <span className={`stamp mt-6 ${sealTone}`} aria-hidden="true">{seal}</span>
            </article>
          ))}
          </div>
        </AnimatedContent>
      </section>

      <section id="pipeline" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <SectionHeading eyebrow="THE PIPELINE" title="The path every lead travels" />
        <PipelineDemo
          stages={stages}
          tracking={tracking}
          shieldBlocked={shield.honeypot}
          lastLeadText={lastLeadText}
        />
        <p className="mt-3 font-mono text-xs text-muted">
          The same five lockstep stages as the ops dashboard — one vocabulary.
        </p>
      </section>

      <LiveDemo />

    </div>
  );
}
