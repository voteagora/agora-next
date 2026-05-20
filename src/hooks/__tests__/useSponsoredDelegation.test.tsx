"use client";

import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useSponsoredDelegation } from "@/hooks/useSponsoredDelegation";

const {
  addMiradorEventMock,
  attachMiradorTransactionArtifactsMock,
  closeFrontendMiradorFlowTraceMock,
  getFrontendMiradorTraceContextMock,
  postMock,
  readContractMock,
  signTypedDataAsyncMock,
  startFrontendMiradorFlowTraceMock,
  useNonceMock,
  useSignTypedDataMock,
  useTokenNameMock,
  waitForTransactionReceiptMock,
} = vi.hoisted(() => ({
  addMiradorEventMock: vi.fn(),
  attachMiradorTransactionArtifactsMock: vi.fn(),
  closeFrontendMiradorFlowTraceMock: vi.fn(),
  getFrontendMiradorTraceContextMock: vi.fn(),
  postMock: vi.fn(),
  readContractMock: vi.fn(),
  signTypedDataAsyncMock: vi.fn(),
  startFrontendMiradorFlowTraceMock: vi.fn(),
  useNonceMock: vi.fn(),
  useSignTypedDataMock: vi.fn(),
  useTokenNameMock: vi.fn(),
  waitForTransactionReceiptMock: vi.fn(),
}));

const delegateAbi = [
  {
    type: "function",
    name: "delegate",
    stateMutability: "nonpayable",
    inputs: [{ name: "delegatee", type: "address" }],
    outputs: [],
  },
] as const;

vi.mock("@/app/Web3Provider", () => ({
  config: {},
}));

vi.mock("wagmi", () => ({
  useSignTypedData: useSignTypedDataMock,
}));

vi.mock("wagmi/actions", () => ({
  waitForTransactionReceipt: waitForTransactionReceiptMock,
}));

vi.mock("@/hooks/useNonce", () => ({
  useNonce: useNonceMock,
}));

vi.mock("@/hooks/useTokenName", () => ({
  useTokenName: useTokenNameMock,
}));

vi.mock("@/app/lib/agoraAPI", () => ({
  default: vi.fn().mockImplementation(() => ({
    post: postMock,
  })),
}));

vi.mock("@/lib/viem", () => ({
  getPublicClient: vi.fn(() => ({
    readContract: readContractMock,
  })),
}));

vi.mock("@/lib/tenant/tenant", () => ({
  default: {
    current: () => ({
      ui: {
        toggle: (name: string) => {
          if (name === "sponsoredDelegate") {
            return {
              enabled: true,
              config: {
                signature: {
                  version: "1",
                },
              },
            };
          }

          return { enabled: false };
        },
      },
      contracts: {
        token: {
          abi: delegateAbi,
          address: "0x0000000000000000000000000000000000000001",
          chain: { id: 1 },
          provider: {
            getBlock: vi.fn().mockResolvedValue({ timestamp: 1000 }),
          },
        },
      },
    }),
  },
}));

vi.mock("@/lib/mirador/headers", () => ({
  withMiradorTraceHeaders: vi.fn((headers) => headers),
}));

vi.mock("@/lib/mirador/frontendFlowTrace", () => ({
  attachMiradorTransactionArtifacts: attachMiradorTransactionArtifactsMock,
  closeFrontendMiradorFlowTrace: closeFrontendMiradorFlowTraceMock,
  getFrontendMiradorTraceContext: getFrontendMiradorTraceContextMock,
  startFrontendMiradorFlowTrace: startFrontendMiradorFlowTraceMock,
}));

vi.mock("@/lib/mirador/webTrace", () => ({
  addMiradorEvent: addMiradorEventMock,
}));

