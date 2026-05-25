"use client";

import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import useSponsoredVoting from "@/hooks/useSponsoredVoting";

const {
  addMiradorEventMock,
  attachMiradorTransactionArtifactsMock,
  closeFrontendMiradorFlowTraceMock,
  getFrontendMiradorTraceContextMock,
  postMock,
  signTypedDataAsyncMock,
  startFrontendMiradorFlowTraceMock,
  trackEventMock,
  useAccountMock,
  useGovernorNameMock,
  useSignTypedDataMock,
  waitForTransactionReceiptMock,
} = vi.hoisted(() => ({
  addMiradorEventMock: vi.fn(),
  attachMiradorTransactionArtifactsMock: vi.fn(),
  closeFrontendMiradorFlowTraceMock: vi.fn(),
  getFrontendMiradorTraceContextMock: vi.fn(),
  postMock: vi.fn(),
  signTypedDataAsyncMock: vi.fn(),
  startFrontendMiradorFlowTraceMock: vi.fn(),
  trackEventMock: vi.fn(),
  useAccountMock: vi.fn(),
  useGovernorNameMock: vi.fn(),
  useSignTypedDataMock: vi.fn(),
  waitForTransactionReceiptMock: vi.fn(),
}));

const governorAbi = [
  {
    type: "function",
    name: "castVote",
    stateMutability: "nonpayable",
    inputs: [
      { name: "proposalId", type: "uint256" },
      { name: "support", type: "uint8" },
    ],
    outputs: [],
  },
] as const;

const relayTxHash =
  "0x000000000000000000000000000000000000000000000000000000000000000a";

vi.mock("@/app/Web3Provider", () => ({
  config: {},
}));

vi.mock("wagmi", () => ({
  useAccount: useAccountMock,
  useSignTypedData: useSignTypedDataMock,
}));

vi.mock("wagmi/actions", () => ({
  waitForTransactionReceipt: waitForTransactionReceiptMock,
}));

vi.mock("@/hooks/useGovernorName", () => ({
  useGovernorName: useGovernorNameMock,
}));

vi.mock("@/app/lib/agoraAPI", () => ({
  default: vi.fn().mockImplementation(() => ({
    post: postMock,
  })),
}));

vi.mock("@/lib/tenant/tenant", () => ({
  default: {
    current: () => ({
      ui: {
        toggle: (name: string) => {
          if (name === "sponsoredVote") {
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
        governor: {
          abi: governorAbi,
          address: "0x0000000000000000000000000000000000000001",
          chain: { id: 1 },
        },
      },
    }),
  },
}));

vi.mock("@/lib/analytics", () => ({
  trackEvent: trackEventMock,
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

describe("useSponsoredVoting", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAccountMock.mockReturnValue({
      address: "0x0000000000000000000000000000000000000002",
      chainId: 1,
      connector: {
        id: "injected",
        name: "MetaMask",
        type: "injected",
        uid: "connector",
        getAccounts: vi.fn(),
        getChainId: vi.fn(),
      },
      status: "connected",
    });
    useGovernorNameMock.mockReturnValue({ data: "Uniswap" });
    signTypedDataAsyncMock.mockResolvedValue("0xsignature");
    useSignTypedDataMock.mockReturnValue({
      signTypedDataAsync: signTypedDataAsyncMock,
    });
    startFrontendMiradorFlowTraceMock.mockReturnValue({ traceId: "trace-id" });
    getFrontendMiradorTraceContextMock.mockReturnValue({ traceId: "trace-id" });
    postMock.mockResolvedValue({
      json: vi.fn().mockResolvedValue(relayTxHash),
    });
    waitForTransactionReceiptMock.mockResolvedValue({
      status: "success",
      blockHash: "0xblock",
      blockNumber: 123n,
      transactionIndex: 4,
    });
    trackEventMock.mockResolvedValue(undefined);
  });

  it("traces sponsored vote broadcast and confirmation separately", async () => {
    const { result } = renderHook(() =>
      useSponsoredVoting({
        proposalId: "96",
        support: 1,
      })
    );

    await act(async () => {
      result.current.write();
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(waitForTransactionReceiptMock).toHaveBeenCalledWith(
      {},
      expect.objectContaining({
        hash: relayTxHash,
        chainId: 1,
        timeout: 600000,
      })
    );
    expect(addMiradorEventMock).toHaveBeenCalledWith(
      { traceId: "trace-id" },
      "governance_vote_relay_broadcasted",
      expect.objectContaining({
        transactionHash: relayTxHash,
        confirmationState: "awaiting_receipt",
      })
    );
    expect(addMiradorEventMock).toHaveBeenCalledWith(
      { traceId: "trace-id" },
      "governance_vote_relay_confirmed",
      expect.objectContaining({
        transactionHash: relayTxHash,
        receiptStatus: "success",
        blockNumber: "123",
      })
    );
    expect(closeFrontendMiradorFlowTraceMock).toHaveBeenCalledWith(
      { traceId: "trace-id" },
      expect.objectContaining({
        reason: "governance_vote_succeeded",
        details: expect.objectContaining({
          transactionHash: relayTxHash,
          receiptStatus: "success",
        }),
      })
    );
  });

  it("records a broadcasted sponsored vote that does not confirm before timeout", async () => {
    waitForTransactionReceiptMock.mockRejectedValue(
      new Error("Timed out while waiting for transaction receipt")
    );

    const { result } = renderHook(() =>
      useSponsoredVoting({
        proposalId: "96",
        support: 1,
      })
    );

    await act(async () => {
      result.current.write();
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe(
      `Sponsored vote transaction ${relayTxHash} was broadcast but was not confirmed within 10 minutes.`
    );
    expect(addMiradorEventMock).toHaveBeenCalledWith(
      { traceId: "trace-id" },
      "governance_vote_relay_confirmation_failed",
      expect.objectContaining({
        transactionHash: relayTxHash,
        receiptTimeoutMs: 600000,
        error: result.current.error?.message,
      })
    );
    expect(closeFrontendMiradorFlowTraceMock).toHaveBeenCalledWith(
      { traceId: "trace-id" },
      expect.objectContaining({
        reason: "governance_vote_failed",
        details: expect.objectContaining({
          transactionHash: relayTxHash,
          error: result.current.error?.message,
        }),
      })
    );
  });
});
