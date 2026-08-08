// page.tsx — the home page: one server-rendered "honest report card".
//
// Everything on it is store-derived or a labeled env reading: the stage
// states come from live probes (lib/stages.ts), the totals/chart/shield
// log come from data/executions.json + data/shield.json, and the tracking
// number is derived deterministically from each execution id. Nothing is
// simulated; unreadable instruments render as N/R, not green lights.
// force-dynamic because the store is a file that changes per submission.
import SectionHeading from "@/components/section-heading";
import ApplicationForm from "@/components/application-form";
import LedgerHeadline from "@/components/ledger-headline";
import ShinyText from "@/components/ShinyText";
import Magnet from "@/components/Magnet";
import AnimatedContent from "@/components/AnimatedContent";
import HeroBackdrop from "@/components/hero-backdrop";
import LiveDemo from "@/components/live-demo";
import LiveLog, { type LiveLogPayload } from "@/components/live-log";
import OpsChart from "@/components/ops-chart";
import { listExecutions } from "@/lib/store";
import { listShield, shieldCounts } from "@/lib/shield";
import { stageStates } from "@/lib/stages";
import { shortIso } from "@/lib/time";
import { trackingId } from "@/lib/tracking";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Leadcare — every lead, checked, logged, shown live | Vstalin's application",
  description:
    "Leadcare, live: every submission checked by a spam shield, logged with a tracking number, and shown on a real dashboard — all on one page. Built by Vstalin as an application for Eterna Indonesia.",
};

// Static copy for the dossier section (job facts) and the fit grid (the
// role's asks vs. what this repo demonstrates). Keeping them as data
// arrays keeps the JSX below declarative.
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

const stateColor: Record<string, string> = {
  ENABLED: "text-ok",
  CONFIGURED: "text-ok",
  LIVE: "text-ok",
  "N/R": "text-warn",
  PENDING: "text-warn",
  DEGRADED: "text-err",
};