describe("useSponsoredDelegation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useNonceMock.mockReturnValue({ data: 0n });
    useTokenNameMock.mockReturnValue({ data: "Uniswap" });
    signTypedDataAsyncMock.mockResolvedValue("0xsignature");
    useSignTypedDataMock.mockReturnValue({
      signTypedDataAsync: signTypedDataAsyncMock,
    });
    startFrontendMiradorFlowTraceMock.mockReturnValue({ traceId: "trace-id" });
    getFrontendMiradorTraceContextMock.mockReturnValue({ traceId: "trace-id" });
    postMock.mockResolvedValue({
      json: vi
        .fn()
        .mockResolvedValue(
          "0x000000000000000000000000000000000000000000000000000000000000000a"
        ),
    });
    waitForTransactionReceiptMock.mockResolvedValue({ status: "success" });
    readContractMock.mockResolvedValue(
      "0x0000000000000000000000000000000000000000"
    );
  });

  it("marks a sponsored delegation as fetched only after a successful receipt", async () => {
    const { result } = renderHook(() =>
      useSponsoredDelegation({
        address: "0x0000000000000000000000000000000000000002",
        delegate: {
          address: "0x0000000000000000000000000000000000000003",
          votingPower: { total: "0", direct: "0", advanced: "0" },
          statement: null,
          participation: 0,
        },
      })
    );

    await act(async () => {
      await result.current.call();
    });

    expect(waitForTransactionReceiptMock).toHaveBeenCalledWith(
      {},
      expect.objectContaining({
        hash: "0x000000000000000000000000000000000000000000000000000000000000000a",
        chainId: 1,
      })
    );
    expect(addMiradorEventMock).toHaveBeenCalledWith(
      { traceId: "trace-id" },
      "governance_delegation_submitted",
      expect.objectContaining({
        transactionHash:
          "0x000000000000000000000000000000000000000000000000000000000000000a",
      })
    );
    expect(closeFrontendMiradorFlowTraceMock).toHaveBeenCalledWith(
      { traceId: "trace-id" },
      expect.objectContaining({
        reason: "governance_delegation_succeeded",
      })
    );
    expect(attachMiradorTransactionArtifactsMock).toHaveBeenCalledWith(
      { traceId: "trace-id" },
      expect.objectContaining({
        txHash:
          "0x000000000000000000000000000000000000000000000000000000000000000a",
        txDetails: "Sponsored delegation transaction",
      })
    );
    expect(result.current.isFetched).toBe(true);
    expect(result.current.isError).toBe(false);
  });

  it("records a failed sponsored delegation when the receipt reverts", async () => {
    waitForTransactionReceiptMock.mockResolvedValue({ status: "reverted" });

    const { result } = renderHook(() =>
      useSponsoredDelegation({
        address: "0x0000000000000000000000000000000000000002",
        delegate: {
          address: "0x0000000000000000000000000000000000000003",
          votingPower: { total: "0", direct: "0", advanced: "0" },
          statement: null,
          participation: 0,
        },
      })
    );

    await act(async () => {
      await result.current.call();
    });

    expect(closeFrontendMiradorFlowTraceMock).toHaveBeenCalledWith(
      { traceId: "trace-id" },
      expect.objectContaining({
        reason: "governance_delegation_failed",
        details: expect.objectContaining({
          error:
            "Sponsored delegation transaction failed with status: reverted",
        }),
      })
    );
    expect(result.current.isFetched).toBe(false);
    expect(result.current.isError).toBe(true);
  });

  it("marks a sponsored delegation as fetched when the relay request fails after the chain state already changed", async () => {
    postMock.mockRejectedValue(new Error("Internal Server Error"));
    readContractMock.mockResolvedValue(
      "0x0000000000000000000000000000000000000003"
    );

    const { result } = renderHook(() =>
      useSponsoredDelegation({
        address: "0x0000000000000000000000000000000000000002",
        delegate: {
          address: "0x0000000000000000000000000000000000000003",
          votingPower: { total: "0", direct: "0", advanced: "0" },
          statement: null,
          participation: 0,
        },
      })
    );

    await act(async () => {
      await result.current.call();
    });

    expect(readContractMock).toHaveBeenCalledWith(
      expect.objectContaining({
        functionName: "delegates",
        args: ["0x0000000000000000000000000000000000000002"],
      })
    );
    expect(addMiradorEventMock).toHaveBeenCalledWith(
      { traceId: "trace-id" },
      "governance_delegation_reconciliation_checked",
      expect.objectContaining({
        reconciled: true,
        originalError: "Internal Server Error",
      })
    );
    expect(closeFrontendMiradorFlowTraceMock).toHaveBeenCalledWith(
      { traceId: "trace-id" },
      expect.objectContaining({
        reason: "governance_delegation_succeeded",
        details: expect.objectContaining({
          reconciled: true,
          currentDelegatee: "0x0000000000000000000000000000000000000003",
        }),
      })
    );
    expect(waitForTransactionReceiptMock).not.toHaveBeenCalled();
    expect(result.current.isFetched).toBe(true);
    expect(result.current.isError).toBe(false);
  });

  it("marks a sponsored delegation as fetched when receipt waiting fails but the chain state matches", async () => {
    waitForTransactionReceiptMock.mockRejectedValue(
      new Error("Timed out while waiting for transaction receipt")
    );
    readContractMock.mockResolvedValue(
      "0x0000000000000000000000000000000000000003"
    );

    const { result } = renderHook(() =>
      useSponsoredDelegation({
        address: "0x0000000000000000000000000000000000000002",
        delegate: {
          address: "0x0000000000000000000000000000000000000003",
          votingPower: { total: "0", direct: "0", advanced: "0" },
          statement: null,
          participation: 0,
        },
      })
    );

    await act(async () => {
      await result.current.call();
    });

    expect(addMiradorEventMock).toHaveBeenCalledWith(
      { traceId: "trace-id" },
      "governance_delegation_reconciliation_checked",
      expect.objectContaining({
        transactionHash:
          "0x000000000000000000000000000000000000000000000000000000000000000a",
        reconciled: true,
      })
    );
    expect(closeFrontendMiradorFlowTraceMock).toHaveBeenCalledWith(
      { traceId: "trace-id" },
      expect.objectContaining({
        reason: "governance_delegation_succeeded",
        details: expect.objectContaining({
          reconciled: true,
          originalTransactionHash:
            "0x000000000000000000000000000000000000000000000000000000000000000a",
        }),
      })
    );
    expect(result.current.txHash).toBe(
      "0x000000000000000000000000000000000000000000000000000000000000000a"
    );
    expect(result.current.isFetched).toBe(true);
    expect(result.current.isError).toBe(false);
  });
});
