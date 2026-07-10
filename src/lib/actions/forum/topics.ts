"use server";

import { z } from "zod";
import {
  createTopicSchema,
  deleteTopicSchema,
  softDeleteTopicSchema,
  handlePrismaError,
  archiveTopicSchema,
} from "./shared";
import { moderateTextContent, isContentNSFW } from "@/lib/moderation";
import { removeForumTopicFromIndex, indexForumTopic } from "./search";
import Tenant from "@/lib/tenant/tenant";
import { prismaWeb2Client } from "@/app/lib/prisma";
import { getIPFSUrl } from "@/lib/pinata";
import { logForumAuditAction } from "./admin";
import {
  requirePermission,
  checkPermission,
  checkAnyPermission,
} from "@/lib/rbac";
import { verifyAuth, type AuthParams } from "@/lib/auth/authHelpers";
import type { DaoSlug } from "@prisma/client";
import { createAttachmentsFromContent } from "../attachmentInternal";
import { canCreateTopic, formatVPError } from "@/lib/forumSettings";
import {
  fetchVotingPowerFromContract,
  formatVotingPower,
} from "@/lib/votingPowerUtils";
import { getPublicClient } from "@/lib/viem";
import {
  addRecipientAttributeValue,
  emitBroadcastEvent,
  formatAddressForNotification,
} from "@/lib/notification-center/emitter";
import { createForumSurveyForTopic } from "./surveyService";
import { isForumSurveysEnabled } from "./surveyFeature";
const { slug } = Tenant.current();

const surveySummaryInclude = {
  select: {
    id: true,
    kind: true,
    closesAt: true,
    closedAt: true,
    _count: { select: { responses: true } },
  },
} as const;

function mapForumSurveySummary(survey: any) {
  if (!survey) return null;
  const isOpen =
    !survey.closedAt && (!survey.closesAt || survey.closesAt > new Date());
  return {
    id: survey.id,
    kind: survey.kind,
    status: isOpen ? ("open" as const) : ("closed" as const),
    isOpen,
    responseCount: survey._count.responses,
  };
}

async function getDeletedAccountSet(
  addresses: (string | null | undefined)[]
): Promise<Set<string>> {
  const unique = [
    ...new Set(addresses.map((a) => (a || "").toLowerCase())),
  ].filter(Boolean);
  if (unique.length === 0) {
    return new Set();
  }
  const rows = await prismaWeb2Client.deletedAccounts.findMany({
    where: { dao_slug: slug, address: { in: unique } },
    select: { address: true },
  });
  return new Set(rows.map((row) => row.address));
}

async function getDisplayNameMap(
  addresses: (string | null | undefined)[]
): Promise<Map<string, string>> {
  const unique = [
    ...new Set(addresses.map((a) => (a || "").toLowerCase())),
  ].filter(Boolean);
  const displayNames = new Map<string, string>();
  if (unique.length === 0) return displayNames;

  const statements = await prismaWeb2Client.delegateStatements.findMany({
    where: {
      dao_slug: slug,
      address: { in: unique, mode: "insensitive" },
      username: { not: null },
    },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    select: { address: true, username: true },
  });

  for (const statement of statements) {
    const normalized = statement.address.toLowerCase();
    const username = statement.username?.trim();
    if (username && !displayNames.has(normalized)) {
      displayNames.set(normalized, username);
    }
  }

  return displayNames;
}

async function deleteOwnedForumTopic(topicId: number, address: string) {
  const normalizedAddress = address.toLowerCase();
  const topic = await prismaWeb2Client.forumTopic.findFirst({
    where: {
      id: topicId,
      dao_slug: slug,
    },
  });

  if (!topic) {
    return { success: false as const, error: "Topic not found" };
  }

  if (topic.address.toLowerCase() !== normalizedAddress) {
    return { success: false as const, error: "Unauthorized" };
  }

  await prismaWeb2Client.$transaction(async (tx) => {
    await tx.forumPost.deleteMany({
      where: {
        topicId: topic.id,
        dao_slug: slug,
      },
    });

    await tx.forumTopic.delete({ where: { id: topic.id } });
  });

  await logForumAuditAction(
    slug,
    normalizedAddress,
    "DELETE_TOPIC",
    "topic",
    topicId
  );

  return { success: true as const };
}

interface GetForumTopicsOptions {
  categoryId?: number;
  excludeCategoryNames?: string[];
  limit?: number;
  offset?: number;
}

