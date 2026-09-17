import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  ContractFunctionExecutionError,
  ContractFunctionRevertedError,
  UserRejectedRequestError,
  WaitForTransactionReceiptTimeoutError,
  encodeErrorResult,
} from "viem";
import { mainnet } from "viem/chains";
import { ConnectorChainMismatchError } from "wagmi";
import {
  submitVoteAttestation,
  type SubmitVoteDeps,
} from "@/lib/easVoteSubmit";
import {
  VOTE_RESOLVER_ERRORS_ABI,
  VoteSubmissionError,
} from "@/lib/voteErrorUtils";

const ADDRESS = "0x1111111111111111111111111111111111111111" as const;
const PROPOSAL_ID =
  "0x2222222222222222222222222222222222222222222222222222222222222222";
const TX_HASH =
  "0x3333333333333333333333333333333333333333333333333333333333333333";

const params = {
  kind: "standard" as const,
  choice: 1,
  reason: "",
  proposalId: PROPOSAL_ID,
  chainId: mainnet.id,
};

function revert(errorName: "AlreadyVoted" | "VotingEnded") {
  const data = encodeErrorResult({
    abi: [...VOTE_RESOLVER_ERRORS_ABI],
    errorName,
  });
  return new ContractFunctionExecutionError(
    new ContractFunctionRevertedError({
      abi: [...VOTE_RESOLVER_ERRORS_ABI],
      data,
      functionName: "attest",
    }),
    { abi: [], functionName: "attest" }
  );
}

async function expectVoteError(promise: Promise<unknown>, code: string) {
  try {
    await promise;
  } catch (error) {
    expect(error).toBeInstanceOf(VoteSubmissionError);
    expect((error as VoteSubmissionError).code).toBe(code);
    expect((error as VoteSubmissionError).chainId).toBe(mainnet.id);
    expect((error as VoteSubmissionError).txInputData).toMatch(/^0x/);
    return error as VoteSubmissionError;
  }
  throw new Error(`expected ${code}`);
}

