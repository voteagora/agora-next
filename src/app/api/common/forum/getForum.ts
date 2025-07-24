import { notFound } from "next/navigation";
import { unstable_cache, revalidateTag } from "next/cache";
import Tenant from "@/lib/tenant/tenant";
import { withMetrics } from "@/lib/metricWrapper";
import { prismaWeb3Client } from "@/app/lib/prisma";
import TenantSlugFactory from "@/lib/tenant/tenantSlugFactory";
import { PaginationParams, paginateResult } from "@/app/lib/pagination";

// ═══════════════════════════════════════════════════════════════════════════════
// READ OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════════

async function getForumCategories() {
  return withMetrics("getForumCategories", async () => {
    const { namespace } = Tenant.current();
    const dao_slug = TenantSlugFactory.create(namespace);

    try {
      const categories = await prismaWeb3Client.forumCategory.findMany({
        where: {
          dao_slug,
        },
        orderBy: {
          id: "asc",
        },
      });
      return categories;
    } catch (error) {
      console.error("Error fetching forum categories:", error);
      throw error;
    }
  });
}

async function getForumCategory(categoryId: number) {
  return withMetrics("getForumCategory", async () => {
    const { namespace } = Tenant.current();
    const dao_slug = TenantSlugFactory.create(namespace);

    try {
      const category = await prismaWeb3Client.forumCategory.findUnique({
        where: {
          id: categoryId,
          dao_slug,
        },
      });

      if (!category) {
        return notFound();
      }

      return category;
    } catch (error) {
      console.error("Error fetching forum category:", error);
      throw error;
    }
  });
}

async function getForumTopics({
  categoryId,
  pagination,
}: {
  categoryId?: number;
  pagination: PaginationParams;
}) {
  return withMetrics("getForumTopics", async () => {
    const { namespace } = Tenant.current();
    const dao_slug = TenantSlugFactory.create(namespace);

    try {
      const topicsResult = await paginateResult(
        async (skip: number, take: number) => {
          return await prismaWeb3Client.forumTopic.findMany({
            where: {
              dao_slug,
              ...(categoryId && { categoryId }),
            },
            orderBy: {
              createdAt: "desc",
            },
            include: {
              votes: true,
              reactions: true,
              posts: {
                take: 1,
                orderBy: {
                  createdAt: "desc",
                },
              },
            },
            skip,
            take,
          });
        },
        pagination
      );

      return topicsResult;
    } catch (error) {
      console.error("Error fetching forum topics:", error);
      throw error;
    }
  });
}

