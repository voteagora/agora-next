import { beforeEach, describe, expect, it, vi } from "vitest";

const discoverSafeTrackedTransactionMock = vi.fn();
const requireSafeJwtForAddressMock = vi.fn();
const enforceAuthenticatedSafeRateLimitMock = vi.fn();

vi.mock("@/lib/tenant/tenant", () => ({
  default: {
    current: () => ({
      slug: "ENS",
    }),
  },
}));

vi.mock("@/lib/mirador/requestContext", () => ({
  getMiradorTraceContextFromHeaders: vi.fn(() => undefined),
}));

vi.mock("@/lib/safeFeatures", () => ({
  isSafeOnchainTransactionTrackingEnabled: vi.fn(() => true),
  SAFE_ONCHAIN_TRANSACTION_TRACKING_DISABLED_MESSAGE:
    "Safe onchain tracking is disabled.",
}));

vi.mock("@/lib/safeInternalApiAuth.server", () => ({
  enforceAuthenticatedSafeRateLimit: enforceAuthenticatedSafeRateLimitMock,
  requireSafeJwtForAddress: requireSafeJwtForAddressMock,
}));

vi.mock("@/lib/safeTrackedTransactions.server", () => ({
  discoverSafeTrackedTransaction: discoverSafeTrackedTransactionMock,
}));

describe("POST /api/internal/safe/tracked-transactions/discover", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    requireSafeJwtForAddressMock.mockResolvedValue({
      address: "0x1234567890123456789012345678901234567890",
    });
    enforceAuthenticatedSafeRateLimitMock.mockResolvedValue(null);
  });

  it("returns the tracked transaction when a matching Safe tx is discovered", async () => {
    discoverSafeTrackedTransactionMock.mockResolvedValue({
      kind: "publish_proposal",
      safeAddress: "0x1234567890123456789012345678901234567890",
      chainId: 1,
      safeTxHash:
        "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      createdAt: "2026-03-12T12:00:00.000Z",
    });

    const { POST } = await import("./route");
    const request = new Request(
      "http://localhost/api/internal/safe/tracked-transactions/discover",
      {
        method: "POST",
        headers: {
          authorization: "Bearer jwt-token",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          kind: "publish_proposal",
          safeAddress: "0x1234567890123456789012345678901234567890",
          chainId: 1,
          to: "0x9999999999999999999999999999999999999999",
          data: "0x1234",
          createdAfter: 1_710_000_000_000,
        }),
      }
    );

    const response = await POST(request as never);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      found: true,
      transaction: {
        kind: "publish_proposal",
        safeAddress: "0x1234567890123456789012345678901234567890",
        chainId: 1,
        safeTxHash:
          "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        createdAt: "2026-03-12T12:00:00.000Z",
      },
    });
  });

  it("requires authentication for tracked transaction discovery", async () => {
    requireSafeJwtForAddressMock.mockResolvedValue({
      response: new Response(
        JSON.stringify({ message: "Authentication required." }),
        { status: 401 }
      ),
    });
    discoverSafeTrackedTransactionMock.mockResolvedValue(null);

    const { POST } = await import("./route");
    const request = new Request(
      "http://localhost/api/internal/safe/tracked-transactions/discover",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          kind: "publish_proposal",
          safeAddress: "0x1234567890123456789012345678901234567890",
          chainId: 1,
          to: "0x9999999999999999999999999999999999999999",
          data: "0x1234",
          createdAfter: 1_710_000_000_000,
        }),
      }
    );

    const response = await POST(request as never);

    expect(response.status).toBe(401);
    expect(discoverSafeTrackedTransactionMock).not.toHaveBeenCalled();
  });
});
