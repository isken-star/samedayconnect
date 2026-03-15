import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetRouteDistance = vi.fn();
const mockGeocodePostcode = vi.fn();
const mockIsStopInCongestionZone = vi.fn();
const mockQuoteRequestCreate = vi.fn();
const mockQuoteResultCreateMany = vi.fn();
const mockCourierFindFirst = vi.fn();

vi.mock("@/src/lib/distance", () => ({
  getDistanceProvider: () => ({
    getRouteDistance: mockGetRouteDistance,
    geocodePostcode: mockGeocodePostcode,
  }),
}));

vi.mock("@/src/lib/zones/ccz", () => ({
  isStopInCongestionZone: mockIsStopInCongestionZone,
}));

vi.mock("@/src/lib/db", () => ({
  db: {
    $transaction: async (callback: (tx: unknown) => Promise<unknown>) => {
      return callback({
        courier: { findFirst: mockCourierFindFirst },
        quoteRequest: { create: mockQuoteRequestCreate },
        quoteResult: { createMany: mockQuoteResultCreateMany },
      });
    },
  },
}));

describe("POST /api/quote", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetRouteDistance.mockResolvedValue({ totalMeters: 10000 });
    mockGeocodePostcode.mockResolvedValue({ lat: 51.5, lng: -0.12 });
    mockIsStopInCongestionZone.mockReturnValue(false);
    mockCourierFindFirst.mockResolvedValue({ id: "courier-1", basePostcode: "TQ2 7PH" });
    mockQuoteRequestCreate.mockResolvedValue({ id: "quote-1" });
    mockQuoteResultCreateMany.mockResolvedValue({ count: 2 });
  });

  it("returns same-day and direct quotes", async () => {
    const { POST } = await import("./route");
    const request = new Request("http://localhost/api/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        collection_postcode: "sw1a1aa",
        delivery_postcodes: ["ec1a1bb", "e1 6an"],
        van_size: "medium",
        job_type: "same_day",
        ready_mode: "ready_now",
      }),
    });

    const response = await POST(request);
    const json = (await response.json()) as { options: { same_day: { total: number }; direct: { total: number } } };

    expect(response.status).toBe(200);
    expect(json.options.same_day.total).toBe(55);
    expect(json.options.direct.total).toBe(70);
    expect(mockQuoteResultCreateMany).toHaveBeenCalledTimes(1);
    expect(mockQuoteResultCreateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({
            runningMilesFee: 0,
          }),
        ]),
      }),
    );
  });

  it("returns max-stops validation message", async () => {
    const { POST } = await import("./route");
    const request = new Request("http://localhost/api/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        collection_postcode: "SW1A 1AA",
        delivery_postcodes: Array.from({ length: 11 }, () => "EC1A 1BB"),
        van_size: "small",
        job_type: "same_day",
        ready_mode: "ready_now",
      }),
    });

    const response = await POST(request);
    const json = (await response.json()) as { details: { fieldErrors: { delivery_postcodes?: string[] } } };

    expect(response.status).toBe(400);
    expect(json.details.fieldErrors.delivery_postcodes?.[0]).toBe(
      "For more than 10 stops, please contact us.",
    );
  });

  it("returns route failure message on distance provider errors", async () => {
    mockGetRouteDistance.mockRejectedValue(new Error("provider down"));
    const { POST } = await import("./route");
    const request = new Request("http://localhost/api/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        collection_postcode: "SW1A 1AA",
        delivery_postcodes: ["EC1A 1BB"],
        van_size: "large",
        job_type: "direct",
        ready_mode: "ready_now",
      }),
    });

    const response = await POST(request);
    const json = (await response.json()) as { error: string };

    expect(response.status).toBe(502);
    expect(json.error).toBe(
      "We couldn’t calculate a route for those postcodes. Please check and try again.",
    );
  });

  it("adds the hidden running miles fee to both quote totals", async () => {
    mockGetRouteDistance
      .mockResolvedValueOnce({ totalMeters: 10000 })
      .mockResolvedValueOnce({ totalMeters: 55 * 1609.344 });

    const { POST } = await import("./route");
    const request = new Request("http://localhost/api/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        collection_postcode: "SW1A 1AA",
        delivery_postcodes: ["EC1A 1BB"],
        van_size: "small",
        job_type: "same_day",
        ready_mode: "ready_now",
      }),
    });

    const response = await POST(request);
    const json = (await response.json()) as { options: { same_day: { total: number }; direct: { total: number } } };

    expect(response.status).toBe(200);
    expect(json.options.same_day.total).toBe(70);
    expect(json.options.direct.total).toBe(80);
    expect(mockQuoteResultCreateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({
            jobType: "SAME_DAY",
            runningMilesFee: 30,
            total: 70,
          }),
          expect.objectContaining({
            jobType: "DIRECT",
            runningMilesFee: 30,
            total: 80,
          }),
        ]),
      }),
    );
  });

  it("falls back to the normal quote when the courier has no base postcode", async () => {
    mockCourierFindFirst.mockResolvedValue({ id: "courier-1", basePostcode: null });

    const { POST } = await import("./route");
    const request = new Request("http://localhost/api/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        collection_postcode: "SW1A 1AA",
        delivery_postcodes: ["EC1A 1BB"],
        van_size: "small",
        job_type: "same_day",
        ready_mode: "ready_now",
      }),
    });

    const response = await POST(request);
    const json = (await response.json()) as { options: { same_day: { total: number }; direct: { total: number } } };

    expect(response.status).toBe(200);
    expect(json.options.same_day.total).toBe(40);
    expect(json.options.direct.total).toBe(50);
    expect(mockGetRouteDistance).toHaveBeenCalledTimes(1);
  });
});
