"use server";

import { getProposalLinks } from "./proposalLinks";
import { getForumTopic } from "./forum/topics";
import { stripHtmlToText } from "@/app/forums/stripHtml";
import { getArchivedProposal } from "./archive";

interface LinkedItemDetails {
  id: string;
  type: string;
  title: string;
  description: string;
  createdAt: string;
  relationship: "source" | "target";
  metadata?: {
    commentsCount?: number;
    category?: string;
    status?: string;
  };
}

export async function getProposalLinksWithDetails(proposalId: string) {
  try {
    const [asTargetResult, asSourceResult] = await Promise.all([
      getProposalLinks({ targetId: proposalId }),
      getProposalLinks({ sourceId: proposalId }),
    ]);

    if (!asTargetResult.success && !asSourceResult.success) {
      return {
        success: false,
        error: asTargetResult.error || asSourceResult.error,
      };
    }

    const asTargetLinks = asTargetResult.success
      ? asTargetResult.links || []
      : [];
    const asSourceLinks = asSourceResult.success
      ? asSourceResult.links || []
      : [];

    const fetchItemDetails = async (itemId: string, itemType: string) => {
      if (itemType === "forum_topic") {
        const topicResult = await getForumTopic(parseInt(itemId));
        if (topicResult.success && topicResult.data) {
          const topic = topicResult.data as any;
          const firstPost = topic.posts?.[0];
          const content = firstPost?.content || "";
          const strippedContent = stripHtmlToText(content);

          return {
            id: itemId,
            type: itemType,
            title: topic.title,
            description: strippedContent.slice(0, 150),
            createdAt: topic.createdAt,
            metadata: {
              commentsCount: topic.posts?.length - 1 || 0,
              category: topic.category?.name,
            },
          };
        }
      } else if (itemType === "tempcheck" || itemType === "gov") {
        const proposalResult = await getArchivedProposal(itemId);
        if (proposalResult.success && proposalResult.data) {
          const proposal = proposalResult.data as any;
          return {
            id: itemId,
            type: itemType,
            title: proposal.title,
            description: proposal.description?.slice(0, 150) || "",
            createdAt: new Date(proposal.start_blocktime * 1000).toISOString(),
            metadata: {},
          };
        }
      }
      return null;
    };

    const targetLinksWithDetails = await Promise.all(
      asTargetLinks.map(async (link) => {
        try {
          const details = await fetchItemDetails(
            link.sourceId,
            link.sourceType
          );
          return details
            ? { ...details, relationship: "target" as const }
            : null;
        } catch (error) {
          console.error(
            `Error fetching source details for link ${link.id}:`,
            error
          );
          return null;
        }
      })
    );

    const sourceLinksWithDetails = await Promise.all(
      asSourceLinks.map(async (link) => {
        try {
          const details = await fetchItemDetails(
            link.targetId,
            link.targetType
          );
          return details
            ? { ...details, relationship: "source" as const }
            : null;
        } catch (error) {
          console.error(
            `Error fetching target details for link ${link.id}:`,
            error
          );
          return null;
        }
      })
    );

    const allLinks: (LinkedItemDetails | null)[] = [
      ...targetLinksWithDetails,
      ...sourceLinksWithDetails,
    ];
    const validLinks = allLinks.filter(
      (link): link is LinkedItemDetails => link !== null
    );

    return { success: true, links: validLinks };
  } catch (error) {
    console.error("Error fetching proposal links with details:", error);
    return {
      success: false,
      error: "Failed to fetch proposal links with details",
    };
  }
}
