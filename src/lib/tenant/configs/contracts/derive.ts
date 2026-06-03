import {
  AgoraGovernor__factory,
  AgoraTimelock__factory,
  AgoraToken__factory,
  ProposalTypesConfigurator__factory,
} from "@/lib/contracts/generated";
import { TenantContract } from "@/lib/tenant/tenantContract";
import { TenantContracts } from "@/lib/types";
import { IGovernorContract } from "@/lib/contracts/common/interfaces/IGovernorContract";
import { BaseContract, JsonRpcProvider } from "ethers";
import { defineChain } from "viem";
import { createTokenContract } from "@/lib/tokenUtils";
import { Chain } from "viem/chains";
import {
  DELEGATION_MODEL,
  GOVERNOR_TYPE,
  PROPOSAL_TYPES_CONFIGURATOR_FACTORY,
  TIMELOCK_TYPE,
} from "@/lib/constants";
import { ITimelockContract } from "@/lib/contracts/common/interfaces/ITimelockContract";

export const DERIVE_TESTNET_RPC = `https://rpc-prod-testnet-0eakp60405.t.conduit.xyz/${process.env.NEXT_PUBLIC_CONDUIT_KEY}`;
export const DERIVE_MAINNET_RPC = `https://rpc.derive.xyz/${process.env.NEXT_PUBLIC_CONDUIT_KEY}`;

const MAINNET_BLOCK_EXPLORER = "https://explorer.derive.xyz";
const TESTNET_BLOCK_EXPLORER =
  "https://explorer-prod-testnet-0eakp60405.t.conduit.xyz";

export const deriveMainnet: Chain = defineChain({
  id: 957,
  name: "Derive",
  network: "derive",
  nativeCurrency: {
    decimals: 18,
    name: "Ethers",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: [DERIVE_MAINNET_RPC],
      webSocket: [DERIVE_MAINNET_RPC.replace("http", "ws")],
    },
    public: {
      http: [DERIVE_MAINNET_RPC],
      webSocket: [DERIVE_MAINNET_RPC.replace("http", "ws")],
    },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: MAINNET_BLOCK_EXPLORER,
    },
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
    },
  },
  testnet: false,
});

export const deriveTestnet: Chain = defineChain({
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
      http: [DERIVE_TESTNET_RPC],
      webSocket: [DERIVE_TESTNET_RPC.replace("http", "ws")],
    },
    public: {
      http: [DERIVE_TESTNET_RPC],
      webSocket: [DERIVE_TESTNET_RPC.replace("http", "ws")],
    },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: TESTNET_BLOCK_EXPLORER,
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
    : "0x47b4Ad50177b8e88F774B4E1D09e590d9cb9e386";

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

  const rpcURL = isProd ? DERIVE_MAINNET_RPC : DERIVE_TESTNET_RPC;

  const usingForkedNode = process.env.NEXT_PUBLIC_FORK_NODE_URL !== undefined;

  const provider = usingForkedNode
    ? new JsonRpcProvider(process.env.NEXT_PUBLIC_FORK_NODE_URL)
    : new JsonRpcProvider(rpcURL);

  const chain = isProd ? deriveMainnet : deriveTestnet;

  return {
    token: createTokenContract({
      abi: AgoraToken__factory.abi,
      address: TOKEN as `0x${string}`,
      chain,
      contract: AgoraToken__factory.connect(TOKEN, provider),
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

    timelock: new TenantContract<ITimelockContract>({
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

    delegationModel: DELEGATION_MODEL.PARTIAL,
    governorType: GOVERNOR_TYPE.AGORA,
    timelockType:
      TIMELOCK_TYPE.TIMELOCKCONTROLLER_WITH_ACCESS_CONTROL_ERC721_ERC115,
    proposalTypesConfiguratorFactory:
      PROPOSAL_TYPES_CONFIGURATOR_FACTORY.WITHOUT_DESCRIPTION,
  };
};
