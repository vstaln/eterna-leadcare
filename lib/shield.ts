// shield.ts — the "shield sidecar".
//
// WHY this file exists:
// The LeadCare promise is "nothing simulated". If the pipeline rejects a
// submission (spam bot caught by the honeypot, malformed request, n8n
// rejecting our signed dispatch), that event MUST be recorded somewhere —
// otherwise the ops dashboard cannot honestly say "N blocked".
//
// DESIGN DECISIONS:
// 1. Separate sidecar file (data/shield.json), NOT a new status in the
//    execution ring. The ring holds REAL leads (statuses: received /
//    dispatched / failed). Blocked attempts are not leads — they never
//    entered the pipeline. Mixing them in would (a) break every typed
//    map that keys on the 3 statuses, and (b) let spam rotate real
//    leads out of the 100-row retained window.
// 2. Append-only list, newest first, capped at 200 entries.
// 3. Reasons are structured (typed union) so the UI can render them.
// 4. Same atomic write pattern as lib/store.ts: write tmp file, rename.

import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

// The only reasons the current pipeline can honestly record.
// - "honeypot":     a bot filled the hidden website field (see
//                   application-form.tsx) — always a 200 decoy, no lead created.
// - "intake_400":   malformed JSON or missing/invalid fields.
// - "n8n_rejected": n8n verified our signed dispatch and rejected it (401).
export type ShieldReason = "honeypot" | "intake_400" | "n8n_rejected";

// One shield event. `id` is just a unique row id (not a lead id —
// there IS no lead; the attempt never became one).
export type ShieldEntry = {
  id: string;
  reason: ShieldReason;
  at: string; // ISO timestamp
};

const FILE = path.join(process.cwd(), "data", "shield.json");
const CAP = 200;

// Record one blocked attempt. Fire-and-forget friendly: callers on the
// hot path (honeypot decoy) should NOT await this before responding,
// otherwise a bot can measure the latency difference between the decoy
// and a real submission.
export async function recordShield(reason: ShieldReason): Promise<void> {
  const list = await readShield();
  list.unshift({ id: randomUUID(), reason, at: new Date().toISOString() });
  if (list.length > CAP) list.length = CAP;
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  const tmp = `${FILE}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(list, null, 2));
  await fs.rename(tmp, FILE);
}

// Most recent entries, newest first.
export async function listShield(limit = 20): Promise<ShieldEntry[]> {
  return (await readShield()).slice(0, limit);
}

// Counts per reason — the honest "N blocked" the ops page renders.
export async function shieldCounts(): Promise<Record<ShieldReason, number>> {
  const list = await readShield();
  return {
    honeypot: list.filter((e) => e.reason === "honeypot").length,
    intake_400: list.filter((e) => e.reason === "intake_400").length,
    n8n_rejected: list.filter((e) => e.reason === "n8n_rejected").length,
  };
}

async function readShield(): Promise<ShieldEntry[]> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as ShieldEntry[];
  } catch {
    return []; // missing or corrupt file = no events yet (honest zero)
  }
}
