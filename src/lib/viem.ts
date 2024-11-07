import {
  createPublicClient,
  createWalletClient,
  custom,
  defineChain,
  http,
} from "viem";
import { cyber, lyra, mainnet, optimism, scroll, sepolia } from "viem/chains";

import "viem/window";
import { getTransportForChain } from "./utils";

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

    case lyra.id:
      return createPublicClient({
        chain: lyra,
        transport: http(),
      });

    case lyraTestnet.id:
      return createPublicClient({
        chain: lyraTestnet,
        transport: http(),
      });
    default:
      throw new Error("Invalid chainId");
  }
};
