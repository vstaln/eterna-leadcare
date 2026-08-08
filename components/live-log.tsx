// live-log.tsx — the "Last 10 leads" table, updating live.
//
// The server renders the initial snapshot (no blank flash on load), then
// this client component polls the PII-stripped public mirror every 5s so
// the table moves as leads land. Polling pauses while the tab is hidden;
// on a failed poll it keeps the last good data and drops the live LED
// (honest — amber, never a fake green). The RENDERED line shows the
// server's own read timestamp, so the "snapshot, not live feed" claim
// stays accurate.
"use client";

import { useEffect, useState } from "react";
import SectionHeading from "@/components/section-heading";
import { relativeAge, shortIso } from "@/lib/time";

export type LiveLogExecution = {
  id: string; // 8-char id prefix (internal key)
  tracking: string; // ELC-2026-XXXXX
  status: string;
  stage: string;
  created_at: string;
  error: string | null;
};

export type LiveLogPayload = {
  ok: true;
  ts: string; // server read time, ISO
  totals: { n: number; received: number; dispatched: number; failed: number };
  firstAt: string | null;
  executions: LiveLogExecution[];
};

const statusTone: Record<string, string> = {
  received: "text-warn",
  dispatched: "text-ok",
  failed: "text-err",
};

const POLL_MS = 5000;

export default function LiveLog({ initial }: { initial: LiveLogPayload }) {
  const [data, setData] = useState<LiveLogPayload>(initial);
  const [live, setLive] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function tick() {
      if (document.hidden) return; // don't poll background tabs
      try {
        const res = await fetch("/api/executions/public", { cache: "no-store" });
        if (!res.ok) {
          setLive(false);
          return;
        }
        const json = (await res.json()) as LiveLogPayload;
        if (!cancelled) {
          setData(json);
          setLive(true);
        }
      } catch {
        setLive(false); // keep last good data, just drop the live LED
      }
    }
    void tick();
    const id = setInterval(tick, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const { totals, firstAt, executions } = data;
  const lastFailure = executions.find((r) => r.status === "failed") ?? null;
  const statsLine =
    totals.n === 0
      ? "N=0 received=0 dispatched=0 failed=0 — store empty"
      : `N=${totals.n} received=${totals.received} dispatched=${totals.dispatched} failed=${totals.failed} since ${
          firstAt ? shortIso(firstAt) : "—"
        }`;
  const now = Date.now();

  return (
    <section id="log" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
      <SectionHeading eyebrow="LOG" title="Last 10 leads" />
      <p className="mb-4 border border-border bg-surface px-4 py-3 font-mono text-xs leading-relaxed text-muted tabular-nums sm:text-sm">
        <span className="text-text">TOTALS</span> — {statsLine} — retained
        ring (last 100, rotated); counts of retained rows only, not all-time.
      </p>
      <div className="border border-border bg-surface">
        <div className="flex items-center gap-2 border-b border-border px-4 py-2 font-mono text-xs text-muted">
          <span className={live ? "led-live" : "led-warn"} aria-hidden="true" />
          <span className="caret" aria-hidden="true" />
        </div>
        {executions.length === 0 ? (
          <div className="px-4 py-8 text-center font-mono text-sm text-muted">
            LOG EMPTY — store has no executions yet; submit a lead (see docs)
            or wait for real traffic.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left font-mono text-xs tabular-nums sm:text-sm">
              <thead className="border-b border-border text-muted">
                <tr>
                  <th scope="col" className="px-4 py-2 font-medium">ID</th>
                  <th scope="col" className="px-4 py-2 font-medium">TRACKING</th>
                  <th scope="col" className="px-4 py-2 font-medium">STATE</th>
                  <th scope="col" className="px-4 py-2 font-medium">STAGE</th>
                  <th scope="col" className="px-4 py-2 font-medium">WHEN</th>
                  <th scope="col" className="px-4 py-2 font-medium">ERR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {executions.map((row) => (
                  <tr key={row.id}>
                    <td className="px-4 py-2 text-muted">{row.id}</td>
                    <td className="px-4 py-2 text-ok">{row.tracking}</td>
                    <td className={`px-4 py-2 ${statusTone[row.status] ?? "text-muted"}`}>
                      {row.status}
                    </td>
                    <td className="px-4 py-2 text-muted">{row.stage}</td>
                    <td className="px-4 py-2 text-muted">
                      <span className="text-text">{relativeAge(row.created_at, now)}</span>
                      <span className="block text-[0.625rem]">{shortIso(row.created_at)}</span>
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
          ? `${lastFailure.id} ${relativeAge(lastFailure.created_at, now)}: ${(lastFailure.error ?? "n/a").slice(0, 48)}`
          : "none in last 10"}
      </p>
      <p className="mt-1 font-mono text-xs text-muted tabular-nums">
        RENDERED {shortIso(data.ts)} — data as of last store write; relative ages
        computed at render time.
      </p>
    </section>
  );
}
