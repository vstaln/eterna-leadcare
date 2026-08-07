"use client";

interface OpsTotalsProps {
  n: number;
  received: number;
  dispatched: number;
  failed: number;
}

export default function OpsTotals({ n, received, dispatched, failed }: OpsTotalsProps) {
  const stats: { label: string; value: number; tone: string }[] = [
    { label: "TOTAL", value: n, tone: "text-text" },
    { label: "RECEIVED", value: received, tone: "text-warn" },
    { label: "DISPATCHED", value: dispatched, tone: "text-ok" },
    { label: "FAILED", value: failed, tone: "text-err" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {stats.map((stat, i) => (
        <div key={stat.label} className="border border-border bg-surface p-4">
          <span className="block font-mono text-xs uppercase tracking-widest text-muted">
            {stat.label}
          </span>
          <span
            className={`mt-1 block font-mono text-2xl font-medium tabular-nums ${stat.tone} number-pop`}
            style={{ animationDelay: `calc(${i} * var(--duration-stagger))` }}
          >
            {stat.value}
          </span>
        </div>
      ))}
    </div>
  );
}
