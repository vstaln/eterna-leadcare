// stages.ts — the five lockstep LeadCare stages with honest, live-verified state.
//
// Shared by the dashboard and both landing versions (v2/v3) so the
// vocabulary and the states stay lockstep everywhere. Now that the app runs
// beside its own n8n (Oracle box), RESEARCHED and LOGGED are live-probed
// instead of guessed: n8n /healthz for reachability, the executions API
// (owner key) for the log. Every probe fails soft — N/R, never a green light.

import { env } from "@/lib/env";
import { listShield, shieldCounts } from "@/lib/shield";
import { shortIso } from "@/lib/time";

export type StageLed = "ok" | "warn" | "err";

export type Stage = {
  num: string;
  name: string;
  state: string;
  led: StageLed;
  source: string;
  note: string;
};

async function probeN8nUp(): Promise<boolean> {
  if (!env.N8N_BASE_URL) return false;
  try {
    const res = await fetch(`${env.N8N_BASE_URL.replace(/\/+$/, "")}/healthz`, {
      signal: AbortSignal.timeout(3000),
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function probeN8nLog(): Promise<{ reachable: boolean; count: number }> {
  if (!env.N8N_BASE_URL || !env.N8N_API_KEY) return { reachable: false, count: 0 };
  try {
    const headers = new Headers();
    headers.set("X-N8N-API-KEY", env.N8N_API_KEY);
    const res = await fetch(`${env.N8N_BASE_URL.replace(/\/+$/, "")}/api/v1/executions?limit=100`, {
      headers,
      signal: AbortSignal.timeout(3000),
      cache: "no-store",
    });
    if (!res.ok) return { reachable: false, count: 0 };
    const data = (await res.json()) as { data?: unknown[] };
    return { reachable: true, count: Array.isArray(data.data) ? data.data.length : 0 };
  } catch {
    return { reachable: false, count: 0 };
  }
}

export async function stageStates(): Promise<Stage[]> {
  const n8nConfigured = Boolean(env.N8N_BASE_URL && env.WEBHOOK_TOKEN);
  const appsScriptConfigured = Boolean(env.APPS_SCRIPT_URL);
  const counts = await shieldCounts();
  const shieldEvents = await listShield(1);
  const firstShieldAt = shieldEvents.length > 0 ? shieldEvents[shieldEvents.length - 1].at : null;
  const [n8nUp, n8nLog] = await Promise.all([probeN8nUp(), probeN8nLog()]);
  return [
    {
      num: "01",
      name: "CAPTURED",
      state: "LIVE",
      led: "ok",
      source: "site repo",
      note: "the form on the landing page posts here — every submission is captured with a timestamp",
    },
    {
      num: "02",
      name: "SPAM SHIELD",
      state: "ENABLED",
      led: "ok",
      source: "data/shield.json",
      note: `honeypot-gated · ${counts.honeypot} blocked${
        firstShieldAt ? ` since ${shortIso(firstShieldAt)}` : " — no hits recorded"
      }`,
    },
    {
      num: "03",
      name: "RESEARCHED",
      state: n8nUp ? "LIVE" : n8nConfigured ? "CONFIGURED" : "PENDING",
      led: n8nUp ? "ok" : n8nConfigured ? "warn" : "err",
      source: n8nUp ? "n8n healthz probe" : "env",
      note: n8nUp
        ? "live-verified — n8n reachable, signed dispatch accepted"
        : n8nConfigured
          ? "N8N_BASE_URL + WEBHOOK_TOKEN present; probe failed — check reachability"
          : "N8N_BASE_URL/WEBHOOK_TOKEN missing — lead intake is offline",
    },
    {
      num: "04",
      name: "LOGGED",
      state: n8nLog.reachable ? "LIVE" : "N/R",
      led: n8nLog.reachable ? "ok" : "warn",
      source: n8nLog.reachable ? "n8n executions API" : "env",
      note: n8nLog.reachable
        ? `n8n execution log live-verified — ${n8nLog.count} record${n8nLog.count === 1 ? "" : "s"}`
        : !env.N8N_API_KEY
          ? "N8N_API_KEY empty — create an owner API key in n8n settings (user-gated); the log still records inside n8n"
          : "n8n execution log unreachable — check N8N_API_KEY and reachability",
    },
    {
      num: "05",
      name: "LIVE",
      state: appsScriptConfigured ? "LIVE" : "DEGRADED",
      led: appsScriptConfigured ? "ok" : "warn",
      source: "env",
      note: appsScriptConfigured
        ? "APPS_SCRIPT_URL present — the receipt leg is deployed"
        : "APPS_SCRIPT_URL empty — the Sheets receipt leg is not deployed (user-gated, docs/apps-script-setup.md); the dashboard itself is live",
    },
  ];
}
