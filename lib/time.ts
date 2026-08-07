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
