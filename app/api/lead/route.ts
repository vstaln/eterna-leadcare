import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createExecution, updateExecution } from "@/lib/store";
import { hmacHex } from "@/lib/crypto";
import { env } from "@/lib/env";

export async function POST(req: NextRequest) {
  if (!env.N8N_BASE_URL || !env.WEBHOOK_TOKEN) {
    return NextResponse.json(
      { ok: false, error: "pipeline not configured" },
      { status: 503 }
    );
  }

  let body: {
    name?: string;
    email?: string;
    company?: string;
    message?: string;
    website?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400 });
  }

  if (body.website) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim().slice(0, 120) : "";
  const email = typeof body.email === "string" ? body.email.trim().slice(0, 200) : "";
  const company = typeof body.company === "string" ? body.company.trim().slice(0, 120) : "";
  const message = typeof body.message === "string" ? body.message.trim().slice(0, 1000) : "";

  if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "invalid fields" }, { status: 400 });
  }

  const executionId = randomUUID();
  const ts = String(Math.floor(Date.now() / 1000));
  const nonce = randomUUID();
  const signature = hmacHex(env.WEBHOOK_TOKEN, `${executionId}.${nonce}.${ts}`);

  await createExecution(executionId, "received", "queued");

  try {
    const url = `${env.N8N_BASE_URL.replace(/\/+$/, "")}/${env.N8N_WEBHOOK_PATH.replace(/^\/+/, "")}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-nonce": nonce,
        "x-ts": ts,
        "x-hmac": signature,
      },
      body: JSON.stringify({
        executionId,
        name,
        email,
        company,
        message,
        nonce,
        ts,
        signature,
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      throw new Error(`n8n ${res.status}`);
    }
    await updateExecution(executionId, { status: "dispatched", stage: "dispatched" });
    return NextResponse.json({ ok: true, executionId });
  } catch {
    await updateExecution(executionId, {
      status: "failed",
      stage: "failed",
      error: "n8n unreachable",
    });
    return NextResponse.json({ ok: false, error: "pipeline unavailable" }, { status: 502 });
  }
}
