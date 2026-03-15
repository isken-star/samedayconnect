import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export function generateToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

export function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

export function compareTokenWithHash(rawToken: string, expectedHash: string): boolean {
  const current = Buffer.from(hashToken(rawToken), "utf8");
  const expected = Buffer.from(expectedHash, "utf8");

  if (current.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(current, expected);
}
