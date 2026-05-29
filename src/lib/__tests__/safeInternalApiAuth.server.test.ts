import { beforeEach, describe, expect, it, vi } from "vitest";

const { expireMock, incrMock, ttlMock } = vi.hoisted(() => ({
  expireMock: vi.fn(),
  incrMock: vi.fn(),
  ttlMock: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("@/lib/redis", () => ({
  default: {
    expire: expireMock,
    incr: incrMock,
    ttl: ttlMock,
  },
}));

vi.mock("@/lib/siweAuth.server", () => ({
  verifyJwtAndGetAddress: vi.fn(),
}));

describe("safeInternalApiAuth.server", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("does not read ttl for requests that are still under the limit", async () => {
    incrMock.mockResolvedValue(2);

    const { enforceAuthenticatedSafeRateLimit } = await import(
      "@/lib/safeInternalApiAuth.server"
    );

    await expect(
      enforceAuthenticatedSafeRateLimit(
        { headers: new Headers() } as never,
        "safe-message-status",
        "0x1234567890123456789012345678901234567890",
        120
      )
    ).resolves.toBeNull();

    expect(ttlMock).not.toHaveBeenCalled();
    expect(expireMock).not.toHaveBeenCalled();
  });

  it("sets the limiter expiry on the first request without reading ttl", async () => {
    incrMock.mockResolvedValue(1);

    const { enforceAuthenticatedSafeRateLimit } = await import(
      "@/lib/safeInternalApiAuth.server"
    );

    await expect(
      enforceAuthenticatedSafeRateLimit(
        { headers: new Headers() } as never,
        "safe-message-status",
        "0x1234567890123456789012345678901234567890",
        120
      )
    ).resolves.toBeNull();

    expect(expireMock).toHaveBeenCalledWith(
      "rate:safe:safe-message-status:safe:0x1234567890123456789012345678901234567890",
      60
    );
    expect(ttlMock).not.toHaveBeenCalled();
  });

  it("reads ttl only after the limit is exceeded", async () => {
    incrMock.mockResolvedValue(31);
    ttlMock.mockResolvedValue(42);

    const { enforceUnauthenticatedSafeStatusRateLimit } = await import(
      "@/lib/safeInternalApiAuth.server"
    );

    const response = await enforceUnauthenticatedSafeStatusRateLimit(
      {
        headers: new Headers({
          "x-real-ip": "203.0.113.10",
        }),
      } as never,
      "safe-message-status",
      30
    );

    expect(response?.status).toBe(429);
    expect(response?.headers.get("Retry-After")).toBe("42");
    expect(ttlMock).toHaveBeenCalledWith(
      "rate:safe:safe-message-status:ip:203.0.113.10"
    );
  });
});
