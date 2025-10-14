import {
  Chain,
  createPublicClient,
  createWalletClient,
  custom,
  http,
} from "viem";
import {
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

// Cache clients to avoid creating multiple instances
const clientCache = new Map<number, ReturnType<typeof createPublicClient>>();

export const getPublicClient = (chain?: Chain) => {
  const { contracts } = Tenant.current();
  const chainId = chain?.id ?? contracts.token.chain.id;

  // Return cached client if available
  if (clientCache.has(chainId)) {
    return clientCache.get(chainId)!;
  }

  const transport = getTransportForChain(chainId)!;

  const client = createPublicClient({
    chain: chain ?? contracts.token.chain,
    transport,
  });

  clientCache.set(chainId, client);
  return client;
};
