import { beforeEach, describe, expect, it, vi } from "vitest";

const getStoredSiweJwtMock = vi.fn();

vi.mock("@/lib/siweSession", () => ({
  getStoredSiweJwt: getStoredSiweJwtMock,
}));

describe("safeTrackedTransactions", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it("loads tracked transactions without a Safe jwt", async () => {
    getStoredSiweJwtMock.mockReturnValue(null);
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          transactions: [],
        }),
        { status: 200 }
      )
    );

    const { fetchActiveSafeTrackedTransactions } = await import(
      "@/lib/safeTrackedTransactions"
    );

    await expect(
      fetchActiveSafeTrackedTransactions(
        "0x1234567890123456789012345678901234567890",
        "publish_proposal"
      )
    ).resolves.toEqual([]);

    expect(getStoredSiweJwtMock).toHaveBeenCalledWith({
      expectedAddress: "0x1234567890123456789012345678901234567890",
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/internal/safe/tracked-transactions?safeAddress=0x1234567890123456789012345678901234567890&kind=publish_proposal",
      {
        cache: "no-store",
      }
    );
  });

  it("attaches the matching Safe jwt when loading tracked transactions", async () => {
    getStoredSiweJwtMock.mockReturnValue("jwt-token");
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          transactions: [],
        }),
        { status: 200 }
      )
    );

    const { fetchActiveSafeTrackedTransactions } = await import(
      "@/lib/safeTrackedTransactions"
    );

    await expect(
      fetchActiveSafeTrackedTransactions(
        "0x1234567890123456789012345678901234567890",
        "publish_proposal"
      )
    ).resolves.toEqual([]);

    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/internal/safe/tracked-transactions?safeAddress=0x1234567890123456789012345678901234567890&kind=publish_proposal",
      {
        cache: "no-store",
        headers: {
          Authorization: "Bearer jwt-token",
        },
      }
    );
  });

  it("does not retry tracked transaction creation without auth when the stored jwt is rejected", async () => {
    getStoredSiweJwtMock.mockReturnValue("jwt-token");
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ message: "Invalid Safe session." }), {
        status: 401,
        headers: {
          "content-type": "application/json",
        },
      })
    );

    const { createSafeTrackedTransaction } = await import(
      "@/lib/safeTrackedTransactions"
    );

    await expect(
      createSafeTrackedTransaction({
        kind: "publish_proposal",
        safeAddress: "0x1234567890123456789012345678901234567890",
        chainId: 1,
        safeTxHash:
          "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      })
    ).rejects.toThrow("Invalid Safe session.");

    expect(fetchSpy).toHaveBeenCalledOnce();
    expect(fetchSpy).toHaveBeenNthCalledWith(
      1,
      "/api/internal/safe/tracked-transactions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer jwt-token",
        }),
      })
    );
  });

  it("retries tracked transaction listing without auth when the stored jwt is rejected", async () => {
    getStoredSiweJwtMock.mockReturnValue("jwt-token");
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ message: "Invalid Safe session." }), {
          status: 401,
          headers: {
            "content-type": "application/json",
          },
        })
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            transactions: [],
          }),
          { status: 200 }
        )
      );

    const { fetchActiveSafeTrackedTransactions } = await import(
      "@/lib/safeTrackedTransactions"
    );

    await expect(
      fetchActiveSafeTrackedTransactions(
        "0x1234567890123456789012345678901234567890",
        "publish_proposal"
      )
    ).resolves.toEqual([]);

    expect(fetchSpy).toHaveBeenNthCalledWith(
      1,
      "/api/internal/safe/tracked-transactions?safeAddress=0x1234567890123456789012345678901234567890&kind=publish_proposal",
      {
        cache: "no-store",
        headers: {
          Authorization: "Bearer jwt-token",
        },
      }
    );
    expect(fetchSpy).toHaveBeenNthCalledWith(
      2,
      "/api/internal/safe/tracked-transactions?safeAddress=0x1234567890123456789012345678901234567890&kind=publish_proposal",
      {
        cache: "no-store",
      }
    );
  });
});
