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
import OpsChart from "@/components/ops-chart";
import { env } from "@/lib/env";
import { listExecutions } from "@/lib/store";
import { listShield, shieldCounts } from "@/lib/shield";
import { stageStates } from "@/lib/stages";
import { clock, relativeAge, shortIso } from "@/lib/time";
import { trackingId } from "@/lib/tracking";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Leadcare — every lead, checked, logged, shown live | Vstalin's application",
  description:
    "Leadcare, live: every submission checked by a spam shield, logged with a tracking number, and shown on a real dashboard — all on one page. Built by Vstalin as an application for Eterna Indonesia.",
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

const stateColor: Record<string, string> = {
  ENABLED: "text-ok",
  CONFIGURED: "text-ok",
  LIVE: "text-ok",
  "N/R": "text-warn",
  PENDING: "text-warn",
  DEGRADED: "text-err",
};

type LedgerItem = {
  title: string;
  ready: boolean;
  note: string;
  description: string;
};

const ledgerItems: LedgerItem[] = [
  {
    title: "OCI SECURITY LIST CLEANUP",
    ready: false,
    note: "(user-gated — Oracle Cloud console)",
    description:
      "Delete the stale TCP 5678 ingress rule. Nothing listens on it anymore — n8n is HTTPS-only via eterna.vstal.in/n8n.",
  },
];

const resolvedItems = [
  ["N8N OWNER API KEY", "Created — stage 04 LOGGED is LIVE"],
  ["RECEIPT LEG", "Deployed box-side — stage 05 LIVE, receipts log for real"],
  ["5678 EXPOSURE", "Closed — n8n moved behind HTTPS on the domain"],
];

