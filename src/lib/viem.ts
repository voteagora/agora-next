import {
  createWalletClient,
  createPublicClient,
  custom,
  http,
  defineChain,
} from "viem";
import { mainnet, sepolia, optimism, lyra } from "viem/chains";
import { cyber } from "@/lib/tenant/configs/contracts/cyber";
import "viem/window";

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
      name: "Testnet Scan",
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
