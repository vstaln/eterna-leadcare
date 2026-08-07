import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createExecution, updateExecution } from "@/lib/store";
import { hmacHex } from "@/lib/crypto";
import { env } from "@/lib/env";
import { recordShield } from "@/lib/shield";
import { trackingId } from "@/lib/tracking";

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
    void recordShield("intake_400");
    return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400 });
  }

  // Honeypot trap: a bot that fills the hidden `website` field (real humans
  // never see it) gets a 200 that looks EXACTLY like success — including a
  // fake execution id — so bots cannot distinguish the decoy from a real
  // submission. The attempt is recorded in the shield sidecar (fire and
  // forget: never let the decoy be slower than the real path).
  if (body.website) {
    void recordShield("honeypot");
    return NextResponse.json({ ok: true, executionId: randomUUID() }, { status: 200 });
  }

  const name = typeof body.name === "string" ? body.name.trim().slice(0, 120) : "";
  const email = typeof body.email === "string" ? body.email.trim().slice(0, 200) : "";
  const company = typeof body.company === "string" ? body.company.trim().slice(0, 120) : "";
  const message = typeof body.message === "string" ? body.message.trim().slice(0, 1000) : "";

  if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    void recordShield("intake_400");
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
    // A 401 from n8n means our signed dispatch was rejected (HMAC verify
    // failed on their side). That is a SHIELD event, not a network outage —
    // record it as such so the ops dashboard can name it honestly.
    if (res.status === 401) {
      await updateExecution(executionId, {
        status: "failed",
        stage: "failed",
        error: "rejected by n8n (signed dispatch failed)",
      });
      void recordShield("n8n_rejected");
      return NextResponse.json({ ok: false, error: "pipeline unavailable" }, { status: 502 });
    }
    if (!res.ok) {
      throw new Error(`n8n ${res.status}`);
    }
    await updateExecution(executionId, { status: "dispatched", stage: "dispatched" });
    // Return the tracking code alongside the internal execution id — the
    // form's success message shows it to the visitor.
    return NextResponse.json({ ok: true, executionId, tracking: trackingId(executionId) });
  } catch {
    await updateExecution(executionId, {
      status: "failed",
      stage: "failed",
      error: "n8n unreachable",
    });
    return NextResponse.json({ ok: false, error: "pipeline unavailable" }, { status: 502 });
  }
}
