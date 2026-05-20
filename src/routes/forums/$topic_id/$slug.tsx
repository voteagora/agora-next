/*
 * TanStack Start port of src/app/forums/[topic_id]/[[...slug]]/page.tsx.
 * URL: /forums/:topic_id/:slug
 */

import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

import Tenant from "@/lib/tenant/tenant";
import { TENANT_NAMESPACES } from "@/lib/constants";
import {
  transformForumTopics,
  buildForumTopicSlug,
  type ForumPost,
} from "@/lib/forumUtils";
import { truncateAddress } from "@/lib/utils/text";
import { hasMarkdownHeadings } from "@/app/forums/[topic_id]/components/markdownHeadings";
import ForumsHeader from "@/app/forums/components/ForumsHeader";
import ForumsSidebar from "@/app/forums/ForumsSidebar";
import TopicHeader from "@/app/forums/[topic_id]/components/TopicHeader";
import PostAttachments from "@/app/forums/[topic_id]/components/PostAttachments";
import EmojiReactions from "@/components/Forum/EmojiReactions";
import ForumThread from "@/app/forums/[topic_id]/components/ForumThread";
import UnpublishedTopicGate from "@/app/forums/[topic_id]/components/UnpublishedTopicGate";
import FinancialStatementLayout from "@/app/forums/[topic_id]/components/FinancialStatementLayout";
import ForumDiscussAction from "@/app/forums/[topic_id]/components/ForumDiscussAction";
import { DunaContentRenderer } from "@/components/duna-editor";
import { formatRelative } from "@/components/ForumShared/utils";
import RelatedProposalLinks from "@/components/Proposals/ProposalPage/RelatedProposalLinks/RelatedProposalLinks";