async function getForumTopic(topicId: number) {
  return withMetrics("getForumTopic", async () => {
    const { namespace } = Tenant.current();
    const dao_slug = TenantSlugFactory.create(namespace);

    try {
      const topic = await prismaWeb3Client.forumTopic.findUnique({
        where: {
          id: topicId,
          dao_slug,
        },
        include: {
          votes: true,
          reactions: true,
          posts: {
            include: {
              votes: true,
              reactions: true,
              replies: true,
            },
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });

      if (!topic) {
        return notFound();
      }

      return topic;
    } catch (error) {
      console.error("Error fetching forum topic:", error);
      throw error;
    }
  });
}

async function getForumPosts({
  topicId,
  parentId,
  pagination,
}: {
  topicId?: number;
  parentId?: number;
  pagination: PaginationParams;
}) {
  return withMetrics("getForumPosts", async () => {
    const { namespace } = Tenant.current();
    const dao_slug = TenantSlugFactory.create(namespace);

    try {
      const postsResult = await paginateResult(
        async (skip: number, take: number) => {
          return await prismaWeb3Client.forumPost.findMany({
            where: {
              dao_slug,
              ...(topicId && { topicId }),
              ...(parentId !== undefined && { parentPostId: parentId }),
            },
            include: {
              votes: true,
              reactions: true,
              replies: {
                include: {
                  votes: true,
                  reactions: true,
                },
              },
            },
            orderBy: {
              createdAt: "asc",
            },
            skip,
            take,
          });
        },
        pagination
      );

      return postsResult;
    } catch (error) {
      console.error("Error fetching forum posts:", error);
      throw error;
    }
  });
}

async function getForumPost(postId: number) {
  return withMetrics("getForumPost", async () => {
    const { namespace } = Tenant.current();
    const dao_slug = TenantSlugFactory.create(namespace);

    try {
      const post = await prismaWeb3Client.forumPost.findUnique({
        where: {
          id: postId,
          dao_slug,
        },
        include: {
          votes: true,
          reactions: true,
          replies: {
            include: {
              votes: true,
              reactions: true,
            },
          },
        },
      });

      if (!post) {
        return notFound();
      }

      return post;
    } catch (error) {
      console.error("Error fetching forum post:", error);
      throw error;
    }
  });
}

async function getForumVote({
  address,
  targetType,
  targetId,
}: {
  address: string;
  targetType: "topic" | "post";
  targetId: number;
}) {
  return withMetrics("getForumVote", async () => {
    const { namespace } = Tenant.current();
    const dao_slug = TenantSlugFactory.create(namespace);

    try {
      const vote = await prismaWeb3Client.forumVote.findUnique({
        where: {
          dao_slug_address_targetType_targetId: {
            dao_slug,
            address: address.toLowerCase(),
            targetType,
            targetId,
          },
        },
      });

      return vote;
    } catch (error) {
      console.error("Error fetching forum vote:", error);
      throw error;
    }
  });
}

async function getForumReactions({
  targetType,
  targetId,
}: {
  targetType: "topic" | "post";
  targetId: number;
}) {
  return withMetrics("getForumReactions", async () => {
    const { namespace } = Tenant.current();
    const dao_slug = TenantSlugFactory.create(namespace);

    try {
      const reactions = await prismaWeb3Client.forumReaction.findMany({
        where: {
          dao_slug,
          targetType,
          targetId,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      return reactions;
    } catch (error) {
      console.error("Error fetching forum reactions:", error);
      throw error;
    }
  });
}

async function getForumAttachments({
  targetType,
  targetId,
}: {
  targetType: "topic" | "post";
  targetId: number;
}) {
  return withMetrics("getForumAttachments", async () => {
    const { namespace } = Tenant.current();
    const dao_slug = TenantSlugFactory.create(namespace);

    try {
      const attachments = await prismaWeb3Client.forumAttachment.findMany({
        where: {
          dao_slug,
          targetType,
          targetId,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      return attachments;
    } catch (error) {
      console.error("Error fetching forum attachments:", error);
      throw error;
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// WRITE OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════════

async function addForumCategory({
  name,
  description,
}: {
  name: string;
  description?: string;
}) {
  return withMetrics("addForumCategory", async () => {
    const { namespace } = Tenant.current();
    const dao_slug = TenantSlugFactory.create(namespace);

    try {
      const category = await prismaWeb3Client.forumCategory.create({
        data: {
          dao_slug,
          name,
          description,
        },
      });

      // Invalidate category-related caches
      revalidateTag("categories");
      revalidateTag("forum");

      return category;
    } catch (error) {
      console.error("Error creating forum category:", error);
      throw error;
    }
  });
}

async function addForumTopic({
  title,
  address,
  categoryId,
}: {
  title: string;
  address: string;
  categoryId: number;
}) {
  return withMetrics("addForumTopic", async () => {
    const { namespace } = Tenant.current();
    const dao_slug = TenantSlugFactory.create(namespace);

    try {
      const topic = await prismaWeb3Client.forumTopic.create({
        data: {
          dao_slug,
          title,
          address: address.toLowerCase(),
          categoryId,
        },
      });

      // Invalidate topic-related caches
      revalidateTag("topics");
      revalidateTag("categories"); // Category may show topic counts
      revalidateTag("forum");

      return topic;
    } catch (error) {
      console.error("Error creating forum topic:", error);
      throw error;
    }
  });
}

async function addForumPost({
  topicId,
  address,
  content,
  parentId,
}: {
  topicId: number;
  address: string;
  content: string;
  parentId?: number;
}) {
  return withMetrics("addForumPost", async () => {
    const { namespace } = Tenant.current();
    const dao_slug = TenantSlugFactory.create(namespace);

    try {
      const post = await prismaWeb3Client.forumPost.create({
        data: {
          dao_slug,
          topicId,
          address: address.toLowerCase(),
          content,
          parentPostId: parentId,
        },
      });

      // Invalidate post-related caches
      revalidateTag("posts");
      revalidateTag("topics"); // Topic shows post counts and latest posts
      revalidateTag("topic"); // Individual topic includes posts
      revalidateTag("forum");

      return post;
    } catch (error) {
      console.error("Error creating forum post:", error);
      throw error;
    }
  });
}

async function setForumVote({
  address,
  targetType,
  targetId,
  vote,
}: {
  address: string;
  targetType: "topic" | "post";
  targetId: number;
  vote: number;
}) {
  return withMetrics("setForumVote", async () => {
    const { namespace } = Tenant.current();
    const dao_slug = TenantSlugFactory.create(namespace);

    try {
      const result = await prismaWeb3Client.forumVote.upsert({
        where: {
          dao_slug_address_targetType_targetId: {
            dao_slug,
            address: address.toLowerCase(),
            targetType,
            targetId,
          },
        },
        create: {
          dao_slug,
          address: address.toLowerCase(),
          targetType,
          targetId,
          vote,
        },
        update: { vote },
      });

      // Update topic/post counts based on target type
      if (targetType === "topic") {
        await prismaWeb3Client.forumTopic.update({
          where: { id: targetId },
          data: {
            upvotesCount: { increment: vote === 1 ? 1 : vote === -1 ? -1 : 0 },
          },
        });
      } else if (targetType === "post") {
        await prismaWeb3Client.forumPost.update({
          where: { id: targetId },
          data: {
            upvotesCount: { increment: vote === 1 ? 1 : vote === -1 ? -1 : 0 },
          },
        });
      }

      // Invalidate vote-related caches
      revalidateTag("vote");
      revalidateTag("votes");
      if (targetType === "topic") {
        revalidateTag("topic");
        revalidateTag("topics");
      } else {
        revalidateTag("post");
        revalidateTag("posts");
      }
      revalidateTag("forum");

      return result;
    } catch (error) {
      console.error("Error setting forum vote:", error);
      throw error;
    }
  });
}

async function addForumReaction({
  address,
  targetType,
  targetId,
  emoji,
}: {
  address: string;
  targetType: "topic" | "post";
  targetId: number;
  emoji: string;
}) {
  return withMetrics("addForumReaction", async () => {
    const { namespace } = Tenant.current();
    const dao_slug = TenantSlugFactory.create(namespace);

    try {
      const reaction = await prismaWeb3Client.forumReaction.create({
        data: {
          dao_slug,
          address: address.toLowerCase(),
          targetType,
          targetId,
          emoji,
        },
      });

      // Update reaction counts
      if (targetType === "topic") {
        await prismaWeb3Client.forumTopic.update({
          where: { id: targetId },
          data: {
            reactionsCount: { increment: 1 },
          },
        });
      } else if (targetType === "post") {
        await prismaWeb3Client.forumPost.update({
          where: { id: targetId },
          data: {
            reactionsCount: { increment: 1 },
          },
        });
      }

      // Invalidate reaction-related caches
      revalidateTag("reactions");
      if (targetType === "topic") {
        revalidateTag("topic");
        revalidateTag("topics");
      } else {
        revalidateTag("post");
        revalidateTag("posts");
      }
      revalidateTag("forum");

      return reaction;
    } catch (error) {
      console.error("Error creating forum reaction:", error);
      throw error;
    }
  });
}

async function removeForumReaction({
  address,
  targetType,
  targetId,
  emoji,
}: {
  address: string;
  targetType: "topic" | "post";
  targetId: number;
  emoji: string;
}) {
  return withMetrics("removeForumReaction", async () => {
    const { namespace } = Tenant.current();
    const dao_slug = TenantSlugFactory.create(namespace);

    try {
      const result = await prismaWeb3Client.forumReaction.delete({
        where: {
          dao_slug_address_targetType_targetId_emoji: {
            dao_slug,
            address: address.toLowerCase(),
            targetType,
            targetId,
            emoji,
          },
        },
      });

      // Update reaction counts
      if (targetType === "topic") {
        await prismaWeb3Client.forumTopic.update({
          where: { id: targetId },
          data: {
            reactionsCount: { decrement: 1 },
          },
        });
      } else if (targetType === "post") {
        await prismaWeb3Client.forumPost.update({
          where: { id: targetId },
          data: {
            reactionsCount: { decrement: 1 },
          },
        });
      }

      // Invalidate reaction-related caches
      revalidateTag("reactions");
      if (targetType === "topic") {
        revalidateTag("topic");
        revalidateTag("topics");
      } else {
        revalidateTag("post");
        revalidateTag("posts");
      }
      revalidateTag("forum");

      return result;
    } catch (error) {
      console.error("Error removing forum reaction:", error);
      throw error;
    }
  });
}

async function addForumAttachment({
  address,
  targetType,
  targetId,
  ipfsCid,
  fileName,
  contentType,
  fileSize,
}: {
  address: string;
  targetType: "topic" | "post";
  targetId: number;
  ipfsCid: string;
  fileName: string;
  contentType: string;
  fileSize: number;
}) {
  return withMetrics("addForumAttachment", async () => {
    const { namespace } = Tenant.current();
    const dao_slug = TenantSlugFactory.create(namespace);

    try {
      const attachment = await prismaWeb3Client.forumAttachment.create({
        data: {
          dao_slug,
          address: address.toLowerCase(),
          targetType,
          targetId,
          ipfsCid,
          fileName,
          contentType,
          fileSize: BigInt(fileSize),
        },
      });

      // Invalidate attachment-related caches
      revalidateTag("attachments");
      if (targetType === "topic") {
        revalidateTag("topic");
        revalidateTag("topics");
      } else {
        revalidateTag("post");
        revalidateTag("posts");
      }
      revalidateTag("forum");

      return attachment;
    } catch (error) {
      console.error("Error creating forum attachment:", error);
      throw error;
    }
  });
}

export const fetchForumCategories = unstable_cache(
  getForumCategories,
  ["forum-categories"],
  {
    revalidate: 600, // 10 minutes
    tags: ["forum", "categories"],
  }
);

export const fetchForumCategory = unstable_cache(
  getForumCategory,
  ["forum-category"],
  {
    revalidate: 300, // 5 minutes
    tags: ["forum", "category"],
  }
);

export const fetchForumTopics = unstable_cache(
  getForumTopics,
  ["forum-topics"],
  {
    revalidate: 300, // 5 minutes
    tags: ["forum", "topics"],
  }
);

export const fetchForumTopic = unstable_cache(getForumTopic, ["forum-topic"], {
  revalidate: 180, // 3 minutes
  tags: ["forum", "topic"],
});

export const fetchForumPosts = unstable_cache(getForumPosts, ["forum-posts"], {
  revalidate: 120, // 2 minutes
  tags: ["forum", "posts"],
});

export const fetchForumPost = unstable_cache(getForumPost, ["forum-post"], {
  revalidate: 180, // 3 minutes
  tags: ["forum", "post"],
});

export const fetchForumVote = unstable_cache(getForumVote, ["forum-vote"], {
  revalidate: 60, // 1 minute
  tags: ["forum", "vote"],
});

export const fetchForumReactions = unstable_cache(
  getForumReactions,
  ["forum-reactions"],
  {
    revalidate: 60, // 1 minute
    tags: ["forum", "reactions"],
  }
);

export const fetchForumAttachments = unstable_cache(
  getForumAttachments,
  ["forum-attachments"],
  {
    revalidate: 300, // 5 minutes
    tags: ["forum", "attachments"],
  }
);

export {
  addForumCategory,
  addForumTopic,
  addForumPost,
  setForumVote,
  addForumReaction,
  removeForumReaction,
  addForumAttachment,
};
