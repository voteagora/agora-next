import { getTransportForChain } from "@/lib/utils";
import { mainnet } from "wagmi/chains";
import { createConfig, createStorage, cookieStorage } from "wagmi";
// import { getDefaultConfig } from "connectkit";
import Tenant from "@/lib/tenant/tenant";

// const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!;
const { contracts } = Tenant.current();

// const metadata = {
//   name: "Agora Next",
//   description: "The on-chain governance company",
//   url: process.env.NEXT_PUBLIC_AGORA_BASE_URL!,
//   icons: ["https://avatars.githubusercontent.com/u/37784886"],
// };

export const configItems = {
  chains: [contracts.token.chain, mainnet],
  transports: {
    [mainnet.id]: getTransportForChain(mainnet.id)!,
    [contracts.token.chain.id]: getTransportForChain(contracts.token.chain.id)!,
  },
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
} as const;

// used for wagmi SSR in layout.tsx
export const config = createConfig(configItems);
