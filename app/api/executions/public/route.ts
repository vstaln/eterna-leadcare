// /api/executions/public — PII-stripped mirror of the execution store.
//
// Deliberately public (the home-page dashboard and the Webflow one-pager
// both consume it). It exposes ONLY id prefix, tracking code, status,
// stage, and created_at — never name/email/company/message. The tracking
// code is derived from the id via lib/tracking.ts so it stays deterministic
// across renders.
import { NextResponse } from "next/server";
import { listExecutions } from "@/lib/store";
import { trackingId } from "@/lib/tracking";

export async function GET() {
  const rows = await listExecutions(10);
  return NextResponse.json({
    ok: true,
    executions: rows.map((r) => ({
      id: r.id.slice(0, 8),
      tracking: trackingId(r.id),
      status: r.status,
      stage: r.stage,
      created_at: r.created_at,
    })),
  });
}
