import {
  AgoraGovernor__factory,
  AgoraTimelock__factory,
  ERC20__factory,
} from "@/lib/contracts/generated";
import { TenantContract } from "@/lib/tenant/tenantContract";
import { TenantContracts } from "@/lib/types";
import { IGovernorContract } from "@/lib/contracts/common/interfaces/IGovernorContract";
import { JsonRpcProvider } from "ethers";
import { defineChain } from "viem";
import { createTokenContract } from "@/lib/tokenUtils";

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

interface Props {
  isProd: boolean;
  alchemyId: string;
}

export const deriveTenantConfig = ({
  isProd,
  alchemyId,
}: Props): TenantContracts => {
  // TODO: FYI _ DEV CONTRACTS IN BOTH PRODUCTION AND DEV
  // const TOKEN = isProd ? "0x0" : "0xCDbD011A4852d173b7b2c3aa80606B230d4ce58A";
  // const GOVERNOR = isProd
  //   ? "0x0"
  //   : "0x6465AbAF0bF54c907109F7456079F467459587EB";

  // const APPROVAL_MODULE = isProd
  //   ? "0x0"
  //   : "0x8dfC3B23EE4ca0b8C4af1e4EC7F72D2efbAB70E3";

  // const rpcURL = isProd
  //   ? `https://rpc-lyra-mainnet-0.t.conduit.xyz/${process.env.NEXT_PUBLIC_CONDUIT_KEY}`
  //   : `https://rpc-prod-testnet-0eakp60405.t.conduit.xyz/${process.env.NEXT_PUBLIC_CONDUIT_KEY}`;
  //

  const TOKEN = "0x47b4Ad50177b8e88F774B4E1D09e590d9cb9e386";
  const GOVERNOR = "0x79CA2f1450Ba61Daa13a56a679E3148eEf96b1Ee";
  const APPROVAL_MODULE = "0x8dfC3B23EE4ca0b8C4af1e4EC7F72D2efbAB70E3";
  const TIMELOCK = "0x53767D56c782D0479Fa7283E2A1A38B1aaEd2DCE";
  const rpcURL = `https://rpc-prod-testnet-0eakp60405.t.conduit.xyz/${process.env.NEXT_PUBLIC_CONDUIT_KEY}`;

  const provider = new JsonRpcProvider(rpcURL);
  // const chain = isProd ? lyra : lyraTestnet;
  const chain = lyraTestnet;

  return {
    token: createTokenContract({
      abi: ERC20__factory.abi,
      address: TOKEN as `0x${string}`,
      chain,
      contract: ERC20__factory.connect(TOKEN, provider),
      provider,
      type: "erc20",
    }),

    // PLACEHOLDER CONTRACT
    governor: new TenantContract<IGovernorContract>({
      abi: AgoraGovernor__factory.abi,
      address: GOVERNOR,
      chain,
      contract: AgoraGovernor__factory.connect(GOVERNOR, provider),
      provider,
    }),

    timelock: new TenantContract<IGovernorContract>({
      abi: AgoraTimelock__factory.abi,
      address: TIMELOCK,
      chain,
      contract: AgoraTimelock__factory.connect(TIMELOCK, provider),
      provider,
    }),

    governorApprovalModule: APPROVAL_MODULE,
  };
};