export async function getForumTopics({
  categoryId,
  excludeCategoryNames,
  limit = 20,
  offset = 0,
}: GetForumTopicsOptions = {}) {
  try {
    const now = new Date();
    const whereClause: any = {
      dao_slug: slug,
      archived: false,
      isNsfw: false,
      deletedAt: null,
      OR: [
        {
          revealTime: null,
          expirationTime: null,
        },
        {
          AND: [
            {
              OR: [{ revealTime: null }, { revealTime: { lte: now } }],
            },
            {
              OR: [{ expirationTime: null }, { expirationTime: { gt: now } }],
            },
          ],
        },
      ],
    };

    if (categoryId !== undefined) {
      whereClause.categoryId = categoryId;
    } else if (excludeCategoryNames && excludeCategoryNames.length > 0) {
      whereClause.NOT = {
        category: {
          name: {
            in: excludeCategoryNames,
          },
        },
      };
    }

    const topics = await prismaWeb2Client.forumTopic.findMany({
      where: whereClause,
      include: {
        ...(isForumSurveysEnabled() ? { survey: surveySummaryInclude } : {}),
        category: {
          select: {
            name: true,
            id: true,
            adminOnlyTopics: true,
            isDuna: true,
          },
        },
        posts: {
          where: { isNsfw: false },
          orderBy: { createdAt: "asc" },
          include: {
            reactions: true,
          },
        },
        _count: {
          select: {
            posts: {
              where: { isNsfw: false },
            },
          },
        },
      },
      orderBy: [{ archived: "asc" }, { createdAt: "desc" }],
      take: limit,
      skip: offset,
    });

    const groupByEmojiAddresses = (reactions: any[] | undefined) => {
      const out: Record<string, string[]> = {};
      (reactions || []).forEach((r: any) => {
        const e = (r.emoji || "").trim();
        const addr = (r.address || "").toLowerCase();
        if (!e || !addr) return;
        if (!out[e]) out[e] = [];
        if (!out[e].includes(addr)) out[e].push(addr);
      });
      return out;
    };

    const authorAddresses = topics.flatMap((topic: any) => [
      topic.address,
      ...topic.posts.map((p: any) => p.address),
    ]);
    const [deletedAccounts, displayNames] = await Promise.all([
      getDeletedAccountSet(authorAddresses),
      getDisplayNameMap(authorAddresses),
    ]);

    return {
      success: true,
      data: topics.map((topic: any) => ({
        ...topic,
        survey: mapForumSurveySummary(topic.survey),
        isAuthorDeleted: deletedAccounts.has(topic.address?.toLowerCase()),
        authorDisplayName:
          displayNames.get(topic.address?.toLowerCase()) ?? null,
        posts: topic.posts.map((p: any) => ({
          ...p,
          isAuthorDeleted: deletedAccounts.has(p.address?.toLowerCase()),
          authorDisplayName: displayNames.get(p.address?.toLowerCase()) ?? null,
          reactionsByEmoji: groupByEmojiAddresses(p.reactions),
        })),
        topicReactionsByEmoji: groupByEmojiAddresses(
          topic.posts?.[0]?.reactions
        ),
        postsCount: topic._count.posts,
      })),
    };
  } catch (error) {
    console.error("Error getting forum topics:", error);
    return handlePrismaError(error);
  }
}

