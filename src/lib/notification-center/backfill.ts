import "server-only";

import { prismaWeb2Client } from "@/app/lib/prisma";
import type { DaoSlug } from "@prisma/client";

export interface UserForumEngagement {
  authored_topics: number[];
  engaged_topics: number[];
}

export async function fetchUserForumEngagement(
  address: string,
  daoSlug: DaoSlug
): Promise<UserForumEngagement> {
  const [authoredTopics, engagedPosts] = await Promise.all([
    prismaWeb2Client.forumTopic.findMany({
      where: {
        dao_slug: daoSlug,
        address: { equals: address, mode: "insensitive" },
        deletedAt: null,
      },
      select: { id: true },
    }),
    prismaWeb2Client.forumPost.findMany({
      where: {
        dao_slug: daoSlug,
        address: { equals: address, mode: "insensitive" },
        deletedAt: null,
      },
      select: { topicId: true },
      distinct: ["topicId"],
    }),
  ]);

  return {
    authored_topics: authoredTopics.map((t) => t.id),
    engaged_topics: engagedPosts.map((p) => p.topicId),
  };
}
