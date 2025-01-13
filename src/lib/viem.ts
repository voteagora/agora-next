import {
  Chain,
  createPublicClient,
  createWalletClient,
  custom,
  defineChain,
} from "viem";
import { cyber, lyra, mainnet, optimism, scroll, sepolia } from "viem/chains";
import "viem/window";

import Tenant from "@/lib/tenant/tenant";
import { getTransportForChain } from "@/lib/utils";

export const lyraTestnet = /*#__PURE__*/ defineChain({
  id: 901,
  name: "Derive Testnet",
  network: "derive testnet",
  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        `https://rpc-prod-testnet-0eakp60405.t.conduit.xyz/${process.env.NEXT_PUBLIC_CONDUIT_KEY}`,
      ],
    },
    public: {
      http: [
        `https://rpc-prod-testnet-0eakp60405.t.conduit.xyz/${process.env.NEXT_PUBLIC_CONDUIT_KEY}`,
      ],
    },
  },
  blockExplorers: {
    default: {
      name: "Derive Testnet Scan",
      url: "https://explorer-prod-testnet-0eakp60405.t.conduit.xyz/",
    },
  },

  testnet: true,
});

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
    case lyra.id:
      return createWalletClient({
        chain: lyra,
        transport: custom(window.ethereum!),
      });

    case lyraTestnet.id:
      return createWalletClient({
        chain: lyraTestnet,
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
