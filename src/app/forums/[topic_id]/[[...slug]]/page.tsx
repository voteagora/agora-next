import React from "react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import TopicHeader from "../components/TopicHeader";
import PostAttachments from "../components/PostAttachments";
import EmojiReactions from "@/components/Forum/EmojiReactions";
import ForumThread from "../components/ForumThread";
import { getForumCategories, getForumTopic } from "@/lib/actions/forum";
import { truncateAddress } from "@/app/lib/utils/text";
import ForumsSidebar from "../../ForumsSidebar";
import ForumsHeader from "../../components/ForumsHeader";
import {
  transformForumTopics,
  buildForumTopicPath,
  buildForumTopicSlug,
  type ForumTopic,
} from "@/lib/forumUtils";
import { DunaContentRenderer } from "@/components/duna-editor";
import { formatRelative } from "@/components/ForumShared/utils";
import { stripHtmlToText } from "../../stripHtml";
import Tenant from "@/lib/tenant/tenant";
import { getForumAdmins } from "@/lib/actions/forum/admin";
import RelatedProposalLinks from "@/components/Proposals/ProposalPage/RelatedProposalLinks/RelatedProposalLinks";

// Force dynamic rendering - forum topics and posts change frequently
export const dynamic = "force-dynamic";

interface PageProps {
  params: {
    topic_id: string;
    slug?: string[];
  };
}

type TopicBundle = {
  topicId: number;
  topicData: any;
  transformed: ForumTopic;
};

