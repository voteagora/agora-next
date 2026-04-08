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

export async function delegateBySignatureApi({
  signature,
  delegatee,
  nonce,
  expiry,
  traceContext,
}: {
  signature: `0x${string}`;
  delegatee: `0x${string}`;
  nonce: string;
  expiry: number;
  traceContext?: MiradorTraceContext;
}): Promise<`0x${string}`> {
  const { request } = await prepareDelegateBySignatureApi({
    signature,
    delegatee,
    nonce,
    expiry,
  });
  const requestData =
    "data" in request && typeof request.data === "string"
      ? request.data
      : undefined;

  const { governor } = Tenant.current().contracts;
  const transport = getTransportForChain(governor.chain.id)!;

  const walletClient = createWalletClient({
    chain: governor.chain,
    transport,
  });

  await appendServerTraceEvent({
    traceContext: withMiradorTraceStep(
      traceContext,
      "relay_delegate_write_start",
      "backend"
    ),
    eventName: "relay_delegate_submission_started",
    details: {
      delegatee,
      nonce,
      expiry,
    },
    txInputData: requestData,
  });

  try {
    const txHash = await walletClient.writeContract(request);
    const miradorChain = getMiradorChainNameFromChainId(governor.chain.id);

    await appendServerTraceEvent({
      traceContext: withMiradorTraceStep(
        traceContext,
        "relay_delegate_write_success",
        "backend"
      ),
      eventName: "relay_delegate_submission_succeeded",
      details: {
        delegatee,
        nonce,
        expiry,
        txHash,
      },
      txInputData: requestData,
      txHashHints: miradorChain
        ? [
            {
              txHash,
              chain: miradorChain,
              details: "Delegation relayed by sponsor",
            },
          ]
        : undefined,
    });

    return txHash;
  } catch (error) {
    await appendServerTraceEvent({
      traceContext: withMiradorTraceStep(
        traceContext,
        "relay_delegate_write_failed",
        "backend"
      ),
      eventName: "relay_delegate_submission_failed",
      details: {
        delegatee,
        nonce,
        expiry,
        message: error instanceof Error ? error.message : String(error),
      },
      txInputData: requestData,
    });
    throw error;
  }
}

async function prepareDelegateBySignatureApi({
  signature,
  delegatee,
  nonce,
  expiry,
}: {
  signature: `0x${string}`;
  delegatee: `0x${string}`;
  nonce: string;
  expiry: number;
}) {
  if (!SPONSOR_PRIVATE_KEY || !isHex(SPONSOR_PRIVATE_KEY)) {
    throw new Error("incorrect or missing SPONSOR_PRIVATE_KEY");
  }

  const { token } = Tenant.current().contracts;

  const publicClient = getPublicClient();

  const { r, s, v } = parseSignature(signature);

  if (!v) {
    throw new Error("Unsupported signature type");
  }

  const account = privateKeyToAccount(SPONSOR_PRIVATE_KEY);

  const { request } = await publicClient.simulateContract({
    address: token.address as `0x${string}`,
    abi: token.abi,
    functionName: "delegateBySig",
    args: [delegatee, BigInt(nonce), BigInt(expiry), v, r, s],
    account: account,
  });

  return { request };
}
