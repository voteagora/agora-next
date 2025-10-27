"use server";

import { getProposalLinks } from "./proposalLinks";
import { getForumTopic } from "./forum/topics";
import { stripHtmlToText } from "@/app/forums/stripHtml";

interface LinkedItemDetails {
  id: string;
  type: string;
  title: string;
  description: string;
  createdAt: string;
  metadata?: {
    commentsCount?: number;
    category?: string;
    status?: string;
  };
}

export async function getProposalLinksWithDetails(targetId: string) {
  try {
    const result = await getProposalLinks({ targetId });

    if (!result.success || !result.links) {
      return { success: false, error: result.error };
    }

    const linksWithDetails = await Promise.all(
      result.links.map(async (link) => {
        try {
          if (link.sourceType === "forum_topic") {
            const topicResult = await getForumTopic(parseInt(link.sourceId));
            if (topicResult.success && topicResult.data) {
              const topic = topicResult.data as any;
              const firstPost = topic.posts?.[0];
              const content = firstPost?.content || "";
              const strippedContent = stripHtmlToText(content);

              return {
                id: link.sourceId,
                type: link.sourceType,
                title: topic.title,
                description: strippedContent.slice(0, 150),
                createdAt: topic.createdAt,
                metadata: {
                  commentsCount: topic.posts?.length - 1 || 0,
                  category: topic.category?.name,
                },
              } as LinkedItemDetails;
            }
          }

          return null;
        } catch (error) {
          console.error(`Error fetching details for link ${link.id}:`, error);
          return null;
        }
      })
    );

    const validLinks = linksWithDetails.filter(
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

