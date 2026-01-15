import React from "react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getForumTopic } from "@/lib/actions/forum";
import {
  transformForumTopics,
  buildForumArticlePath,
  buildForumTopicSlug,
  type ForumTopic,
} from "@/lib/forumUtils";
import { stripHtmlToText } from "@/app/forums/stripHtml";
import Tenant from "@/lib/tenant/tenant";
import FinancialStatementLayout from "@/app/forums/[topic_id]/components/FinancialStatementLayout";

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
  return `${safe}...`;
}

function truncateTitleForMeta(
  title: string,
  suffix: string,
  maxLength: number
): string {
  const maxTitleLength = maxLength - suffix.length;
  if (title.length <= maxTitleLength) {
    return `${title}${suffix}`;
  }
  return `${title.slice(0, maxTitleLength)}...${suffix}`;
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
  return truncateForMeta(`Financial Statement: ${title}`);
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
  const canonicalPath = buildForumArticlePath(topicId, transformed.title);
  const tenant = Tenant.current();
  const brandName = tenant.brandName || "Agora";

  const description = buildDescription(
    transformed.content || "",
    transformed.title
  );
  const suffix = ` | ${brandName}`;
  const metaTitle = truncateTitleForMeta(transformed.title, suffix, 60);
  const authorAddress = transformed.author;
  const createdAt = new Date(topicData.createdAt).toISOString();
  const updatedAt = topicData.updatedAt
    ? new Date(topicData.updatedAt).toISOString()
    : createdAt;

  const ogImageUrl = `${baseUrl}/api/images/og/generic?title=${encodeURIComponent(
    transformed.title
  )}&description=${encodeURIComponent(description)}`;

  return {
    title: metaTitle,
    description,
    alternates: {
      canonical: `${baseUrl}${canonicalPath}`,
    },
    openGraph: {
      type: "article",
      url: `${baseUrl}${canonicalPath}`,
      title: metaTitle,
      description,
      siteName: brandName,
      publishedTime: createdAt,
      modifiedTime: updatedAt,
      authors: authorAddress ? [authorAddress] : undefined,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: metaTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function ForumArticlePage({ params }: PageProps) {
  const topicBundle = await loadTopic(params.topic_id);
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
    redirect(buildForumArticlePath(topicId, transformed.title));
  }

  if ((params.slug?.length ?? 0) > 1) {
    redirect(buildForumArticlePath(topicId, transformed.title));
  }

  const isFinancialStatement = (topicData as any).isFinancialStatement ?? false;
  if (!isFinancialStatement) {
    redirect(`/forums/${topicId}${canonicalSlug ? `/${canonicalSlug}` : ""}`);
  }

  const topicBody = transformed.content || "";
  const rootPost = topicData.posts?.[0];
  const rootAttachments = (rootPost?.attachments as any[]) || [];
  const pdfAttachment = rootAttachments.find(
    (att: any) => att.contentType === "application/pdf"
  );
  const pdfUrl = pdfAttachment?.url ?? null;

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-0 pt-8">
        <FinancialStatementLayout
          topicId={topicId}
          title={transformed.title}
          content={topicBody}
          pdfUrl={pdfUrl}
          isOnArticlePage={true}
        />
      </div>
    </div>
  );
}
