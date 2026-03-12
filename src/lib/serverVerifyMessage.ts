import "server-only";

import { EIP1271_MAGIC_VALUE } from "./constants";
import { getCanonicalSafeMessageHash } from "./safeMessages";
import { getChainById, getPublicClient } from "./viem";

const ERC1271_ABI = [
  {
    type: "function",
    name: "isValidSignature",
    stateMutability: "view",
    inputs: [
      { name: "hash", type: "bytes32" },
      { name: "signature", type: "bytes" },
    ],
    outputs: [{ name: "magicValue", type: "bytes4" }],
  },
] as const;

type VerifyMessageParams = {
  address: `0x${string}`;
  chainId?: number;
  signature: `0x${string}`;
  message: string;
};

function getVerificationPublicClient(chainId?: number) {
  if (typeof chainId !== "number") {
    return getPublicClient();
  }

  const chain = getChainById(chainId);
  if (!chain) {
    return null;
  }

  return getPublicClient(chain);
}

async function verifyEoaMessageWithClient(
  publicClient: NonNullable<ReturnType<typeof getVerificationPublicClient>>,
  { address, message, signature }: VerifyMessageParams
) {
  try {
    return await publicClient.verifyMessage({
      address,
      message,
      signature,
    });
  } catch {
    return false;
  }
}

async function verifySafeContractMessageWithClient(
  publicClient: NonNullable<ReturnType<typeof getVerificationPublicClient>>,
  {
    address,
    chainId,
    message,
    signature,
  }: VerifyMessageParams & {
    chainId: number;
  }
) {
  try {
    const code = await publicClient.getBytecode({ address });
    const isContract = !!code && code !== "0x";
    if (!isContract) {
      return false;
    }

    const safeMessageHash = await getCanonicalSafeMessageHash({
      safeAddress: address,
      chainId,
      message,
    });

    const response = (await publicClient.readContract({
      address,
      abi: ERC1271_ABI,
      functionName: "isValidSignature",
      args: [safeMessageHash, signature],
    })) as `0x${string}`;

    return response?.toLowerCase() === EIP1271_MAGIC_VALUE;
  } catch {
    return false;
  }
}

export async function verifyEoaMessage(params: VerifyMessageParams) {
  const publicClient = getVerificationPublicClient(params.chainId);
  if (!publicClient) {
    return false;
  }

  return verifyEoaMessageWithClient(publicClient, params);
}

export async function verifySafeContractMessage(
  params: VerifyMessageParams & {
    chainId: number;
  }
) {
  const publicClient = getVerificationPublicClient(params.chainId);
  if (!publicClient) {
    return false;
  }

  return verifySafeContractMessageWithClient(publicClient, params);
}

export default async function verifyMessage({
  allowSafeContractSignature = false,
  ...params
}: VerifyMessageParams & {
  allowSafeContractSignature?: boolean;
}) {
  const publicClient = getVerificationPublicClient(params.chainId);
  if (!publicClient) {
    return false;
  }

  const verifiedAsEoa = await verifyEoaMessageWithClient(publicClient, params);
  if (verifiedAsEoa) {
    return true;
  }

  if (!allowSafeContractSignature || typeof params.chainId !== "number") {
    return false;
  }

  return verifySafeContractMessageWithClient(publicClient, {
    ...params,
    chainId: params.chainId,
  });
}
