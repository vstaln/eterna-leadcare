import SectionHeading from "@/components/section-heading";
import LiveTicker from "@/components/live-ticker";
import ApplicationForm from "@/components/application-form";
import LedgerHeadline from "@/components/ledger-headline";
import CountUp from "@/components/CountUp";
import ShinyText from "@/components/ShinyText";
import Magnet from "@/components/Magnet";
import FaultyTerminal from "@/components/FaultyTerminal";
import ScrollStack from "@/components/ScrollStack";
import { listExecutions } from "@/lib/store";
import { shieldCounts } from "@/lib/shield";
import { stageStates } from "@/lib/stages";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Eterna LeadCare — The Operations Ledger",
  description:
    "The LeadCare demo: one honest record. Every lead checked by the spam shield, logged with a tracking number, and shown live — nothing simulated.",
};

const stateColor: Record<string, string> = {
  ENABLED: "text-ok",
  CONFIGURED: "text-ok",
  LIVE: "text-ok",
  "N/R": "text-warn",
  PENDING: "text-warn",
  DEGRADED: "text-err",
};

const aboutCards: [string, string, string, string][] = [
  [
    "01",
    "CAPTURE",
    "Lead capture",
    "A typed intake API on this site. Every submission is checked by a honeypot shield that catches bots and records each blocked attempt — nothing silent, nothing hidden.",
  ],
  [
    "02",
    "DISPATCH",
    "Automation",
    "Accepted leads are dispatched onward through a signed workflow — the N8N-style orchestration Eterna runs for clients — with every state recorded.",
  ],
  [
    "03",
    "REPORT",
    "Live reporting",
    "The ops dashboard renders the real execution store: per-day chart, named stages, and a tracking number on every lead. No simulated lights.",
  ],
];

