import { BaseContract } from "ethers";

export type TenantNamespace = "optimism";

export type TenantContracts = {
    alligator?: TenantContract;
    governor: TenantContract;
    proposalTypesConfigurator: TenantContract;
    token: TenantContract;
}

export type TenantContract = {
    abi: any;
    address: `0x${string}`;
    chainId: number;
    contract: BaseContract;
    v6UpgradeBlock?: number;
}


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
}