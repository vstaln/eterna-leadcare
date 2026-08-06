import { NextRequest, NextResponse } from "next/server";
import { listExecutions } from "@/lib/store";
import { env } from "@/lib/env";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!env.EXECUTIONS_AUTH_TOKEN || auth !== `Bearer ${env.EXECUTIONS_AUTH_TOKEN}`) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const rows = await listExecutions(50);
  return NextResponse.json({ ok: true, executions: rows });
}
