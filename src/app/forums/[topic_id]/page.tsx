import React from "react";
import { notFound } from "next/navigation";
import TopicHeader from "./components/TopicHeader";
import PostAttachments from "./components/PostAttachments";
import EmojiReactions from "@/components/Forum/EmojiReactions";
import ForumThread from "./components/ForumThread";
import { Eye } from "lucide-react";
import { getForumTopic } from "@/lib/actions/forum";
import { getForumViewStats } from "@/lib/actions/forum/analytics";
import { truncateAddress } from "@/app/lib/utils/text";
import ForumsSidebar from "../ForumsSidebar";
import { transformForumTopics } from "@/lib/forumUtils";
import { DunaContentRenderer } from "@/components/duna-editor";
import { formatRelative } from "@/components/ForumShared/utils";

interface PageProps {
  params: {
    topic_id: string;
  };
}

export default async function ForumTopicPage({ params }: PageProps) {
  const topicId = Number(params.topic_id);
  if (!Number.isFinite(topicId)) return notFound();

  const topicResult = await getForumTopic(topicId);
  const result = topicResult;
  if (!result?.success || !result.data) {
    return notFound();
  }

  const { data: topicData } = result;
  // Use shared transformer for consistent shape
  const [t] = transformForumTopics([topicData]);
  const comments = t.comments;
  const topic = {
    id: t.id,
    title: t.title,
    address: t.author,
    createdAt:
      typeof t.createdAt === "string"
        ? t.createdAt
        : new Date(t.createdAt).toISOString(),
  };

  const topicBody = t.content || "";

  const headerTopic = {
    id: topic.id,
    title: topic.title,
    address: topic.address,
    authorName: truncateAddress(topic.address) || topic.address,
    createdAt: topic.createdAt,
  };

  const headerContent = {
    content: topicBody,
    attachments: [] as any[],
  };

  const rootPost = comments[0];
  const rootAttachments = (rootPost?.attachments as any[]) || [];

  const lastActivityAt =
    comments[comments.length - 1]?.createdAt || topic.createdAt;
  const labelName = topicData.category?.name ?? undefined;
  const topicReactionsByEmoji = topicData.topicReactionsByEmoji || {};
  const rootPostId = rootPost?.id ?? undefined;
  const categoryId = topicData.category?.id ?? null;
  // const viewStats = viewStatsResult?.success ? viewStatsResult.data : null;
  // const totalViews = viewStats?.uniqueViews ?? 0;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1 max-w-4xl">
            <TopicHeader topic={headerTopic} />

            <div className="mt-2 mb-4">
              <DunaContentRenderer
                content={headerContent.content}
                className="text-gray-700 text-sm leading-relaxed"
              />
            </div>

            {rootAttachments.length > 0 && (
              <PostAttachments
                attachments={rootAttachments}
                postId={rootPost?.id}
                postAuthor={topic.address || ""}
                categoryId={categoryId}
              />
            )}

            <div className="flex items-center gap-6 text-xs font-semibold text-tertiary border-b pb-2 items-baseline">
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
              {/* <div className="inline-flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" strokeWidth={1.7} />
                <span>{totalViews}</span>
              </div> */}
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
              />
            </div>
          </div>

          {/* Sidebar */}
          <ForumsSidebar />
        </div>
      </div>
    </div>
  );
}
