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

const officialUrl = "https://www.eternaindonesia.com/jobs/lead-automation-web-engineer";
const roleFacts = [
  ["Role", "Lead Automation & Web Engineer"],
  ["Salary", "Rp13.000.000 – Rp18.000.000"],
  ["Employment", "Full time · Fully remote"],
  ["Client", "U.S.-based client"],
];

const fitItems = [
  ["Build stunning, high-performance websites, primarily in Webflow", "I ship fast, polished web apps with Next.js and React — ready to bring that standard to Webflow."],
  ["Design intelligent workflows with N8N and Google Apps Script", "This site runs the pattern live: intake, honeypot shield, signed dispatch, storage, report card."],
  ["Manage cloud hosting and lead initiatives on Google Cloud / AWS", "I deploy and operate this production site myself, Docker on Oracle Cloud."],
  ["Use AI-enhanced systems to accelerate development", "I build with AI tools daily — this codebase is the evidence."],
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
      <section id="hero" className="ledger-lines relative flex min-h-screen items-center overflow-hidden py-16 sm:py-20">
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
                  <a href="#pipeline" className="press inline-flex items-center gap-2 border border-border px-5 py-3 text-sm font-medium text-text transition hover:border-live focus-visible:outline-2 focus-visible:outline-live">
                    How it works
                  </a>
                </Magnet>
              </div>
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
                Submit → the receipt prints right here, instantly — tracking number included.
              </div>
            </div>
          </div>
        </div>
      </section>

      <LiveDemo />

      <section id="dossier" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <SectionHeading eyebrow="THE APPLICATION" title="About me" />
        <div className="mt-10 grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,19rem)] md:items-stretch">
          <div className="flex flex-col justify-center">
            <p className="measure text-base leading-relaxed text-muted">
              I&apos;m Vstalin — I build web experiences, connect them with automation, and ship with AI
              tools. This site is my application for the Lead Automation &amp; Web Engineer role at
              Eterna Indonesia; the live pipeline below is the evidence.
            </p>
          </div>
          <figure className="border border-border bg-surface p-3 md:self-start">
            <img
              src="/vstalingrady.webp"
              alt="Portrait of Vstalin Grady"
              className="aspect-square w-full object-cover"
            />
            <figcaption className="mt-3 flex items-center gap-2 font-mono text-xs text-muted">
              <span className="led-live" aria-hidden="true" />
              <span>VSTALIN GRADY — THE OPERATOR</span>
            </figcaption>
          </figure>
        </div>
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
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Magnet className="inline-flex" padding={10} activeStrength={2}>
            <a href={officialUrl} target="_blank" rel="noreferrer" className="stamp stamp-red press text-sm">
              OFFICIAL POSTING
            </a>
          </Magnet>
        </div>
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
            <span className="text-text">SHIELD</span> — bots blocked: {shield.honeypot} · bad requests:{" "}
            {shield.intake_400} · rejected by workflow: {shield.n8n_rejected}
          </span>
          <span className="stamp stamp-red" aria-hidden="true">BLOCKED, COUNTED</span>
        </div>
        </AnimatedContent>
        <p className="mt-3 font-mono text-xs text-muted">
          Last 100 submissions — real numbers, not all-time.
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

      <section id="pipeline" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <SectionHeading eyebrow="THE PIPELINE" title="The path every lead travels" />
        <PipelineDemo
          stages={stages}
          tracking={tracking}
          shieldBlocked={shield.honeypot}
          lastLeadText={lastLeadText}
        />
        <p className="mt-3 font-mono text-xs text-muted">
          The same five stages as the ops dashboard.
        </p>
      </section>


    </div>
  );
}
