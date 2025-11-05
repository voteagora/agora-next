import { BaseContract } from "ethers";
import { IAlligatorContract } from "@/lib/contracts/common/interfaces/IAlligatorContract";
import { IGovernorContract } from "@/lib/contracts/common/interfaces/IGovernorContract";
import { IStaker } from "@/lib/contracts/common/interfaces/IStaker";
import { ITokenContract } from "@/lib/contracts/common/interfaces/ITokenContract";
import { IMembershipContract } from "@/lib/contracts/common/interfaces/IMembershipContract";
import { TENANT_NAMESPACES } from "./constants";
import { TenantContract } from "@/lib/tenant/tenantContract";
import { DelegateChunk } from "@/app/api/common/delegates/delegate";
import { Chain } from "viem/chains";

export type MetricTimeSeriesValue = {
  day: string;
  date: string;
  value: any;
};

export type StakedDeposit = {
  amount: string;
  delegatee: string;
  depositor: string;
  id: number;
};

export type ChartVote = {
  voter: string;
  support: string;
  weight: string;
  block_number: string;
  created?: string;
};

export type VoterStats = {
  voter: string;
  total_proposals: number;
  last_10_props: number;
};

export type TenantNamespace =
  (typeof TENANT_NAMESPACES)[keyof typeof TENANT_NAMESPACES];

export type TenantContracts = {
  governor: TenantContract<IGovernorContract>;
  proposalTypesConfigurator?: TenantContract<BaseContract>;
  token: TenantContract<ITokenContract | IMembershipContract> & {
    isERC20: () => this is TenantContract<ITokenContract>;
    isERC721: () => this is TenantContract<IMembershipContract>;
  };

  votableSupplyOracle?: TenantContract<IVotableSupplyOracleContract>;
  staker?: TenantContract<IStaker>;
  timelock?: TenantContract<BaseContract>;
  alligator?: TenantContract<IAlligatorContract>;
  treasury?: string[]; // We don't interact with them, but maybe one day we will.
  governorApprovalModule?: string;
  delegationModel?: DELEGATION_MODEL;
  governorType?: GOVERNOR_TYPE;
  timelockType?: TIMELOCK_TYPE;
  supportScopes?: boolean;
  chainForTime?: any;
  providerForTime?: AlchemyProvider;
  supportScopes?: boolean;
  easRecipient?: string;
};

export type TenantToken = {
  name: string;
  symbol: string;
  decimals: number;
  address: string;
  chainId?: number;
};

export type RetroPGFProject = {
  id: string;
  bio: string;
  impactCategory: string[];
  displayName: string;
  websiteUrl: string;
  applicant: {
    address: string;
  };
  status: string;
  impactEvaluation: {
    metrics: any[];
    overallImpact: number;
    evaluationDate: string;
  };
};

export type RetroPGFProjectListItem = {
  id: string;
  displayName: string;
  impactCategory: string[];
  status: string;
  applicant: {
    address: string;
  };
  impactEvaluation: {
    metrics: any[];
    overallImpact: number;
    evaluationDate: string;
  };
};

export enum ANALYTICS_EVENT_NAMES {
  STANDARD_VOTE = "standard_vote",
  ADVANCED_VOTE = "advanced_vote",
  DELEGATE = "delegate",
  ADVANCED_DELEGATE = "advanced_delegate",
  PARTIAL_DELEGATION = "partial_delegation",
  CREATE_PROPOSAL = "create_proposal",
  SHARE_VOTE = "share_vote",
  DELEGATION_ENCOURAGEMENT_CTA = "delegation_encouragement_cta",
  DELEGATION_ENCOURAGEMENT_DOT = "delegation_encouragement_dot",
  WALLET_CONNECTED = "wallet_connected",
  DELEGATE_PAGE_VIEW_WITH_WALLET = "delegate_page_view_with_wallet",
  CREATE_OFFCHAIN_PROPOSAL = "CREATE_OFFCHAIN_PROPOSAL",
}

export type ProposalType =
  | "STANDARD"
  | "APPROVAL"
  | "OPTIMISTIC"
  | "SNAPSHOT"
  | "OFFCHAIN_OPTIMISTIC_TIERED"
  | "OFFCHAIN_OPTIMISTIC"
  | "OFFCHAIN_STANDARD"
  | "OFFCHAIN_APPROVAL"
  | "HYBRID_STANDARD"
  | "HYBRID_APPROVAL"

// Add any other types that were in the original file...
// (You can copy the rest from the original .d.ts file)
