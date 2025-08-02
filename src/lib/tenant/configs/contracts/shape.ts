import {
  AgoraGovernor_11__factory,
  AgoraTimelock__factory,
  ProposalTypesConfiguratorScopes__factory,
  ERC20__factory,
} from "@/lib/contracts/generated";
import { TenantContract } from "@/lib/tenant/tenantContract";
import { TenantContracts } from "@/lib/types";
import { mainnet, sepolia } from "viem/chains";
import { defineChain } from "viem";
import type { Chain } from "viem";
import { IGovernorContract } from "@/lib/contracts/common/interfaces/IGovernorContract";
import { AlchemyProvider, BaseContract, JsonRpcProvider } from "ethers";
import { createTokenContract } from "@/lib/tokenUtils";
import { ITimelockContract } from "@/lib/contracts/common/interfaces/ITimelockContract";
import {
  DELEGATION_MODEL,
  GOVERNOR_TYPE,
  TIMELOCK_TYPE,
} from "@/lib/constants";

interface Props {
  isProd: boolean;
  alchemyId: string;
}

// ✅ Shape chain definitions
export const shapeSepolia: Chain = defineChain({
  id: 11011,
  name: "Shape Sepolia",
  network: "shape-sepolia",
  nativeCurrency: {
    decimals: 18,
    name: "ETH",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["https://shape-sepolia.g.alchemy.com/v2/"],
    },
    public: {
      http: ["https://sepolia.shape.network"],
    },
  },
  blockExplorers: {
    default: {
      name: "Shape Sepolia Explorer",
      url: "https://sepolia.shapescan.xyz",
    },
  },
  testnet: true,
});

export const shapeMainnet: Chain = defineChain({
  id: 360,
  name: "Shape",
  network: "shape",
  nativeCurrency: {
    decimals: 18,
    name: "ETH",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["https://shape-mainnet.g.alchemy.com/v2/"],
    },
    public: {
      http: ["https://mainnet.shape.network"],
    },
  },
  blockExplorers: {
    default: {
      name: "Shape Explorer",
      url: "https://shapescan.xyz",
    },
  },
  testnet: false,
});

export const shapeTenantConfig = ({
  isProd,
  alchemyId,
}: Props): TenantContracts => {
  // ✅ UPDATED: New contract addresses - December 2024
  // Updated with latest deployed contracts
  const TOKEN = "0x4f25eaeb3cedc0dc102a4f4adaa2afd8440aa796"; // Token (SHAPE) ERC20+IVotes
  const GOVERNOR = "0x8E7B12df08278Ebe26fadc13913B57Fa2f3c4ba2"; // AgoraGovernor
  const TIMELOCK = "0x98607C6D56bD3Ea5a1B516Ce77E07CA54e5f3FFf"; // TimelockController
  const TYPES = "0x68d0d96c148085abb433e55a3c5fc089c70c0200"; // Middleware (PTC)

  // Additional modules available:
  const APPROVAL_MODULE = "0x28c8be698a115bc062333cd9b281abad971b0785"; // ApprovalVotingModule
  const OPTIMISTIC_MODULE = "0xba17b665d463771bf4b10138e7d651883f582148"; // OptimisticModule

  const TREASURY = [TIMELOCK];

  const usingForkedNode = process.env.NEXT_PUBLIC_FORK_NODE_URL !== undefined;

  // ✅ UPDATED: Use correct RPC for prod/dev
  const provider = usingForkedNode
    ? new JsonRpcProvider(process.env.NEXT_PUBLIC_FORK_NODE_URL)
    : isProd
      ? new JsonRpcProvider(
          `https://shape-mainnet.g.alchemy.com/v2/${alchemyId}`
        )
      : new JsonRpcProvider(
          `https://shape-sepolia.g.alchemy.com/v2/${alchemyId}`
        );

  // ✅ UPDATED: Use correct chain for prod/dev
  const chain = isProd ? shapeMainnet : shapeSepolia;

  return {
    token: createTokenContract({
      abi: ERC20__factory.abi,
      address: TOKEN as `0x${string}`,
      chain: chain,
      contract: ERC20__factory.connect(TOKEN, provider),
      provider,
      type: "erc20",
    }),

    governor: new TenantContract<IGovernorContract>({
      abi: AgoraGovernor_11__factory.abi,
      address: GOVERNOR,
      chain,
      contract: AgoraGovernor_11__factory.connect(GOVERNOR, provider),
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
      abi: ProposalTypesConfiguratorScopes__factory.abi,
      address: TYPES,
      chain,
      contract: ProposalTypesConfiguratorScopes__factory.connect(
        TYPES,
        provider
      ),
      provider,
    }),

    treasury: TREASURY,

    delegationModel: DELEGATION_MODEL.FULL,
    governorType: GOVERNOR_TYPE.AGORA, // ✅ CORRECTED: Shape uses basic propose() function, not proposeWithModule()
    timelockType:
      TIMELOCK_TYPE.TIMELOCKCONTROLLER_WITH_ACCESS_CONTROL_ERC721_ERC115,
    supportScopes: true,
  };
};