const trustItems = [
  ["Real store, not a mockup", "Every row on the dashboard is a real submission that went through this pipeline. The store file is right here in the repo.", "VERIFIED", "stamp-green"],
  ["Failures are named, not hidden", "If a step can't report, it says N/R — never a green light. If a piece is pending, the page says PENDING. Degraded states render DEGRADED.", "HONEST", "stamp-green"],
  ["Open build", "The whole pipeline, the workflow definition, and the build log are documented behind the scenes — including what is still waiting on you.", "OPEN", "stamp-red"],
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
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <p className="mb-6 flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-muted">
            <span className="stamp stamp-red !p-0.5 !px-2 !text-[0.625rem]">LIVE</span>
            <ShinyText text="Eterna LeadCare" />
          </p>
          <LedgerHeadline />
          <p className="mt-8 max-w-2xl text-balance text-lg leading-relaxed text-muted">
            Eterna LeadCare keeps an honest record: every submission is checked by
            the spam shield, logged with a tracking number, and shown to you live —
            no simulated lights, no hidden steps.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Magnet className="inline-flex" padding={10} activeStrength={2}>
              <a href="/ops" className="stamp stamp-red press text-sm">Open the ledger</a>
            </Magnet>
            <Magnet className="inline-flex" padding={10} activeStrength={2}>
              <a href="#about" className="press inline-flex items-center gap-2 border border-border px-5 py-3 text-sm font-medium text-text transition hover:border-live focus-visible:outline-2 focus-visible:outline-live">
                How it works
              </a>
            </Magnet>
          </div>
          <p className="mt-6 font-mono text-xs text-muted">
            THE OPERATIONS LEDGER — one pipeline, one real data set, no versions.
          </p>
        </div>
      </section>

      <section id="about" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <SectionHeading eyebrow="WHAT LEADCARE DOES" title="Three steps, one ledger" />
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
      </section>

      <LiveTicker />

      <section id="totals" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <SectionHeading eyebrow="REAL FIGURES" title="What the ledger holds" />
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
        <div className="mt-2 flex flex-col gap-2 border border-border bg-surface px-5 py-4 font-mono text-xs tabular-nums text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>
            <span className="text-text">SHIELD</span> — honeypot: {shield.honeypot} · malformed:{" "}
            {shield.intake_400} · signed-dispatch rejected: {shield.n8n_rejected}
          </span>
          <span className="stamp stamp-red" aria-hidden="true">BLOCKED, COUNTED</span>
        </div>
        <p className="mt-3 font-mono text-xs text-muted">
          RETAINED RING (LAST 100) — counts of retained rows only, not all-time · every figure store-derived.
        </p>
      </section>

      <section id="stages" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <SectionHeading eyebrow="THE FIVE STAGES" title="The five stages, honestly" />
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
        <p className="mt-3 font-mono text-xs leading-relaxed text-muted">
          STATE VOCABULARY — PENDING awaiting an action · N/R no reading available · CONFIGURED env
          present, never live-verified · DEGRADED the log leg answers 200-degraded while APPS_SCRIPT_URL is empty.
        </p>
      </section>

      <section id="trust" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <SectionHeading eyebrow="WHY IT CAN BE TRUSTED" title="Stamped, not claimed" />
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
      </section>

      <section id="pipeline" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <SectionHeading eyebrow="THE PIPELINE" title="The path every lead travels" />
        <ScrollStack
          items={stages.map((stage, i) => (
            <div key={stage.num} className="flex min-h-[45vh] flex-col p-8 md:min-h-[55vh] md:p-12">
              {cornerPositions.map((pos) => (
                <span key={pos} aria-hidden="true" className={`pointer-events-none absolute ${pos} px-1 font-mono text-xs text-muted/40`}>
                  +
                </span>
              ))}
              <div className="flex flex-wrap items-center gap-3">
                <span className={`led-${stage.led}`} aria-hidden="true" />
                <span className="font-mono text-xs uppercase tracking-widest text-muted">STAGE {stage.num}</span>
                <span className={`font-mono text-xs ${stateColor[stage.state]}`}>{stage.state}</span>
              </div>
              <h3 className="mt-5 text-3xl font-semibold tracking-tight text-text md:text-4xl">{stage.name}</h3>
              <p className="mt-3 font-mono text-xs text-muted">
                sub={["web form", "honeypot", "n8n · rdap", "store", "dashboard"][i]} · source={stage.source}
              </p>
              <p className="mt-auto pt-6 font-mono text-xs leading-relaxed text-muted">{stage.note}</p>
            </div>
          ))}
        />
        <p className="mt-3 font-mono text-xs text-muted">
          The same five lockstep stages as the ops dashboard — one vocabulary.
        </p>
      </section>

      <section id="try" className="relative mx-auto max-w-6xl overflow-hidden px-6 py-24 md:py-32">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <FaultyTerminal className="absolute bottom-0 right-0 max-h-full overflow-hidden text-right text-ok/10" />
        </div>
        <div className="relative">
          <SectionHeading eyebrow="TRY IT" title="Send a test lead" />
          <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <div>
            <p className="measure text-sm leading-relaxed text-muted">
              Send a test lead — it travels the same path a real one would: checked, logged, and
              tracked live on the ops dashboard. This form is a live demo, not Eterna&apos;s official application.
            </p>
            <p className="mt-6 font-mono text-xs leading-relaxed text-muted">
              Every other surface on this page is paper. This one stays a terminal on purpose —
              the capture desk is the one place data enters the ledger.
            </p>
          </div>
          <div className="capture-terminal">
            <div className="flex items-center gap-2 border-b border-border bg-surface px-4 py-2 font-mono text-xs text-muted">
              <span className="led-live" aria-hidden="true" />
              <span>CAPTURE TERMINAL</span>
              <span className="caret" aria-hidden="true" />
            </div>
            <ApplicationForm />
            <p className="px-6 pb-4 pt-0 font-mono text-xs text-muted">
              Submits via POST /api/lead — honeypot-gated, tracked live on /ops
            </p>
          </div>
        </div>
        </div>
      </section>
    </div>
  );
}
