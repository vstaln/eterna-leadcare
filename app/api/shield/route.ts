// /api/shield — public readout of the shield sidecar.
//
// Returns ONLY aggregate counts + recent reasons/timestamps.
// NO PII: blocked attempts never contain name/email/message payloads,
// so this endpoint is safe to expose publicly (the Webflow one-pager
// and the ops dashboard both consume it).

import { NextResponse } from "next/server";
import { listShield, shieldCounts } from "@/lib/shield";

export async function GET() {
  return NextResponse.json({
    ok: true,
    counts: await shieldCounts(),
    recent: await listShield(10),
  });
}