const serverLoadForumTopic = createServerFn({ method: "GET" })
  .inputValidator((data: { topicIdParam: string; slug?: string }) => data)
  .handler(async ({ data }) => {
    const {
      getForumTopic,
      getForumCategories,
      getForumTopicsCount,
      getUncategorizedTopicsCount,
    } = await import("@/lib/actions/forum");
    const { getForumAdmins } = await import("@/lib/actions/forum/admin");
    const { hasUnpublishedTopicAccess } = await import(
      "@/server/forum/unpublishedTopic"
    );

    const topicId = Number(data.topicIdParam);
    if (!Number.isFinite(topicId)) {
      return { redirectTo: "/forums" as const };
    }

    const [
      topicResult,
      adminsResult,
      categoriesResult,
      topicsCountResult,
      uncategorizedCountResult,
    ] = await Promise.all([
      getForumTopic(topicId),
      getForumAdmins(),
      getForumCategories(),
      getForumTopicsCount(),
      getUncategorizedTopicsCount(),
    ]);

    if (!topicResult?.success || !topicResult.data) {
      return { redirectTo: "/forums" as const };
    }

    const transformedTopics = transformForumTopics([topicResult.data]);
    const transformed = transformedTopics[0];
    if (!transformed) {
      return { redirectTo: "/forums" as const };
    }

    const canonicalSlug = buildForumTopicSlug(transformed.title);
    if (
      (canonicalSlug && data.slug !== canonicalSlug) ||
      (!canonicalSlug && data.slug)
    ) {
      return {
        redirectTo: (canonicalSlug
          ? `/forums/${topicId}/${canonicalSlug}`
          : `/forums/${topicId}`) as string,
      };
    }

    const topicData = topicResult.data;

    const revealTime = topicData.revealTime
      ? new Date(topicData.revealTime)
      : null;
    const isUnpublished =
      revealTime !== null && revealTime.getTime() > Date.now();
    const canAccessUnpublished = isUnpublished
      ? await hasUnpublishedTopicAccess()
      : true;

    const adminRolesMap = adminsResult?.success
      ? adminsResult.data.reduce(
          (map: Map<string, string | null>, admin: any) => {
            const addr = (admin.address || "").toLowerCase();
            if (addr) map.set(addr, admin.role ?? null);
            return map;
          },
          new Map<string, string | null>()
        )
      : new Map<string, string | null>();

    const adminDirectory = Array.from(adminRolesMap.entries()).map(
      ([address, role]) => ({ address, role })
    );

    const authorAddress = transformed.author || "";
    const normalizedAuthor = authorAddress.toLowerCase();
    const authorRole = adminRolesMap.get(normalizedAuthor) || null;
    const isAuthorAdmin = normalizedAuthor
      ? adminRolesMap.has(normalizedAuthor)
      : false;

    const createdAtIso = new Date(topicData.createdAt).toISOString();
    const categoryName = topicData.category?.name || null;
    const categoryId: number | null = topicData.category?.id ?? null;
    const comments = transformed.comments as ForumPost[];
    const topicBody = transformed.content || "";

    const headerTopic = {
      id: transformed.id,
      title: transformed.title,
      address: authorAddress,
      authorName: truncateAddress(authorAddress) || authorAddress,
      createdAt: createdAtIso,
      revealTime: transformed.revealTime ?? null,
      adminRole: authorRole,
    };

    const rootPost = topicData.posts?.[0];
    const rootAttachments: any[] = rootPost?.attachments || [];
    const rootPostId: number | undefined = rootPost?.id ?? undefined;
    const isFinancialStatement = topicData.isFinancialStatement ?? false;
    const showTocSidebar =
      isFinancialStatement && hasMarkdownHeadings(topicBody);
    const pdfAttachment = rootAttachments.find(
      (att: any) => att.contentType === "application/pdf"
    );
    const pdfUrl: string | null = pdfAttachment?.url ?? null;
    const lastActivityAt =
      comments[comments.length - 1]?.createdAt || createdAtIso;
    const topicReactionsByEmoji = topicData.topicReactionsByEmoji || {};

    const breadcrumbs = [
      { label: "Discussions", href: "/forums" },
      ...(categoryName && categoryId
        ? [{ label: categoryName, href: `/forums/category/${categoryId}` }]
        : []),
    ];

    const categories = categoriesResult.success
      ? categoriesResult.data.map((cat: any) => ({
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

    const totalTopicsCount = topicsCountResult.success
      ? topicsCountResult.data
      : 0;
    const uncategorizedCount = uncategorizedCountResult.success
      ? uncategorizedCountResult.data
      : 0;

    const { namespace, brandName } = Tenant.current();
    const isOnArticlePage = namespace === TENANT_NAMESPACES.UNISWAP;
    const showDiscussButton = isFinancialStatement && !isOnArticlePage;

    const metaSuffix = ` | ${brandName} Forum`;
    const availableLen = Math.max(20, 60 - metaSuffix.length);
    const metaTitle =
      transformed.title.length <= availableLen
        ? `${transformed.title}${metaSuffix}`
        : `${transformed.title.slice(0, availableLen - 3)}...${metaSuffix}`;

    return {
      topicId,
      topicTitle: transformed.title,
      topicBody,
      authorAddress,
      createdAtIso,
      categoryName,
      categoryId,
      adminDirectory,
      isAuthorAdmin,
      headerTopic,
      rootAttachments,
      rootPostId,
      isFinancialStatement,
      showTocSidebar,
      pdfUrl,
      lastActivityAt,
      topicReactionsByEmoji,
      breadcrumbs,
      categories,
      totalTopicsCount,
      uncategorizedCount,
      isUnpublished,
      canAccessUnpublished,
      isOnArticlePage,
      showDiscussButton,
      comments,
      metaTitle,
      metaDescription: transformed.title,
    };
  });

export const Route = createFileRoute("/forums/$topic_id/$slug")({
  validateSearch: (search: Record<string, unknown>) => ({
    post: (search.post as string) ?? undefined,
  }),
  beforeLoad: () => {
    const { ui } = Tenant.current();
    if (!ui.toggle("forums")?.enabled) {
      throw redirect({ to: "/" });
    }
  },
  head: ({ loaderData }) => {
    const d = loaderData as
      | { metaTitle?: string; metaDescription?: string }
      | undefined;
    return {
      meta: [
        { title: d?.metaTitle ?? "Forum Topic" },
        { name: "description", content: d?.metaDescription ?? "" },
      ],
    };
  },
  loader: async ({ params }) => {
    const data = await serverLoadForumTopic({
      data: { topicIdParam: params.topic_id, slug: params.slug },
    });
    if ("redirectTo" in data) {
      throw redirect({ to: data.redirectTo });
    }
    return data;
  },
  component: function ForumTopicPage() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = Route.useLoaderData() as any;
    if (!data) return null;
    const {
      topicId,
      topicTitle,
      topicBody,
      authorAddress,
      categoryName,
      categoryId,
      adminDirectory,
      isAuthorAdmin,
      headerTopic,
      rootAttachments,
      rootPostId,
      isFinancialStatement,
      showTocSidebar,
      pdfUrl,
      lastActivityAt,
      topicReactionsByEmoji,
      breadcrumbs,
      categories,
      totalTopicsCount,
      uncategorizedCount,
      isUnpublished,
      canAccessUnpublished,
      isOnArticlePage,
      showDiscussButton,
      comments,
    } = data;

    if (isUnpublished && !canAccessUnpublished) {
      return (
        <div className="min-h-screen">
          <ForumsHeader
            breadcrumbs={[{ label: "Discussions", href: "/forums" }]}
            isDuna={false}
            showSearch={false}
          />
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <UnpublishedTopicGate
              redirectPath={`/forums/${topicId}/${buildForumTopicSlug(topicTitle)}`}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen">
        <ForumsHeader
          breadcrumbs={breadcrumbs}
          isDuna={categoryName === "DUNA"}
          showSearch={false}
          headerActions={showDiscussButton ? <ForumDiscussAction /> : undefined}
          topicContext={{
            id: headerTopic.id,
            title: headerTopic.title,
            content: topicBody,
            createdAt: headerTopic.createdAt,
            commentsCount: comments.length,
          }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            <div
              className={`flex-1 min-w-0 max-w-full ${
                isFinancialStatement
                  ? "lg:max-w-5xl xl:max-w-6xl"
                  : "lg:max-w-4xl"
              }`}
            >
              {isFinancialStatement ? (
                <FinancialStatementLayout
                  topicId={topicId}
                  title={topicTitle}
                  content={topicBody}
                  pdfUrl={pdfUrl}
                  isOnArticlePage={isOnArticlePage}
                  hideInlineDiscussButton={showDiscussButton}
                >
                  <ForumThread
                    topicId={topicId}
                    initialComments={comments}
                    categoryId={categoryId}
                    adminDirectory={adminDirectory}
                  />
                </FinancialStatementLayout>
              ) : (
                <>
                  <TopicHeader
                    topic={headerTopic as never}
                    isAdmin={isAuthorAdmin}
                  />

                  <div className="mt-2 mb-4 break-words">
                    <DunaContentRenderer
                      content={topicBody}
                      className="text-sm leading-relaxed break-words"
                    />
                  </div>

                  {rootAttachments.length > 0 && (
                    <PostAttachments
                      attachments={rootAttachments}
                      postId={rootPostId}
                      postAuthor={authorAddress}
                      categoryId={categoryId}
                    />
                  )}

                  <div className="my-4">
                    <RelatedProposalLinks proposalId={topicId.toString()} />
                  </div>

                  <div className="flex flex-wrap items-center gap-3 lg:gap-6 text-xs font-semibold text-tertiary border-b pb-2">
                    {rootPostId && (
                      <div>
                        <EmojiReactions
                          targetType="post"
                          targetId={rootPostId}
                          initialByEmoji={topicReactionsByEmoji}
                        />
                      </div>
                    )}
                    <div>Last activity {formatRelative(lastActivityAt)}</div>
                    <div>{comments.length} comments</div>
                    {categoryName && (
                      <span className="pr-4 py-1 bg-neutral-50 rounded-full text-neutral-700">
                        {categoryName}
                      </span>
                    )}
                  </div>

                  <div className="mt-8">
                    <ForumThread
                      topicId={topicId}
                      initialComments={comments}
                      categoryId={categoryId}
                      adminDirectory={adminDirectory}
                    />
                  </div>
                </>
              )}
            </div>

            {!showTocSidebar && (
              <div className="w-full lg:w-72 xl:w-64 lg:ml-auto flex-shrink-0">
                <ForumsSidebar
                  categories={categories}
                  selectedCategoryId={categoryId}
                  totalTopicsCount={totalTopicsCount}
                  uncategorizedCount={uncategorizedCount}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
});
