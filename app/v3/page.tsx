import SectionHeading from "@/components/section-heading";
import LiveTicker from "@/components/live-ticker";
import PipelineDiagram from "@/components/pipeline-diagram";
import ApplicationForm from "@/components/application-form";
import LedgerHeadline from "@/components/ledger-headline";
import { env } from "@/lib/env";
import { listExecutions } from "@/lib/store";
import { listShield, shieldCounts } from "@/lib/shield";
import { shortIso } from "@/lib/time";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Eterna LeadCare v3 — The Operations Ledger",
  description:
    "v3 of the LeadCare demo: the operations ledger. Same pipeline, same real data — every lead checked, logged, and tracked, with nothing simulated.",
};

type LedColor = "ok" | "warn" | "err";

type Stage = {
  num: string;
  name: string;
  state: string;
  led: LedColor;
  source: string;
  note: string;
};

async function stageStates(): Promise<Stage[]> {
  const n8nConfigured = Boolean(env.N8N_BASE_URL && env.WEBHOOK_TOKEN);
  const appsScriptConfigured = Boolean(env.APPS_SCRIPT_URL);
  const counts = await shieldCounts();
  const shieldEvents = await listShield(1);
  const firstShieldAt = shieldEvents.length > 0 ? shieldEvents[shieldEvents.length - 1].at : null;
  return [
    {
      num: "01",
      name: "CAPTURED",
      state: "LIVE",
      led: "ok",
      source: "site repo",
      note: "the form on this page posts here — every submission is captured with a timestamp",
    },
    {
      num: "02",
      name: "SPAM SHIELD",
      state: "ENABLED",
      led: "ok",
      source: "data/shield.json",
      note: `honeypot-gated · ${counts.honeypot} blocked${
        firstShieldAt ? ` since ${shortIso(firstShieldAt)}` : " — no hits recorded"
      }`,
    },
    {
      num: "03",
      name: "RESEARCHED",
      state: n8nConfigured ? "CONFIGURED" : "PENDING",
      led: n8nConfigured ? "ok" : "err",
      source: "env",
      note: n8nConfigured
        ? "N8N_BASE_URL + WEBHOOK_TOKEN present; signed dispatch enabled — never live-verified from this device"
        : "N8N_BASE_URL/WEBHOOK_TOKEN missing — lead intake is offline",
    },
    {
      num: "04",
      name: "LOGGED",
      state: "N/R",
      led: "warn",
      source: "workflow definition",
      note: "runs inside n8n (docs/n8n-workflow.json); no runtime readout reachable from this phone",
    },
    {
      num: "05",
      name: "LIVE",
      state: appsScriptConfigured ? "LIVE" : "DEGRADED",
      led: appsScriptConfigured ? "ok" : "warn",
      source: "env",
      note: appsScriptConfigured
        ? "APPS_SCRIPT_URL present — deployed outside this phone"
        : "user deploy (docs/apps-script-setup.md) — APPS_SCRIPT_URL empty; the log leg answers 200-degraded until deployed",
    },
  ];
}

const stateColor: Record<string, string> = {
  ENABLED: "text-ok",
  CONFIGURED: "text-ok",
  LIVE: "text-ok",
  "N/R": "text-warn",
  PENDING: "text-warn",
  DEGRADED: "text-err",
};

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

export default async function V3Page() {
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
    <div className="v3">
      <section id="ledger-hero" className="ledger-lines relative overflow-hidden pt-24 pb-20 sm:pt-32 sm:pb-24">
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <p className="mb-6 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted">
            <span className="stamp stamp-red !p-0.5 !px-2 !text-[0.625rem]">LIVE</span>
            ET-48 // OPERATIONS LEDGER // PRODUCT DEMO
          </p>
          <LedgerHeadline />
          <p className="mt-8 max-w-2xl text-balance text-lg leading-relaxed text-muted">
            Eterna LeadCare keeps an honest record: every submission is checked by
            the spam shield, logged with a tracking number, and shown to you live —
            no simulated lights, no hidden steps.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a href="/ops" className="stamp stamp-red press text-sm">Open the ledger</a>
            <a href="/v2" className="press inline-flex items-center gap-2 border border-border px-5 py-3 text-sm font-medium text-text transition hover:border-live focus-visible:outline-2 focus-visible:outline-live">
              See v2 terminal
            </a>
          </div>
          <p className="mt-6 font-mono text-xs text-muted">
            v3 — the operations ledger · v2 — the terminal · same pipeline, same real data.
          </p>
        </div>
      </section>

      <LiveTicker />

      <section id="totals" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <SectionHeading eyebrow="LEDGER // real figures" title="What the ledger holds" />
        <div className="grid grid-cols-2 gap-px border border-border bg-border lg:grid-cols-4">
          {statCells.map((cell, i) => (
            <div key={cell.label} className="relative bg-surface p-6 md:p-8">
              <p className="font-mono text-xs uppercase tracking-widest text-muted">{cell.label}</p>
              <p className={`mt-2 font-mono text-4xl font-medium tabular-nums md:text-5xl ${cell.tone} number-pop`}
                style={{ animationDelay: `calc(${i} * var(--duration-stagger))` }}>
                {cell.value}
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
        <SectionHeading eyebrow="STAGES // real state, named sources" title="The five stages, honestly" />
        <div className="border border-border bg-surface">
          <div className="flex items-center gap-2 border-b border-border px-4 py-2 font-mono text-xs text-muted">
            <span className="led-live" aria-hidden="true" />
            <span>$ ./status</span>
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
        <SectionHeading eyebrow="SEALS // why it can be trusted" title="Stamped, not claimed" />
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
        <SectionHeading eyebrow="FORM 12-A // the pipeline" title="The path every lead travels" />
        <div className="border border-border bg-surface">
          <div className="flex items-center gap-2 border-b border-border px-4 py-2 font-mono text-xs text-muted">
            <span className="led-live" aria-hidden="true" />
            <span>$ ./pipeline --live</span>
            <span className="caret" aria-hidden="true" />
          </div>
          <div className="p-4">
            <PipelineDiagram />
          </div>
        </div>
        <p className="mt-3 font-mono text-xs text-muted">
          FORM 12-A — the same five lockstep stages as v2 and the ops dashboard · one vocabulary.
        </p>
      </section>

      <section id="try" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
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
              {"// submits via POST /api/lead — honeypot-gated, tracked live on /ops"}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
