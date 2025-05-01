import Tenant from "@/lib/tenant/tenant";
import { getTransportForChain } from "@/lib/utils";
import { getPublicClient } from "@/lib/viem";
import { createWalletClient, parseSignature, isHex, Chain } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const SPONSOR_PRIVATE_KEY = process.env.GAS_SPONSOR_PK;

export async function delegateBySignatureApi({
  signature,
  delegatee,
  nonce,
  expiry,
}: {
  signature: `0x${string}`;
  delegatee: `0x${string}`;
  nonce: string;
  expiry: number;
}): Promise<`0x${string}`> {
  const request = await prepareDelegateBySignatureApi({
    signature,
    delegatee,
    nonce,
    expiry,
  });

  const { governor } = Tenant.current().contracts;
  const transport = getTransportForChain(governor.chain.id)!;

  const walletClient = createWalletClient({
    chain: governor.chain as Chain,
    transport,
  });

  return walletClient.writeContract(request);
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

  return request;
}
