import { beforeEach, describe, expect, it, vi } from "vitest";

const enforceUnauthenticatedSafeStatusRateLimitMock = vi.fn();
const enforceAuthenticatedSafeRateLimitMock = vi.fn();
const getOptionalSafeJwtAddressMock = vi.fn();
const getSafeMultisigTransactionForClientMock = vi.fn();
const isSafeOnchainTransactionTrackingEnabledMock = vi.fn();
const safeAddressesMatchMock = vi.fn(
  (left: string, right: string) => left.toLowerCase() === right.toLowerCase()
);

vi.mock("@/lib/safeApi.server", () => ({
  getSafeMultisigTransactionForClient: getSafeMultisigTransactionForClientMock,
}));

vi.mock("@/lib/safeFeatures", () => ({
  isSafeOnchainTransactionTrackingEnabled:
    isSafeOnchainTransactionTrackingEnabledMock,
  SAFE_ONCHAIN_TRANSACTION_TRACKING_DISABLED_MESSAGE:
    "Safe onchain transaction tracking is disabled for this tenant.",
}));

vi.mock("@/lib/safeInternalApiAuth.server", () => ({
  enforceAuthenticatedSafeRateLimit: enforceAuthenticatedSafeRateLimitMock,
  enforceUnauthenticatedSafeStatusRateLimit:
    enforceUnauthenticatedSafeStatusRateLimitMock,
  getOptionalSafeJwtAddress: getOptionalSafeJwtAddressMock,
  safeAddressesMatch: safeAddressesMatchMock,
}));

describe("GET /api/internal/safe/multisig-transaction", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    isSafeOnchainTransactionTrackingEnabledMock.mockReturnValue(true);
    enforceUnauthenticatedSafeStatusRateLimitMock.mockReturnValue(null);
    enforceAuthenticatedSafeRateLimitMock.mockResolvedValue(null);
  });

  it("returns 403 when Safe tracking is disabled", async () => {
    isSafeOnchainTransactionTrackingEnabledMock.mockReturnValue(false);

    const { GET } = await import("./route");
    const request = {
      nextUrl: new URL(
        "http://localhost/api/internal/safe/multisig-transaction?chainId=1&safeTxHash=0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
      ),
      headers: new Headers(),
    };

    const response = await GET(request as never);

    expect(response.status).toBe(403);
    expect(getSafeMultisigTransactionForClientMock).not.toHaveBeenCalled();
  });

  it("rejects authenticated Safe status lookups for a different Safe address", async () => {
    getOptionalSafeJwtAddressMock.mockResolvedValue({
      address: "0x1234567890123456789012345678901234567890",
    });
    getSafeMultisigTransactionForClientMock.mockResolvedValue({
      found: true,
      status: {
        safeAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
        safeTxHash:
          "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        confirmations: [],
        signedOwners: [],
        isExecuted: false,
        isSuccessful: null,
      },
      isSuccessful: null,
      nextPollMs: 5000,
    });

    const { GET } = await import("./route");
    const request = {
      nextUrl: new URL(
        "http://localhost/api/internal/safe/multisig-transaction?chainId=1&safeTxHash=0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
      ),
      headers: new Headers({
        authorization: "Bearer jwt-token",
      }),
    };

    const response = await GET(request as never);

    expect(response.status).toBe(403);
  });

  it("rejects authenticated lookups when the requested safeAddress param does not match the Safe session", async () => {
    getOptionalSafeJwtAddressMock.mockResolvedValue({
      address: "0x1234567890123456789012345678901234567890",
    });

    const { GET } = await import("./route");
    const request = {
      nextUrl: new URL(
        "http://localhost/api/internal/safe/multisig-transaction?chainId=1&safeTxHash=0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa&safeAddress=0xabcdefabcdefabcdefabcdefabcdefabcdefabcd"
      ),
      headers: new Headers({
        authorization: "Bearer jwt-token",
      }),
    };

    const response = await GET(request as never);

    expect(response.status).toBe(403);
    expect(getSafeMultisigTransactionForClientMock).not.toHaveBeenCalled();
  });
});
