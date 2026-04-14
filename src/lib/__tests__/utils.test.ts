import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";
import {
  isSafeWallet,
  resolveSafeTx,
  wrappedWaitForTransactionReceipt,
} from "../utils";
import { mainnet } from "viem/chains";
import { getChainById, getPublicClient } from "../viem";

vi.mock("next/font/google", () => ({
  Inter: () => ({
    style: { fontFamily: "Inter" },
  }),
  Rajdhani: () => ({
    style: { fontFamily: "Rajdhani" },
  }),
  Chivo_Mono: () => ({
    style: { fontFamily: "ChivoMono" },
  }),
}));

vi.mock(import("react"), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    cache: (fn: any) => fn,
  };
});

vi.mock("server-only", () => ({
  default: {},
}));

vi.mock("../tenant/tenant", () => ({
  default: {
    current: () => ({
      namespace: "ens",
      contracts: {
        token: {
          chain: {
            id: 1,
          },
        },
      },
      ui: {
        toggle: vi.fn(),
      },
    }),
  },
}));

vi.mock("viem", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as any),
    createPublicClient: vi.fn(),
    http: vi.fn(),
  };
});

vi.mock("../viem", () => ({
  getChainById: vi.fn(),
  getPublicClient: vi.fn(),
}));

const originalFetch = global.fetch;
vi.stubGlobal("fetch", vi.fn());

describe("Safe Transaction Utils", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    global.fetch = vi.fn();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  describe("resolveSafeTx", () => {
    it("should return transaction hash when safe transaction is successful", async () => {
      const mockResponse = {
        found: true,
        isSuccessful: true,
        transactionHash: "0xsuccesshash" as `0x${string}`,
        nextPollMs: 5_000,
      };

      (global.fetch as any).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), { status: 200 })
      );

      const result = await resolveSafeTx(
        mainnet.id,
        "0xsafetxhash" as `0x${string}`
      );

      expect(result).toBe("0xsuccesshash");
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/internal/safe/multisig-transaction?chainId=1&safeTxHash=0xsafetxhash",
        { cache: "no-store" }
      );
    });

    it("should return undefined when safe transaction is not successful", async () => {
      const mockResponse = {
        found: true,
        isSuccessful: false,
        nextPollMs: 5_000,
      };

      (global.fetch as any).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), { status: 200 })
      );

      const result = await resolveSafeTx(
        mainnet.id,
        "0xsafetxhash" as `0x${string}`
      );

      expect(result).toBeUndefined();
    });

    it("should return original hash when transaction is not found (404)", async () => {
      (global.fetch as any).mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            found: false,
            isSuccessful: null,
            nextPollMs: 5_000,
          }),
          { status: 200 }
        )
      );

      const safeTxHash = "0xsafetxhash" as `0x${string}`;
      const result = await resolveSafeTx(mainnet.id, safeTxHash);

      expect(result).toBe(safeTxHash);
    });
  });

  describe("wrappedWaitForTransactionReceipt", () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    it("should handle regular (non-safe) transactions", async () => {
      const mockPublicClient = {
        chain: { id: 1 },
        readContract: vi.fn().mockRejectedValue(new Error("not a safe")),
        waitForTransactionReceipt: vi
          .fn()
          .mockResolvedValue({ status: "success" }),
      };

      (getPublicClient as any).mockReturnValue(mockPublicClient);

      const params = {
        hash: "0xtxhash" as `0x${string}`,
        address: "0xaddress" as `0x${string}`,
      };

      const result = await wrappedWaitForTransactionReceipt(params);

      expect(mockPublicClient.waitForTransactionReceipt).toHaveBeenCalledWith(
        params
      );
      expect(result).toEqual({ status: "success" });
    });

    it("should handle safe transactions", async () => {
      const mockPublicClient = {
        chain: { id: 1 },
        readContract: vi.fn().mockResolvedValue(2n),
        waitForTransactionReceipt: vi
          .fn()
          .mockResolvedValue({ status: "success" }),
      };

      (getChainById as any).mockReturnValue(mainnet);
      (getPublicClient as any).mockReturnValue(mockPublicClient);

      const mockResolvedTx = "0xresolvedtx" as `0x${string}`;
      (global.fetch as any).mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            found: true,
            isSuccessful: true,
            transactionHash: mockResolvedTx,
            nextPollMs: 5_000,
          }),
          { status: 200 }
        )
      );

      const params = {
        hash: "0xsafetxhash" as `0x${string}`,
        address: "0xsafeaddress" as `0x${string}`,
      };

      const result = await wrappedWaitForTransactionReceipt(params);

      expect(mockPublicClient.waitForTransactionReceipt).toHaveBeenCalledWith({
        hash: mockResolvedTx,
      });
      expect(result).toEqual({ status: "success" });
    });

    it("should throw error when public client has no chain", async () => {
      const mockPublicClient = {
        chain: null,
      };

      (getPublicClient as any).mockReturnValue(mockPublicClient);

      const params = {
        hash: "0xtxhash" as `0x${string}`,
        address: "0xaddress" as `0x${string}`,
      };

      await expect(wrappedWaitForTransactionReceipt(params)).rejects.toThrow(
        "no chain on public client"
      );
    });
  });

  describe("isSafeWallet", () => {
    it("uses the requested chain when checking Safe wallet status", async () => {
      const mockPublicClient = {
        readContract: vi.fn().mockResolvedValue(2n),
      };

      (getChainById as any).mockReturnValue(mainnet);
      (getPublicClient as any).mockReturnValue(mockPublicClient);

      await expect(
        isSafeWallet("0xaddress" as `0x${string}`, mainnet.id)
      ).resolves.toBe(true);

      expect(getChainById).toHaveBeenCalledWith(mainnet.id);
      expect(getPublicClient).toHaveBeenCalledWith(mainnet);
    });
  });
});
