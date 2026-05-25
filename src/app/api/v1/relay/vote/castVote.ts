import Tenant from "@/lib/tenant/tenant";
import { getTransportForChain } from "@/lib/utils";
import { getPublicClient } from "@/lib/viem";
import { getMiradorChainNameFromChainId } from "@/lib/mirador/chains";
import {
  appendServerTraceEvent,
  withMiradorTraceStep,
} from "@/lib/mirador/serverTrace";
import type { MiradorTraceContext } from "@/lib/mirador/types";
import { createWalletClient, parseSignature, isHex } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const SPONSOR_PRIVATE_KEY = process.env.GAS_SPONSOR_PK;

export async function voteBySignatureApi({
  signature,
  proposalId,
  support,
  traceContext,
}: {
  signature: `0x${string}`;
  proposalId: string;
  support: number;
  traceContext?: MiradorTraceContext;
}): Promise<`0x${string}`> {
  const { request, sponsorAddress } = await prepareVoteBySignatureApi({
    signature,
    proposalId,
    support,
  });
  const requestData =
    "data" in request && typeof request.data === "string"
      ? request.data
      : undefined;

  const { governor } = Tenant.current().contracts;
  const transport = getTransportForChain(governor.chain.id)!;
  const publicClient = getPublicClient();

  const walletClient = createWalletClient({
    chain: governor.chain,
    transport,
  });
  const nonceSnapshot = await getSponsorNonceSnapshot(
    publicClient,
    sponsorAddress
  );

  appendServerTraceEvent({
    traceContext: withMiradorTraceStep(
      traceContext,
      "relay_vote_write_start",
      "backend"
    ),
    eventName: "relay_vote_submission_started",
    details: {
      proposalId,
      support,
      sponsorAddress,
      governorAddress: governor.address,
      chainId: governor.chain.id,
      ...nonceSnapshot,
    },
    txInputData: requestData,
  });

  try {
    const txHash = await walletClient.writeContract(request);
    const miradorChain = getMiradorChainNameFromChainId(governor.chain.id);

    appendServerTraceEvent({
      traceContext: withMiradorTraceStep(
        traceContext,
        "relay_vote_broadcasted",
        "backend"
      ),
      eventName: "relay_vote_broadcasted",
      details: {
        proposalId,
        support,
        txHash,
        sponsorAddress,
        governorAddress: governor.address,
        chainId: governor.chain.id,
        broadcastState: "broadcasted",
        confirmationState: "unconfirmed",
        ...nonceSnapshot,
        ...getRelayVoteRequestTraceDetails(request),
      },
      txInputData: requestData,
      txHashHints: miradorChain
        ? [
            {
              txHash,
              chain: miradorChain,
              details:
                "Governance vote broadcast by sponsor; awaiting confirmation",
            },
          ]
        : undefined,
    });

    return txHash;
  } catch (error) {
    appendServerTraceEvent({
      traceContext: withMiradorTraceStep(
        traceContext,
        "relay_vote_write_failed",
        "backend"
      ),
      eventName: "relay_vote_submission_failed",
      details: {
        proposalId,
        support,
        sponsorAddress,
        governorAddress: governor.address,
        chainId: governor.chain.id,
        ...nonceSnapshot,
        message: error instanceof Error ? error.message : String(error),
      },
      txInputData: requestData,
    });
    throw error;
  }
}

async function prepareVoteBySignatureApi({
  signature,
  proposalId,
  support,
}: {
  signature: `0x${string}`;
  proposalId: string;
  support: number;
}) {
  if (!SPONSOR_PRIVATE_KEY || !isHex(SPONSOR_PRIVATE_KEY)) {
    throw new Error("incorrect or missing SPONSOR_PRIVATE_KEY");
  }

  const { governor } = Tenant.current().contracts;

  const publicClient = getPublicClient();

  const { r, s, v } = parseSignature(signature);

  if (!v) {
    throw new Error("Unsupported signature type");
  }

  const account = privateKeyToAccount(SPONSOR_PRIVATE_KEY);

  const { request } = await publicClient.simulateContract({
    address: governor.address as `0x${string}`,
    abi: governor.abi,
    functionName: "castVoteBySig",
    args: [BigInt(proposalId), support, v, r, s],
    account: account,
  });

  return { request, sponsorAddress: account.address };
}

async function getSponsorNonceSnapshot(
  publicClient: ReturnType<typeof getPublicClient>,
  sponsorAddress: `0x${string}`
) {
  const [latestNonce, pendingNonce] = await Promise.allSettled([
    publicClient.getTransactionCount({
      address: sponsorAddress,
      blockTag: "latest",
    }),
    publicClient.getTransactionCount({
      address: sponsorAddress,
      blockTag: "pending",
    }),
  ]);

  return {
    sponsorLatestNonceBeforeBroadcast:
      latestNonce.status === "fulfilled" ? latestNonce.value : undefined,
    sponsorPendingNonceBeforeBroadcast:
      pendingNonce.status === "fulfilled" ? pendingNonce.value : undefined,
  };
}

function getRelayVoteRequestTraceDetails(
  request: Record<string, unknown>
): Record<string, unknown> {
  return {
    requestGas: getSerializableTxRequestValue(request.gas),
    requestGasPrice: getSerializableTxRequestValue(request.gasPrice),
    requestMaxFeePerGas: getSerializableTxRequestValue(request.maxFeePerGas),
    requestMaxPriorityFeePerGas: getSerializableTxRequestValue(
      request.maxPriorityFeePerGas
    ),
    requestNonce: getSerializableTxRequestValue(request.nonce),
  };
}

function getSerializableTxRequestValue(value: unknown) {
  if (typeof value === "bigint") {
    return value.toString();
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  return undefined;
}
