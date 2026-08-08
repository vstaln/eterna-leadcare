// /api/executions — the FULL execution store, bearer-gated.
//
// Unlike the public mirror (/api/executions/public), this returns complete
// rows (id, status, stage, timestamps, error). It is protected by an HMAC
// of the EXECUTIONS_AUTH_TOKEN (see lib/crypto.ts) so the raw store is
// never exposed to the public dashboard. The dashboard itself renders the
// PII-stripped mirror instead.
import { NextRequest, NextResponse } from "next/server";
import { listExecutions } from "@/lib/store";
import { env } from "@/lib/env";
import { verifyHmac } from "@/lib/crypto";

export async function GET(req: NextRequest) {
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!env.EXECUTIONS_AUTH_TOKEN || !verifyHmac(env.EXECUTIONS_AUTH_TOKEN, "executions", token)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const rows = await listExecutions(50);
  return NextResponse.json({ ok: true, executions: rows });
}
