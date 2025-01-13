import { createPublicClient, createWalletClient, custom, http } from "viem";
import { cyber, mainnet, optimism, scroll, sepolia } from "viem/chains";

import "viem/window";
import { getTransportForChain } from "./utils";
import {
  deriveMainnet,
  deriveTestnet,
} from "@/lib/tenant/configs/contracts/derive";

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

export const getPublicClient = (chainId: number) => {
  const transport = getTransportForChain(chainId);

  if (!transport) {
    throw new Error("Invalid chainId");
  }

  switch (chainId) {
    case mainnet.id:
      return createPublicClient({
        chain: mainnet,
        transport,
      });
    case sepolia.id:
      return createPublicClient({
        chain: sepolia,
        transport,
      });
    case optimism.id:
      return createPublicClient({
        chain: optimism,
        transport,
      });
    case cyber.id:
      return createPublicClient({
        chain: cyber,
        transport,
      });
    case scroll.id:
      return createPublicClient({
        chain: scroll,
        transport,
      });

    case deriveTestnet.id:
      return createPublicClient({
        chain: deriveTestnet,
        transport: http(),
      });

    case deriveMainnet.id:
      return createPublicClient({
        chain: deriveMainnet,
        transport: http(),
      });
    default:
      throw new Error("Invalid chainId");
  }
};
