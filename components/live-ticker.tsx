import { listExecutions } from "@/lib/store";
import type { Execution } from "@/lib/store";
import { relativeAge, statusLed, statusColor, clock } from "@/lib/time";

function TickRow({
  row,
  now,
  ariaHidden,
}: {
  row: Execution;
  now: number;
  ariaHidden?: boolean;
}) {
  return (
    <span
      aria-hidden={ariaHidden || undefined}
      className="flex items-center gap-2 px-8 font-mono text-xs tabular-nums whitespace-nowrap"
    >
      <span className={statusLed[row.status]} aria-hidden="true" />
      <span className="text-muted">{row.id.slice(0, 8)}</span>
      <span className={statusColor[row.status]}>{row.status}</span>
      <span className="text-muted">stage={row.stage}</span>
      <span className="text-text">{relativeAge(row.created_at, now)}</span>
      <span className="text-muted">·</span>
    </span>
  );
}

export default async function LiveTicker() {
  const rows = await listExecutions(20);
  const { now } = clock();

  if (rows.length === 0) {
    return (
      <div className="relative overflow-hidden border-y border-border bg-surface">
        <div className="flex items-center gap-2 border-b border-border px-4 py-2 font-mono text-xs text-muted">
          <span className="led-live" aria-hidden="true" />
          <span>$ tail -f executions.json</span>
          <span className="caret" />
        </div>
        <div className="ticker">
          <div className="ticker-track">
            <span className="px-8 font-mono text-xs text-muted whitespace-nowrap">
              LOG EMPTY — no executions yet
            </span>
            <span className="px-8 font-mono text-xs text-muted whitespace-nowrap" aria-hidden="true">
              LOG EMPTY — no executions yet
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden border-y border-border bg-surface">
      <div className="flex items-center gap-2 border-b border-border px-4 py-2 font-mono text-xs text-muted">
        <span className="led-live" aria-hidden="true" />
        <span>$ tail -f executions.json</span>
        <span className="caret" />
      </div>
      <div className="ticker">
        <div className="ticker-track">
          {rows.map((row) => (
            <TickRow key={`a-${row.id}`} row={row} now={now} />
          ))}
          {rows.map((row) => (
            <TickRow key={`b-${row.id}`} row={row} now={now} ariaHidden />
          ))}
        </div>
      </div>
    </div>
  );
}