export async function getForumTopic(topicId: number) {
  try {
    const whereClause: any = {
      id: topicId,
      dao_slug: slug,
      isNsfw: false,
    };

    const now = new Date();
    const attachmentWhere = {
      archived: false,
      OR: [
        {
          revealTime: null,
          expirationTime: null,
        },
        {
          AND: [
            {
              OR: [{ revealTime: null }, { revealTime: { lte: now } }],
            },
            {
              OR: [{ expirationTime: null }, { expirationTime: { gt: now } }],
            },
          ],
        },
      ],
    };

    const topic = await prismaWeb2Client.forumTopic.findFirst({
      where: whereClause,
      include: {
        ...(isForumSurveysEnabled() ? { survey: surveySummaryInclude } : {}),
        category: {
          select: {
            name: true,
            id: true,
            adminOnlyTopics: true,
            isDuna: true,
          },
        },
        posts: {
          where: { isNsfw: false },
          orderBy: { createdAt: "asc" },
          include: {
            votes: true,
            reactions: true,
            attachments: {
              where: attachmentWhere,
            },
          },
        },
      },
    });

    if (!topic) {
      return {
        success: false,
        error: "Topic not found",
      };
    }

    const groupByEmojiAddresses = (reactions: any[] | undefined) => {
      const out: Record<string, string[]> = {};
      (reactions || []).forEach((r: any) => {
        const e = (r.emoji || "").trim();
        const addr = (r.address || "").toLowerCase();
        if (!e || !addr) return;
        if (!out[e]) out[e] = [];
        if (!out[e].includes(addr)) out[e].push(addr);
      });
      return out;
    };

    const [deletedAccounts, displayNames] = await Promise.all([
      getDeletedAccountSet([
        (topic as any).address,
        ...(topic as any).posts.map((p: any) => p.address),
      ]),
      getDisplayNameMap([
        (topic as any).address,
        ...(topic as any).posts.map((p: any) => p.address),
      ]),
    ]);

    const mappedPosts = (topic as any).posts.map((p: any) => ({
      ...p,
      isAuthorDeleted: deletedAccounts.has(p.address?.toLowerCase()),
      authorDisplayName: displayNames.get(p.address?.toLowerCase()) ?? null,
      reactionsByEmoji: groupByEmojiAddresses(p.reactions),
      attachments: (p.attachments || []).map((att: any) => ({
        id: att.id,
        fileName: att.fileName,
        contentType: att.contentType,
        fileSize: Number(att.fileSize ?? 0),
        ipfsCid: att.ipfsCid,
        url: getIPFSUrl(att.ipfsCid),
        createdAt: (att.createdAt instanceof Date
          ? att.createdAt
          : new Date(att.createdAt)
        ).toISOString(),
        uploadedBy: att.address,
        isFinancialStatement: att.isFinancialStatement ?? false,
        revealTime: att.revealTime
          ? att.revealTime instanceof Date
            ? att.revealTime.toISOString()
            : new Date(att.revealTime).toISOString()
          : null,
        expirationTime: att.expirationTime
          ? att.expirationTime instanceof Date
            ? att.expirationTime.toISOString()
            : new Date(att.expirationTime).toISOString()
          : null,
      })),
    }));

    return {
      success: true,
      data: {
        ...topic,
        authorDisplayName:
          displayNames.get((topic as any).address?.toLowerCase()) ?? null,
        survey: mapForumSurveySummary((topic as any).survey),
        isAuthorDeleted: deletedAccounts.has(
          (topic as any).address?.toLowerCase()
        ),
        posts: mappedPosts,
        topicReactionsByEmoji: groupByEmojiAddresses(
          (topic as any).posts?.[0]?.reactions
        ),
      },
    };
  } catch (error) {
    console.error("Error getting forum topic:", error);
    return handlePrismaError(error);
  }
}

export async function getForumTopicsByUser(
  address: string,
  pagination: { limit: number; offset: number }
) {
  try {
    const { limit, offset } = pagination;
    const now = new Date();

    const topics = await prismaWeb2Client.forumTopic.findMany({
      where: {
        dao_slug: slug,
        address: address.toLowerCase(),
        archived: false,
        isNsfw: false,
        OR: [
          {
            revealTime: null,
            expirationTime: null,
          },
          {
            AND: [
              {
                OR: [{ revealTime: null }, { revealTime: { lte: now } }],
              },
              {
                OR: [{ expirationTime: null }, { expirationTime: { gt: now } }],
              },
            ],
          },
        ],
      },
      include: {
        ...(isForumSurveysEnabled() ? { survey: surveySummaryInclude } : {}),
        category: {
          select: {
            name: true,
            id: true,
            adminOnlyTopics: true,
            isDuna: true,
          },
        },
        posts: {
          where: { isNsfw: false },
          orderBy: { createdAt: "asc" },
          include: {
            reactions: true,
          },
        },
        _count: {
          select: {
            posts: {
              where: { isNsfw: false },
            },
          },
        },
      },
      orderBy: [{ archived: "asc" }, { createdAt: "desc" }],
      take: limit + 1,
      skip: offset,
    });

    const hasNext = topics.length > limit;
    const data = topics.slice(0, limit);

    const groupByEmojiAddresses = (reactions: any[] | undefined) => {
      const out: Record<string, string[]> = {};
      (reactions || []).forEach((r: any) => {
        const e = (r.emoji || "").trim();
        const addr = (r.address || "").toLowerCase();
        if (!e || !addr) return;
        if (!out[e]) out[e] = [];
        if (!out[e].includes(addr)) out[e].push(addr);
      });
      return out;
    };

    const processedTopics = data.map((topic: any) => ({
      ...topic,
      survey: mapForumSurveySummary(topic.survey),
      posts: topic.posts.map((p: any) => ({
        ...p,
        reactionsByEmoji: groupByEmojiAddresses(p.reactions),
      })),
      topicReactionsByEmoji: groupByEmojiAddresses(topic.posts?.[0]?.reactions),
      postsCount: topic._count.posts,
    }));

    return {
      success: true,
      data: {
        meta: {
          has_next: hasNext,
          total_returned: processedTopics.length,
          next_offset: hasNext ? offset + limit : 0,
        },
        data: processedTopics,
      },
    };
  } catch (error) {
    console.error("Error getting forum topics by user:", error);
    return handlePrismaError(error);
  }
}

