import React from "react";
import Link from "next/link";
import ForumsSidebar from "./ForumsSidebar";
import { getForumData } from "@/lib/actions/forum/topics";
import ENSAvatar from "@/components/shared/ENSAvatar";
import { MessageCircle, Clock, ChevronUp } from "lucide-react";
import { stripHtmlToText } from "./stripHtml";
import NewTopicButton from "./components/NewTopicButton";
import { formatRelative } from "@/components/ForumShared/utils";
import { buildForumTopicPath } from "@/lib/forumUtils";
import ForumAdminBadge from "@/components/Forum/ForumAdminBadge";
import { ADMIN_TYPES } from "@/lib/constants";

interface ForumsPageContentProps {
  categoryId: number | null;
  categoryTitle?: string | null;
  description?: string | null;
}

export default async function ForumsPageContent({
  categoryId,
  categoryTitle,
  description,
}: ForumsPageContentProps) {
  const selectedCategoryId =
    typeof categoryId === "number" && Number.isFinite(categoryId)
      ? categoryId
      : null;
  const selectedCategoryTitle = categoryTitle || null;

  const result = await getForumData({
    categoryId: selectedCategoryId || undefined,
  });

  if (!result.success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Error loading forum data</p>
      </div>
    );
  }

  const { topics, admins, categories, latestPost } = result.data;

  const sortedTopics = topics.slice().sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const heading = selectedCategoryTitle || "Discussions";

  return (
    <div className="min-h-screen">
      <div className="mt-6 max-w-7xl mx-auto px-6 sm:px-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">{heading}</h1>
            {description && (
              <p className="text-sm text-gray-500">{description}</p>
            )}
          </div>
          <NewTopicButton isDuna={categoryTitle === "DUNA"} />
        </div>
      </div>
      <div className="flex gap-8 max-w-7xl mx-auto px-6 sm:px-0">
        <div className="flex-1">
          <div className="space-y-3">
            {sortedTopics.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No topics found</p>
              </div>
            ) : (
              sortedTopics.map((topic: any) => {
                const firstPost = topic.firstPost;
                const createdAt = topic.createdAt;
                const replies = Math.max((topic.postsCount || 1) - 1, 0);
                const excerpt = stripHtmlToText(firstPost?.content || "");
                const upvotes = topic.upvotes || 0;
                const authorAddress = (topic.address || "").toLowerCase();
                const adminRole = admins[authorAddress] || null;
                const isAuthorAdmin = authorAddress in admins;

                return (
                  <Link
                    key={topic.id}
                    href={buildForumTopicPath(topic.id, topic.title)}
                    className="group block bg-card border border-cardBorder rounded-lg p-3 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="flex-shrink-0 relative">
                        {/* ENS avatar based on author address */}
                        <ENSAvatar
                          ensName={topic.address}
                          className="w-[42px] h-[42px]"
                          size={42}
                        />
                        {isAuthorAdmin && (
                          <ForumAdminBadge
                            className="absolute -bottom-1 -right-1"
                            type={adminRole ? ADMIN_TYPES[adminRole] : "Admin"}
                          />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Title + Meta */}
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="text-base font-semibold text-black truncate group-hover:underline">
                            {topic.title}
                          </h3>
                          <div className="flex items-center gap-4 text-xs font-semibold text-[#6a6a6a]">
                            {/* Replies */}
                            <div className="inline-flex items-center gap-1.5">
                              <MessageCircle
                                className="w-3.5 h-3.5"
                                strokeWidth={1.7}
                              />
                              <span>{replies}</span>
                            </div>
                            {/* Time */}
                            <div className="inline-flex items-center gap-1.5">
                              <Clock
                                className="w-3.5 h-3.5"
                                strokeWidth={1.7}
                              />
                              <span>{formatRelative(createdAt)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Excerpt */}
                        {excerpt && (
                          <p className="mt-1 text-neutral-700 text-sm leading-relaxed line-clamp-1 overflow-hidden max-w-full md:max-w-[556px] break-words">
                            {excerpt}
                          </p>
                        )}
                      </div>

                      {/* Right compact stat (upvotes) */}
                      <div
                        className="flex flex-col items-center justify-center text-neutral-700 py-1 px-2 rounded-md min-w-[52px]"
                        aria-label={`${upvotes} upvotes`}
                      >
                        <ChevronUp className="w-4 h-4" strokeWidth={1.7} />
                        <span className="text-sm font-semibold">{upvotes}</span>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        <div className="w-80">
          <ForumsSidebar 
            selectedCategoryId={selectedCategoryId}
            categories={categories}
            latestPost={latestPost}
          />
        </div>
      </div>
    </div>
  );
}
