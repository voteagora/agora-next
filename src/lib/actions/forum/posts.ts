"use server";

import { z } from "zod";
import {
  createPostSchema,
  deletePostSchema,
  softDeletePostSchema,
  handlePrismaError,
} from "./shared";
import { moderateTextContent, isContentNSFW } from "@/lib/moderation";
import { removeForumPostFromIndex, indexForumPost } from "./search";
import verifyMessage from "@/lib/serverVerifyMessage";
import Tenant from "@/lib/tenant/tenant";
import { prismaWeb2Client } from "@/app/lib/prisma";
import { logForumAuditAction } from "./admin";
import { getIPFSUrl } from "@/lib/pinata";
import { createAttachmentsFromContent } from "../attachment";

const { slug } = Tenant.current();

// Lightweight schema for topic upvotes
const topicVoteSchema = z.object({
  topicId: z.number().min(1, "Topic ID is required"),
  address: z.string().min(1, "Address is required"),
  signature: z.string().min(1, "Signature is required"),
  message: z.string().min(1, "Signed message is required"),
});

async function getRootPostId(topicId: number): Promise<number | null> {
  const root = await prismaWeb2Client.forumPost.findFirst({
    where: { dao_slug: slug, topicId, parentPostId: null },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  return root?.id ?? null;
}

export async function upvoteForumTopic(data: z.infer<typeof topicVoteSchema>) {
  try {
    const validated = topicVoteSchema.parse(data);

    const isValid = await verifyMessage({
      address: validated.address as `0x${string}`,
      message: validated.message,
      signature: validated.signature as `0x${string}`,
    });
    if (!isValid)
      return { success: false, error: "Invalid signature" } as const;

    const topic = await prismaWeb2Client.forumTopic.findFirst({
      where: { id: validated.topicId, dao_slug: slug },
      select: { id: true },
    });
    if (!topic) return { success: false, error: "Topic not found" } as const;

    const rootPostId = await getRootPostId(validated.topicId);
    if (!rootPostId)
      return { success: false, error: "Root post not found" } as const;

    // Upsert an upvote (vote = 1) for this user on the root post
    await prismaWeb2Client.forumPostVote.upsert({
      where: {
        dao_slug_address_postId: {
          dao_slug: slug,
          address: validated.address,
          postId: rootPostId,
        },
      },
      update: { vote: 1 },
      create: {
        dao_slug: slug,
        address: validated.address,
        postId: rootPostId,
        vote: 1,
      },
    });

    const upvotes = await prismaWeb2Client.forumPostVote.count({
      where: { dao_slug: slug, postId: rootPostId, vote: 1 },
    });

    return { success: true as const, data: { postId: rootPostId, upvotes } };
  } catch (error) {
    console.error("Error upvoting forum topic:", error);
    return handlePrismaError(error);
  } finally {
    await prismaWeb2Client.$disconnect();
  }
}

export async function removeUpvoteForumTopic(
  data: z.infer<typeof topicVoteSchema>
) {
  try {
    const validated = topicVoteSchema.parse(data);

    const isValid = await verifyMessage({
      address: validated.address as `0x${string}`,
      message: validated.message,
      signature: validated.signature as `0x${string}`,
    });
    if (!isValid)
      return { success: false, error: "Invalid signature" } as const;

    const rootPostId = await getRootPostId(validated.topicId);
    if (!rootPostId)
      return { success: false, error: "Root post not found" } as const;

    await prismaWeb2Client.forumPostVote.deleteMany({
      where: {
        dao_slug: slug,
        address: validated.address,
        postId: rootPostId,
      },
    });

    const upvotes = await prismaWeb2Client.forumPostVote.count({
      where: { dao_slug: slug, postId: rootPostId, vote: 1 },
    });

    return { success: true as const, data: { postId: rootPostId, upvotes } };
  } catch (error) {
    console.error("Error removing upvote from forum topic:", error);
    return handlePrismaError(error);
  } finally {
    await prismaWeb2Client.$disconnect();
  }
}

export async function getForumTopicUpvotes(topicId: number) {
  try {
    const rootPostId = await getRootPostId(topicId);
    if (!rootPostId)
      return { success: true as const, data: { postId: null, upvotes: 0 } };
    const upvotes = await prismaWeb2Client.forumPostVote.count({
      where: { dao_slug: slug, postId: rootPostId, vote: 1 },
    });
    return { success: true as const, data: { postId: rootPostId, upvotes } };
  } catch (error) {
    console.error("Error getting topic upvotes:", error);
    return handlePrismaError(error);
  } finally {
    await prismaWeb2Client.$disconnect();
  }
}

export async function getMyForumTopicVote(topicId: number, address: string) {
  try {
    const rootPostId = await getRootPostId(topicId);
    if (!rootPostId)
      return {
        success: true as const,
        data: { postId: null, hasVoted: false },
      };

    const vote = await prismaWeb2Client.forumPostVote.findUnique({
      where: {
        dao_slug_address_postId: {
          dao_slug: slug,
          address,
          postId: rootPostId,
        },
      },
      select: { vote: true },
    });

    return {
      success: true as const,
      data: { postId: rootPostId, hasVoted: !!vote && vote.vote === 1 },
    };
  } catch (error) {
    console.error("Error checking my topic vote:", error);
    return handlePrismaError(error);
  } finally {
    await prismaWeb2Client.$disconnect();
  }
}

export async function createForumPost(
  topicId: number,
  data: z.infer<typeof createPostSchema>
) {
  try {
    const validatedData = createPostSchema.parse(data);

    const isValid = await verifyMessage({
      address: validatedData.address as `0x${string}`,
      message: validatedData.message,
      signature: validatedData.signature as `0x${string}`,
    });

    if (!isValid) {
      return { success: false, error: "Invalid signature" };
    }

    const topic = await prismaWeb2Client.forumTopic.findUnique({
      where: { id: topicId },
    });

    if (!topic) {
      return { success: false, error: "Topic not found" };
    }

    // Moderate post content automatically
    let isNsfw = false;
    try {
      const moderation = await moderateTextContent(validatedData.content);
      isNsfw = isContentNSFW(moderation);
    } catch (moderationError) {
      console.error("Post content moderation failed:", moderationError);
    }

    const newPost = await prismaWeb2Client.forumPost.create({
      data: {
        content: validatedData.content,
        address: validatedData.address,
        topicId: topicId,
        parentPostId: validatedData.parentId || null,
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
      console.error("Failed to create attachments for new post:", attachmentError);
      // Don't fail the entire operation if attachments fail
    }

    if (!isNsfw) {
      // Index the new post for search (async, don't block response)
      indexForumPost({
        postId: newPost.id,
        daoSlug: slug,
        content: validatedData.content,
        author: validatedData.address,
        topicId: topicId,
        topicTitle: topic.title,
        parentPostId: validatedData.parentId || undefined,
        createdAt: newPost.createdAt,
      }).catch((error) => console.error("Failed to index new post:", error));
    }

    return {
      success: true as const,
      data: {
        id: newPost.id,
        address: newPost.address,
        content: newPost.content,
        createdAt: newPost.createdAt.toISOString(),
        parentPostId: newPost.parentPostId,
      },
    };
  } catch (error) {
    console.error("Error creating forum post:", error);
    return handlePrismaError(error);
  } finally {
    await prismaWeb2Client.$disconnect();
  }
}

export async function deleteForumPost(data: z.infer<typeof deletePostSchema>) {
  try {
    const validatedData = deletePostSchema.parse(data);

    const isValid = await verifyMessage({
      address: validatedData.address as `0x${string}`,
      message: validatedData.message,
      signature: validatedData.signature as `0x${string}`,
    });

    if (!isValid) {
      return { success: false, error: "Invalid signature" };
    }

    const post = await prismaWeb2Client.forumPost.findUnique({
      where: { id: validatedData.postId },
    });

    if (!post) {
      return { success: false, error: "Post not found" };
    }

    if (post.address !== validatedData.address) {
      return { success: false, error: "Unauthorized" };
    }

    await prismaWeb2Client.forumPost.delete({
      where: { id: validatedData.postId },
    });

    await logForumAuditAction(
      slug,
      validatedData.address,
      "DELETE_POST",
      "post",
      validatedData.postId
    );

    return { success: true };
  } catch (error) {
    console.error("Error deleting forum post:", error);
    return handlePrismaError(error);
  } finally {
    await prismaWeb2Client.$disconnect();
  }
}

export async function softDeleteForumPost(
  data: z.infer<typeof softDeletePostSchema>
) {
  try {
    const validatedData = softDeletePostSchema.parse(data);

    const isValid = await verifyMessage({
      address: validatedData.address as `0x${string}`,
      message: validatedData.message,
      signature: validatedData.signature as `0x${string}`,
    });

    if (!isValid) {
      return { success: false, error: "Invalid signature" };
    }

    await prismaWeb2Client.forumPost.update({
      where: {
        id: validatedData.postId,
        dao_slug: slug,
      },
      data: {
        deletedAt: new Date(),
        deletedBy: validatedData.address,
      },
    });

    // Update search index to reflect the deletion (async, don't block response)
    removeForumPostFromIndex(validatedData.postId, slug).catch((error) =>
      console.error("Failed to update post in search index:", error)
    );

    return { success: true };
  } catch (error) {
    console.error("Error soft deleting forum post:", error);
    return handlePrismaError(error);
  } finally {
    await prismaWeb2Client.$disconnect();
  }
}

export async function restoreForumPost(
  data: z.infer<typeof softDeletePostSchema>
) {
  try {
    const validatedData = softDeletePostSchema.parse(data);

    const isValid = await verifyMessage({
      address: validatedData.address as `0x${string}`,
      message: validatedData.message,
      signature: validatedData.signature as `0x${string}`,
    });

    if (!isValid) {
      return { success: false, error: "Invalid signature" };
    }

    await prismaWeb2Client.forumPost.update({
      where: {
        id: validatedData.postId,
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
        "RESTORE_POST",
        "post",
        validatedData.postId
      );
    }

    // Update search index to reflect the restoration (async, don't block response)
    const restoredPost = await prismaWeb2Client.forumPost.findUnique({
      where: { id: validatedData.postId },
      include: {
        topic: {
          select: { title: true },
        },
      },
    });

    if (restoredPost) {
      indexForumPost({
        postId: restoredPost.id,
        daoSlug: slug,
        content: restoredPost.content,
        author: restoredPost.address,
        topicId: restoredPost.topicId,
        topicTitle: restoredPost.topic.title,
        parentPostId: restoredPost.parentPostId || undefined,
        createdAt: restoredPost.createdAt,
      }).catch((error) =>
        console.error("Failed to update post in search index:", error)
      );
    }

    return { success: true };
  } catch (error) {
    console.error("Error restoring forum post:", error);
    return handlePrismaError(error);
  } finally {
    await prismaWeb2Client.$disconnect();
  }
}

export async function getForumPostsByTopic(topicId: number) {
  try {
    const whereClause: any = {
      topicId,
      dao_slug: slug,
      isNsfw: false,
    };

    const posts = await prismaWeb2Client.forumPost.findMany({
      where: whereClause,
      include: {
        votes: true,
        reactions: true,
        topic: {
          select: {
            title: true,
            id: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
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
      data: posts.map((p) => ({
        ...p,
        reactionsByEmoji: groupByEmojiAddresses((p as any).reactions),
      })),
    };
  } catch (error) {
    console.error("Error getting forum posts:", error);
    return handlePrismaError(error);
  } finally {
    await prismaWeb2Client.$disconnect();
  }
}

export async function getForumPost(postId: number) {
  try {
    const whereClause: any = {
      id: postId,
      dao_slug: slug,
      isNsfw: false,
    };

    const post = await prismaWeb2Client.forumPost.findFirst({
      where: whereClause,
      include: {
        votes: true,
        reactions: true,
        topic: {
          select: {
            title: true,
            id: true,
          },
        },
      },
    });

    if (!post) {
      return {
        success: false,
        error: "Post not found",
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

    return {
      success: true,
      data: {
        ...post,
        reactionsByEmoji: groupByEmojiAddresses((post as any).reactions),
      },
    };
  } catch (error) {
    console.error("Error getting forum post:", error);
    return handlePrismaError(error);
  } finally {
    await prismaWeb2Client.$disconnect();
  }
}

// Fetch the most recent non-NSFW, non-deleted post for the current tenant
export async function getLatestForumPost() {
  try {
    const post = await prismaWeb2Client.forumPost.findFirst({
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
      },
    });

    if (!post) return { success: true as const, data: null };

    return {
      success: true as const,
      data: {
        id: post.id,
        createdAt:
          post.createdAt instanceof Date
            ? post.createdAt.toISOString()
            : new Date(post.createdAt).toISOString(),
        topicId: post.topicId,
      },
    };
  } catch (error) {
    console.error("Error getting latest forum post:", error);
    return handlePrismaError(error);
  } finally {
    await prismaWeb2Client.$disconnect();
  }
}

export async function getForumPostsByUser(address: string, pagination: { limit: number; offset: number }) {
  try {
    const { limit, offset } = pagination;
    
    const posts = await prismaWeb2Client.forumPost.findMany({
      where: {
        dao_slug: slug,
        address: address.toLowerCase(),
        isNsfw: false,
      },
      include: {
        votes: true,
        reactions: true,
        topic: {
          select: {
            title: true,
            id: true,
            category: {
              select: {
                name: true,
                id: true,
              },
            },
          },
        },
        attachments: true,
      },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      skip: offset,
    });

    const hasNext = posts.length > limit;
    const data = posts.slice(0, limit);

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

    const processedPosts = data.map((p) => ({
      ...p,
      reactionsByEmoji: groupByEmojiAddresses((p as any).reactions),
      attachments: ((p as any).attachments || []).map((att: any) => ({
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
        meta: {
          has_next: hasNext,
          total_returned: processedPosts.length,
          next_offset: hasNext ? offset + limit : 0,
        },
        data: processedPosts,
      },
    };
  } catch (error) {
    console.error("Error getting forum posts by user:", error);
    return handlePrismaError(error);
  } finally {
    await prismaWeb2Client.$disconnect();
  }
}
