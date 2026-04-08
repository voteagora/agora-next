import { defineChain } from "viem";
import type { DaoSlug } from "@prisma/client";
import { TENANT_NAMESPACES, ZERO_ADDRESS } from "@/lib/constants";
import type { TenantContracts, TenantNamespace, TenantToken } from "@/lib/types";
import { TenantContract } from "@/lib/tenant/tenantContract";
import { TenantUI } from "@/lib/tenant/tenantUI";
import { createTokenContract } from "@/lib/tokenUtils";
import optimismLogo from "@/assets/tenant/optimism_logo.svg";
import optimismHero from "@/assets/tenant/optimism_hero.svg";
import successImage from "@/assets/tenant/optimism_success.svg";
import pendingImage from "@/assets/tenant/optimism_pending.svg";
import delegateImage from "@/assets/tenant/optimism_delegate.svg";
import { publicEnv } from "./public-env";

export type VibdaoLocalCapabilities = {
  supportsForum: boolean;
  supportsForumRbac: boolean;
  supportsEns: boolean;
  supportsEfp: boolean;
  supportsDrafts: boolean;
  supportsAdvancedDelegation: boolean;
  supportsAuthorityChains: boolean;
  supportsTokenBalanceReads: boolean;
};

export type TenantRuntime = {
  isVibdaoLocal: boolean;
  capabilities: VibdaoLocalCapabilities;
};

const localChain = defineChain({
  id: publicEnv.NEXT_PUBLIC_VIBDAO_CHAIN_ID,
  name: "VibDAO Local",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [publicEnv.NEXT_PUBLIC_VIBDAO_CHAIN_RPC_URL],
    },
    public: {
      http: [publicEnv.NEXT_PUBLIC_VIBDAO_CHAIN_RPC_URL],
    },
  },
});

const noopProvider = {
  getBlock: async () => ({
    number: 0,
    timestamp: Math.floor(Date.now() / 1000),
  }),
  getBlockNumber: async () => 0,
} as any;

function createNoopContract() {
  return {
    balanceOf: async () => 0n,
    getVotes: async () => 0n,
  } as any;
}

const localToken: TenantToken = {
  name: "Vibly Voting",
  symbol: "VIB",
  decimals: 18,
  address: ZERO_ADDRESS,
  chainId: publicEnv.NEXT_PUBLIC_VIBDAO_CHAIN_ID,
};

const localContracts: TenantContracts = {
  token: createTokenContract({
    abi: [],
    address: ZERO_ADDRESS,
    chain: localChain,
    contract: createNoopContract(),
    provider: noopProvider,
    type: "erc20",
  }),
  governor: new TenantContract({
    abi: [],
    address: ZERO_ADDRESS as `0x${string}`,
    chain: localChain,
    contract: createNoopContract(),
    provider: noopProvider,
  }),
  timelock: new TenantContract({
    abi: [],
    address: ZERO_ADDRESS as `0x${string}`,
    chain: localChain,
    contract: createNoopContract(),
    provider: noopProvider,
  }),
  providerForTime: noopProvider,
  chainForTime: localChain,
};

const localUI = new TenantUI({
  title: "VibDAO Local Governance",
  logo: optimismLogo,
  pages: [
    {
      route: "/",
      title: "VibDAO local governance",
      description: "Local DAO workflows backed by the Vibly contracts and indexer.",
      hero: optimismHero,
      meta: {
        title: "VibDAO Local Governance",
        description: "Local DAO workflows backed by the Vibly contracts and indexer.",
        imageTitle: "VibDAO Local Governance",
        imageDescription: "Local DAO workflows backed by the Vibly contracts and indexer.",
      },
    },
    {
      route: "proposals",
      title: "VibDAO proposals",
      description: "Review, create, and execute local VibDAO governance proposals.",
      hero: optimismHero,
      meta: {
        title: "VibDAO Proposals",
        description: "Review and manage local VibDAO governance proposals.",
        imageTitle: "VibDAO Proposals",
        imageDescription: "Review and manage local VibDAO governance proposals.",
      },
    },
    {
      route: "delegates",
      title: "VibDAO delegates",
      description: "Explore local governance participants and their activity.",
      hero: optimismHero,
      meta: {
        title: "VibDAO Delegates",
        description: "Explore local governance participants and their activity.",
        imageTitle: "VibDAO Delegates",
        imageDescription: "Explore local governance participants and their activity.",
      },
    },
  ],
  tokens: [localToken],
  tacticalStrings: {
    myBalance: "My VIB balance",
  },
  assets: {
    success: successImage,
    pending: pendingImage,
    delegate: delegateImage,
  },
  customization: {
    primary: "0 0 0",
    secondary: "64 64 64",
    tertiary: "115 115 115",
    neutral: "255 255 255",
    wash: "255 255 255",
    line: "229 229 229",
    positive: "97 209 97",
    negative: "226 54 54",
    brandPrimary: "0 0 0",
    brandSecondary: "255 255 255",
    tokenAmountFont: "font-chivoMono",
  },
  toggles: [
    { name: "proposals", enabled: true },
    { name: "delegates", enabled: true },
    { name: "proposal-lifecycle", enabled: true },
    { name: "delegation-encouragement", enabled: false },
    { name: "forums", enabled: false },
    { name: "email-subscriptions", enabled: false },
    { name: "show-ens-text-records", enabled: false },
    { name: "show-efp-stats", enabled: false },
    { name: "show-delegate-badges", enabled: false },
    { name: "staking", enabled: false },
    { name: "retropgf", enabled: false },
    { name: "grants", enabled: false },
    { name: "info", enabled: false },
    { name: "coming-soon", enabled: false },
    { name: "use-archive-for-proposals", enabled: false },
    { name: "use-archive-for-proposal-details", enabled: false },
    { name: "include-nonivotes", enabled: false },
  ],
});

const localCapabilities: VibdaoLocalCapabilities = {
  supportsForum: false,
  supportsForumRbac: false,
  supportsEns: false,
  supportsEfp: false,
  supportsDrafts: false,
  supportsAdvancedDelegation: false,
  supportsAuthorityChains: false,
  supportsTokenBalanceReads: false,
};

const localRuntime: TenantRuntime = {
  isVibdaoLocal: true,
  capabilities: localCapabilities,
};

const defaultRuntime: TenantRuntime = {
  isVibdaoLocal: false,
  capabilities: {
    supportsForum: true,
    supportsForumRbac: true,
    supportsEns: true,
    supportsEfp: true,
    supportsDrafts: true,
    supportsAdvancedDelegation: true,
    supportsAuthorityChains: true,
    supportsTokenBalanceReads: true,
  },
};

export function isVibdaoLocalRuntimeEnabled(): boolean {
  return process.env.VIBDAO_LOCAL_MODE === "true";
}

export function getTenantRuntime(): TenantRuntime {
  return isVibdaoLocalRuntimeEnabled() ? localRuntime : defaultRuntime;
}

export function getVibdaoLocalTenantConfig(): {
  namespace: TenantNamespace;
  slug: DaoSlug;
  token: TenantToken;
  contracts: TenantContracts;
  ui: TenantUI;
  brandName: string;
  runtime: TenantRuntime;
  isProd: boolean;
} {
  return {
    namespace: TENANT_NAMESPACES.OPTIMISM,
    slug: "OP",
    token: localToken,
    contracts: localContracts,
    ui: localUI,
    brandName: "VibDAO Local",
    runtime: localRuntime,
    isProd: false,
  };
}
