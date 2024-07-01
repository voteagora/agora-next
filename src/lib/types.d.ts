import { BaseContract } from "ethers";
import { IAlligatorContract } from "@/lib/contracts/common/interfaces/IAlligatorContract";
import { IGovernorContract } from "@/lib/contracts/common/interfaces/IGovernorContract";
import { IStaker } from "@/lib/contracts/common/interfaces/IStaker";
import { ITokenContract } from "@/lib/contracts/common/interfaces/ITokenContract";
import { TENANT_NAMESPACES } from "./constants";
import { TenantContract } from "@/lib/tenant/tenantContract";
import { DelegateChunk } from "@/app/staking/components/delegates/DelegateCardList";

export type MetricTimeSeriesValue = {
  day: string;
  date: string;
  ts: number;
  value: any;
};

export type StakedDeposit = {
  amount: string;
  delegatee: string;
  depositor: string;
  id: number;
};

export type DelegatePaginated = {
  seed: number;
  meta: any;
  delegates: DelegateChunk[];
};

export type TenantNamespace =
  (typeof TENANT_NAMESPACES)[keyof typeof TENANT_NAMESPACES];

export type TenantContracts = {
  token: TenantContract<ITokenContract>;
  governor: TenantContract<IGovernorContract>;
  staker?: TenantContract<IStaker>;
  alligator?: TenantContract<IAlligatorContract>;
  proposalTypesConfigurator?: TenantContract<BaseContract>;
  treasury?: string[]; // We don't interact with them, but maybe one day we will.
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
