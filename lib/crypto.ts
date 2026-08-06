import { createHmac, timingSafeEqual } from "crypto";

export function hmacHex(secret: string, message: string): string {
  return createHmac("sha256", secret).update(message).digest("hex");
}

export function verifyHmac(
  secret: string,
  message: string,
  provided: string
): boolean {
  const expected = hmacHex(secret, message);
  const actual = hmacHex(provided, message);
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(actual, "utf8");
  return timingSafeEqual(a, b);
}