export async function createForumTopic(
  data: z.infer<typeof createTopicSchema>
) {
  try {
    const validatedData = createTopicSchema.parse(data);

    const [authResult, hasTopicPermission] = await Promise.all([
      verifyAuth(
        {
          message: validatedData.message,
          signature: validatedData.signature as `0x${string}` | undefined,
          jwt: validatedData.jwt,
        },
        validatedData.address as `0x${string}`
      ),
      checkPermission(
        validatedData.address,
        slug as DaoSlug,
        "forums",
        "topics",
        "create"
      ),
    ]);

    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    const normalizedAddress = authResult.address.toLowerCase();

    if (validatedData.survey && !isForumSurveysEnabled()) {
      return {
        success: false,
        error: "Forum surveys are not enabled for this tenant",
      };
    }

    if (validatedData.survey?.key) {
      return {
        success: false,
        error: "Stable survey keys can only be assigned by the seed process",
      };
    }

    if (
      validatedData.survey?.closesAt &&
      validatedData.survey.closesAt <= new Date()
    ) {
      return { success: false, error: "Survey deadline must be in the future" };
    }

    if (validatedData.categoryId != null) {
      const category = await prismaWeb2Client.forumCategory.findFirst({
        where: { id: validatedData.categoryId, dao_slug: slug },
        select: { adminOnlyTopics: true },
      });
      if (!category) {
        return { success: false, error: "Category not found" };
      }
      if (category.adminOnlyTopics && !hasTopicPermission) {
        return {
          success: false,
          error: "Only forum staff can create topics in this category",
        };
      }
    }

    // Only check voting power if user doesn't have RBAC permission
    if (!hasTopicPermission) {
      try {
        const tenant = Tenant.current();
        const client = getPublicClient();

        if (validatedData.survey) {
          let directBalance: bigint;
          try {
            directBalance = BigInt(
              (await client.readContract({
                abi: tenant.contracts.token.abi,
                address: tenant.contracts.token.address as `0x${string}`,
                functionName: "balanceOf",
                args: [normalizedAddress],
              })) as bigint
            );
          } catch (error) {
            console.error("Failed to verify CIVIC survey membership", error);
            return {
              success: false,
              error: "CIVIC membership verification is temporarily unavailable",
            };
          }
          if (directBalance <= 0n) {
            return {
              success: false,
              error: "A CIVIC Supporter Pass is required to create a survey",
            };
          }
        }

        // Fetch voting power directly from contract
        const votingPowerBigInt = await fetchVotingPowerFromContract(
          client,
          validatedData.address,
          {
            namespace: tenant.namespace,
            contracts: tenant.contracts,
          }
        );

        // Convert to number for comparison
        const currentVP = formatVotingPower(
          votingPowerBigInt,
          tenant.token.decimals
        );
        const vpCheck = await canCreateTopic(currentVP, slug);

        if (!vpCheck.allowed) {
          return {
            success: false,
            error: formatVPError(vpCheck, "create topics"),
          };
        }
      } catch (vpError) {
        console.error("Failed to check voting power:", vpError);
        if (validatedData.survey) {
          return {
            success: false,
            error: "CIVIC membership verification is temporarily unavailable",
          };
        }
        // Continue if VP check fails - don't block legitimate users
      }
    }

    // Moderate content automatically
    let isNsfw = false;
    try {
      const surveyText = validatedData.survey?.questions
        .flatMap((question) => [question.prompt, ...question.options])
        .join("\n");
      const combinedText = [
        validatedData.title,
        validatedData.content,
        surveyText,
      ]
        .filter(Boolean)
        .join("\n\n");
      const moderation = await moderateTextContent(combinedText);
      isNsfw = isContentNSFW(moderation);
    } catch (moderationError) {
      console.error("Content moderation failed:", moderationError);
    }

    const { newTopic, newPost, newSurvey } =
      await prismaWeb2Client.$transaction(async (tx) => {
        const newTopic = await tx.forumTopic.create({
          data: {
            title: validatedData.title,
            address: normalizedAddress,
            dao_slug: slug,
            categoryId: validatedData.categoryId || null,
            isNsfw,
          },
        });

        const newPost = await tx.forumPost.create({
          data: {
            content: validatedData.content,
            address: normalizedAddress,
            topicId: newTopic.id,
            dao_slug: slug,
            isNsfw,
          },
        });

        const newSurvey = validatedData.survey
          ? await createForumSurveyForTopic(
              tx,
              slug as DaoSlug,
              newTopic.id,
              validatedData.survey
            )
          : null;

        return { newTopic, newPost, newSurvey };
      });

    // Create attachment records for any IPFS images in the content
    try {
      await createAttachmentsFromContent(
        validatedData.content,
        validatedData.address,
        "post",
        newPost.id
      );
    } catch (attachmentError) {
      console.error(
        "Failed to create attachments for new topic:",
        attachmentError
      );
      // Don't fail the entire operation if attachments fail
    }

    if (!isNsfw) {
      // Index the new topic for search (async, don't block response)
      indexForumTopic({
        topicId: newTopic.id,
        daoSlug: slug,
        title: validatedData.title,
        content: validatedData.content,
        author: validatedData.address,
        categoryId: validatedData.categoryId || undefined,
        createdAt: newTopic.createdAt,
      }).catch((error) => console.error("Failed to index new topic:", error));
    }

    addRecipientAttributeValue(
      normalizedAddress,
      "authored_topics",
      newTopic.id
    );
    addRecipientAttributeValue(
      normalizedAddress,
      "engaged_topics",
      newTopic.id
    );

    if (!isNsfw && newTopic.categoryId) {
      const category = await prismaWeb2Client.forumCategory.findUnique({
        where: { id: newTopic.categoryId },
        select: { name: true },
      });

      // Format address for display (ENS or truncated) and build profile URL
      const authorDisplayName =
        await formatAddressForNotification(normalizedAddress);

      emitBroadcastEvent(
        "forum_discussion_in_watched_category",
        String(newTopic.id),
        {
          attributes: {
            subscribed_categories: { $contains: newTopic.categoryId },
          },
          exclude_recipient_ids: [normalizedAddress],
        },
        {
          dao_name: slug,
          topic_id: newTopic.id,
          topic_title: newTopic.title,
          category_name: category?.name ?? "General",
          author_address: normalizedAddress,
          author_display_name: authorDisplayName,
        }
      );
    }

    return {
      success: true as const,
      data: {
        topic: {
          id: newTopic.id,
          title: newTopic.title,
          address: newTopic.address,
          createdAt: newTopic.createdAt.toISOString(),
        },
        post: {
          id: newPost.id,
          content: newPost.content,
          address: newPost.address,
          createdAt: newPost.createdAt.toISOString(),
        },
        survey: newSurvey
          ? {
              id: newSurvey.id,
              kind: newSurvey.kind,
              responseCount: 0,
              status: "open" as const,
              isOpen: true,
            }
          : null,
      },
    };
  } catch (error) {
    console.error("Error creating forum topic:", error);
    return handlePrismaError(error);
  }
}

