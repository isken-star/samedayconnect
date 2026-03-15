import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetAuthenticatedCourier = vi.fn();
const mockRefreshCourierSessionInRoute = vi.fn();
const mockExpireStalePendingJobs = vi.fn();
const mockJobFindFirst = vi.fn();
const mockJobUpdate = vi.fn();
const mockAvailabilityUpsert = vi.fn();

vi.mock("@/src/lib/courierAuth/session", () => ({
  getAuthenticatedCourier: mockGetAuthenticatedCourier,
  refreshCourierSessionInRoute: mockRefreshCourierSessionInRoute,
}));

vi.mock("@/src/lib/courierJobs/expirePending", () => ({
  expireStalePendingJobs: mockExpireStalePendingJobs,
}));

vi.mock("@/src/lib/db", () => ({
  db: {
    $transaction: async (callback: (tx: unknown) => Promise<unknown>) =>
      callback({
        job: {
          findFirst: mockJobFindFirst,
          update: mockJobUpdate,
        },
        courierAvailability: {
          upsert: mockAvailabilityUpsert,
        },
      }),
  },
}));

describe("POST /api/courier/jobs/[id]/accept", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAuthenticatedCourier.mockResolvedValue({ id: "courier-1" });
    mockJobFindFirst.mockResolvedValue({ id: "job-1", status: "PENDING" });
    mockJobUpdate.mockResolvedValue({});
    mockAvailabilityUpsert.mockResolvedValue({});
  });

  it("accepts pending job and sets courier busy", async () => {
    const { POST } = await import("./route");

    const response = await POST(new Request("http://localhost/api/courier/jobs/job-1/accept", { method: "POST" }), {
      params: Promise.resolve({ id: "11111111-1111-4111-8111-111111111111" }),
    });
    const json = (await response.json()) as { ok?: boolean; status?: string };

    expect(response.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.status).toBe("ACCEPTED");
    expect(mockExpireStalePendingJobs).toHaveBeenCalledTimes(1);
    expect(mockJobUpdate).toHaveBeenCalledTimes(1);
    expect(mockAvailabilityUpsert).toHaveBeenCalledTimes(1);
  });

  it("returns unauthorized when no courier session", async () => {
    mockGetAuthenticatedCourier.mockResolvedValue(null);
    const { POST } = await import("./route");

    const response = await POST(new Request("http://localhost/api/courier/jobs/job-1/accept", { method: "POST" }), {
      params: Promise.resolve({ id: "11111111-1111-4111-8111-111111111111" }),
    });

    expect(response.status).toBe(401);
  });
});
