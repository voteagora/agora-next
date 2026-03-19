"use server";

import { prismaWeb2Client } from "@/app/lib/prisma";
import { checkAuth, type AuthParams } from "@/lib/auth/authHelpers";

interface CreateProposalLinksParams {
  sourceId: string;
  sourceType: string;
  links: Array<{
    targetId: string;
    targetType: string;
  }>;
  auth: AuthParams;
}

interface CreateProposalLinksInternalParams {
  sourceId: string;
  sourceType: string;
  links: Array<{
    targetId: string;
    targetType: string;
  }>;
}

// Internal function for server-side/CRON callers (no auth required)
// Only call this from already-authenticated server contexts (e.g., CRON routes)
export async function createProposalLinksInternal({
  sourceId,
  sourceType,
  links,
}: CreateProposalLinksInternalParams) {
  if (!sourceId || !sourceType || !Array.isArray(links)) {
    return { success: false, error: "Invalid request body" };
  }

  const validatedLinks = links.filter((link) => {
    if (!link.targetId || !link.targetType) return false;
    return sourceId !== link.targetId;
  });

  if (validatedLinks.length === 0) {
    return { success: true, created: 0 };
  }

  const results = await Promise.allSettled(
    validatedLinks.map((link) =>
      prismaWeb2Client.proposalLinks.upsert({
        where: {
          sourceId_targetId: {
            sourceId: sourceId,
            targetId: link.targetId,
          },
        },
        create: {
          sourceId: sourceId,
          sourceType: sourceType,
          targetId: link.targetId,
          targetType: link.targetType,
        },
        update: {},
      })
    )
  );

  const created = results.filter((r) => r.status === "fulfilled").length;

  return {
    success: true,
    created,
    total: validatedLinks.length,
  };
}

// Public function for client callers (requires auth)
export async function createProposalLinks({
  sourceId,
  sourceType,
  links,
  auth,
}: CreateProposalLinksParams) {
  try {
    // Verify authentication
    const authError = await checkAuth(auth, auth.address);
    if (authError) return authError;

    // Delegate to internal function after auth passes
    return await createProposalLinksInternal({ sourceId, sourceType, links });
  } catch (error) {
    console.error("Error creating proposal links:", error);
    return { success: false, error: "Failed to create proposal links" };
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