export async function deleteForumTopic(
  data: z.infer<typeof deleteTopicSchema>
) {
  try {
    const validatedData = deleteTopicSchema.parse(data);

    const authResult = await verifyAuth(
      {
        message: validatedData.message,
        signature: validatedData.signature as `0x${string}` | undefined,
        jwt: validatedData.jwt,
      },
      validatedData.address as `0x${string}`
    );

    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    return await deleteOwnedForumTopic(
      validatedData.topicId,
      authResult.address
    );
  } catch (error) {
    console.error("Error deleting forum topic:", error);
    return handlePrismaError(error);
  }
}

export async function deleteForumTopicWithAuth(
  topicId: number,
  address: `0x${string}`,
  auth: AuthParams
) {
  try {
    const authResult = await verifyAuth(auth, address);
    if (!authResult.success) {
      return { success: false as const, error: authResult.error };
    }

    return await deleteOwnedForumTopic(topicId, authResult.address);
  } catch (error) {
    console.error("Error deleting forum topic with auth:", error);
    return handlePrismaError(error);
  }
}

export async function softDeleteForumTopic(
  data: z.infer<typeof softDeleteTopicSchema>
) {
  try {
    const validatedData = softDeleteTopicSchema.parse(data);

    const authResult = await verifyAuth(
      {
        message: validatedData.message,
        signature: validatedData.signature as `0x${string}` | undefined,
        jwt: validatedData.jwt,
      },
      validatedData.address as `0x${string}`
    );

    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    const normalizedAddress = authResult.address.toLowerCase();

    const topic = await prismaWeb2Client.forumTopic.findFirst({
      where: {
        id: validatedData.topicId,
        dao_slug: slug,
      },
      select: {
        id: true,
        address: true,
        isFinancialStatement: true,
        category: {
          select: {
            isDuna: true,
          },
        },
      },
    });

    if (!topic) {
      return { success: false, error: "Topic not found" };
    }

    const isDunaFinancialStatement =
      topic.isFinancialStatement && topic.category?.isDuna;
    const hasDeletePermission = isDunaFinancialStatement
      ? await checkAnyPermission(normalizedAddress, slug as DaoSlug, [
          {
            module: "duna_filings",
            resource: "filings",
            action: "delete",
          },
          { module: "forums", resource: "topics", action: "archive" },
        ])
      : await checkPermission(
          normalizedAddress,
          slug as DaoSlug,
          "forums",
          "topics",
          "archive"
        );

    if (!hasDeletePermission) {
      return { success: false, error: "Unauthorized" };
    }

    await prismaWeb2Client.forumTopic.update({
      where: {
        id: topic.id,
        dao_slug: slug,
      },
      data: {
        deletedAt: new Date(),
        deletedBy: normalizedAddress,
      },
    });

    // Update search index to reflect the deletion (async, don't block response)
    removeForumTopicFromIndex(validatedData.topicId, slug).catch((error) =>
      console.error("Failed to delete topic in search index:", error)
    );

    return { success: true };
  } catch (error) {
    console.error("Error soft deleting forum topic:", error);
    return handlePrismaError(error);
  }
}

