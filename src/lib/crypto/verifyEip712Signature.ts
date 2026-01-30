import { hashTypedData, verifyTypedData } from "viem";

import { EIP1271_MAGIC_VALUE } from "@/lib/constants";
import { getPublicClient } from "@/lib/viem";

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

export async function verifyEip712Signature(params: {
  address: `0x${string}`;
  domain: unknown;
  types: unknown;
  primaryType: string;
  message: unknown;
  signature: `0x${string}`;
}): Promise<boolean> {
  const { address, domain, types, primaryType, message, signature } = params;

  try {
    const isValid = await verifyTypedData({
      address,
      domain: domain as any,
      types: types as any,
      primaryType: primaryType as any,
      message: message as any,
      signature,
    });
    if (isValid) return true;
  } catch {
    // continue to EIP-1271 fallback
  }

  try {
    const publicClient = getPublicClient();
    const code = await publicClient.getBytecode({ address });
    const isContract = !!code && code !== "0x";
    if (!isContract) return false;

    const digest = hashTypedData({
      domain: domain as any,
      types: types as any,
      primaryType: primaryType as any,
      message: message as any,
    });

    const res = (await publicClient.readContract({
      address,
      abi: ERC1271_ABI,
      functionName: "isValidSignature",
      args: [digest, signature],
    })) as `0x${string}`;

    return res?.toLowerCase() === EIP1271_MAGIC_VALUE;
  } catch {
    return false;
  }
}
