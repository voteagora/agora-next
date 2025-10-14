import {
  Chain,
  createPublicClient,
  createWalletClient,
  custom,
  http,
} from "viem";
import {
  base,
  bsc,
  cyber,
  mainnet,
  optimism,
  scroll,
  sepolia,
  linea,
  lineaSepolia,
} from "viem/chains";

import "viem/window";
import { getTransportForChain } from "./utils";
import {
  deriveMainnet,
  deriveTestnet,
} from "@/lib/tenant/configs/contracts/derive";
import Tenant from "@/lib/tenant/tenant";

export const getWalletClient = (chainId: number) => {
  let transport;

  const FORK_NODE_URL = process.env.NEXT_PUBLIC_FORK_NODE_URL;

  if (FORK_NODE_URL) {
    transport = http(FORK_NODE_URL);
  } else {
    transport = custom(window.ethereum!);
  }

  switch (chainId) {
    case mainnet.id:
      return createWalletClient({
        chain: mainnet,
        transport,
      });
    case sepolia.id:
      return createWalletClient({
        chain: sepolia,
        transport,
      });
    case optimism.id:
      return createWalletClient({
        chain: optimism,
        transport,
      });
    case cyber.id:
      return createWalletClient({
        chain: cyber,
        transport,
      });

    case deriveTestnet.id:
      return createWalletClient({
        chain: deriveTestnet,
        transport,
      });

    case deriveMainnet.id:
      return createWalletClient({
        chain: deriveMainnet,
        transport,
      });

    case scroll.id:
      return createWalletClient({
        chain: scroll,
        transport,
      });

    case linea.id:
      return createWalletClient({
        chain: linea,
        transport,
      });

    case lineaSepolia.id:
      return createWalletClient({
        chain: lineaSepolia,
        transport,
      });

    default:
      throw new Error("Invalid chainId");
  }
};

export const getChainById = (chainId: number): Chain | null => {
  switch (chainId) {
    case mainnet.id:
      return mainnet;
    case sepolia.id:
      return sepolia;
    case optimism.id:
      return optimism;
    case cyber.id:
      return cyber;
    case deriveTestnet.id:
      return deriveTestnet;
    case deriveMainnet.id:
      return deriveMainnet;
    case scroll.id:
      return scroll;
    case linea.id:
      return linea;
    case lineaSepolia.id:
      return lineaSepolia;
    case base.id:
      return base;
    case bsc.id:
      return bsc;
    default:
      return null;
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