export async function restoreForumTopic(
  data: z.infer<typeof softDeleteTopicSchema>
) {
  try {
    const validatedData = softDeleteTopicSchema.parse(data);

    await requirePermission({
      address: validatedData.address,
      message: validatedData.message,
      signature: validatedData.signature,
      jwt: validatedData.jwt,
      daoSlug: slug as any,
      module: "forums",
      resource: "topics",
      action: "archive",
    });

    const topic = await prismaWeb2Client.forumTopic.findFirst({
      where: {
        id: validatedData.topicId,
        dao_slug: slug,
      },
      select: {
        id: true,
        address: true,
      },
    });

    if (!topic) {
      return { success: false, error: "Topic not found" };
    }

    await prismaWeb2Client.forumTopic.update({
      where: {
        id: topic.id,
        dao_slug: slug,
      },
      data: {
        deletedAt: null,
        deletedBy: null,
      },
    });

    if (topic.address.toLowerCase() !== validatedData.address.toLowerCase()) {
      await logForumAuditAction(
        slug,
        validatedData.address,
        "RESTORE_TOPIC",
        "topic",
        validatedData.topicId
      );
    }

    // Update search index to reflect the restoration (async, don't block response)
    const restoredTopic = await prismaWeb2Client.forumTopic.findUnique({
      where: { id: validatedData.topicId },
      include: {
        posts: {
          where: { deletedAt: null },
          orderBy: { createdAt: "asc" },
          take: 1,
        },
      },
    });

    if (restoredTopic) {
      const firstPost = (restoredTopic as any).posts[0];
      indexForumTopic({
        topicId: restoredTopic.id,
        daoSlug: slug,
        title: restoredTopic.title,
        content: firstPost?.content || "",
        author: restoredTopic.address,
        categoryId: restoredTopic.categoryId || undefined,
        createdAt: restoredTopic.createdAt,
      }).catch((error) =>
        console.error("Failed to update topic in search index:", error)
      );
    }

    return { success: true };
  } catch (error) {
    console.error("Error restoring forum topic:", error);
    return handlePrismaError(error);
  }
}

export async function archiveForumTopic(
  data: z.infer<typeof archiveTopicSchema>
) {
  try {
    const validatedData = archiveTopicSchema.parse(data);

    const authResult = await verifyAuth(
      {
        message: validatedData.message,
        signature: validatedData.signature as `0x${string}` | undefined,
        jwt: validatedData.jwt,
      },
      validatedData.address as `0x${string}`
    );

    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    const normalizedAddress = authResult.address.toLowerCase();

    const topic = await prismaWeb2Client.forumTopic.findFirst({
      where: {
        id: validatedData.topicId,
        dao_slug: slug,
      },
      select: {
        id: true,
        address: true,
        isFinancialStatement: true,
        category: {
          select: {
            isDuna: true,
          },
        },
      },
    });

    if (!topic) {
      return { success: false, error: "Topic not found" };
    }

    const isAuthor = topic.address.toLowerCase() === normalizedAddress;
    const isDunaFinancialStatement =
      topic.isFinancialStatement && topic.category?.isDuna;
    const hasArchivePermission = isDunaFinancialStatement
      ? await checkAnyPermission(normalizedAddress, slug as DaoSlug, [
          {
            module: "duna_filings",
            resource: "filings",
            action: "archive",
          },
          {
            module: "duna_filings",
            resource: "filings",
            action: "delete",
          },
          { module: "forums", resource: "topics", action: "archive" },
        ])
      : await checkPermission(
          normalizedAddress,
          slug as DaoSlug,
          "forums",
          "topics",
          "archive"
        );

    if (!((isDunaFinancialStatement && isAuthor) || hasArchivePermission)) {
      return { success: false, error: "Unauthorized" };
    }

    await prismaWeb2Client.forumTopic.update({
      where: {
        id: topic.id,
        dao_slug: slug,
      },
      data: {
        archived: true,
      },
    });

    if (!isAuthor) {
      await logForumAuditAction(
        slug,
        normalizedAddress,
        "ARCHIVE_TOPIC",
        "topic",
        validatedData.topicId
      );
    }

    return { success: true };
  } catch (error) {
    console.error("Error archiving forum topic:", error);
    return handlePrismaError(error);
  }
}

