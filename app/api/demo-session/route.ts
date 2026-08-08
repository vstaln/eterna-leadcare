import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const N8N_BASE = process.env.N8N_BASE_URL ?? "http://host.docker.internal:5678";

export async function GET() {
  const email = process.env.DEMO_N8N_EMAIL;
  const password = process.env.DEMO_N8N_PASSWORD;
  if (!email || !password) {
    return NextResponse.json({ ok: false, error: "demo session not configured" }, { status: 503 });
  }
  try {
    const res = await fetch(`${N8N_BASE.replace(/\/+$/, "")}/rest/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ emailOrLdapLoginId: email, password }),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      return NextResponse.json({ ok: false, error: "n8n login failed" }, { status: 502 });
    }
    const setCookie = res.headers.getSetCookie?.() ?? [];
    const n8nAuth = setCookie.find((c) => c.startsWith("n8n-auth="));
    if (!n8nAuth) {
      return NextResponse.json({ ok: false, error: "no session cookie from n8n" }, { status: 502 });
    }
    const pair = n8nAuth.split(";")[0];
    const response = NextResponse.json({ ok: true });
    response.headers.set(
      "Set-Cookie",
      `${pair}; Path=/; HttpOnly; Secure; SameSite=Lax`
    );
    return response;
  } catch {
    return NextResponse.json({ ok: false, error: "n8n unreachable" }, { status: 502 });
  }
}
