import { beforeEach, describe, expect, it, vi } from "vitest";

const enforceUnauthenticatedSafeStatusRateLimitMock = vi.fn();
const getOptionalSafeJwtAddressMock = vi.fn();
const getSafeMessageStatusForClientMock = vi.fn();
const refreshTraceKeepAliveMock = vi.fn();
const safeAddressesMatchMock = vi.fn(
  (left: string, right: string) => left.toLowerCase() === right.toLowerCase()
);

vi.mock("@/lib/safeApi.server", () => ({
  getSafeMessageStatusForClient: getSafeMessageStatusForClientMock,
}));

vi.mock("@/lib/mirador/serverKeepAlive", () => ({
  refreshTraceKeepAlive: refreshTraceKeepAliveMock,
}));

vi.mock("@/lib/safeInternalApiAuth.server", () => ({
  enforceUnauthenticatedSafeStatusRateLimit:
    enforceUnauthenticatedSafeStatusRateLimitMock,
  getOptionalSafeJwtAddress: getOptionalSafeJwtAddressMock,
  safeAddressesMatch: safeAddressesMatchMock,
}));

describe("GET /api/internal/safe/message-status", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    getOptionalSafeJwtAddressMock.mockResolvedValue(undefined);
    enforceUnauthenticatedSafeStatusRateLimitMock.mockReturnValue(null);
  });

  it("requires the Safe address parameter", async () => {
    const { GET } = await import("./route");
    const request = {
      nextUrl: new URL(
        "http://localhost/api/internal/safe/message-status?chainId=1&messageHash=0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
      ),
      headers: new Headers(),
    };

    const response = await GET(request as never);

    expect(response.status).toBe(400);
    expect(getSafeMessageStatusForClientMock).not.toHaveBeenCalled();
  });

  it("rate-limits unauthenticated Safe status requests when abuse controls trigger", async () => {
    enforceUnauthenticatedSafeStatusRateLimitMock.mockReturnValue(
      new Response(
        JSON.stringify({
          message: "Too many Safe status requests. Please retry shortly.",
        }),
        {
          status: 429,
          headers: {
            "content-type": "application/json",
          },
        }
      )
    );

    const { GET } = await import("./route");
    const request = {
      nextUrl: new URL(
        "http://localhost/api/internal/safe/message-status?chainId=1&messageHash=0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa&safeAddress=0x1234567890123456789012345678901234567890"
      ),
      headers: new Headers(),
    };

    const response = await GET(request as never);

    expect(response.status).toBe(429);
    expect(getSafeMessageStatusForClientMock).not.toHaveBeenCalled();
  });
});
