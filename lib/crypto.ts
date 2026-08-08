// crypto.ts — HMAC-SHA256 sign + verify, the shared-secret core of the
// signed dispatch.
//
// WHY: /api/lead signs each dispatch over `executionId.nonce.ts` with
// WEBHOOK_TOKEN; n8n re-derives and timing-safe-compares it. verifyHmac
// uses timingSafeEqual so an attacker can't learn the token from response
// timing — and length-checking first avoids the throw on mismatched sizes.
import { createHmac, timingSafeEqual } from "crypto";

export function hmacHex(secret: string, message: string): string {
  return createHmac("sha256", secret).update(message).digest("hex");
}

export function verifyHmac(
  secret: string,
  message: string,
  provided: string
): boolean {
  const expected = Buffer.from(hmacHex(secret, message), "utf8");
  const actual = Buffer.from(provided, "utf8");
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}
