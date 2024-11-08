import {
  createWalletClient,
  createPublicClient,
  custom,
  http,
  Chain,
} from "viem";
import { mainnet, sepolia, optimism, scroll } from "viem/chains";
import { cyber } from "@/lib/tenant/configs/contracts/cyber";
import "viem/window";
import Tenant from "./tenant/tenant";

export const getWalletClient = (chainId: number) => {
  switch (chainId) {
    case mainnet.id:
      return createWalletClient({
        chain: mainnet,
        transport: custom(window.ethereum!),
      });
    case sepolia.id:
      return createWalletClient({
        chain: sepolia,
        transport: custom(window.ethereum!),
      });
    case optimism.id:
      return createWalletClient({
        chain: optimism,
        transport: custom(window.ethereum!),
      });
    case cyber.id:
      return createWalletClient({
        chain: cyber,
        transport: custom(window.ethereum!),
      });

    case scroll.id:
      return createWalletClient({
        chain: scroll,
        transport: custom(window.ethereum!),
      });

    default:
      throw new Error("Invalid chainId");
  }
};

export const getPublicClient = (chain?: Chain) => {
  const { contracts } = Tenant.current();

  const alchemyId = process.env.NEXT_PUBLIC_ALCHEMY_ID!;
  const hasAlchemy = contracts.governor.chain.rpcUrls?.alchemy;
  const transport = hasAlchemy
    ? `${chain?.rpcUrls.alchemy.http[0] ?? contracts.governor.chain.rpcUrls.alchemy.http[0]}/${alchemyId}`
    : `${chain?.rpcUrls.default.http[0] ?? contracts.governor.chain.rpcUrls.default.http[0]}`;

  return createPublicClient({
    chain: chain ?? contracts.governor.chain,
    transport: http(transport),
  });
};
