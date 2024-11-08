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
import { getTransportForChain } from "./utils";

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

  const transport = getTransportForChain(
    chain?.id ?? contracts.governor.chain.id
  )!;

  return createPublicClient({
    chain: chain ?? contracts.governor.chain,
    transport,
  });
};
