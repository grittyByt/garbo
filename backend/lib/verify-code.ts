// Helpers: generate code, hash it, and compare

import * as crypto from "crypto";

export function generate6DigitCode(): string {
  // 000000 - 999999
  const n = crypto.randomInt(0, 1_000_000);
  return n.toString().padStart(6, "0");
}

export function hashCode(code: string): string {
  // Pepper is optional but recommended:
  const pepper = process.env.VERIFICATION_CODE_PEPPER ?? "";
  return crypto.createHash("sha256").update(code + pepper).digest("hex");
}

export function timingSafeEqualHex(a: string, b: string): boolean {
  const ba = Buffer.from(a, "hex");
  const bb = Buffer.from(b, "hex");
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}