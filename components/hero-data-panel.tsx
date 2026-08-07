import { TerminalWindow } from "@phosphor-icons/react/dist/ssr";
import { listExecutions } from "@/lib/store";

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

function clock() {
  return { now: Date.now(), iso: new Date().toISOString() };
}

const statusLed: Record<string, string> = {
  received: "led-warn",
  dispatched: "led-ok",
  failed: "led-err",
};

const statusColor: Record<string, string> = {
  received: "text-warn",
  dispatched: "text-ok",
  failed: "text-err",
};

export default async function HeroDataPanel() {
  const rows = await listExecutions(5);
  const { now, iso } = clock();

  return (
    <div className="w-full border border-border bg-surface font-mono">
      <div className="flex items-center gap-2 border-b border-border px-4 py-2 text-xs text-muted">
        <TerminalWindow className="h-4 w-4 text-ok" aria-hidden="true" />
        <span>vstal@eterna:~/ops $ tail -n 5 executions.json</span>
      </div>
      {rows.length === 0 ? (
        <p className="px-4 py-8 text-center text-xs leading-relaxed text-muted">
          LOG EMPTY: no executions yet - submit a lead (see docs) or wait for real traffic.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {rows.map((row) => (
            <li
              key={row.id}
              className="flex items-center gap-3 px-4 py-2 text-xs"
            >
              <span className={statusLed[row.status]} aria-hidden="true" />
              <span className="text-muted">{row.id.slice(0, 8)}</span>
              <span className={statusColor[row.status]}>{row.status}</span>
              <span className="text-muted">{row.stage}</span>
              <span className="ml-auto shrink-0 text-text">
                {relativeAge(row.created_at, now)}
              </span>
            </li>
          ))}
        </ul>
      )}
      <div className="border-t border-border px-4 py-2 text-[0.625rem] uppercase tracking-widest text-muted">
        REAL DATA - last 5 executions - rendered {iso}
      </div>
    </div>
  );
}

