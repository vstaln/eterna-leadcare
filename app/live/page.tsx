import SectionHeading from "@/components/section-heading";
import LiveLookup from "@/components/live-lookup";
import { listExecutions } from "@/lib/store";
import { trackingId } from "@/lib/tracking";
import { shortIso } from "@/lib/time";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Eterna LeadCare — track a lead",
  description:
    "Enter the tracking number the form gave you and see where the lead is on the ledger — the same real store the ops dashboard renders.",
};

const statusTone: Record<string, string> = {
  received: "text-warn",
  dispatched: "text-ok",
  failed: "text-err",
};

export default async function LivePage({
  searchParams,
}: {
  searchParams: Promise<{ tracking?: string }>;
}) {
  const { tracking } = await searchParams;
  const target = (tracking ?? "").trim().toUpperCase();
  const ring = await listExecutions(100);
  const row = target ? (ring.find((r) => trackingId(r.id) === target) ?? null) : null;

  return (
    <div className="mx-auto max-w-6xl px-6 pt-24 pb-20 sm:pt-32">
      <SectionHeading eyebrow="TRACK A LEAD" title="Your lead, on the ledger" />
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">
        Enter the tracking number the capture terminal gave you — it looks up the same real store
        the ops dashboard renders. No simulated statuses.
      </p>

      <div className="mt-8 max-w-2xl">
        <LiveLookup />
      </div>

      <div className="mt-10 max-w-2xl">
        {!target && (
          <p className="border border-border bg-surface px-5 py-4 font-mono text-xs text-muted">
            Format: <span className="text-text">ELC-2026-XXXXX</span> — five digits, zero-padded.
            Example from the demo:{" "}
            <span className="text-text">ELC-2026-44691</span>.
          </p>
        )}

        {target && row && (
          <div className="border border-border bg-surface">
            <div className="flex items-center gap-2 border-b border-border px-4 py-2 font-mono text-xs text-muted">
              <span className="led-ok" aria-hidden="true" />
              <span>LEAD FOUND IN THE LEDGER</span>
              <span className="stamp stamp-green ml-auto !px-2 !py-0.5 !text-[0.625rem]" aria-hidden="true">
                REAL ROW
              </span>
            </div>
            <dl className="divide-y divide-border font-mono text-sm">
              <div className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-baseline sm:justify-between">
                <dt className="text-xs uppercase tracking-widest text-muted">Tracking</dt>
                <dd className="text-text">{trackingId(row.id)}</dd>
              </div>
              <div className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-baseline sm:justify-between">
                <dt className="text-xs uppercase tracking-widest text-muted">Status</dt>
                <dd className={statusTone[row.status]}>{row.status}</dd>
              </div>
              <div className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-baseline sm:justify-between">
                <dt className="text-xs uppercase tracking-widest text-muted">Stage</dt>
                <dd className="text-text">{row.stage}</dd>
              </div>
              <div className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-baseline sm:justify-between">
                <dt className="text-xs uppercase tracking-widest text-muted">Submitted</dt>
                <dd className="text-text">{shortIso(row.created_at)} UTC</dd>
              </div>
              {row.error && (
                <div className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-baseline sm:justify-between">
                  <dt className="text-xs uppercase tracking-widest text-muted">Error</dt>
                  <dd className="text-err">{row.error}</dd>
                </div>
              )}
            </dl>
            <p className="border-t border-border px-5 py-3 font-mono text-xs text-muted">
              Same ledger as /ops — if it shows here, it happened.
            </p>
          </div>
        )}

        {target && !row && (
          <div className="border border-border bg-surface">
            <div className="flex items-center gap-2 border-b border-border px-4 py-2 font-mono text-xs text-muted">
              <span className="led-err" aria-hidden="true" />
              <span>NO SUCH TRACKING</span>
            </div>
            <div className="px-5 py-4">
              <p className="font-mono text-sm text-text">{target}</p>
              <p className="mt-3 font-mono text-xs leading-relaxed text-muted">
                Codes that never landed don&apos;t exist on this ledger. If you just submitted, the
                row is written before you see the success message — double-check the code, or send a
                fresh test lead.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
