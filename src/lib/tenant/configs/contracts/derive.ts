import {
  AgoraGovernor__factory,
  ERC20__factory,
} from "@/lib/contracts/generated";
import { ITokenContract } from "@/lib/contracts/common/interfaces/ITokenContract";
import { TenantContract } from "@/lib/tenant/tenantContract";
import { TenantContracts } from "@/lib/types";
import { IGovernorContract } from "@/lib/contracts/common/interfaces/IGovernorContract";
import { JsonRpcProvider } from "ethers";
import { defineChain } from "viem";

interface Props {
  isProd: boolean;
  alchemyId: string;
}

export const derive = /*#__PURE__*/ defineChain({
  id: 957,
  name: "Derive",
  network: "dervie",
  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["rpc.lyra.finance"],
      webSocket: ["wss://rpc.lyra.finance"],
    },
    public: {
      http: ["rpc.lyra.finance"],
      webSocket: ["wss://rpc.lyra.finance"],
    },
  },
  blockExplorers: {
    default: {
      name: "Explorer",
      url: "https://explorer.lyra.finance",
    },
  },
  testnet: false,
});

export const deriveTenantConfig = ({
                                     isProd,
                                     alchemyId,
                                   }: Props): TenantContracts => {
  const TOKEN = isProd ? "0x0" : "0xCDbD011A4852d173b7b2c3aa80606B230d4ce58A";
  const GOVERNOR = isProd ? "0x0" : "0x6465AbAF0bF54c907109F7456079F467459587EB";

  const rpcURL = isProd
    ? `https://rpc-lyra-mainnet-0.t.conduit.xyz/${process.env.NEXT_PUBLIC_CONDUIT_KEY}`
    : `https://rpc-prod-testnet-0eakp60405.t.conduit.xyz/${process.env.NEXT_PUBLIC_CONDUIT_KEY}`;

  const provider = new JsonRpcProvider(rpcURL);
  const chain = derive;

  return {
    token: new TenantContract<ITokenContract>({
      abi: ERC20__factory.abi,
      address: TOKEN as `0x${string}`,
      chain,
      contract: ERC20__factory.connect(TOKEN, provider),
      provider,
    }),

    // PLACEHOLDER CONTRACT
    governor: new TenantContract<IGovernorContract>({
      abi: AgoraGovernor__factory.abi,
      address: GOVERNOR,
      chain,
      contract: AgoraGovernor__factory.connect(GOVERNOR, provider),
      provider,
    }),
  };
};
