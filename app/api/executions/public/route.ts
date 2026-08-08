// /api/executions/public — PII-stripped mirror of the execution store.
//
// Deliberately public (the home-page dashboard and the Webflow one-pager
// both consume it). It exposes ONLY id prefix, tracking code, status,
// stage, created_at, and a truncated operational error string — never
// name/email/company/message. The tracking code is derived from the id via
// lib/tracking.ts so it stays deterministic across renders.
//
// Also returns totals + firstAt (retained-ring counts, no PII) and ts (the
// server read time), so the live log on the home page can render the full
// section from this one endpoint.
import { NextResponse } from "next/server";
import { listExecutions } from "@/lib/store";
import { trackingId } from "@/lib/tracking";

export async function GET() {
  const ring = await listExecutions(100);
  const rows = ring.slice(0, 10);
  const totals = {
    n: ring.length,
    received: ring.filter((r) => r.status === "received").length,
    dispatched: ring.filter((r) => r.status === "dispatched").length,
    failed: ring.filter((r) => r.status === "failed").length,
  };
  const firstAt = ring.length > 0 ? ring[ring.length - 1].created_at : null;
  return NextResponse.json({
    ok: true,
    ts: new Date().toISOString(),
    totals,
    firstAt,
    executions: rows.map((r) => ({
      id: r.id.slice(0, 8),
      tracking: trackingId(r.id),
      status: r.status,
      stage: r.stage,
      created_at: r.created_at,
      error: r.error ? r.error.slice(0, 48) : null,
    })),
  });
}
