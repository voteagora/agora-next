import { BaseContract } from "ethers";
import { IAlligatorContract } from "@/lib/contracts/common/interfaces/IAlligatorContract";
import { IGovernorContract } from "@/lib/contracts/common/interfaces/IGovernorContract";
import { IStaker } from "@/lib/contracts/common/interfaces/IStaker";
import { ITokenContract } from "@/lib/contracts/common/interfaces/ITokenContract";
import { IMembershipContract } from "@/lib/contracts/common/interfaces/IMembershipContract";
import { TENANT_NAMESPACES } from "./constants";
import { TenantContract } from "@/lib/tenant/tenantContract";
import { DelegateChunk } from "@/app/staking/components/delegates/DelegateCardList";

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

export type TenantNamespace =
  (typeof TENANT_NAMESPACES)[keyof typeof TENANT_NAMESPACES];

export type TenantContracts = {
  governor: TenantContract<IGovernorContract>;
  proposalTypesConfigurator?: TenantContract<BaseContract>;
  token: TenantContract<ITokenContract | IMembershipContract> & {
    isERC20: () => this is TenantContract<ITokenContract>;
    isERC721: () => this is TenantContract<IMembershipContract>;
  };

  staker?: TenantContract<IStaker>;
  timelock?: TenantContract<BaseContract>;
  alligator?: TenantContract<IAlligatorContract>;
  treasury?: string[]; // We don't interact with them, but maybe one day we will.
  governorApprovalModule?: string;
  delegationModel?: DELEGATION_MODEL;
};

export type TenantToken = {
  name: string;
  symbol: string;
  decimals: number;
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
    };
