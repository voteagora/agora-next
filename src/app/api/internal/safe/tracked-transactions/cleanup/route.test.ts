import { beforeEach, describe, expect, it, vi } from "vitest";

const deleteExpiredSafeTrackedTransactionsMock = vi.fn();

vi.mock("@/lib/safeTrackedTransactions.server", () => ({
  deleteExpiredSafeTrackedTransactions: deleteExpiredSafeTrackedTransactionsMock,
}));

describe("POST /api/internal/safe/tracked-transactions/cleanup", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.CRON_SECRET = "cron-secret";
  });

  it("requires cron authentication", async () => {
    const { POST } = await import("./route");
    const request = new Request(
      "http://localhost/api/internal/safe/tracked-transactions/cleanup",
      {
        method: "POST",
      }
    );

    const response = await POST(request);

    expect(response.status).toBe(401);
    expect(deleteExpiredSafeTrackedTransactionsMock).not.toHaveBeenCalled();
  });

  it("deletes expired tracked transactions for authorized cron requests", async () => {
    deleteExpiredSafeTrackedTransactionsMock.mockResolvedValue({
      deletedCount: 2,
      cutoff: new Date("2026-02-10T00:00:00Z"),
    });

    const { POST } = await import("./route");
    const request = new Request(
      "http://localhost/api/internal/safe/tracked-transactions/cleanup",
      {
        method: "POST",
        headers: {
          authorization: "Bearer cron-secret",
        },
      }
    );

    const response = await POST(request);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      deletedCount: 2,
      cutoff: "2026-02-10T00:00:00.000Z",
    });
  });
});
