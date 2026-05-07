import { prismaWeb2Client } from "@/app/lib/prisma";

export interface ProposalLinkTarget {
  targetId: string;
  targetType: string;
}

export interface CreateProposalLinksInternalParams {
  sourceId: string;
  sourceType: string;
  links: ProposalLinkTarget[];
}

// Internal function for trusted server-side callers only.
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
            sourceId,
            targetId: link.targetId,
          },
        },
        create: {
          sourceId,
          sourceType,
          targetId: link.targetId,
          targetType: link.targetType,
        },
        update: {},
      })
    )
  );

  const created = results.filter(
    (result) => result.status === "fulfilled"
  ).length;

  return {
    success: true,
    created,
    total: validatedLinks.length,
  };
}
