import { cache } from "react";

async function getImpactMetricsApi(roundId: string, ballotAddressOrEns?: string) {
    const defaultPageMetadata = {
        hasNext: false,
        totalReturned: 1,
        nextOffset: 0
    };
    const defaultComments = [
        {
            id: "1",
            content: "Comment 1",
            commenter: "0x1234",
            createdAt: "2021-10-01T00:00:00Z",
            editedAt: "2021-10-01T00:00:00Z"
        }
    ];
    const defaultImpactMetrics = [
        {
            id: "1",
            name: "Impact Metric 1",
            description: "Description of Impact Metric 1",
            externalLink: "https://www.opensource.observer/", 
            comments: defaultComments
        }
    ]
    return {
        metadata: defaultPageMetadata,
        impactMetrics: defaultImpactMetrics
    };
}

export const fetchImpactMetricsApi = cache(getImpactMetricsApi);