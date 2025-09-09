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

const { slug } = Tenant.current();

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

    return {
      success: true,
      data: posts,
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

    return {
      success: true,
      data: post,
    };
  } catch (error) {
    console.error("Error getting forum post:", error);
    return handlePrismaError(error);
  } finally {
    await prismaWeb2Client.$disconnect();
  }
}
