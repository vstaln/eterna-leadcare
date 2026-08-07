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
