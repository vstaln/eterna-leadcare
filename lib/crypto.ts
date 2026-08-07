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
