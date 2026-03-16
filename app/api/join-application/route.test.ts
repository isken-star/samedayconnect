import { beforeEach, describe, expect, it, vi } from "vitest";

const mockJoinApplicationCreate = vi.fn();
const mockSendJoinApplicationNotification = vi.fn();

vi.mock("@/src/lib/db", () => ({
  db: {
    joinApplication: {
      create: mockJoinApplicationCreate,
    },
  },
}));

vi.mock("@/src/lib/email", () => ({
  getEmailProvider: () => ({
    sendJoinApplicationNotification: mockSendJoinApplicationNotification,
  }),
}));

describe("POST /api/join-application", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockJoinApplicationCreate.mockResolvedValue({
      id: "join-1",
      fullName: "Ahmed Khan",
      businessName: "AK Direct Couriers",
      email: "ahmed@example.com",
      phone: "07123456789",
      areasCovered: "Bristol",
      vanType: "MEDIUM",
      insuranceConfirmed: true,
      message: null,
      createdAt: new Date("2026-03-16T10:00:00.000Z"),
    });
    mockSendJoinApplicationNotification.mockResolvedValue(undefined);
  });

  it("creates a join application", async () => {
    const { POST } = await import("./route");

    const request = new Request("http://localhost/api/join-application", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Ahmed Khan",
        businessName: "AK Direct Couriers",
        email: "ahmed@example.com",
        phone: "07123456789",
        areasCovered: "Bristol",
        vanType: "MEDIUM",
        insuranceConfirmed: true,
      }),
    });

    const response = await POST(request);
    const json = (await response.json()) as { applicationId: string };

    expect(response.status).toBe(200);
    expect(json.applicationId).toBe("join-1");
    expect(mockJoinApplicationCreate).toHaveBeenCalledTimes(1);
    expect(mockSendJoinApplicationNotification).toHaveBeenCalledWith({
      toEmail: "info@samedayconnect.co.uk",
      fullName: "Ahmed Khan",
      businessName: "AK Direct Couriers",
      email: "ahmed@example.com",
      phone: "07123456789",
      areasCovered: "Bristol",
      vanType: "MEDIUM",
      insuranceConfirmed: true,
      message: null,
      createdAt: "2026-03-16T10:00:00.000Z",
    });
  });

  it("returns field errors for invalid payload", async () => {
    const { POST } = await import("./route");

    const request = new Request("http://localhost/api/join-application", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "",
        businessName: "",
        email: "bad",
        phone: "",
        areasCovered: "",
        insuranceConfirmed: false,
      }),
    });

    const response = await POST(request);
    const json = (await response.json()) as {
      error: string;
      details: { fieldErrors: { fullName?: string[]; insuranceConfirmed?: string[] } };
    };

    expect(response.status).toBe(400);
    expect(json.error).toBe("Please check the form and try again.");
    expect(json.details.fieldErrors.fullName?.[0]).toBe("Full name is required.");
    expect(json.details.fieldErrors.insuranceConfirmed?.[0]).toBe(
      "Insurance confirmation is required.",
    );
    expect(mockJoinApplicationCreate).not.toHaveBeenCalled();
    expect(mockSendJoinApplicationNotification).not.toHaveBeenCalled();
  });

  it("returns a server error if the notification email fails", async () => {
    mockSendJoinApplicationNotification.mockRejectedValue(new Error("provider down"));
    const { POST } = await import("./route");

    const request = new Request("http://localhost/api/join-application", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Ahmed Khan",
        businessName: "AK Direct Couriers",
        email: "ahmed@example.com",
        phone: "07123456789",
        areasCovered: "Bristol",
        vanType: "MEDIUM",
        insuranceConfirmed: true,
      }),
    });

    const response = await POST(request);
    const json = (await response.json()) as { error: string };

    expect(response.status).toBe(500);
    expect(json.error).toBe(
      "Your application was saved, but we could not send the notification email. Please try again shortly.",
    );
    expect(mockJoinApplicationCreate).toHaveBeenCalledTimes(1);
    expect(mockSendJoinApplicationNotification).toHaveBeenCalledTimes(1);
  });
});