interface ForumDataOptions {
  categoryId?: number;
  excludeCategoryNames?: string[];
  limit?: number;
  offset?: number;
}

export const getForumTopicsCount = async () => {
  try {
    const now = new Date();
    const count = await prismaWeb2Client.forumTopic.count({
      where: {
        dao_slug: slug,
        archived: false,
        isNsfw: false,
        deletedAt: null,
        posts: {
          some: {
            isNsfw: false,
            deletedAt: null,
          },
        },
        OR: [
          {
            revealTime: null,
            expirationTime: null,
          },
          {
            AND: [
              {
                OR: [{ revealTime: null }, { revealTime: { lte: now } }],
              },
              {
                OR: [{ expirationTime: null }, { expirationTime: { gt: now } }],
              },
            ],
          },
        ],
      },
    });

    return {
      success: true,
      data: count,
    };
  } catch (error) {
    console.error("Error getting forum topics count:", error);
    return handlePrismaError(error);
  }
};

export const getUncategorizedTopicsCount = async () => {
  try {
    const now = new Date();
    const count = await prismaWeb2Client.forumTopic.count({
      where: {
        dao_slug: slug,
        archived: false,
        isNsfw: false,
        deletedAt: null,
        categoryId: null,
        posts: {
          some: {
            isNsfw: false,
            deletedAt: null,
          },
        },
        OR: [
          {
            revealTime: null,
            expirationTime: null,
          },
          {
            AND: [
              {
                OR: [{ revealTime: null }, { revealTime: { lte: now } }],
              },
              {
                OR: [{ expirationTime: null }, { expirationTime: { gt: now } }],
              },
            ],
          },
        ],
      },
    });

    return {
      success: true,
      data: count,
    };
  } catch (error) {
    console.error("Error getting uncategorized topics count:", error);
    return handlePrismaError(error);
  }
};

