"use server";

import { forumSearchService, ForumDocument } from "@/lib/search";

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
  try {
    const document: ForumDocument = {
      id: `${daoSlug}_topic_${topicId}`,
      contentType: "topic",
      topicId: topicId,
      daoSlug: daoSlug,
      title: title,
      content: content,
      author: author,
      categoryId: categoryId,
      createdAt: createdAt ? createdAt.getTime() : Date.now(),
    };

    await forumSearchService.indexDocument(document);
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
    const document: ForumDocument = {
      id: `${daoSlug}_post_${postId}`,
      contentType: "post",
      postId: postId,
      daoSlug: daoSlug,
      title: `Re: ${topicTitle}`,
      topicId: topicId,
      topicTitle: topicTitle,
      content: content,
      author: author,
      parentPostId: parentPostId,
      createdAt: createdAt ? createdAt.getTime() : Date.now(),
    };

    await forumSearchService.indexDocument(document);
  } catch (error) {
    console.error("Error indexing forum post:", error);
  }
}

export async function removeForumTopicFromIndex(
  topicId: number,
  daoSlug: string
): Promise<void> {
  await forumSearchService.deleteDocument({
    id: `${daoSlug}_topic_${topicId}`,
    daoSlug,
  });
}

export async function removeForumPostFromIndex(
  postId: number,
  daoSlug: string
): Promise<void> {
  await forumSearchService.deleteDocument({
    id: `${daoSlug}_post_${postId}`,
    daoSlug,
  });
}
