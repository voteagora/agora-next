import { TenantContract } from "@/lib/tenant/tenantContract";
import { ITokenContract } from "@/lib/contracts/common/interfaces/ITokenContract";
import { IGovernorContract } from "@/lib/contracts/common/interfaces/IGovernorContract";
import { IAlligatorContract } from "@/lib/contracts/common/interfaces/IAlligatorContract";
import { IL2GovTokenContract } from "@/lib/contracts/common/interfaces/IL2GovTokenContract";
import { IScrollGovernorContract } from "@/lib/contracts/common/interfaces/IScrollGovernorContract";
import { BaseContract } from "ethers";
import { TENANT_NAMESPACES } from "./constants";

export type TenantNamespace =
  (typeof TENANT_NAMESPACES)[keyof typeof TENANT_NAMESPACES];

export type TenantContracts = {
  token: TenantContract<ITokenContract | IL2GovTokenContract>;
  governor: TenantContract<IGovernorContract | IScrollGovernorContract>;
  tokenDistributor?: TenantContract<BaseContract>;
  alligator?: TenantContract<IAlligatorContract>;
  proposalTypesConfigurator?: TenantContract<BaseContract>;
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
