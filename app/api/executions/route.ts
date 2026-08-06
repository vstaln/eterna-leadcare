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
