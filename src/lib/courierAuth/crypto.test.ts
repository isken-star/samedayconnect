import { describe, expect, it } from "vitest";

import { compareTokenWithHash, generateToken, hashToken } from "./crypto";

describe("courier auth crypto", () => {
  it("generates sufficiently long base64url token", () => {
    const token = generateToken();
    expect(token.length).toBeGreaterThanOrEqual(43);
  });

  it("hashes and verifies token matches", () => {
    const token = generateToken();
    const hash = hashToken(token);
    expect(compareTokenWithHash(token, hash)).toBe(true);
    expect(compareTokenWithHash(`${token}-x`, hash)).toBe(false);
  });
});