export default async function HomePage() {
  const ring = await listExecutions(100);
  const rows = ring.slice(0, 10);
  const shieldRows = await listShield(10);
  const shield = await shieldCounts();
  const stages = await stageStates();
  const { now, iso: nowIso } = clock();
  const appsScriptPending = !env.APPS_SCRIPT_URL;

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

  const firstAt = ring.length > 0 ? ring[ring.length - 1].created_at : null;
  const lastFailure = rows.find((r) => r.status === "failed") ?? null;

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

  const statsLine =
    totals.n === 0
      ? "N=0 received=0 dispatched=0 failed=0 — store empty"
      : `N=${totals.n} received=${totals.received} dispatched=${totals.dispatched} failed=${totals.failed} since ${
          firstAt ? shortIso(firstAt) : "—"
        }`;

  return (
    <div>
      <section id="hero" className="ledger-lines relative flex min-h-screen items-center overflow-hidden py-16 sm:py-20">
        <Beams className="absolute inset-0" />
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
                  <a href="#pipeline" className="press inline-flex items-center gap-2 border border-border px-5 py-3 text-sm font-medium text-text transition hover:border-live focus-visible:outline-2 focus-visible:outline-live">
                    How it works
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

      <section id="dashboard" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <SectionHeading eyebrow="SIGNAL // pipeline status" title="Is it real?" />
        <div className="border border-border bg-surface">
          <div className="flex items-center gap-2 border-b border-border px-4 py-2 font-mono text-xs text-muted">
            <span className="led-ok" aria-hidden="true" />
            <span>$ ./status</span>
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
          <SectionHeading eyebrow="TRAFFIC // executions per day" title="What actually came in?" />
          <OpsChart series={series} total={totals.n} />
          <p className="mt-3 font-mono text-xs text-muted tabular-nums">
            RETAINED RING (LAST 100) — per day, by status · zero-filled days
            shown, not skipped · every figure store-derived · not all-time
          </p>
        </div>

        <div className="mt-10">
          <SectionHeading eyebrow="SHIELD LOG // rejected attempts" title="What the shield blocked" />
          <p className="mb-4 border border-border bg-surface px-4 py-3 font-mono text-xs leading-relaxed text-muted tabular-nums">
            <span className="text-text">TOTALS</span> — bots blocked: {shield.honeypot} · bad
            requests: {shield.intake_400} · rejected by workflow: {shield.n8n_rejected}
          </p>
          <div className="border border-border bg-surface">
            <div className="flex items-center gap-2 border-b border-border px-4 py-2 font-mono text-xs text-muted">
              <span className="led-warn" aria-hidden="true" />
              <span>$ ./shield --log</span>
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

        <div className="mt-10">
          <SectionHeading eyebrow="LEDGER // known unknowns" title="What&apos;s still missing?" />
          <div className="border border-border bg-surface">
            <div className="flex items-center gap-2 border-b border-border px-4 py-2 font-mono text-xs text-muted">
              <span className="led-warn" aria-hidden="true" />
              <span>$ ./ledger --known-unknowns</span>
              <span className="caret" aria-hidden="true" />
            </div>
            <ul className="divide-y divide-border">
              {ledgerItems.map((item) => (
                <li key={item.title} className="flex items-start gap-3 px-4 py-3">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 border border-muted/50"
                  />
                  <div>
                    <p className="font-mono text-sm tabular-nums">
                      <span className="text-text">{item.title}</span>
                      {item.ready ? (
                        <span className="ml-2 text-ok">CONFIGURED</span>
                      ) : (
                        <>
                          <span className="ml-2 text-warn">PENDING</span>
                          <span className="ml-2 text-muted">{item.note}</span>
                        </>
                      )}
                    </p>
                    <p className="mt-1 text-xs text-muted">{item.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-2 border border-border bg-surface">
            <div className="flex items-center gap-2 border-b border-border px-4 py-2 font-mono text-xs text-muted">
              <span className="led-ok" aria-hidden="true" />
              <span>RESOLVED THIS WEEK</span>
            </div>
            <ul className="divide-y divide-border">
              {resolvedItems.map(([title, note]) => (
                <li key={title} className="flex items-start gap-3 px-4 py-3">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 border border-ok/50"
                  />
                  <div>
                    <p className="font-mono text-sm tabular-nums">
                      <span className="text-text">{title}</span>
                      <span className="ml-2 text-ok">DONE</span>
                    </p>
                    <p className="mt-1 text-xs text-muted">{note}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          {appsScriptPending && (
            <div className="mt-4 border border-warn/40 bg-surface px-4 py-3 font-mono text-xs leading-relaxed text-muted tabular-nums">
              <span className="text-warn">DEGRADED</span> — Apps Script not
              deployed: executions return 200-degraded until the user deploys
              (docs/apps-script-setup.md) — the honest pre-deploy state.
            </div>
          )}
        </div>
      </section>

      <section id="log" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <SectionHeading eyebrow="LOG // last 10 executions" title="What did it actually do?" />
        <p className="mb-4 border border-border bg-surface px-4 py-3 font-mono text-xs leading-relaxed text-muted tabular-nums sm:text-sm">
          <span className="text-text">TOTALS</span> — {statsLine} — retained
          ring (last 100, rotated); counts of retained rows only, not all-time.
        </p>
        <div className="border border-border bg-surface">
          <div className="flex items-center gap-2 border-b border-border px-4 py-2 font-mono text-xs text-muted">
            <span className="led-ok" aria-hidden="true" />
            <span>$ ./log --tail 10</span>
            <span className="caret" aria-hidden="true" />
          </div>
          {rows.length === 0 ? (
            <div className="px-4 py-8 text-center font-mono text-sm text-muted">
              LOG EMPTY — store has no executions yet; submit a lead (see docs)
              or wait for real traffic.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left font-mono text-xs tabular-nums sm:text-sm">
                <thead className="border-b border-border text-muted">
                  <tr>
                    <th scope="col" className="px-4 py-2 font-medium">TRACKING</th>
                    <th scope="col" className="px-4 py-2 font-medium">STATE</th>
                    <th scope="col" className="px-4 py-2 font-medium">STAGE</th>
                    <th scope="col" className="px-4 py-2 font-medium">WHEN</th>
                    <th scope="col" className="px-4 py-2 font-medium">ERR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td className="px-4 py-2 text-muted">{row.id.slice(0, 8)}</td>
                      <td className="px-4 py-2 text-ok">{trackingId(row.id)}</td>
                      <td
                        className={
                          row.status === "failed"
                            ? "px-4 py-2 text-err"
                            : row.status === "dispatched"
                              ? "px-4 py-2 text-ok"
                              : "px-4 py-2 text-muted"
                        }
                      >
                        {row.status}
                      </td>
                      <td className="px-4 py-2 text-muted">{row.stage}</td>
                      <td className="px-4 py-2 text-muted">
                        <span className="text-text">
                          {relativeAge(row.created_at, now)}
                        </span>
                        <span className="block text-[0.625rem]">
                          {shortIso(row.created_at)}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-err">
                        {row.error ? row.error.slice(0, 48) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <p className="mt-3 font-mono text-xs text-muted tabular-nums">
          LAST FAILURE —{" "}
          {lastFailure
            ? `${lastFailure.id.slice(0, 8)} ${relativeAge(lastFailure.created_at, now)}: ${(lastFailure.error ?? "n/a").slice(0, 48)}`
            : "none in last 10"}
        </p>
        <p className="mt-1 font-mono text-xs text-muted tabular-nums">
          RENDERED {nowIso} — data as of last store write; relative ages
          computed at render time.
        </p>
      </section>

      <section id="legend" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <SectionHeading
          eyebrow="PIPELINE LEGEND // the five honest stages"
          title="The five stages, honestly"
        />
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-4 font-mono text-sm tabular-nums">
          {stages.map((stage, i) => (
            <li key={stage.num} className="flex items-center gap-2">
              <span className="border border-border bg-surface px-3 py-2 text-center">
                <span className="block text-text">
                  {stage.num} {stage.name}
                </span>
                <span className={stateColor[stage.state]}>{stage.state}</span>
              </span>
              {i < stages.length - 1 && (
                <span className="text-muted" aria-hidden="true">
                  →
                </span>
              )}
            </li>
          ))}
        </ol>
        <p className="mt-6 font-mono text-xs leading-relaxed text-muted">
          STATE VOCABULARY — PENDING awaiting an action · USER-GATED needs a
          browser/account step the phone cannot do · N/R no reading available ·
          CONFIGURED env present, never live-verified · DEGRADED 200-degraded
          path while APPS_SCRIPT_URL is empty · P5 deferred to documented phase
          5.
        </p>
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
          The same five stages as the live dashboard above.
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

    </div>
  );
}
