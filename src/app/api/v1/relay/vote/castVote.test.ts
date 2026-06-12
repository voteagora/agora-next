import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const appendServerTraceEventMock = vi.fn();
const createWalletClientMock = vi.fn();
const getPublicClientMock = vi.fn();
const getTransportForChainMock = vi.fn();
const parseSignatureMock = vi.fn();
const privateKeyToAccountMock = vi.fn();
const simulateContractMock = vi.fn();
const getTransactionCountMock = vi.fn();
const writeContractMock = vi.fn();

vi.mock("@/lib/tenant/tenant", () => ({
  default: {
    current: () => ({
      contracts: {
        governor: {
          abi: [],
          address: "0x0000000000000000000000000000000000000001",
          chain: { id: 1 },
        },
      },
    }),
  },
}));

vi.mock("@/lib/utils", () => ({
  getTransportForChain: getTransportForChainMock,
}));

vi.mock("@/lib/viem", () => ({
  getPublicClient: getPublicClientMock,
}));

vi.mock("@/lib/mirador/chains", () => ({
  getMiradorChainNameFromChainId: vi.fn(() => "ethereum"),
}));

vi.mock("@/lib/mirador/serverTrace", () => ({
  appendServerTraceEvent: appendServerTraceEventMock,
  withMiradorTraceStep: vi.fn((traceContext, step, source) => ({
    ...traceContext,
    step,
    source,
  })),
}));

vi.mock("viem", () => ({
  createWalletClient: createWalletClientMock,
  isHex: vi.fn(() => true),
  parseSignature: parseSignatureMock,
}));

vi.mock("viem/accounts", () => ({
  privateKeyToAccount: privateKeyToAccountMock,
}));

describe("voteBySignatureApi", () => {
  const originalSponsorPrivateKey = process.env.GAS_SPONSOR_PK;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.GAS_SPONSOR_PK =
      "0x0000000000000000000000000000000000000000000000000000000000000001";
    parseSignatureMock.mockReturnValue({
      r: "0xr",
      s: "0xs",
      v: 28,
    });
    privateKeyToAccountMock.mockReturnValue({
      address: "0x0000000000000000000000000000000000000002",
    });
    simulateContractMock.mockResolvedValue({
      request: {
        data: "0xabcdef",
        gas: 123n,
        maxFeePerGas: 456n,
        maxPriorityFeePerGas: 78n,
        nonce: 9,
      },
    });
    getTransactionCountMock.mockImplementation(({ blockTag }) =>
      Promise.resolve(blockTag === "pending" ? 12 : 10)
    );
    getPublicClientMock.mockReturnValue({
      simulateContract: simulateContractMock,
      getTransactionCount: getTransactionCountMock,
    });
    getTransportForChainMock.mockReturnValue({});
    writeContractMock.mockResolvedValue(
      "0x000000000000000000000000000000000000000000000000000000000000000a"
    );
    createWalletClientMock.mockReturnValue({
      writeContract: writeContractMock,
    });
  });

  afterEach(() => {
    process.env.GAS_SPONSOR_PK = originalSponsorPrivateKey;
  });

  it("traces relay vote tx hashes as broadcasted, not confirmed", async () => {
    const { voteBySignatureApi } = await import("./castVote");

    await expect(
      voteBySignatureApi({
        signature: "0xabc123",
        proposalId: "96",
        support: 1,
        traceContext: {
          traceId: "trace-id",
          flow: "governance_vote",
        },
      })
    ).resolves.toBe(
      "0x000000000000000000000000000000000000000000000000000000000000000a"
    );

    expect(appendServerTraceEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: "relay_vote_broadcasted",
        details: expect.objectContaining({
          txHash:
            "0x000000000000000000000000000000000000000000000000000000000000000a",
          broadcastState: "broadcasted",
          confirmationState: "unconfirmed",
          sponsorAddress: "0x0000000000000000000000000000000000000002",
          sponsorLatestNonceBeforeBroadcast: 10,
          sponsorPendingNonceBeforeBroadcast: 12,
          requestGas: "123",
          requestMaxFeePerGas: "456",
          requestMaxPriorityFeePerGas: "78",
          requestNonce: 9,
        }),
        txHashHints: [
          {
            txHash:
              "0x000000000000000000000000000000000000000000000000000000000000000a",
            chain: "ethereum",
            details:
              "Governance vote broadcast by sponsor; awaiting confirmation",
          },
        ],
      })
    );
  });
});
