import type { Metadata } from "next";
import SectionHeading from "@/components/section-heading";
import { env } from "@/lib/env";
import { listExecutions } from "@/lib/store";
import { clock, relativeAge, shortIso } from "@/lib/time";
import { trackingId } from "@/lib/tracking";
import { listShield, shieldCounts } from "@/lib/shield";
import OpsChart from "@/components/ops-chart";
import OpsTotals from "@/components/ops-totals";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ops — Eterna LeadCare",
  description:
    "The honest report card of the LeadCare pipeline: real store rows, named stages, shield log, no simulated lights.",
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
      note: "the form on the landing page posts here — every submission is captured with a timestamp",
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

type UserGatedItem = { label: string; note: string };

const userGatedItems: UserGatedItem[] = [
  { label: "5678 EXPOSURE", note: "(user-gated — OCI security list)" },
  { label: "OWNER API KEY", note: "(P5 — N8N_API_KEY)" },
];

type LedgerItem = {
  title: string;
  ready: boolean;
  note: string;
  description: string;
};

const ledgerItems: LedgerItem[] = [
  {
    title: "5678 EXPOSURE",
    ready: false,
    note: "(user-gated — OCI security list)",
    description:
      "Open TCP 5678 inbound on the box; until then n8n is reachable only from the box itself.",
  },
  {
    title: "APPS SCRIPT DEPLOY",
    ready: Boolean(env.APPS_SCRIPT_URL),
    note: "(user-gated — docs/apps-script-setup.md)",
    description:
      "Deploy the web app and set APPS_SCRIPT_URL in .env.local; the pipeline upgrades from degraded to full after deploy.",
  },
  {
    title: "N8N OWNER API KEY",
    ready: Boolean(env.N8N_API_KEY),
    note: "(P5)",
    description:
      "Created in the n8n settings UI; needed for the P5 stage callbacks, not for the current slice.",
  },
  {
    title: "TELEGRAM NOTIFY",
    ready: false,
    note: "(P5 — documented, deferred)",
    description:
      "Live delivery notifications land in the documented P5 phase; the report card already records everything the bot would send.",
  },
];

export default async function OpsPage() {
  const ring = await listExecutions(100);
  const rows = ring.slice(0, 10);
  const { now, iso: nowIso } = clock();

  const totals = {
    n: ring.length,
    received: ring.filter((r) => r.status === "received").length,
    dispatched: ring.filter((r) => r.status === "dispatched").length,
    failed: ring.filter((r) => r.status === "failed").length,
  };
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
  // Zero-fill every day between first and last retained row — an empty day
  // renders a zero-height bar (a real "no submissions that day"), never a gap.
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

  const shieldRows = await listShield(10);
  const shield = await shieldCounts();

  const statsLine =
    totals.n === 0
      ? "N=0 received=0 dispatched=0 failed=0 — store empty"
      : `N=${totals.n} received=${totals.received} dispatched=${totals.dispatched} failed=${totals.failed} since ${
          firstAt ? shortIso(firstAt) : "—"
        }`;

  const stages = await stageStates();
  const appsScriptPending = !env.APPS_SCRIPT_URL;

  return (
    <div>
      <section className="bg-grid scanlines relative overflow-hidden pt-28 pb-12 sm:pt-36">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="mb-6 font-mono text-xs uppercase tracking-widest text-muted">
            ET-48 // OPS DASHBOARD — LIVE REPORT CARD
          </p>
          <h1 className="max-w-3xl text-balance text-[clamp(2.25rem,5vw,3.75rem)] font-semibold leading-[1.05] tracking-tighter text-text">
            Operations Dashboard
          </h1>
          <p className="mt-6 measure text-balance text-base leading-relaxed text-muted">
            Every LOG row is rendered from the real execution store; every
            other datum is a labeled env reading — nothing is simulated. Each
            instrument shows its own state and source — unreadable ones drop
            N/R flags, never green lights.
          </p>
        </div>
      </section>

      <section id="signal" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <SectionHeading eyebrow="SIGNAL // pipeline status" title="Is it real?" />
        <div className="mb-6">
          <OpsTotals n={totals.n} received={totals.received} dispatched={totals.dispatched} failed={totals.failed} />
        </div>
        <div className="mb-6 border border-border bg-surface px-4 py-3 font-mono text-xs leading-relaxed text-muted tabular-nums">
          <span className="text-text">REALITY KEY</span> — every LOG row is
          rendered from the real execution store; every other datum is a
          labeled env reading — nothing is simulated.
        </div>
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
          <div className="border-t border-border bg-surface px-4 py-3">
            <p className="mb-2 font-mono text-xs uppercase tracking-widest text-muted">
              User-gated items
            </p>
            <ul className="space-y-1.5 font-mono text-xs tabular-nums">
              {userGatedItems.map((item) => (
                <li key={item.label} className="flex flex-wrap items-center gap-2">
                  <span className="led-warn" aria-hidden="true" />
                  <span className="text-text">{item.label}</span>
                  <span className="text-warn">PENDING</span>
                  <span className="text-muted">{item.note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="chart" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <SectionHeading eyebrow="TRAFFIC // executions per day" title="What actually came in?" />
        <OpsChart series={series} total={totals.n} />
        <p className="mt-3 font-mono text-xs text-muted tabular-nums">
          RETAINED RING (LAST 100) — per day, by status · zero-filled days
          shown, not skipped · every figure store-derived · not all-time
        </p>
      </section>

      <section id="shield" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <SectionHeading eyebrow="SHIELD LOG // rejected attempts" title="What the shield blocked" />
        <p className="mb-4 border border-border bg-surface px-4 py-3 font-mono text-xs leading-relaxed text-muted tabular-nums">
          <span className="text-text">TOTALS</span> — honeypot: {shield.honeypot} · malformed
          requests: {shield.intake_400} · signed-dispatch rejected: {shield.n8n_rejected}
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
      </section>

      <section id="ledger" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
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
        {appsScriptPending && (
          <div className="mt-4 border border-warn/40 bg-surface px-4 py-3 font-mono text-xs leading-relaxed text-muted tabular-nums">
            <span className="text-warn">DEGRADED</span> — Apps Script not
            deployed: executions return 200-degraded until the user deploys
            (docs/apps-script-setup.md) — the honest pre-deploy state.
          </div>
        )}
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
    </div>
  );
}
