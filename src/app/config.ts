import { getTransportForChain } from "@/lib/utils";
import { mainnet } from "wagmi/chains";
import { createConfig, createStorage, cookieStorage } from "wagmi";
import Tenant from "@/lib/tenant/tenant";

const { contracts } = Tenant.current();

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