describe("submitVoteAttestation", () => {
  const simulateContract = vi.fn();
  const waitForTransactionReceipt = vi.fn();
  const sendTransaction = vi.fn();
  const switchChain = vi.fn();
  const getWalletClient = vi.fn();
  const onInputData = vi.fn();

  const deps = (overrides: Partial<SubmitVoteDeps> = {}): SubmitVoteDeps => ({
    address: ADDRESS,
    currentChainId: mainnet.id,
    targetChain: mainnet,
    publicClient: { simulateContract, waitForTransactionReceipt } as any,
    switchChain,
    getWalletClient,
    onInputData,
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "warn").mockImplementation(() => {});
    simulateContract.mockResolvedValue({ request: {} });
    waitForTransactionReceipt.mockResolvedValue({
      status: "success",
      logs: [],
    });
    sendTransaction.mockResolvedValue(TX_HASH);
    switchChain.mockResolvedValue(undefined);
    getWalletClient.mockResolvedValue({ sendTransaction });
  });

  it("happy path: simulates through the public client, sends, confirms", async () => {
    const result = await submitVoteAttestation(deps(), params);

    expect(onInputData).toHaveBeenCalledWith(expect.stringMatching(/^0x/));
    expect(switchChain).not.toHaveBeenCalled();
    expect(getWalletClient).toHaveBeenCalledWith(mainnet.id);
    expect(simulateContract).toHaveBeenCalledWith(
      expect.objectContaining({
        functionName: "attest",
        account: ADDRESS,
        value: 0n,
      })
    );
    expect(sendTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        account: ADDRESS,
        value: 0n,
        chain: mainnet,
      })
    );
    expect(waitForTransactionReceipt).toHaveBeenCalledWith(
      expect.objectContaining({ hash: TX_HASH })
    );
    expect(result).toMatchObject({
      txHash: TX_HASH,
      transactionHash: TX_HASH,
      chainId: mainnet.id,
      confirmed: true,
      preflight: "ok",
    });
  });

  it("switches chain only when the wallet is elsewhere", async () => {
    await submitVoteAttestation(deps({ currentChainId: 8453 }), params);
    expect(switchChain).toHaveBeenCalledWith(mainnet.id);
    expect(sendTransaction).toHaveBeenCalled();
  });

  it("stops with WRONG_CHAIN when the switch is refused", async () => {
    switchChain.mockRejectedValue(new Error("nope"));
    await expectVoteError(
      submitVoteAttestation(deps({ currentChainId: 8453 }), params),
      "WRONG_CHAIN"
    );
    expect(onInputData).toHaveBeenCalled();
    expect(sendTransaction).not.toHaveBeenCalled();
  });

  it("reports a user-rejected chain switch", async () => {
    switchChain.mockRejectedValue(
      new UserRejectedRequestError(new Error("denied"))
    );
    await expectVoteError(
      submitVoteAttestation(deps({ currentChainId: 8453 }), params),
      "USER_REJECTED"
    );
  });

  it("maps a connector chain mismatch from getWalletClient", async () => {
    getWalletClient.mockRejectedValue(
      new ConnectorChainMismatchError({
        connectionChainId: 1,
        connectorChainId: 8453,
      })
    );
    await expectVoteError(submitVoteAttestation(deps(), params), "WRONG_CHAIN");
    expect(simulateContract).not.toHaveBeenCalled();
  });

  it("fails closed on a decoded simulation revert without prompting the wallet", async () => {
    simulateContract.mockRejectedValue(revert("AlreadyVoted"));
    const error = await expectVoteError(
      submitVoteAttestation(deps(), params),
      "ALREADY_VOTED"
    );
    expect(error.message).toBe("You have already voted on this proposal");
    expect(sendTransaction).not.toHaveBeenCalled();
  });

  it("fails open when the simulation RPC itself fails", async () => {
    simulateContract.mockRejectedValue(new Error("502 Bad Gateway"));
    const result = await submitVoteAttestation(deps(), params);
    expect(sendTransaction).toHaveBeenCalled();
    expect(result.preflight).toBe("skipped");
  });

  it("maps wallet rejection on send", async () => {
    sendTransaction.mockRejectedValue(
      new UserRejectedRequestError(new Error("denied"))
    );
    await expectVoteError(
      submitVoteAttestation(deps(), params),
      "USER_REJECTED"
    );
    expect(waitForTransactionReceipt).not.toHaveBeenCalled();
  });

  it("throws REVERTED with the hash when the mined tx reverted", async () => {
    waitForTransactionReceipt.mockResolvedValue({
      status: "reverted",
      logs: [],
    });
    const error = await expectVoteError(
      submitVoteAttestation(deps(), params),
      "REVERTED"
    );
    expect(error.txHash).toBe(TX_HASH);
  });

  it("returns unconfirmed on a receipt timeout instead of throwing", async () => {
    waitForTransactionReceipt.mockRejectedValue(
      new WaitForTransactionReceiptTimeoutError({ hash: TX_HASH })
    );
    const result = await submitVoteAttestation(deps(), params);
    expect(result).toMatchObject({ txHash: TX_HASH, confirmed: false });
  });

  it("returns unconfirmed without waiting when the wallet returns a non-hash id", async () => {
    sendTransaction.mockResolvedValue("bundle-0001");
    const result = await submitVoteAttestation(deps(), params);
    expect(waitForTransactionReceipt).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      transactionHash: "bundle-0001",
      confirmed: false,
    });
  });

  it("rejects unsupported target chains before touching the wallet", async () => {
    const chain = { ...mainnet, id: 424242, name: "Nowhere" };
    try {
      await submitVoteAttestation(deps({ targetChain: chain }), params);
      throw new Error("expected throw");
    } catch (error) {
      expect((error as VoteSubmissionError).code).toBe("UNSUPPORTED_CHAIN");
    }
    expect(getWalletClient).not.toHaveBeenCalled();
  });
});
