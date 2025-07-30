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
      url: "https://sepolia-explorer.shape.network",
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
      url: "https://explorer.shape.network",
    },
  },
  testnet: false,
});

export const shapeTenantConfig = ({
  isProd,
  alchemyId,
}: Props): TenantContracts => {
  // ✅ UPDATED: Correct addresses from agora-tenants repository
  // Both prod and dev use Shape Sepolia testnet (chain_id: 11011) for now
  const TOKEN = "0x10374c5D846179BA9aC03b468497B58E13C5f74e";
  const GOVERNOR = "0x90193C961A926261B756D1E5bb255e67ff9498A1";
  const TIMELOCK = "0x34A1D3fff3958843C43aD80F30b94c510645C316";
  const TYPES = "0x98607C6D56bD3Ea5a1B516Ce77E07CA54e5f3FFf";

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
    governorType: GOVERNOR_TYPE.AGORA,
    timelockType:
      TIMELOCK_TYPE.TIMELOCKCONTROLLER_WITH_ACCESS_CONTROL_ERC721_ERC115,
    supportScopes: true,
  };
};
