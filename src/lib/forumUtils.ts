export interface ForumAttachment {
  id: number;
  fileName: string;
  contentType: string;
  fileSize: number;
  ipfsCid: string;
  url: string;
  createdAt: string;
  uploadedBy?: string;
  revealTime?: string | null;
  expirationTime?: string | null;
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
  reactionsByEmoji?: Record<string, string[]>;
}

export interface ForumCategory {
  id: number;
  name: string;
  description?: string | null;
  archived: boolean;
  adminOnlyTopics: boolean;
  createdAt: string;
  updatedAt: string;
  isDuna?: boolean;
  topicsCount?: number;
}

export interface TransformForumTopicsOptions {
  mergePostAttachments?: boolean;
}

/**
 * Normalize a forum topic title into a URL-safe slug suitable for SEO-friendly paths.
 */
export function slugifyForumTopicTitle(title: string): string {
  if (!title) return "";

  const normalized = title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  return normalized
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .trim();
}

export function buildForumTopicSlug(title?: string | null): string {
  return slugifyForumTopicTitle(title || "");
}

export function buildForumTopicPath(id: number, title?: string | null): string {
  const numericId = Number(id);
  const slug = buildForumTopicSlug(title);
  if (!Number.isFinite(numericId)) {
    return "/forums";
  }
  return slug
    ? `/forums/${Math.abs(Math.trunc(numericId))}/${slug}`
    : `/forums/${Math.abs(Math.trunc(numericId))}`;
}

export function buildForumCategoryPath(
  id: number,
  title?: string | null
): string {
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) {
    return "/forums";
  }
  const safeId = Math.abs(Math.trunc(numericId));
  const slug = buildForumTopicSlug(title);
  return slug
    ? `/forums/category/${safeId}/${slug}`
    : `/forums/category/${safeId}`;
}

export function extractForumTopicId(
  raw: string | string[] | undefined
): number | null {
  if (!raw) return null;
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return null;
  const match = value.match(/^\d+/);
  if (!match) return null;
  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? parsed : null;
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
        reactionsByEmoji: post.reactionsByEmoji,
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
