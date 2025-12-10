import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";
import { resolveSafeTx, wrappedWaitForTransactionReceipt, getProposalTypeText } from "../utils";
import { mainnet } from "viem/chains";
import { getPublicClient } from "../viem";

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
        isSuccessful: true,
        transactionHash: "0xsuccesshash" as `0x${string}`,
      };

      (global.fetch as any).mockResolvedValueOnce({
        status: 200,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await resolveSafeTx(
        mainnet.id,
        "0xsafetxhash" as `0x${string}`
      );

      expect(result).toBe("0xsuccesshash");
      expect(global.fetch).toHaveBeenCalledWith(
        "https://safe-transaction-mainnet.safe.global/api/v1/multisig-transactions/0xsafetxhash"
      );
    });

    it("should return undefined when safe transaction is not successful", async () => {
      const mockResponse = {
        isSuccessful: false,
      };

      (global.fetch as any).mockResolvedValueOnce({
        status: 200,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await resolveSafeTx(
        mainnet.id,
        "0xsafetxhash" as `0x${string}`
      );

      expect(result).toBeUndefined();
    });

    it("should return original hash when transaction is not found (404)", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        status: 404,
        json: () => Promise.resolve({}),
      });

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
        transport: {
          request: vi.fn(({ method }) => {
            if (method === "eth_getCode") {
              return Promise.resolve("0x");
            }
            return Promise.resolve(null);
          }),
        },
        getCode: vi.fn().mockResolvedValue("0x"),
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
        transport: {
          request: vi.fn(({ method }) => {
            if (method === "eth_getCode") {
              return Promise.resolve("0xcontractcode");
            }
            return Promise.resolve(null);
          }),
        },
        getCode: vi.fn().mockResolvedValue("0xcontractcode"),
        waitForTransactionReceipt: vi
          .fn()
          .mockResolvedValue({ status: "success" }),
      };

      (getPublicClient as any).mockReturnValue(mockPublicClient);

      const mockResolvedTx = "0xresolvedtx" as `0x${string}`;
      (global.fetch as any).mockResolvedValueOnce({
        status: 200,
        json: () =>
          Promise.resolve({
            isSuccessful: true,
            transactionHash: mockResolvedTx,
          }),
      });

      const params = {
        hash: "0xsafetxhash" as `0x${string}`,
        address: "0xaddress" as `0x${string}`,
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
  describe("getProposalTypeText", () => {
    it("should return custom label if provided", () => {
      expect(getProposalTypeText("STANDARD", undefined, "Custom Label")).toBe(
        "Custom Label"
      );
    });

    it("should return 'Optimistic Proposal' for OFFCHAIN_OPTIMISTIC", () => {
      expect(getProposalTypeText("OFFCHAIN_OPTIMISTIC")).toBe(
        "Optimistic Proposal"
      );
    });

    it("should return 'Standard Proposal' for OFFCHAIN_STANDARD", () => {
      expect(getProposalTypeText("OFFCHAIN_STANDARD")).toBe(
        "Standard Proposal"
      );
    });

    it("should return 'Approval Vote Proposal' for OFFCHAIN_APPROVAL", () => {
      expect(getProposalTypeText("OFFCHAIN_APPROVAL")).toBe(
        "Approval Vote Proposal"
      );
    });

    it("should return 'Optimistic Proposal' for OPTIMISTIC", () => {
      expect(getProposalTypeText("OPTIMISTIC")).toBe("Optimistic Proposal");
    });
  });
});
