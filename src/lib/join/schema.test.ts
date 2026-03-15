import { describe, expect, it } from "vitest";

import { joinApplicationSchema } from "./schema";

describe("joinApplicationSchema", () => {
  it("validates a complete payload", () => {
    const parsed = joinApplicationSchema.safeParse({
      fullName: "Ahmed Khan",
      businessName: "AK Direct Couriers",
      email: "ahmed@example.com",
      phone: "07123456789",
      areasCovered: "Bristol and surrounding areas",
      vanType: "MEDIUM",
      insuranceConfirmed: true,
      message: "Available weekdays.",
    });

    expect(parsed.success).toBe(true);
  });

  it("requires core fields and insurance confirmation", () => {
    const parsed = joinApplicationSchema.safeParse({
      fullName: "",
      businessName: "",
      email: "not-an-email",
      phone: "",
      areasCovered: "",
      vanType: "",
      insuranceConfirmed: false,
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      expect(fieldErrors.fullName?.[0]).toBe("Full name is required.");
      expect(fieldErrors.businessName?.[0]).toBe("Business name is required.");
      expect(fieldErrors.email?.[0]).toBe("Enter a valid email address.");
      expect(fieldErrors.phone?.[0]).toBe("Phone is required.");
      expect(fieldErrors.areasCovered?.[0]).toBe("Area(s) covered is required.");
      expect(fieldErrors.vanType?.[0]).toBe("Van type is required.");
      expect(fieldErrors.insuranceConfirmed?.[0]).toBe("Insurance confirmation is required.");
    }
  });
});
