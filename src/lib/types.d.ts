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
    lists: List[];
}
// TODO: frh -> check list
type List = {
    id: string;
    author: {
        resolvedName: {
            address: string;
        }
    };
    listName: string;
    listDescription: string;
    categories: string[];
    listContentCount: number;
    listContentShort: {
        project: {
            displayName: string;
            profile: {
                profileImageUrl: string;
                id: string;
            };
            id: string;
        };
    }[];
}