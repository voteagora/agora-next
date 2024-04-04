import "server-only";

import { createPublicClient, http } from "viem";
import { mainnet, optimism } from "viem/chains";
import Tenant from "@/lib/tenant/tenant";

export default async function verifyMessage({
  address,
  message,
  signature,
}: {
  address: `0x${string}`;
  signature: `0x${string}`;
  message: string;
}) {
  const { contracts } = Tenant.current();

  const getChain = () => {
    switch (contracts.token.chainId) {
      case 1:
        return mainnet;
      case 10:
        return optimism;
      default:
        throw new Error(`Invalid chainId: ${contracts.token.chainId}`);
    }
  };

  const getRpcUrl = () => {
    switch (contracts.token.chainId) {
      case 1:
        return `https://eth-mainnet.g.alchemy.com/v2/${alchemyId}`;
      case 10:
        return `https://opt-mainnet.g.alchemy.com/v2/${alchemyId}`;
      default:
        throw new Error(`Invalid chainId: ${contracts.token.chainId}`);
    }
  };

  // Alchemy key
  const alchemyId = process.env.NEXT_PUBLIC_ALCHEMY_ID!;

  const publicClient = createPublicClient({
    chain: getChain(),
    transport: http(getRpcUrl()),
  });

  return await publicClient.verifyMessage({
    address,
    message,
    signature,
  });
}