export const getForumData = async ({
  categoryId,
  excludeCategoryNames,
  limit = 20,
  offset = 0,
}: ForumDataOptions = {}) => {
  try {
    const now = new Date();
    const whereClause: any = {
      dao_slug: slug,
      archived: false,
      isNsfw: false,
      deletedAt: null,
      // Only include topics that have at least one valid post
      posts: {
        some: {
          isNsfw: false,
          deletedAt: null,
        },
      },
      OR: [
        {
          revealTime: null,
          expirationTime: null,
        },
        {
          AND: [
            {
              OR: [{ revealTime: null }, { revealTime: { lte: now } }],
            },
            {
              OR: [{ expirationTime: null }, { expirationTime: { gt: now } }],
            },
          ],
        },
      ],
    };

    if (categoryId !== undefined) {
      // Special case: categoryId = 0 means uncategorized topics
      if (categoryId === 0) {
        whereClause.categoryId = null;
      } else {
        whereClause.categoryId = categoryId;
      }
    } else if (excludeCategoryNames && excludeCategoryNames.length > 0) {
      whereClause.NOT = {
        category: {
          name: {
            in: excludeCategoryNames,
          },
        },
      };
    }

    // Base where clause for all topics (for total count - always unfiltered)
    const baseWhereClause: any = {
      dao_slug: slug,
      archived: false,
      isNsfw: false,
      deletedAt: null,
      // Only include topics that have at least one valid post
      posts: {
        some: {
          isNsfw: false,
          deletedAt: null,
        },
      },
      OR: [
        {
          revealTime: null,
          expirationTime: null,
        },
        {
          AND: [
            {
              OR: [{ revealTime: null }, { revealTime: { lte: now } }],
            },
            {
              OR: [{ expirationTime: null }, { expirationTime: { gt: now } }],
            },
          ],
        },
      ],
    };

    const [
      topics,
      totalCount,
      admins,
      categories,
      latestPost,
      uncategorizedCount,
    ] = await Promise.all([
      prismaWeb2Client.forumTopic.findMany({
        where: whereClause,
        include: {
          ...(isForumSurveysEnabled() ? { survey: surveySummaryInclude } : {}),
          category: {
            select: {
              name: true,
              id: true,
              adminOnlyTopics: true,
              isDuna: true,
            },
          },
          posts: {
            where: { isNsfw: false, deletedAt: null },
            orderBy: { createdAt: "asc" },
            take: 1,
            include: {
              reactions: true,
              _count: {
                select: {
                  votes: {
                    where: { vote: 1 },
                  },
                },
              },
            },
          },
          _count: {
            select: {
              posts: {
                where: { isNsfw: false, deletedAt: null },
              },
            },
          },
        },
        orderBy: [{ archived: "asc" }, { createdAt: "desc" }],
        take: limit,
        skip: offset,
      }),

      // Total count across all categories (always unfiltered)
      prismaWeb2Client.forumTopic.count({
        where: baseWhereClause,
      }),

      // Fetch users with active RBAC roles for this DAO
      prismaWeb2Client.forumUserRole.findMany({
        where: {
          daoSlug: slug,
          isActive: true,
          revokedAt: null,
        },
        include: {
          role: {
            select: {
              slug: true,
              name: true,
            },
          },
        },
        orderBy: { address: "asc" },
      }),

      prismaWeb2Client.forumCategory.findMany({
        where: { dao_slug: slug, archived: false },
        include: {
          _count: {
            select: {
              topics: {
                where: {
                  archived: false,
                  deletedAt: null,
                  posts: {
                    some: {
                      isNsfw: false,
                      deletedAt: null,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),

      prismaWeb2Client.forumPost.findFirst({
        where: {
          dao_slug: slug,
          isNsfw: false,
          deletedAt: null,
        },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          createdAt: true,
          topicId: true,
          address: true,
          content: true,
        },
      }),

      // Count uncategorized topics
      prismaWeb2Client.forumTopic.count({
        where: {
          dao_slug: slug,
          archived: false,
          isNsfw: false,
          deletedAt: null,
          categoryId: null,
          posts: {
            some: {
              isNsfw: false,
              deletedAt: null,
            },
          },
        },
      }),
    ]);

    // Map RBAC user roles to legacy admin format for compatibility
    const adminRolesObj: Record<string, string | null> = {};
    const adminMap = new Map<string, string>();

    admins.forEach((userRole) => {
      const normalizedAddress = userRole.address.toLowerCase();
      const roleSlug = userRole.role.slug;

      // Map RBAC roles to legacy role format
      let legacyRole = "admin";
      if (roleSlug === "duna_admin") {
        legacyRole = "duna_admin";
      }

      // Keep highest role per address
      const existing = adminMap.get(normalizedAddress);
      if (!existing || legacyRole !== "duna_admin") {
        adminMap.set(normalizedAddress, legacyRole);
      }
    });

    // Convert map to object
    adminMap.forEach((role, address) => {
      adminRolesObj[address] = role;
    });

    const deletedAccounts = await getDeletedAccountSet(
      topics.map((topic) => topic.address)
    );

    const processedTopics = topics.map((topic) => ({
      ...topic,
      survey: mapForumSurveySummary((topic as any).survey),
      isAuthorDeleted: deletedAccounts.has(topic.address.toLowerCase()),
      createdAt: topic.createdAt.toISOString(),
      revealTime: topic.revealTime
        ? (topic.revealTime instanceof Date
            ? topic.revealTime
            : new Date(topic.revealTime)
          ).toISOString()
        : null,
      upvotes: (topic as any).posts[0]?._count?.votes || 0,
      firstPost: (topic as any).posts[0],
      postsCount: (topic as any)._count.posts,
    }));

    const processedCategories = categories.map((category) => ({
      id: category.id,
      name: category.name,
      description: category.description,
      archived: category.archived,
      adminOnlyTopics: category.adminOnlyTopics,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
      isDuna: category.isDuna,
      topicsCount: category._count.topics,
    }));

    return {
      success: true,
      data: {
        topics: processedTopics,
        totalCount,
        admins: adminRolesObj,
        categories: processedCategories,
        uncategorizedCount,
        latestPost: latestPost
          ? {
              id: latestPost.id,
              author: latestPost.address,
              content: latestPost.content,
              createdAt:
                latestPost.createdAt instanceof Date
                  ? latestPost.createdAt.toISOString()
                  : new Date(latestPost.createdAt).toISOString(),
              parentId: undefined,
              attachments: undefined,
              deletedAt: null,
              deletedBy: null,
              isNsfw: false,
              reactionsByEmoji: undefined,
            }
          : undefined,
      },
    };
  } catch (error) {
    console.error("Error getting optimized forum data:", error);
    return handlePrismaError(error);
  }
};
