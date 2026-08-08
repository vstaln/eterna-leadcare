// time.ts — small time-presentation helpers shared by the dashboard rows,
// the shield log, and the /live tracking page.
//
// All take an ISO string and render a human string; they never touch the
// store. `now` is passed in as an argument (not read internally) so every
// row on a page renders against the same clock tick — honest relative ages.

export type StatusKey = "received" | "dispatched" | "failed";

export function relativeAge(iso: string, now: number): string {
  const ms = now - new Date(iso).getTime();
  const secs = Number.isFinite(ms) ? Math.max(0, Math.floor(ms / 1000)) : 0;
  if (secs < 60) return "now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function shortIso(iso: string): string {
  return iso.slice(0, 19).replace("T", " ");
}

export function clock() {
  return { now: Date.now(), iso: new Date().toISOString() };
}

// Per-status LED + text color classes, so the whole app colors a lead's
// state the same way: received = amber (in flight), dispatched = green
// (done), failed = red.
export const statusLed: Record<StatusKey, string> = {
  received: "led-warn",
  dispatched: "led-ok",
  failed: "led-err",
};

export const statusColor: Record<StatusKey, string> = {
  received: "text-warn",
  dispatched: "text-ok",
  failed: "text-err",
};
