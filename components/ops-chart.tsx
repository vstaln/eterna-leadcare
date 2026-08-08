// ops-chart.tsx — recharts stacked bar of executions per day.
//
// Recharts components are client-only, so this is the one client island on
// the otherwise server-rendered home page. The DATA (series) is computed
// server-side in app/page.tsx from the real execution store and passed
// in as props — this component only renders. Every label on the page around
// it ("RETAINED RING (LAST 100)", "not all-time") keeps the honesty promise:
// the chart never fabricates history, and zero-filled days are rendered as
// real zero-height bars.
//
// Colors: zinc/console palette — received amber, dispatched green, failed
// red — matching the site's traffic-light semantics (color is information).

"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type OpsSeriesDay = {
  day: string;
  received: number;
  dispatched: number;
  failed: number;
};

export default function OpsChart({
  series,
  total,
}: {
  series: OpsSeriesDay[];
  total: number;
}) {
  return (
    <div className="border border-border bg-surface">
      <div className="flex items-center gap-2 border-b border-border px-4 py-2 font-mono text-xs text-muted">
        <span className="led-ok" aria-hidden="true" />
        <span>EXECUTIONS / DAY</span>
      </div>
      {total === 0 ? (
        <div className="px-4 py-8 text-center font-mono text-sm text-muted">
          CHART EMPTY — submit a lead to see the first bar.
        </div>
      ) : (
        <div className="p-4">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={series} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10, fontFamily: "var(--font-mono)", fill: "var(--color-muted)" }}
                stroke="var(--color-border)"
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 10, fontFamily: "var(--font-mono)", fill: "var(--color-muted)" }}
                stroke="var(--color-border)"
              />
              <Tooltip
                contentStyle={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 0,
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontFamily: "var(--font-mono)", fontSize: 11 }} />
              <Bar dataKey="received" stackId="s" fill="#fbbf24" maxBarSize={48} name="received" />
              <Bar dataKey="dispatched" stackId="s" fill="#4ade80" maxBarSize={48} name="dispatched" />
              <Bar dataKey="failed" stackId="s" fill="#f87171" maxBarSize={48} name="failed" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
