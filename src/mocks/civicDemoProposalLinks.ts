import { isCivicDemoEnabled } from "@/mocks/civicDemoProposals";

export type CivicProposalLink = {
  id: string;
  sourceId: string;
  sourceType: string;
  targetId: string;
  targetType: string;
};

// forum_topic → tempcheck → gov proposal chains for demo screenshots
const CIVIC_PROPOSAL_LINKS: CivicProposalLink[] = [
  {
    id: "civic-link-1",
    sourceId: "1004",
    sourceType: "forum_topic",
    targetId: "civic-demo-7",
    targetType: "tempcheck",
  },
  {
    id: "civic-link-2",
    sourceId: "civic-demo-7",
    sourceType: "tempcheck",
    targetId: "civic-demo-gov-1",
    targetType: "gov",
  },
  {
    id: "civic-link-3",
    sourceId: "1005",
    sourceType: "forum_topic",
    targetId: "civic-demo-8",
    targetType: "tempcheck",
  },
  {
    id: "civic-link-4",
    sourceId: "civic-demo-8",
    sourceType: "tempcheck",
    targetId: "civic-demo-gov-2",
    targetType: "gov",
  },
  {
    id: "civic-link-5",
    sourceId: "1007",
    sourceType: "forum_topic",
    targetId: "civic-demo-9",
    targetType: "tempcheck",
  },
  {
    id: "civic-link-6",
    sourceId: "civic-demo-9",
    sourceType: "tempcheck",
    targetId: "civic-demo-2",
    targetType: "gov",
  },
  {
    id: "civic-link-7",
    sourceId: "1014",
    sourceType: "forum_topic",
    targetId: "civic-demo-example-a",
    targetType: "gov",
  },
  {
    id: "civic-link-8",
    sourceId: "1015",
    sourceType: "forum_topic",
    targetId: "civic-demo-example-b",
    targetType: "gov",
  },
];

export function getCivicDemoProposalLinks({
  sourceId,
  targetId,
}: {
  sourceId?: string;
  targetId?: string;
}) {
  if (!isCivicDemoEnabled()) {
    return [];
  }

  return CIVIC_PROPOSAL_LINKS.filter((link) => {
    if (sourceId && link.sourceId !== sourceId) {
      return false;
    }
    if (targetId && link.targetId !== targetId) {
      return false;
    }
    return true;
  });
}

export function getCivicDemoForumTopicTempChecks(topicId: string) {
  return getCivicDemoProposalLinks({
    sourceId: topicId,
  }).filter(
    (link) =>
      link.sourceType === "forum_topic" && link.targetType === "tempcheck"
  );
}
