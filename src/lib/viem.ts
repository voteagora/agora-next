import { Chain, createPublicClient, createWalletClient, custom, http } from "viem";
import { cyber, mainnet, optimism, scroll, sepolia } from "viem/chains";

import "viem/window";
import { getTransportForChain } from "./utils";
import {
  deriveMainnet,
  deriveTestnet,
} from "@/lib/tenant/configs/contracts/derive";
import Tenant from "@/lib/tenant/tenant";

export const getWalletClient = (chainId: number) => {

  if (!process.env.GOV_CLIENT_NODE_RPC) {

    throw new Error("GOV_CLIENT_NODE_RPC environment variable is not defined");
  }
 
  switch (chainId) {
    case mainnet.id:
      return createWalletClient({
        chain: mainnet,
        transport: http(process.env.GOV_CLIENT_NODE_RPC!),
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

    case deriveTestnet.id:
      return createWalletClient({
        chain: deriveTestnet,
        transport: custom(window.ethereum!),
      });

    case deriveMainnet.id:
      return createWalletClient({
        chain: deriveMainnet,
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
    chain?.id ?? contracts.token.chain.id
  )!;

  return createPublicClient({
    chain: chain ?? contracts.token.chain,
    transport,
  });
};
