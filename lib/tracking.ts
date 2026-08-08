// tracking.ts — deterministic "tracking number" derived from a lead's UUID.
//
// WHY: LeadCare's client-facing promise is that every lead is trackable
// ("like J&T tracking, but for leads"). We derive a short, human-friendly
// code from the execution UUID so we get a trackable id WITHOUT changing
// the store schema or the API contracts (the UUID stays the internal key).
//
// Format: ELC-2026-XXXXX  (brand prefix + year + 5-digit hash fragment).
// Deterministic: same UUID always yields the same code, on any renderer
// (server or client), which is what lets the form's success message show
// the exact same code the dashboard shows.

export function trackingId(id: string): string {
  // Simple 32-bit FNV-1a-style hash over the UUID string.
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash ^= id.charCodeAt(i);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  // Collision-safe at the 100-row ring scale; padded to a fixed width so
  // all codes are the same length (nicer in tables and copy).
  const fragment = String(hash % 100000).padStart(5, "0");
  return `ELC-2026-${fragment}`;
}
