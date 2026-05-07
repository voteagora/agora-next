import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ensureSafeOffchainSigningEnabled } from "../safeMessages";

const { getChainByIdMock, getPublicClientMock } = vi.hoisted(() => ({
  getChainByIdMock: vi.fn(),
  getPublicClientMock: vi.fn(),
}));

vi.mock("@/lib/viem", () => ({
  getChainById: getChainByIdMock,
  getPublicClient: getPublicClientMock,
}));

describe("ensureSafeOffchainSigningEnabled", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("enables Safe offchain signing when the wallet supports it", async () => {
    const request = vi.fn().mockResolvedValue(undefined);

    await expect(ensureSafeOffchainSigningEnabled({ request })).resolves.toBe(
      "enabled"
    );

    expect(request).toHaveBeenCalledWith({
      method: "safe_setSettings",
      params: [{ offChainSigning: true }],
    });
  });

  it("ignores wallets that do not implement safe_setSettings", async () => {
    const request = vi
      .fn()
      .mockRejectedValue(new Error("Method not found: safe_setSettings"));

    await expect(ensureSafeOffchainSigningEnabled({ request })).resolves.toBe(
      "unsupported"
    );
  });

  it("returns unavailable when the wallet client does not expose request", async () => {
    await expect(ensureSafeOffchainSigningEnabled({})).resolves.toBe(
      "unavailable"
    );
  });
});

describe("getSafeOwnersAndThreshold", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-12T00:00:00Z"));
    getChainByIdMock.mockReturnValue({ id: 1, name: "Ethereum" });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("refreshes owner and threshold data after the cache TTL expires", async () => {
    const readContractMock = vi
      .fn()
      .mockResolvedValueOnce(["0x1111111111111111111111111111111111111111"])
      .mockResolvedValueOnce(2n)
      .mockResolvedValueOnce([
        "0x2222222222222222222222222222222222222222",
        "0x3333333333333333333333333333333333333333",
      ])
      .mockResolvedValueOnce(3n);

    getPublicClientMock.mockReturnValue({
      readContract: readContractMock,
    });

    const {
      getSafeOwnersAndThreshold,
      SAFE_OWNERS_AND_THRESHOLD_CACHE_TTL_MS,
    } = await import("../safeMessages");

    await expect(
      getSafeOwnersAndThreshold({
        safeAddress: "0x1234567890123456789012345678901234567890",
        chainId: 1,
      })
    ).resolves.toEqual({
      owners: ["0x1111111111111111111111111111111111111111"],
      threshold: 2,
    });

    await expect(
      getSafeOwnersAndThreshold({
        safeAddress: "0x1234567890123456789012345678901234567890",
        chainId: 1,
      })
    ).resolves.toEqual({
      owners: ["0x1111111111111111111111111111111111111111"],
      threshold: 2,
    });

    expect(readContractMock).toHaveBeenCalledTimes(2);

    vi.advanceTimersByTime(SAFE_OWNERS_AND_THRESHOLD_CACHE_TTL_MS + 1);

    await expect(
      getSafeOwnersAndThreshold({
        safeAddress: "0x1234567890123456789012345678901234567890",
        chainId: 1,
      })
    ).resolves.toEqual({
      owners: [
        "0x2222222222222222222222222222222222222222",
        "0x3333333333333333333333333333333333333333",
      ],
      threshold: 3,
    });

    expect(readContractMock).toHaveBeenCalledTimes(4);
  });
});
