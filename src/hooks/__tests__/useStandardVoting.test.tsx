"use client";

import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import useStandardVoting from "@/hooks/useStandardVoting";

const {
  attachMiradorTransactionArtifactsMock,
  closeFrontendMiradorFlowTraceMock,
  startFrontendMiradorFlowTraceMock,
  useAccountMock,
  useWriteContractMock,
  writeContractAsyncMock,
} = vi.hoisted(() => ({
  attachMiradorTransactionArtifactsMock: vi.fn(),
  closeFrontendMiradorFlowTraceMock: vi.fn(),
  startFrontendMiradorFlowTraceMock: vi.fn(),
  useAccountMock: vi.fn(),
  useWriteContractMock: vi.fn(),
  writeContractAsyncMock: vi.fn(),
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

vi.mock("wagmi", () => ({
  useAccount: useAccountMock,
  useWriteContract: useWriteContractMock,
}));

vi.mock("@/lib/tenant/tenant", () => ({
  default: {
    current: () => ({
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
  trackEvent: vi.fn(),
  trackEventFireAndForget: vi.fn(),
}));

vi.mock("@/lib/utils", () => ({
  wrappedWaitForTransactionReceipt: vi.fn(),
}));

vi.mock("@/lib/mirador/frontendFlowTrace", () => ({
  attachMiradorTransactionArtifacts: attachMiradorTransactionArtifactsMock,
  closeFrontendMiradorFlowTrace: closeFrontendMiradorFlowTraceMock,
  startFrontendMiradorFlowTrace: startFrontendMiradorFlowTraceMock,
}));

describe("useStandardVoting", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useWriteContractMock.mockReturnValue({
      writeContractAsync: writeContractAsyncMock,
      isError: false,
      error: null,
    });
    startFrontendMiradorFlowTraceMock.mockReturnValue({ traceId: "trace-id" });
  });

  it("does not submit a vote while Wagmi is exposing a serialized reconnecting connector", async () => {
    useAccountMock.mockReturnValue({
      address: "0x0000000000000000000000000000000000000002",
      chainId: 1,
      connector: {
        id: "injected",
        name: "MetaMask",
        type: "injected",
        uid: "persisted-connector",
      },
      status: "reconnecting",
    });

    const { result } = renderHook(() =>
      useStandardVoting({
        proposalId: "96",
        support: 1,
        missingVote: "DIRECT",
      })
    );

    await act(async () => {
      result.current.write();
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toContain("still reconnecting");
    expect(writeContractAsyncMock).not.toHaveBeenCalled();
    expect(startFrontendMiradorFlowTraceMock).toHaveBeenCalledWith(
      expect.objectContaining({
        attributes: expect.objectContaining({
          "wallet.accountStatus": "reconnecting",
          "wallet.connectedChainId": 1,
          "wallet.connector.id": "injected",
          "wallet.connector.hasGetChainId": false,
          "wallet.connector.hasLiveMethods": false,
        }),
      })
    );
    expect(attachMiradorTransactionArtifactsMock).toHaveBeenCalled();
    expect(closeFrontendMiradorFlowTraceMock).toHaveBeenCalledWith(
      { traceId: "trace-id" },
      expect.objectContaining({
        reason: "governance_vote_failed",
        details: expect.objectContaining({
          error:
            "Wallet connection is still reconnecting. Please try again in a moment.",
        }),
      })
    );
  });
});
