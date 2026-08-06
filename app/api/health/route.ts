import { NextResponse } from "next/server";

const started = Date.now();

export function GET() {
  return NextResponse.json({
    status: "ok",
    uptime: Math.floor((Date.now() - started) / 1000),
    ts: new Date().toISOString(),
  });
}
