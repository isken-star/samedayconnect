import { beforeEach, describe, expect, it } from "vitest";

import { __resetRateLimitForTests, checkMagicLinkRateLimit } from "./rateLimit";

describe("magic link rate limit", () => {
  beforeEach(() => {
    __resetRateLimitForTests();
  });

  it("allows requests under threshold", async () => {
    const now = Date.now();
    for (let index = 0; index < 5; index += 1) {
      const result = await checkMagicLinkRateLimit({
        email: "test@couriercommunity.co.uk",
        ip: "127.0.0.1",
        nowMs: now,
      });
      expect(result.allowed).toBe(true);
    }
  });

  it("blocks when email threshold exceeded", async () => {
    const now = Date.now();
    for (let index = 0; index < 5; index += 1) {
      await checkMagicLinkRateLimit({
        email: "test@couriercommunity.co.uk",
        ip: `127.0.0.${index}`,
        nowMs: now,
      });
    }

    const blocked = await checkMagicLinkRateLimit({
      email: "test@couriercommunity.co.uk",
      ip: "127.0.0.9",
      nowMs: now,
    });
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });
});
