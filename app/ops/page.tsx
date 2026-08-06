import type { Metadata } from "next";
import SectionHeading from "@/components/section-heading";
import { env } from "@/lib/env";
import { listExecutions } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ops — Eterna Ops Command Center",
  description:
    "The honest report card of the EMPWR-pattern pipeline: real store rows, named states, no simulated lights.",
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

function stageStates(): Stage[] {
  const n8nConfigured = Boolean(env.N8N_BASE_URL && env.WEBHOOK_TOKEN);
  const hmacEnabled = Boolean(env.WEBHOOK_TOKEN);
  const appsScriptConfigured = Boolean(env.APPS_SCRIPT_URL);
  return [
    {
      num: "01",
      name: "FORM",
      state: "STATIC PREVIEW",
      led: "warn",
      source: "site repo",
      note: "no form UI shipped yet; intake endpoint /api/lead is live",
    },
    {
      num: "02",
      name: "HMAC GATE",
      state: hmacEnabled ? "ENABLED" : "PENDING",
      led: hmacEnabled ? "ok" : "err",
      source: "env",
      note: hmacEnabled
        ? "sha256 + 5-min freshness — WEBHOOK_TOKEN present; every dispatch is signed"
        : "WEBHOOK_TOKEN missing — dispatches cannot be signed; /api/lead returns 503",
    },
    {
      num: "03",
      name: "N8N",
      state: n8nConfigured ? "CONFIGURED" : "PENDING",
      led: n8nConfigured ? "ok" : "err",
      source: "env",
      note: n8nConfigured
        ? "N8N_BASE_URL + WEBHOOK_TOKEN present; never live-verified from this device — no public status endpoint"
        : "N8N_BASE_URL/WEBHOOK_TOKEN missing — lead intake is offline",
    },
    {
      num: "04",
      name: "RDAP",
      state: "N/R",
      led: "warn",
      source: "workflow definition",
      note: "runs inside n8n (docs/n8n-workflow.json); no runtime readout reachable from this phone",
    },
    {
      num: "05",
      name: "APPS SCRIPT",
      state: appsScriptConfigured ? "CONFIGURED" : "PENDING",
      led: appsScriptConfigured ? "ok" : "warn",
      source: "env",
      note: appsScriptConfigured
        ? "APPS_SCRIPT_URL present — deployed outside this phone"
        : "user deploy (docs/apps-script-setup.md) — APPS_SCRIPT_URL empty; the log leg answers 200-degraded until deployed",
    },
  ];
}

const stateColor: Record<string, string> = {
  "STATIC PREVIEW": "text-warn",
  ENABLED: "text-ok",
  CONFIGURED: "text-ok",
  "N/R": "text-warn",
  PENDING: "text-warn",
  DEGRADED: "text-err",
};

function relativeAge(iso: string, now: number): string {
  const ms = now - new Date(iso).getTime();
  const secs = Number.isFinite(ms) ? Math.max(0, Math.floor(ms / 1000)) : 0;
  if (secs < 60) return "now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function shortIso(iso: string): string {
  return iso.slice(0, 19).replace("T", " ");
}

function clock() {
  return { now: Date.now(), iso: new Date().toISOString() };
}

