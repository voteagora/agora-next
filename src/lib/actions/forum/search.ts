"use server";

import { forumSearchService, ForumDocument } from "@/lib/search";
import Tenant from "@/lib/tenant/tenant";

export async function indexForumTopic({
  topicId,
  daoSlug,
  title,
  content,
  author,
  categoryId,
  createdAt,
}: {
  topicId: number;
  daoSlug: string;
  title: string;
  content: string;
  author: string;
  categoryId?: number;
  createdAt?: Date;
}): Promise<void> {
  const { isProd } = Tenant.current();
  try {
    const document: ForumDocument = {
      id: `${daoSlug}_topic_${topicId}`,
      contentType: "topic",
      topicId,
      daoSlug,
      title,
      content,
      author,
      categoryId,
      createdAt: createdAt?.getTime() ?? Date.now(),
    };

    await forumSearchService.indexDocument(document, isProd);
  } catch (error) {
    console.error("Error indexing forum topic:", error);
  }
}

export async function indexForumPost({
  postId,
  daoSlug,
  content,
  author,
  topicId,
  topicTitle,
  parentPostId,
  createdAt,
}: {
  postId: number;
  daoSlug: string;
  content: string;
  author: string;
  topicId: number;
  topicTitle: string;
  parentPostId?: number;
  createdAt?: Date;
}): Promise<void> {
  try {
    const { isProd } = Tenant.current();
    const document: ForumDocument = {
      id: `${daoSlug}_post_${postId}`,
      contentType: "post",
      postId,
      daoSlug,
      title: `Re: ${topicTitle}`,
      topicId,
      topicTitle,
      content,
      author,
      parentPostId,
      createdAt: createdAt?.getTime() ?? Date.now(),
    };

    await forumSearchService.indexDocument(document, isProd);
  } catch (error) {
    console.error("Error indexing forum post:", error);
  }
}

export async function removeForumTopicFromIndex(
  topicId: number,
  daoSlug: string
): Promise<void> {
  const { isProd } = Tenant.current();
  await forumSearchService.deleteDocument({
    id: `${daoSlug}_topic_${topicId}`,
    daoSlug,
    isProd,
  });
}

export async function removeForumPostFromIndex(
  postId: number,
  daoSlug: string
): Promise<void> {
  const { isProd } = Tenant.current();
  await forumSearchService.deleteDocument({
    id: `${daoSlug}_post_${postId}`,
    daoSlug,
    isProd,
  });
}
