import { beforeEach, describe, expect, it, vi } from "vitest";

const listActiveSafeTrackedTransactionsMock = vi.fn();
const getOptionalSafeJwtAddressMock = vi.fn();
const enforceUnauthenticatedSafeStatusRateLimitMock = vi.fn();
const safeAddressesMatchMock = vi.fn((left: string, right: string) => {
  return left.toLowerCase() === right.toLowerCase();
});
const upsertSafeTrackedTransactionMock = vi.fn();

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

vi.mock("@/lib/safeInternalApiAuth.server", () => ({
  getOptionalSafeJwtAddress: getOptionalSafeJwtAddressMock,
  enforceUnauthenticatedSafeStatusRateLimit:
    enforceUnauthenticatedSafeStatusRateLimitMock,
  safeAddressesMatch: safeAddressesMatchMock,
}));

vi.mock("@/lib/safeTrackedTransactions.server", () => ({
  listActiveSafeTrackedTransactions: listActiveSafeTrackedTransactionsMock,
  upsertSafeTrackedTransaction: upsertSafeTrackedTransactionMock,
}));

describe("POST /api/internal/safe/tracked-transactions", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    getOptionalSafeJwtAddressMock.mockResolvedValue({
      address: "0x1234567890123456789012345678901234567890",
    });
    enforceUnauthenticatedSafeStatusRateLimitMock.mockReturnValue(null);
  });

  it("returns a retriable 503 when the initial Safe lookup cannot be completed", async () => {
    upsertSafeTrackedTransactionMock.mockRejectedValue(
      Object.assign(
        new Error(
          "Unable to validate the Safe transaction right now. Please retry."
        ),
        {
          statusCode: 503,
        }
      )
    );

    const { POST } = await import("./route");
    const request = new Request(
      "http://localhost/api/internal/safe/tracked-transactions",
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
          safeTxHash:
            "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        }),
      }
    );

    const response = await POST(request as never);

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      message:
        "Unable to validate the Safe transaction right now. Please retry.",
    });
  });

  it("allows unauthenticated tracking and applies rate limiting instead", async () => {
    getOptionalSafeJwtAddressMock.mockResolvedValue(undefined);
    upsertSafeTrackedTransactionMock.mockResolvedValue({
      kind: "publish_proposal",
      safeAddress: "0x1234567890123456789012345678901234567890",
      chainId: 1,
      safeTxHash:
        "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      createdAt: "2026-03-12T12:00:00.000Z",
    });

    const { POST } = await import("./route");
    const request = new Request(
      "http://localhost/api/internal/safe/tracked-transactions",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          kind: "publish_proposal",
          safeAddress: "0x1234567890123456789012345678901234567890",
          chainId: 1,
          safeTxHash:
            "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        }),
      }
    );

    const response = await POST(request as never);

    expect(response.status).toBe(200);
    expect(enforceUnauthenticatedSafeStatusRateLimitMock).toHaveBeenCalledWith(
      request,
      "safe-tracked-transactions-create"
    );
    expect(upsertSafeTrackedTransactionMock).toHaveBeenCalledTimes(1);
  });
});

describe("GET /api/internal/safe/tracked-transactions", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    getOptionalSafeJwtAddressMock.mockResolvedValue(undefined);
    enforceUnauthenticatedSafeStatusRateLimitMock.mockReturnValue(null);
  });

  it("allows unauthenticated listing and applies rate limiting instead", async () => {
    listActiveSafeTrackedTransactionsMock.mockResolvedValue([
      {
        kind: "publish_proposal",
        safeAddress: "0x1234567890123456789012345678901234567890",
        chainId: 1,
        safeTxHash:
          "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        createdAt: "2026-03-12T12:00:00.000Z",
      },
    ]);

    const { GET } = await import("./route");
    const request = {
      nextUrl: new URL(
        "http://localhost/api/internal/safe/tracked-transactions?safeAddress=0x1234567890123456789012345678901234567890&kind=publish_proposal"
      ),
      headers: new Headers(),
    };

    const response = await GET(request as never);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      transactions: [
        {
          kind: "publish_proposal",
          safeAddress: "0x1234567890123456789012345678901234567890",
          chainId: 1,
          safeTxHash:
            "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          createdAt: "2026-03-12T12:00:00.000Z",
        },
      ],
    });
    expect(enforceUnauthenticatedSafeStatusRateLimitMock).toHaveBeenCalledWith(
      request,
      "safe-tracked-transactions-list"
    );
    expect(listActiveSafeTrackedTransactionsMock).toHaveBeenCalledTimes(1);
  });
});