export default async function OpsPage() {
  const rows = await listExecutions(10);
  const ring = await listExecutions(100);
  const { now, iso: nowIso } = clock();

  const totals = {
    n: ring.length,
    received: ring.filter((r) => r.status === "received").length,
    dispatched: ring.filter((r) => r.status === "dispatched").length,
    failed: ring.filter((r) => r.status === "failed").length,
  };
  const firstAt = ring.length > 0 ? ring[ring.length - 1].created_at : null;
  const lastFailure = rows.find((r) => r.status === "failed") ?? null;

  const statsLine =
    totals.n === 0
      ? "N=0 received=0 dispatched=0 failed=0 — store empty"
      : `N=${totals.n} received=${totals.received} dispatched=${totals.dispatched} failed=${totals.failed} since ${
          firstAt ? shortIso(firstAt) : "—"
        }`;

  const stages = stageStates();
  const appsScriptPending = !env.APPS_SCRIPT_URL;

  return (
    <div>
      <section className="bg-grid scanlines relative overflow-hidden pt-28 pb-12 sm:pt-36">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="mb-6 font-mono text-xs uppercase tracking-widest text-muted">
            ET-48 // OPS DASHBOARD — LIVE REPORT CARD
          </p>
          <h1 className="max-w-3xl text-balance text-[clamp(2.25rem,5vw,3.75rem)] font-bold leading-[1.05] tracking-[-0.03em] text-text">
            Operations Dashboard
          </h1>
          <p className="mt-6 max-w-xl text-balance text-base leading-relaxed text-muted">
            Every row on this page comes from the real execution store. Each
            instrument shows its own state and source — unreadable ones drop
            N/R flags, never green lights.
          </p>
        </div>
      </section>

      <section id="signal" className="mx-auto max-w-6xl px-6 py-16">
        <SectionHeading eyebrow="SIGNAL // pipeline status" title="Is it real?" />
        <div className="mb-6 border border-border bg-surface px-4 py-3 font-mono text-xs leading-relaxed text-muted">
          <span className="text-text">REALITY KEY</span> — every row on this
          page is rendered from the real execution store; nothing is simulated.
        </div>
        <ul className="divide-y divide-border border border-border bg-surface">
          {stages.map((stage) => (
            <li
              key={stage.num}
              className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
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
          <ul className="space-y-1.5 font-mono text-xs">
            <li className="flex flex-wrap items-center gap-2">
              <span className="led-warn" aria-hidden="true" />
              <span className="text-text">5678 EXPOSURE</span>
              <span className="text-warn">PENDING</span>
              <span className="text-muted">(user-gated — OCI security list)</span>
            </li>
            <li className="flex flex-wrap items-center gap-2">
              <span className="led-warn" aria-hidden="true" />
              <span className="text-text">OWNER API KEY</span>
              <span className="text-warn">PENDING</span>
              <span className="text-muted">(P5 — N8N_API_KEY)</span>
            </li>
          </ul>
        </div>
      </section>

      <section id="ledger" className="mx-auto max-w-6xl px-6 py-16">
        <SectionHeading eyebrow="LEDGER // known unknowns" title="What&apos;s still missing?" />
        <ul className="divide-y divide-border border border-border bg-surface">
          <li className="flex items-start gap-3 px-4 py-3">
            <span
              aria-hidden="true"
              className="mt-0.5 h-3.5 w-3.5 shrink-0 border border-muted/50"
            />
            <div>
              <p className="font-mono text-sm">
                <span className="text-text">5678 EXPOSURE</span>
                <span className="ml-2 text-warn">PENDING</span>
                <span className="ml-2 text-muted">(user-gated — OCI security list)</span>
              </p>
              <p className="mt-1 text-xs text-muted">
                Open TCP 5678 inbound on the box; until then n8n is reachable
                only from the box itself.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3 px-4 py-3">
            <span
              aria-hidden="true"
              className="mt-0.5 h-3.5 w-3.5 shrink-0 border border-muted/50"
            />
            <div>
              <p className="font-mono text-sm">
                <span className="text-text">APPS SCRIPT DEPLOY</span>
                {env.APPS_SCRIPT_URL ? (
                  <span className="ml-2 text-ok">DONE</span>
                ) : (
                  <>
                    <span className="ml-2 text-warn">PENDING</span>
                    <span className="ml-2 text-muted">(user-gated — docs/apps-script-setup.md)</span>
                  </>
                )}
              </p>
              <p className="mt-1 text-xs text-muted">
                Deploy the web app and set APPS_SCRIPT_URL in .env.local; the
                pipeline upgrades from degraded to full after deploy.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3 px-4 py-3">
            <span
              aria-hidden="true"
              className="mt-0.5 h-3.5 w-3.5 shrink-0 border border-muted/50"
            />
            <div>
              <p className="font-mono text-sm">
                <span className="text-text">N8N OWNER API KEY</span>
                {env.N8N_API_KEY ? (
                  <span className="ml-2 text-ok">DONE</span>
                ) : (
                  <>
                    <span className="ml-2 text-warn">PENDING</span>
                    <span className="ml-2 text-muted">(P5)</span>
                  </>
                )}
              </p>
              <p className="mt-1 text-xs text-muted">
                Created in the n8n settings UI; needed for the P5 stage
                callbacks, not for the current slice.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3 px-4 py-3">
            <span
              aria-hidden="true"
              className="mt-0.5 h-3.5 w-3.5 shrink-0 border border-muted/50"
            />
            <div>
              <p className="font-mono text-sm">
                <span className="text-text">TELEGRAM NOTIFY</span>
                <span className="ml-2 text-warn">PENDING</span>
                <span className="ml-2 text-muted">(P5 — documented, deferred)</span>
              </p>
              <p className="mt-1 text-xs text-muted">
                Live delivery notifications land in the documented P5 phase;
                the report card already records everything the bot would send.
              </p>
            </div>
          </li>
        </ul>
        {appsScriptPending && (
          <div className="mt-4 border border-warn/40 bg-surface px-4 py-3 font-mono text-xs leading-relaxed text-muted">
            <span className="text-warn">DEGRADED</span> — Apps Script not
            deployed: executions return 200-degraded until the user deploys
            (docs/apps-script-setup.md) — the honest pre-deploy state.
          </div>
        )}
      </section>

      <section id="log" className="mx-auto max-w-6xl px-6 py-16">
        <SectionHeading eyebrow="LOG // last 10 executions" title="What did it actually do?" />
        <p className="mb-4 border border-border bg-surface px-4 py-3 font-mono text-xs leading-relaxed text-muted sm:text-sm">
          <span className="text-text">TOTALS</span> — {statsLine} — retained
          ring (last 100, rotated); counts of retained rows only, not all-time.
        </p>
        {rows.length === 0 ? (
          <div className="border border-border bg-surface px-4 py-8 text-center font-mono text-sm text-muted">
            LOG EMPTY — store has no executions yet; submit a lead (see docs)
            or wait for real traffic.
          </div>
        ) : (
          <div className="overflow-x-auto border border-border bg-surface">
            <table className="w-full min-w-[640px] text-left font-mono text-xs sm:text-sm">
              <thead className="border-b border-border text-muted">
                <tr>
                  <th scope="col" className="px-4 py-2 font-medium">ID</th>
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
        <p className="mt-3 font-mono text-xs text-muted">
          LAST FAILURE —{" "}
          {lastFailure
            ? `${lastFailure.id.slice(0, 8)} ${relativeAge(lastFailure.created_at, now)}: ${(lastFailure.error ?? "n/a").slice(0, 48)}`
            : "none in last 10"}
        </p>
        <p className="mt-1 font-mono text-xs text-muted">
          RENDERED {nowIso} — data as of last store write; relative ages
          computed at render time.
        </p>
      </section>

      <section id="legend" className="mx-auto max-w-6xl px-6 py-16">
        <SectionHeading
          eyebrow="PIPELINE LEGEND // the five honest stages"
          title="The five stages, honestly"
        />
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-4 font-mono text-sm">
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