export default async function HomePage() {
  const ring = await listExecutions(100);
  const shieldRows = await listShield(10);
  const shield = await shieldCounts();
  const stages = await stageStates();
  const nowIso = new Date().toISOString();

  const totals = {
    n: ring.length,
    received: ring.filter((r) => r.status === "received").length,
    dispatched: ring.filter((r) => r.status === "dispatched").length,
    failed: ring.filter((r) => r.status === "failed").length,
  };

  const firstAt = ring.length > 0 ? ring[ring.length - 1].created_at : null;

  // Chart series: bucket the retained ring by day (created_at date), count
  // per status, and ZERO-FILL every day between first and last so absence
  // is visible — an empty day is a real "no submissions that day".
  const byDay = new Map<string, { received: number; dispatched: number; failed: number }>();
  for (const r of ring) {
    const day = r.created_at.slice(0, 10);
    const slot = byDay.get(day) ?? { received: 0, dispatched: 0, failed: 0 };
    slot[r.status] += 1;
    byDay.set(day, slot);
  }
  const chartDays = [...byDay.keys()].sort();
  const series: { day: string; received: number; dispatched: number; failed: number }[] =
    chartDays.length === 0
      ? []
      : (() => {
          const [first, last] = [chartDays[0], chartDays[chartDays.length - 1]];
          const out: { day: string; received: number; dispatched: number; failed: number }[] = [];
          for (let d = new Date(first); d <= new Date(last); d.setDate(d.getDate() + 1)) {
            const day = d.toISOString().slice(0, 10);
            out.push({ day, ...(byDay.get(day) ?? { received: 0, dispatched: 0, failed: 0 }) });
          }
          return out;
        })();

  // Initial snapshot for the live log — same shape as /api/executions/public,
  // so the client component can swap in fresh polled data seamlessly.
  const initialLog: LiveLogPayload = {
    ok: true,
    ts: nowIso,
    totals,
    firstAt,
    executions: ring.slice(0, 10).map((r) => ({
      id: r.id.slice(0, 8),
      tracking: trackingId(r.id),
      status: r.status,
      stage: r.stage,
      created_at: r.created_at,
      error: r.error ?? null,
    })),
  };

  return (
    <div>
      <section id="hero" className="ledger-lines relative flex min-h-screen items-center overflow-hidden py-16 sm:py-20">
        <HeroBackdrop />
        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-14 lg:items-start">
            <div>
              <p className="mb-6 flex items-center gap-3 font-mono text-sm font-semibold tracking-widest text-text">
                <span className="stamp stamp-red !p-0.5 !px-2 !text-[0.625rem]">LIVE</span>
                <ShinyText text="Leadcare" />
              </p>
              <LedgerHeadline />
              <p className="mt-8 max-w-2xl text-balance text-lg leading-relaxed text-muted">
                Every submission is checked by a spam shield, logged with a tracking
                number, and shown live right here — every row real, nothing simulated.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Magnet className="inline-flex" padding={10} activeStrength={2}>
                  <a href="#dashboard" className="stamp stamp-red press text-sm">View live dashboard</a>
                </Magnet>
                <Magnet className="inline-flex" padding={10} activeStrength={2}>
                  <a href="#log" className="press inline-flex items-center gap-2 border border-border px-5 py-3 text-sm font-medium text-text transition hover:border-live focus-visible:outline-2 focus-visible:outline-live">
                    See the log
                  </a>
                </Magnet>
              </div>
            </div>
            <div>
              <ApplicationForm />
              <p className="mt-4 font-mono text-xs leading-relaxed text-muted">
                Submit → the receipt prints right here, instantly — tracking number included.
              </p>
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

      <section id="dashboard" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <SectionHeading eyebrow="SIGNAL" title="Pipeline status" />
        <div className="border border-border bg-surface">
          <div className="flex items-center gap-2 border-b border-border px-4 py-2 font-mono text-xs text-muted">
            <span className="led-ok" aria-hidden="true" />
            <span>PIPELINE STATUS</span>
            <span className="caret" aria-hidden="true" />
          </div>
          <ul className="divide-y divide-border">
            {stages.map((stage) => (
              <li
                key={stage.num}
                className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6 tabular-nums"
              >
                <span className="flex items-center gap-3 font-mono text-sm">
                  <span className={`led-${stage.led}`} aria-hidden="true" />
                  <span className="text-text">
                    {stage.num} {stage.name}
                  </span>
                  <span className={stateColor[stage.state]}>{stage.state}</span>
                </span>
                <span className="font-mono text-xs text-muted">
                  source={stage.source} · {stage.note}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10">
          <SectionHeading eyebrow="TRAFFIC" title="Executions per day" />
          <OpsChart series={series} total={totals.n} />
          <p className="mt-3 font-mono text-xs text-muted tabular-nums">
            RETAINED RING (LAST 100) — per day, by status · zero-filled days
            shown, not skipped · every figure store-derived · not all-time
          </p>
        </div>

        <div className="mt-10">
          <SectionHeading eyebrow="SHIELD LOG" title="Blocked attempts" />
          <p className="mb-4 border border-border bg-surface px-4 py-3 font-mono text-xs leading-relaxed text-muted tabular-nums">
            <span className="text-text">TOTALS</span> — bots blocked: {shield.honeypot} · bad
            requests: {shield.intake_400} · rejected by workflow: {shield.n8n_rejected}
          </p>
          <div className="border border-border bg-surface">
            <div className="flex items-center gap-2 border-b border-border px-4 py-2 font-mono text-xs text-muted">
              <span className="led-warn" aria-hidden="true" />
              <span>SHIELD LOG</span>
              <span className="caret" aria-hidden="true" />
            </div>
            {shieldRows.length === 0 ? (
              <div className="px-4 py-8 text-center font-mono text-sm text-muted">
                SHIELD LOG EMPTY — no rejections recorded; the honeypot has never been triggered.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px] text-left font-mono text-xs tabular-nums sm:text-sm">
                  <thead className="border-b border-border text-muted">
                    <tr>
                      <th scope="col" className="px-4 py-2 font-medium">REASON</th>
                      <th scope="col" className="px-4 py-2 font-medium">WHEN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {shieldRows.map((entry) => (
                      <tr key={entry.id}>
                        <td className="px-4 py-2 text-warn">{entry.reason.toUpperCase()}</td>
                        <td className="px-4 py-2 text-muted">{shortIso(entry.at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </section>

      <LiveLog initial={initialLog} />

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

    </div>
  );
}
