// /api/health — liveness probe: uptime + timestamp.
//
// Used by the hosting layer (Cloud Run / nginx) to decide the instance is
// alive. No store access — a health check should never touch disk.
import { NextResponse } from "next/server";

const started = Date.now();

export function GET() {
  return NextResponse.json({
    status: "ok",
    uptime: Math.floor((Date.now() - started) / 1000),
    ts: new Date().toISOString(),
  });
}
