export interface ForumAttachment {
  id: number;
  fileName: string;
  contentType: string;
  fileSize: number;
  ipfsCid: string;
  url: string;
  createdAt: string;
}

export interface ForumTopic {
  id: number;
  title: string;
  author: string;
  content: string;
  createdAt: string;
  comments: ForumPost[];
  attachments: ForumAttachment[];
  deletedAt?: string | null;
  deletedBy?: string | null;
  isNsfw?: boolean;
}

export interface ForumPost {
  id: number;
  author: string;
  content: string;
  createdAt: string;
  parentId?: number;
  attachments?: ForumAttachment[];
  deletedAt?: string | null;
  deletedBy?: string | null;
  isNsfw?: boolean;
}

export interface ForumCategory {
  id: number;
  name: string;
  description?: string;
  archived: boolean;
  adminOnlyTopics: boolean;
  createdAt: string;
  updatedAt: string;
  isDuna?: boolean;
}

export interface TransformForumTopicsOptions {
  mergePostAttachments?: boolean;
}

export function transformForumTopics(
  data: any[],
  options: TransformForumTopicsOptions = {}
): ForumTopic[] {
  const { mergePostAttachments = false } = options;

  return data.map((topic: any) => {
    let attachments = topic.attachments || [];

    if (mergePostAttachments) {
      const postAttachments =
        topic.posts?.flatMap((post: any) => post.attachments || []) || [];
      attachments = [...attachments, ...postAttachments];
    }

    const comments =
      topic.posts?.slice(1).map((post: any) => ({
        id: post.id,
        author: post.address,
        content: post.content,
        createdAt: post.createdAt,
        parentId: post.parentPostId || undefined,
        attachments: post.attachments || [],
        deletedAt: post.deletedAt,
        deletedBy: post.deletedBy,
      })) || [];

    return {
      id: topic.id,
      title: topic.title,
      author: topic.address,
      content: topic.posts?.[0]?.content || "",
      createdAt: topic.createdAt,
      comments,
      attachments,
      deletedAt: topic.deletedAt,
      deletedBy: topic.deletedBy,
    };
  });
}

export function canArchiveContent(
  userAddress: string,
  contentAuthor: string,
  isAdmin: boolean,
  isModerator: boolean
): boolean {
  const isAuthor = userAddress.toLowerCase() === contentAuthor.toLowerCase();
  return isAuthor || isAdmin || isModerator;
}

export function canDeleteContent(
  userAddress: string,
  contentAuthor: string,
  isAdmin: boolean,
  isModerator: boolean
): boolean {
  const isAuthor = userAddress.toLowerCase() === contentAuthor.toLowerCase();
  return isAuthor || isAdmin || isModerator;
}
