import { BaseContract } from "ethers";
import { IAlligatorContract } from "@/lib/contracts/common/interfaces/IAlligatorContract";
import { IGovernorContract } from "@/lib/contracts/common/interfaces/IGovernorContract";
import { IStaker } from "@/lib/contracts/common/interfaces/IStaker";
import { ITokenContract } from "@/lib/contracts/common/interfaces/ITokenContract";
import { IMembershipContract } from "@/lib/contracts/common/interfaces/IMembershipContract";
import {
  PROPOSAL_TYPES_CONFIGURATOR_FACTORY,
  TENANT_NAMESPACES,
} from "./constants";
import { TenantContract } from "@/lib/tenant/tenantContract";
import { DelegateChunk } from "@/app/staking/components/delegates/DelegateCardList";
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
  delegationModel?: DELEGATION_MODEL;
  governorType?: GOVERNOR_TYPE;
  timelockType?: TIMELOCK_TYPE;
  supportScopes?: boolean;
  chainForTime?: Chain;
  providerForTime?: AlchemyProvider;
  supportScopes?: boolean;
  easRecipient?: string;
  proposalTypesConfiguratorFactory?: PROPOSAL_TYPES_CONFIGURATOR_FACTORY;
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
    address: {
      address: string;
    };
    id: string;
  };
  applicantType: string;
  profile: {
    profileImageUrl: string;
    bannerImageUrl: string;
    id: string;
  };
  includedInBallots: number;
  impactDescription: string;
  contributionDescription: string;
  contributionLinks: {
    type: string;
    url: string;
    description: string;
  }[];
  impactMetrics: {
    description: string;
    number: number;
    url: string;
  }[];
  fundingSources: {
    type: string;
    currency: string;
    amount: number;
    description: string;
  }[];
};

// Analytics events
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

export type AnalyticsEvent =
  | {
      event_name: ANALYTICS_EVENT_NAMES.STANDARD_VOTE;
      event_data: {
        proposal_id: string;
        support: number;
        voter: `0x${string}`;
        transaction_hash: string;
        reason?: string;
        params?: `0x${string}`;
      };
    }
  | {
      event_name: ANALYTICS_EVENT_NAMES.ADVANCED_VOTE;
      event_data: {
        proposal_id: string;
        support: number;
        voter: `0x${string}`;
        transaction_hash: string;
        reason?: string;
        params?: `0x${string}`;
      };
    }
  | {
      event_name: ANALYTICS_EVENT_NAMES.DELEGATE;
      event_data: {
        delegator: `0x${string}`;
        delegate: `0x${string}`;
        transaction_hash: string;
      };
    }
  | {
      event_name: ANALYTICS_EVENT_NAMES.ADVANCED_DELEGATE;
      event_data: {
        delegatees: DelegateChunk[];
        delegator: `0x${string}`;
        transaction_hash: string;
      };
    }
  | {
      event_name: ANALYTICS_EVENT_NAMES.CREATE_PROPOSAL;
      event_data: {
        transaction_hash: string;
        uses_plm: boolean;
        proposal_data: any;
      };
    }
  | {
      event_name: ANALYTICS_EVENT_NAMES.PARTIAL_DELEGATION;
      event_data: {
        transaction_hash: string;
        delegatees: DelegateChunk[];
        delegator: `0x${string}`;
        is_scw: boolean;
      };
    }
  | {
      event_name: ANALYTICS_EVENT_NAMES.SHARE_VOTE;
      event_data: {
        proposal_id: string;
        address?: `0x${string}`;
        type: "X" | "COPY_LINK" | "DOWNLOAD_IMAGE" | "WARPCAST";
      };
    }
  | {
      event_name: ANALYTICS_EVENT_NAMES.DELEGATION_ENCOURAGEMENT_CTA;
      event_data: {
        transaction_hash: string;
        delegator: `0x${string}`;
      };
    }
  | {
      event_name: ANALYTICS_EVENT_NAMES.DELEGATION_ENCOURAGEMENT_DOT;
      event_data: {
        address: `0x${string}`;
      };
    }
  | {
      event_name: ANALYTICS_EVENT_NAMES.WALLET_CONNECTED;
      event_data: {
        address: `0x${string}`;
      };
    }
  | {
      event_name: ANALYTICS_EVENT_NAMES.DELEGATE_PAGE_VIEW_WITH_WALLET;
      event_data: {
        address: `0x${string}`;
      };
    }
  | {
      event_name: ANALYTICS_EVENT_NAMES.CREATE_OFFCHAIN_PROPOSAL;
      event_data: {
        proposal_id: string;
      };
    };

export type ScopeData = {
  proposal_type_id: number;
  scope_key: string;
  selector?: string;
  description: string;
  disabled_event: any;
  deleted_event: any;
  status: "created" | "disabled" | "deleted";
  parameters?: string[];
  comparators?: number[];
  types?: number[];
};

export interface FormattedProposalType {
  name: string;
  quorum: number;
  approval_threshold: number;
  proposal_type_id: number;
  isClientSide?: boolean;
  scopes?: ScopeData[];
}

export interface DelegateResponse {
  delegate: DelegateStats;
}

export interface DelegateStats {
  addr: string;
  from_cnt: number;
  from_list: object[];
  voting_power: string;
  participation: [number, number];
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
  | "HYBRID_OPTIMISTIC"
  | "HYBRID_OPTIMISTIC_TIERED";

// Execution Transaction Types
export interface ExecutionTransaction {
  id: string;
  tenant: string;
  proposal_id: string;
  transaction_hash: string;
  chain_id: number;
  executed_by: string;
  executed_at: string;
  created_at: string;
  updated_at: string;
}

export interface AddExecutionTransactionRequest {
  proposal_id: string;
  transaction_hash: string;
  chain_id: number;
  executed_by: string;
  executed_at: string;
}
