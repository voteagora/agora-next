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
import verifyMessage from "@/lib/serverVerifyMessage";
import Tenant from "@/lib/tenant/tenant";
import { prismaWeb2Client } from "@/app/lib/prisma";
import { getIPFSUrl } from "@/lib/pinata";
import { logForumAuditAction, checkForumPermissions } from "./admin";
import { unstable_cache } from "next/cache";
import { createAttachmentsFromContent } from "../attachment";
import { canCreateTopic, formatVPError } from "@/lib/forumSettings";
import {
  fetchVotingPowerFromContract,
  formatVotingPower,
} from "@/lib/votingPowerUtils";
import { getPublicClient } from "@/lib/viem";
import {
  addRecipientAttributeValue,
  buildForumTopicUrl,
  emitBroadcastEvent,
} from "@/lib/notification-center/emitter";
const { slug } = Tenant.current();

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
    const whereClause: any = {
      dao_slug: slug,
      archived: false,
      isNsfw: false,
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

    return {
      success: true,
      data: topics.map((topic: any) => ({
        ...topic,
        posts: topic.posts.map((p: any) => ({
          ...p,
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

    const topic = await prismaWeb2Client.forumTopic.findFirst({
      where: whereClause,
      include: {
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
            attachments: true,
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

    const mappedPosts = (topic as any).posts.map((p: any) => ({
      ...p,
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
      })),
    }));

    return {
      success: true,
      data: {
        ...topic,
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

    const topics = await prismaWeb2Client.forumTopic.findMany({
      where: {
        dao_slug: slug,
        address: address.toLowerCase(),
        archived: false,
        isNsfw: false,
      },
      include: {
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

    // Parallelize signature verification and admin check
    const [isValid, adminCheck] = await Promise.all([
      verifyMessage({
        address: validatedData.address as `0x${string}`,
        message: validatedData.message,
        signature: validatedData.signature as `0x${string}`,
      }),
      checkForumPermissions(
        validatedData.address,
        validatedData.categoryId || undefined
      ),
    ]);

    if (!isValid) {
      return { success: false, error: "Invalid signature" };
    }

    const normalizedAddress = validatedData.address.toLowerCase();

    // Only check voting power for non-admins
    if (!adminCheck.isAdmin) {
      try {
        const tenant = Tenant.current();
        const client = getPublicClient();

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
        const currentVP = formatVotingPower(votingPowerBigInt);
        const vpCheck = await canCreateTopic(currentVP, slug);

        if (!vpCheck.allowed) {
          return {
            success: false,
            error: formatVPError(vpCheck, "create topics"),
          };
        }
      } catch (vpError) {
        console.error("Failed to check voting power:", vpError);
        // Continue if VP check fails - don't block legitimate users
      }
    }

    // Moderate content automatically
    let isNsfw = false;
    try {
      const combinedText = `${validatedData.title}\n\n${validatedData.content}`;
      const moderation = await moderateTextContent(combinedText);
      isNsfw = isContentNSFW(moderation);
    } catch (moderationError) {
      console.error("Content moderation failed:", moderationError);
    }

    const newTopic = await prismaWeb2Client.forumTopic.create({
      data: {
        title: validatedData.title,
        address: validatedData.address,
        dao_slug: slug,
        categoryId: validatedData.categoryId || null,
        isNsfw,
      },
    });

    const newPost = await prismaWeb2Client.forumPost.create({
      data: {
        content: validatedData.content,
        address: validatedData.address,
        topicId: newTopic.id,
        dao_slug: slug,
        isNsfw,
      },
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

    addRecipientAttributeValue(normalizedAddress, "authored_topics", newTopic.id);
    addRecipientAttributeValue(normalizedAddress, "engaged_topics", newTopic.id);

    if (!isNsfw && newTopic.categoryId) {
      const category = await prismaWeb2Client.forumCategory.findUnique({
        where: { id: newTopic.categoryId },
        select: { name: true },
      });

      emitBroadcastEvent(
        "forum_discussion_in_watched_category",
        String(newTopic.id),
        {
          attributes: { subscribed_categories: { $contains: newTopic.categoryId } },
          exclude_recipient_ids: [normalizedAddress],
        },
        {
          dao_name: slug,
          topic_title: newTopic.title,
          topic_url: buildForumTopicUrl(newTopic.id, newTopic.title),
          category_name: category?.name ?? "General",
          author_address: normalizedAddress,
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
      },
    };
  } catch (error) {
    console.error("Error creating forum topic:", error);
    return handlePrismaError(error);
  }
}

async function _deleteForumTopicInternal(topicId: number) {
  try {
    await prismaWeb2Client.forumPost.deleteMany({
      where: {
        topicId: topicId,
        dao_slug: slug,
      },
    });

    await prismaWeb2Client.forumTopic.delete({
      where: {
        id: topicId,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting forum topic (internal):", error);
    return {
      success: false,
      error: "Failed to delete topic",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function deleteForumTopic(
  data:
    | z.infer<typeof deleteTopicSchema>
    | { topicId: number; _internal?: boolean }
) {
  // Allow internal cleanup operations to bypass signature verification
  if ("_internal" in data && data._internal) {
    return _deleteForumTopicInternal(data.topicId);
  }

  try {
    const validatedData = deleteTopicSchema.parse(data);

    const isValid = await verifyMessage({
      address: validatedData.address as `0x${string}`,
      message: validatedData.message,
      signature: validatedData.signature as `0x${string}`,
    });

    if (!isValid) {
      return { success: false, error: "Invalid signature" };
    }

    const topic = await prismaWeb2Client.forumTopic.findUnique({
      where: { id: validatedData.topicId },
    });

    if (!topic) {
      return { success: false, error: "Topic not found" };
    }

    if (topic.address !== validatedData.address) {
      return { success: false, error: "Unauthorized" };
    }

    await prismaWeb2Client.forumTopic.delete({
      where: { id: validatedData.topicId },
    });

    await logForumAuditAction(
      slug,
      validatedData.address,
      "DELETE_TOPIC",
      "topic",
      validatedData.topicId
    );

    return { success: true };
  } catch (error) {
    console.error("Error deleting forum topic:", error);
    return handlePrismaError(error);
  }
}

export async function softDeleteForumTopic(
  data: z.infer<typeof softDeleteTopicSchema>
) {
  try {
    const validatedData = softDeleteTopicSchema.parse(data);

    const isValid = await verifyMessage({
      address: validatedData.address as `0x${string}`,
      message: validatedData.message,
      signature: validatedData.signature as `0x${string}`,
    });

    if (!isValid) {
      return { success: false, error: "Invalid signature" };
    }

    await prismaWeb2Client.forumTopic.update({
      where: {
        id: validatedData.topicId,
        dao_slug: slug,
      },
      data: {
        deletedAt: new Date(),
        deletedBy: validatedData.address,
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

    const isValid = await verifyMessage({
      address: validatedData.address as `0x${string}`,
      message: validatedData.message,
      signature: validatedData.signature as `0x${string}`,
    });

    if (!isValid) {
      return { success: false, error: "Invalid signature" };
    }

    await prismaWeb2Client.forumTopic.update({
      where: {
        id: validatedData.topicId,
        dao_slug: slug,
      },
      data: {
        deletedAt: null,
        deletedBy: null,
      },
    });

    if (!validatedData.isAuthor) {
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

    const isValid = await verifyMessage({
      address: validatedData.address as `0x${string}`,
      message: validatedData.message,
      signature: validatedData.signature as `0x${string}`,
    });

    if (!isValid) {
      return { success: false, error: "Invalid signature" };
    }

    await prismaWeb2Client.forumTopic.update({
      where: {
        id: validatedData.topicId,
        dao_slug: slug,
      },
      data: {
        archived: true,
      },
    });

    if (!validatedData.isAuthor) {
      await logForumAuditAction(
        slug,
        validatedData.address,
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

      prismaWeb2Client.forumAdmin.findMany({
        where: {
          managedAccounts: {
            has: slug,
          },
        },
        select: { address: true, role: true },
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

    const adminRolesObj: Record<string, string | null> = {};
    admins.forEach((admin) => {
      const normalizedAddress = admin.address.toLowerCase();
      adminRolesObj[normalizedAddress] = admin.role;
    });

    const processedTopics = topics.map((topic) => ({
      ...topic,
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
