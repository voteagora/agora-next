import { createWalletClient, createPublicClient, custom, http } from "viem";
import { mainnet, sepolia, optimism, scroll } from "viem/chains";
import { cyber } from "@/lib/tenant/configs/contracts/cyber";
import "viem/window";

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

export const getPublicClient = (chainId: number) => {
  switch (chainId) {
    case mainnet.id:
      return createPublicClient({
        chain: mainnet,
        transport: http(),
      });
    case sepolia.id:
      return createPublicClient({
        chain: sepolia,
        transport: http(),
      });
    case optimism.id:
      return createPublicClient({
        chain: optimism,
        transport: http(),
      });
    case cyber.id:
      return createPublicClient({
        chain: cyber,
        transport: http(),
      });
    case scroll.id:
      return createPublicClient({
        chain: scroll,
        transport: http(),
      });
    default:
      throw new Error("Invalid chainId");
  }
};
