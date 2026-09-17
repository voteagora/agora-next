import {
  BaseError,
  ContractFunctionRevertedError,
  ExecutionRevertedError,
  type Address,
  type Chain,
  type Hex,
  type PublicClient,
  type TransactionReceipt,
  type WalletClient,
} from "viem";
import {
  buildVoteAttestationRequest,
  EAS_ATTEST_ABI,
  isTransactionHash,
  parseAttestationUidFromReceipt,
  type VoteAttestationParams,
} from "@/lib/easVote";
import {
  classifyVoteError,
  isContractRevertCode,
  VOTE_RESOLVER_ERRORS_ABI,
  VoteSubmissionError,
} from "@/lib/voteErrorUtils";

export type PreflightOutcome = "ok" | "skipped" | "reverted";

export type VoteAttestationResult = {
  /** Transaction hash (or whatever the wallet returned when it is not a hash). */
  transactionHash: string;
  txHash: string;
  attestationUid?: Hex;
  chainId: number;
  txInputData: Hex;
  /** False when the wallet returned a non-hash id or confirmation timed out. */
  confirmed: boolean;
  preflight: PreflightOutcome;
};

export type SubmitVoteDeps = {
  address: Address;
  /** The chain the wallet is currently on, if known. */
  currentChainId?: number;
  targetChain: Chain;
  /** Agora's own RPC client for the target chain (never the wallet provider). */
  publicClient: Pick<
    PublicClient,
    "simulateContract" | "waitForTransactionReceipt"
  >;
  switchChain: (chainId: number) => Promise<unknown>;
  /** Must re-check the connector's live chain (wagmi `getWalletClient`). */
  getWalletClient: (
    chainId: number
  ) => Promise<Pick<WalletClient, "sendTransaction">>;
  waitTimeoutMs?: number;
  onInputData?: (data: Hex) => void;
};

const DEFAULT_WAIT_TIMEOUT_MS = 120_000;
const RECEIPT_POLLING_INTERVAL_MS = 4_000;

function isSimulationRevert(error: unknown): boolean {
  if (error instanceof BaseError) {
    const revert = error.walk(
      (e) =>
        e instanceof ContractFunctionRevertedError ||
        e instanceof ExecutionRevertedError
    );
    if (revert) {
      return true;
    }
  }

  return isContractRevertCode(classifyVoteError(error).code);
}

/**
 * Casts a vote attestation:
 * switch chain -> get a wallet client on that chain -> simulate through Agora's
 * RPC -> send -> confirm through Agora's RPC.
 *
 * Every failure is thrown as a `VoteSubmissionError` carrying the calldata and
 * chain id so Mirador failure traces stay complete.
 */
export async function submitVoteAttestation(
  deps: SubmitVoteDeps,
  params: VoteAttestationParams
): Promise<VoteAttestationResult> {
  const { address, targetChain } = deps;
  const chainId = targetChain.id;

  const request = buildVoteAttestationRequest({ ...params, chainId });
  const txInputData = request.data;
  deps.onInputData?.(txInputData);

  const context = { txInputData, chainId };
  const wrongChainMessage = `Switch your wallet to ${targetChain.name} to vote`;

  // 1. Chain enforcement
  if (deps.currentChainId !== chainId) {
    try {
      await deps.switchChain(chainId);
    } catch (error) {
      const classified = classifyVoteError(error);
      throw new VoteSubmissionError(
        classified.code === "USER_REJECTED" ? "USER_REJECTED" : "WRONG_CHAIN",
        classified.code === "USER_REJECTED"
          ? "Network switch was rejected in your wallet"
          : wrongChainMessage,
        { ...context, cause: error }
      );
    }
  }

  // 2. Wallet client on the target chain (wagmi re-reads the live chain id)
  let walletClient: Pick<WalletClient, "sendTransaction">;
  try {
    walletClient = await deps.getWalletClient(chainId);
  } catch (error) {
    const classified = classifyVoteError(error);
    throw new VoteSubmissionError(
      classified.code === "WRONG_CHAIN" ? "WRONG_CHAIN" : "WALLET_NOT_READY",
      classified.code === "WRONG_CHAIN"
        ? wrongChainMessage
        : "Wallet is not ready to send a transaction. Please reconnect and try again.",
      { ...context, cause: error }
    );
  }

  // 3. Pre-flight simulation through Agora's RPC. Decoded reverts fail closed;
  //    infrastructure errors fail open so a flaky RPC cannot block voting.
  let preflight: PreflightOutcome = "ok";
  try {
    await deps.publicClient.simulateContract({
      address: request.to,
      abi: [...EAS_ATTEST_ABI, ...VOTE_RESOLVER_ERRORS_ABI],
      functionName: "attest",
      args: [request.attestationRequest],
      account: address,
      value: 0n,
    });
  } catch (error) {
    if (isSimulationRevert(error)) {
      const classified = classifyVoteError(error);
      throw new VoteSubmissionError(
        classified.code === "UNKNOWN" ? "SIMULATION_FAILED" : classified.code,
        classified.code === "UNKNOWN"
          ? `This vote would fail: ${classified.message}`
          : classified.message,
        { ...context, cause: error }
      );
    }

    console.warn("Vote pre-flight simulation skipped:", error);
    preflight = "skipped";
  }

  // 4. Send
  let hash: string;
  try {
    hash = await walletClient.sendTransaction({
      account: address,
      to: request.to,
      data: request.data,
      value: 0n,
      chain: targetChain,
    });
  } catch (error) {
    const classified = classifyVoteError(error);
    throw new VoteSubmissionError(classified.code, classified.message, {
      ...context,
      cause: error,
    });
  }

  const baseResult = {
    transactionHash: hash,
    txHash: hash,
    chainId,
    txInputData,
    preflight,
  };

  // 5. Confirm through Agora's RPC only
  if (!isTransactionHash(hash)) {
    return { ...baseResult, confirmed: false };
  }

  let receipt: TransactionReceipt;
  try {
    receipt = await deps.publicClient.waitForTransactionReceipt({
      hash,
      timeout: deps.waitTimeoutMs ?? DEFAULT_WAIT_TIMEOUT_MS,
      pollingInterval: RECEIPT_POLLING_INTERVAL_MS,
    });
  } catch (error) {
    console.warn("Vote confirmation did not complete:", error);
    return { ...baseResult, confirmed: false };
  }

  if (receipt.status === "reverted") {
    throw new VoteSubmissionError(
      "REVERTED",
      "Your vote transaction was mined but reverted",
      { ...context, txHash: hash }
    );
  }

  return {
    ...baseResult,
    attestationUid: parseAttestationUidFromReceipt(receipt, request.to),
    confirmed: true,
  };
}
