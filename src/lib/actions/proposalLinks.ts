"use server";

import Tenant from "@/lib/tenant/tenant";
import { prismaWeb2Client } from "@/app/lib/prisma";
import { verifyAuth, type AuthParams } from "@/lib/auth/authHelpers";
import { createProposalLinksInternal } from "./proposalLinksInternal";

interface CreateDiscussionProposalLinkParams {
  proposalId: string;
  proposalType: string;
  forumTopicId: string;
  auth: AuthParams;
}

function normalizeDiscussionProposalType(proposalType: string) {
  if (proposalType === "gov-proposal") {
    return "gov";
  }

  if (proposalType === "gov" || proposalType === "tempcheck") {
    return proposalType;
  }

  return null;
}

// Public action for forum-topic authors linking their topic back to a proposal.
export async function createDiscussionProposalLink({
  proposalId,
  proposalType,
  forumTopicId,
  auth,
}: CreateDiscussionProposalLinkParams) {
  try {
    const normalizedProposalType =
      normalizeDiscussionProposalType(proposalType);
    if (!proposalId || !normalizedProposalType || !forumTopicId) {
      return { success: false, error: "Invalid request body" };
    }

    const authResult = await verifyAuth(auth, auth.address);
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    const topicId = Number(forumTopicId);
    if (!Number.isInteger(topicId) || topicId <= 0) {
      return { success: false, error: "Invalid forum topic id" };
    }

    const { slug } = Tenant.current();
    const forumTopic = await prismaWeb2Client.forumTopic.findFirst({
      where: {
        id: topicId,
        dao_slug: slug,
      },
      select: {
        id: true,
        address: true,
      },
    });

    if (!forumTopic) {
      return { success: false, error: "Forum topic not found" };
    }

    if (forumTopic.address.toLowerCase() !== authResult.address.toLowerCase()) {
      return { success: false, error: "Unauthorized" };
    }

    return await createProposalLinksInternal({
      sourceId: proposalId,
      sourceType: normalizedProposalType,
      links: [{ targetId: forumTopicId, targetType: "forum_topic" }],
    });
  } catch (error) {
    console.error("Error creating discussion proposal link:", error);
    return {
      success: false,
      error: "Failed to create discussion proposal link",
    };
  }
}

interface GetProposalLinksParams {
  sourceId?: string;
  targetId?: string;
}

export async function getProposalLinks({
  sourceId,
  targetId,
}: GetProposalLinksParams) {
  try {
    if (!sourceId && !targetId) {
      return {
        success: false,
        error: "Either sourceId or targetId is required",
      };
    }

    const where: any = {};
    if (sourceId) where.sourceId = sourceId;
    if (targetId) where.targetId = targetId;

    const links = await prismaWeb2Client.proposalLinks.findMany({ where });

    return { success: true, links };
  } catch (error) {
    console.error("Error fetching proposal links:", error);
    return { success: false, error: "Failed to fetch proposal links" };
  }
}

export async function getForumTopicTempChecks(topicId: string) {
  try {
    const links = await prismaWeb2Client.proposalLinks.findMany({
      where: {
        sourceId: topicId,
        sourceType: "forum_topic",
        targetType: "tempcheck",
      },
    });

    return { success: true, tempChecks: links };
  } catch (error) {
    console.error("Error fetching temp checks for topic:", error);
    return {
      success: false,
      error: "Failed to fetch temp checks",
      tempChecks: [],
    };
  }
}
