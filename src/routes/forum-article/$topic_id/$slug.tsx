/*
 * TanStack Start port of src/app/forum-article/[topic_id]/[[...slug]]/page.tsx.
 * URL: /forum-article/:topic_id/:slug
 */

import { createFileRoute, redirect } from "@tanstack/react-router";

import Tenant from "@/lib/tenant/tenant";
import {
  transformForumTopics,
  buildForumTopicSlug,
  buildForumArticlePath,
} from "@/lib/forumUtils";
import UnpublishedTopicGate from "@/components/Forum/topic/UnpublishedTopicGate";
import FinancialStatementLayout from "@/components/Forum/topic/FinancialStatementLayout";
import { getForumTopic } from "@/server/forum/actions";
import { hasUnpublishedTopicAccess } from "@/server/forum/unpublishedTopic";

export const Route = createFileRoute("/forum-article/$topic_id/$slug")({
  head: ({ loaderData }) => {
    const d = loaderData as { metaTitle?: string } | undefined;
    return {
      meta: [
        { title: d?.metaTitle ?? "Forum Article" },
        { name: "description", content: " " },
      ],
    };
  },
  loader: async ({ params }) => {
    const topicId = Number(params.topic_id);
    if (!Number.isFinite(topicId)) {
      throw redirect({ to: "/forums" });
    }

    const result = await getForumTopic(topicId);
    if (!result?.success || !result.data) {
      throw redirect({ to: "/forums" });
    }

    const transformedTopics = transformForumTopics([result.data]);
    const transformed = transformedTopics[0];
    if (!transformed) {
      throw redirect({ to: "/forums" });
    }

    // Canonicalize slug
    const canonicalSlug = buildForumTopicSlug(transformed.title);
    if (
      (canonicalSlug && params.slug !== canonicalSlug) ||
      (!canonicalSlug && params.slug)
    ) {
      throw redirect({
        to: (canonicalSlug
          ? `/forum-article/${topicId}/${canonicalSlug}`
          : `/forum-article/${topicId}`) as string,
      });
    }

    const topicData = result.data;

    // Non-financial statements redirect to the forum topic page
    const isFinancialStatement =
      (topicData as any).isFinancialStatement ?? false;
    if (!isFinancialStatement) {
      throw redirect({
        to: (canonicalSlug
          ? `/forums/${topicId}/${canonicalSlug}`
          : `/forums/${topicId}`) as string,
      });
    }

    const revealTime = topicData.revealTime
      ? new Date(topicData.revealTime)
      : null;
    const isUnpublished =
      revealTime !== null && revealTime.getTime() > Date.now();
    const canAccessUnpublished = isUnpublished
      ? await hasUnpublishedTopicAccess()
      : true;

    const topicBody = transformed.content || "";
    const rootPost = (topicData as any).posts?.[0];
    const rootAttachments: any[] = rootPost?.attachments || [];
    const pdfAttachment = rootAttachments.find(
      (att: any) => att.contentType === "application/pdf"
    );
    const pdfUrl: string | null = pdfAttachment?.url ?? null;

    const { brandName } = Tenant.current();
    const metaSuffix = ` | ${brandName}`;
    const maxTitleLen = 60 - metaSuffix.length;
    const metaTitle =
      transformed.title.length <= maxTitleLen
        ? `${transformed.title}${metaSuffix}`
        : `${transformed.title.slice(0, maxTitleLen - 3)}...${metaSuffix}`;

    return {
      topicId,
      topicTitle: transformed.title,
      topicBody,
      pdfUrl,
      isUnpublished,
      canAccessUnpublished,
      metaTitle,
      canonicalSlug,
    };
  },
  component: function ForumArticlePage() {
    const loaderData = Route.useLoaderData();
    if (!loaderData) return null;
    const {
      topicId,
      topicTitle,
      topicBody,
      pdfUrl,
      isUnpublished,
      canAccessUnpublished,
      canonicalSlug,
    } = loaderData;

    if (isUnpublished && !canAccessUnpublished) {
      return (
        <div className="min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8">
            <UnpublishedTopicGate
              redirectPath={buildForumArticlePath(topicId, topicTitle)}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8">
          <FinancialStatementLayout
            topicId={topicId}
            title={topicTitle}
            content={topicBody}
            pdfUrl={pdfUrl}
            isOnArticlePage={true}
          />
        </div>
      </div>
    );
  },
});