function getRequestBaseUrl(): string {
  const headerList = headers();
  const forwardedHost = headerList.get("x-forwarded-host");
  const host = forwardedHost || headerList.get("host") || "localhost:3000";
  const protoHeader = headerList.get("x-forwarded-proto");
  const protocol =
    protoHeader || (host && host.startsWith("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}

function truncateForMeta(value: string, maxLength = 160): string {
  if (!value) return "";
  if (value.length <= maxLength) return value;
  const trimmed = value.slice(0, maxLength);
  const lastSpace = trimmed.lastIndexOf(" ");
  const safe = lastSpace > 50 ? trimmed.slice(0, lastSpace) : trimmed;
  return `${safe.trim()}...`;
}

async function loadTopic(topicIdParam: string): Promise<TopicBundle | null> {
  const topicId = Number(topicIdParam);
  if (!Number.isFinite(topicId)) {
    return null;
  }

  const result = await getForumTopic(topicId);
  if (!result?.success || !result.data) {
    return null;
  }

  const transformedTopics = transformForumTopics([result.data]);
  const transformed = transformedTopics[0];
  if (!transformed) {
    return null;
  }

  return {
    topicId,
    topicData: result.data,
    transformed,
  };
}

function buildDescription(content: string, title: string): string {
  const plain = stripHtmlToText(content);
  if (plain) {
    return truncateForMeta(plain);
  }
  return truncateForMeta(`Discussion: ${title}`);
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const topicBundle = await loadTopic(params.topic_id);
  if (!topicBundle) {
    return {};
  }

  const { topicId, topicData, transformed } = topicBundle;
  const baseUrl = getRequestBaseUrl();
  const canonicalPath = buildForumTopicPath(topicId, transformed.title);
  const canonicalUrl = `${baseUrl}${canonicalPath}`;
  const description = buildDescription(
    transformed.content || "",
    transformed.title
  );
  const tenant = Tenant.current();
  const brandName = tenant.brandName || "Agora";
  const metaTitle = `${transformed.title} | ${brandName} Forum`;
  const createdAt = new Date(topicData.createdAt).toISOString();
  const updatedAt = topicData.updatedAt
    ? new Date(topicData.updatedAt).toISOString()
    : createdAt;
  const authorAddress = transformed.author;

  return {
    title: metaTitle,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "article",
      url: canonicalUrl,
      title: metaTitle,
      description,
      siteName: `${brandName} Forum`,
      publishedTime: createdAt,
      modifiedTime: updatedAt,
      authors: authorAddress ? [authorAddress] : undefined,
    },
    twitter: {
      card: "summary",
      title: metaTitle,
      description,
    },
  };
}

export default async function ForumTopicPage({ params }: PageProps) {
  const [topicBundle, adminsResult, categoriesResult] = await Promise.all([
    loadTopic(params.topic_id),
    getForumAdmins(),
    getForumCategories(),
  ]);
  if (!topicBundle) {
    return notFound();
  }

  const { topicId, topicData, transformed } = topicBundle;
  const canonicalSlug = buildForumTopicSlug(transformed.title);
  const slugParam = params.slug?.[0] ?? "";

  if (
    (canonicalSlug && slugParam !== canonicalSlug) ||
    (!canonicalSlug && slugParam)
  ) {
    redirect(buildForumTopicPath(topicId, transformed.title));
  }

  if ((params.slug?.length ?? 0) > 1) {
    redirect(buildForumTopicPath(topicId, transformed.title));
  }

  const comments = transformed.comments;
  const topicBody = transformed.content || "";
  const authorAddress = transformed.author || "";
  const createdAtIso = new Date(topicData.createdAt).toISOString();
  const categoryName = topicData.category?.name || null;

  const adminRolesMap = adminsResult?.success
    ? adminsResult.data.reduce((map, admin) => {
        const normalizedAddress = (admin.address || "").toLowerCase();
        if (!normalizedAddress) {
          return map;
        }
        map.set(normalizedAddress, admin.role ?? null);
        return map;
      }, new Map<string, string | null>())
    : new Map<string, string | null>();

  const adminDirectory = Array.from(adminRolesMap.entries()).map(
    ([address, role]) => ({
      address,
      role,
    })
  );
  const normalizedAuthor = authorAddress.toLowerCase();
  const authorRole = adminRolesMap.get(normalizedAuthor) || null;
  const isAuthorAdmin = normalizedAuthor
    ? adminRolesMap.has(normalizedAuthor)
    : false;

  const headerTopic = {
    id: transformed.id,
    title: transformed.title,
    address: authorAddress,
    authorName: truncateAddress(authorAddress) || authorAddress,
    createdAt: createdAtIso,
    adminRole: authorRole,
  };

  const rootPost = topicData.posts?.[0];
  const rootAttachments = (rootPost?.attachments as any[]) || [];

  const lastActivityAt =
    comments[comments.length - 1]?.createdAt || createdAtIso;
  const labelName = categoryName ?? undefined;
  const topicReactionsByEmoji = topicData.topicReactionsByEmoji || {};
  const rootPostId = rootPost?.id ?? undefined;
  const categoryId = topicData.category?.id ?? null;
  const breadcrumbs = [
    { label: "Discussions", href: "/forums" },
    ...(categoryName && categoryId
      ? [{ label: categoryName, href: `/forums/category/${categoryId}` }]
      : []),
  ];

  const categories = categoriesResult.success
    ? categoriesResult.data.map((cat) => ({
        id: cat.id,
        name: cat.name,
        description: cat.description,
        archived: cat.archived,
        adminOnlyTopics: cat.adminOnlyTopics,
        createdAt: cat.createdAt.toISOString(),
        updatedAt: cat.updatedAt.toISOString(),
        topicsCount: cat.topicsCount,
      }))
    : [];

  return (
    <div className="min-h-screen">
      <ForumsHeader
        breadcrumbs={breadcrumbs}
        isDuna={categoryName === "DUNA"}
        topicContext={{
          id: headerTopic.id,
          title: headerTopic.title,
          content: topicBody,
          createdAt: headerTopic.createdAt,
          commentsCount: comments.length,
        }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-0">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="flex-1 min-w-0 max-w-full lg:max-w-4xl">
            <TopicHeader topic={headerTopic} isAdmin={isAuthorAdmin} />

            <div className="mt-2 mb-4 break-words">
              <DunaContentRenderer
                content={topicBody}
                className="text-secondary text-sm leading-relaxed break-words"
              />
            </div>

            {rootAttachments.length > 0 && (
              <PostAttachments
                attachments={rootAttachments}
                postId={rootPost?.id}
                postAuthor={authorAddress}
                categoryId={categoryId}
              />
            )}

            <div className="my-4">
              <RelatedProposalLinks proposalId={topicId.toString()} />
            </div>

            <div className="flex flex-wrap items-center gap-3 lg:gap-6 text-xs font-semibold text-tertiary border-b pb-2">
              {rootPostId && (
                <div className="">
                  <EmojiReactions
                    targetType="post"
                    targetId={rootPostId}
                    initialByEmoji={topicReactionsByEmoji}
                  />
                </div>
              )}
              <div className="">
                Last activity {formatRelative(lastActivityAt)}
              </div>
              <div className="">{comments.length} comments</div>
              {labelName && (
                <span className=" pr-4 py-1 bg-neutral-50 rounded-full text-neutral-700">
                  {labelName}
                </span>
              )}
            </div>

            {/* Replies Section */}
            <div className="mt-8">
              <ForumThread
                topicId={topicId}
                initialComments={comments}
                categoryId={categoryId}
                adminDirectory={adminDirectory}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-auto">
            <ForumsSidebar
              categories={categories}
              latestPost={topicData}
              selectedCategoryId={categoryId}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
