import {
  AgoraGovernor__factory,
  AgoraTimelock__factory,
  ERC20__factory,
  ProposalTypesConfigurator__factory,
} from "@/lib/contracts/generated";
import { TenantContract } from "@/lib/tenant/tenantContract";
import { TenantContracts } from "@/lib/types";
import { IGovernorContract } from "@/lib/contracts/common/interfaces/IGovernorContract";
import { BaseContract, JsonRpcProvider } from "ethers";
import { defineChain } from "viem";
import { createTokenContract } from "@/lib/tokenUtils";
import { Chain, lyra } from "viem/chains";

const LYRA_TESTNET_RPC = "https://rpc-prod-testnet-0eakp60405.t.conduit.xyz";

const lyraTestnet: Chain = defineChain({
  id: 901,
  name: "Derive",
  network: "derive",
  nativeCurrency: {
    decimals: 18,
    name: "Ethers",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: [LYRA_TESTNET_RPC],
      webSocket: [LYRA_TESTNET_RPC.replace("http", "ws")],
    },
    public: {
      http: [LYRA_TESTNET_RPC],
      webSocket: [LYRA_TESTNET_RPC.replace("http", "ws")],
    },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://explorer-prod-testnet-0eakp60405.t.conduit.xyz",
    },
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
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
  const TOKEN = isProd
    ? "0x7499d654422023a407d92e1D83D387d81BC68De1"
    : "0xbe9dbda519e15a1c0d238cea0b3dad47a484a6ff";

  const GOVERNOR = isProd
    ? "0x3CdCbB7dBfb4BC02009f2879dAd7620619046b1A"
    : "0x79CA2f1450Ba61Daa13a56a679E3148eEf96b1Ee";

  const APPROVAL_MODULE = isProd
    ? "0x5d729d4c0BF5d0a2Fa0F801c6e0023BD450c4fd6"
    : "0x8dfC3B23EE4ca0b8C4af1e4EC7F72D2efbAB70E3";

  const TIMELOCK = isProd
    ? "0x239dcb72dF956e27a64f458cB49FEf0732B1f291"
    : "0x53767D56c782D0479Fa7283E2A1A38B1aaEd2DCE";

  const TYPES = isProd
    ? "0xd828b681F717E5a03C41540Bc6A31b146b5C1Ac6"
    : "0x98Baf5c59689a3292b365ff5Fc03b475EfeC8776";

  const rpcURL = isProd
    ? `https://rpc-prod-testnet-0eakp60405.t.conduit.xyz/${process.env.NEXT_PUBLIC_CONDUIT_KEY}`
    : LYRA_TESTNET_RPC;

  const provider = new JsonRpcProvider(rpcURL);
  const chain = isProd ? lyra : lyraTestnet;

  return {
    token: createTokenContract({
      abi: ERC20__factory.abi,
      address: TOKEN as `0x${string}`,
      chain,
      contract: ERC20__factory.connect(TOKEN, provider),
      provider,
      type: "erc20",
    }),

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

    proposalTypesConfigurator: new TenantContract<BaseContract>({
      abi: ProposalTypesConfigurator__factory.abi,
      address: TYPES,
      chain,
      contract: ProposalTypesConfigurator__factory.connect(TYPES, provider),
      provider,
    }),

    governorApprovalModule: APPROVAL_MODULE,
  };
};
