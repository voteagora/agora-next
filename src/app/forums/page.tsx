import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import ForumsSidebar from "./ForumsSidebar";
import { getForumTopics, getForumTopicUpvotes } from "@/lib/actions/forum";
import { getForumAdmins } from "@/lib/actions/forum/admin";
import ENSAvatar from "@/components/shared/ENSAvatar";
import { MessageCircle, Clock, ChevronUp } from "lucide-react";
import { stripHtmlToText } from "./stripHtml";
import NewTopicButton from "./components/NewTopicButton";
import { formatRelative } from "@/components/ForumShared/utils";
import { buildForumTopicPath } from "@/lib/forumUtils";
import Tenant from "@/lib/tenant/tenant";
import ForumAdminBadge from "@/components/Forum/ForumAdminBadge";

const tenant = Tenant.current();
const brandName = tenant.brandName || "Agora";

export const metadata: Metadata = {
  title: `${brandName} Forum Discussions`,
  description: `Browse the latest topics, questions, and community updates from the ${brandName} forum.`,
  alternates: {
    canonical: "/forums",
  },
  openGraph: {
    type: "website",
    title: `${brandName} Forum Discussions`,
    description: `Join the ${brandName} community conversations and explore trending forum topics.`,
    url: "/forums",
    siteName: `${brandName} Forum`,
  },
  twitter: {
    card: "summary",
    title: `${brandName} Forum Discussions`,
    description: `Discover the latest conversations happening on the ${brandName} forum.`,
  },
};

export default async function ForumsPage() {
  const [topicsResult, adminsResult] = await Promise.all([
    getForumTopics({
      excludeCategoryNames: ["DUNA"],
    }),
    getForumAdmins(),
  ]);

  const adminAddresses = new Set<string>(
    adminsResult?.success
      ? adminsResult.data.map((admin) => admin.address.toLowerCase())
      : []
  );

  const getLastActivity = (topic: any) => {
    const posts = Array.isArray(topic.posts) ? topic.posts : [];
    const latestPost = posts[posts.length - 1];
    return latestPost?.createdAt || topic.createdAt;
  };

  const topics = topicsResult.success
    ? topicsResult.data.slice().sort((a: any, b: any) => {
        const lastA = getLastActivity(a);
        const lastB = getLastActivity(b);
        return new Date(lastB || 0).getTime() - new Date(lastA || 0).getTime();
      })
    : [];

  const upvoteCounts = new Map<number, number>();

  if (topics.length) {
    for (const topic of topics) {
      const res = await getForumTopicUpvotes(topic.id);
      const count = res?.success ? (res.data?.upvotes ?? 0) : 0;
      upvoteCounts.set(topic.id, count);
    }
  }

  return (
    <div className="min-h-screen">
      <div className="mt-6 max-w-7xl mx-auto px-6 sm:px-0">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Discussions</h1>
          <NewTopicButton />
        </div>
      </div>
      <div className="flex gap-8 max-w-7xl mx-auto px-6 sm:px-0">
        <div className="flex-1">
          <div className="space-y-3">
            {topics.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No topics found</p>
              </div>
            ) : (
              topics.map((topic: any) => {
                const posts = Array.isArray(topic.posts) ? topic.posts : [];
                const firstPost = posts[0];
                const createdAt =
                  posts[posts.length - 1]?.createdAt || topic.createdAt;
                const replies = Math.max(
                  (topic.postsCount || posts.length) - 1,
                  0
                );
                const excerpt = stripHtmlToText(firstPost?.content || "");
                const upvotes = upvoteCounts.get(topic.id) ?? 0;
                const authorAddress = (topic.address || "").toLowerCase();
                const isAuthorAdmin = authorAddress
                  ? adminAddresses.has(authorAddress)
                  : false;

                return (
                  <Link
                    key={topic.id}
                    href={buildForumTopicPath(topic.id, topic.title)}
                    className="group block bg-white border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow"
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
                          <ForumAdminBadge className="absolute -bottom-1 -right-1" />
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
                        className="flex-shrink-0 w-8 h-[42px] bg-neutral-50 rounded relative hidden sm:block"
                        title={`${upvotes} upvotes`}
                      >
                        <div className="absolute inset-x-0 top-1 flex justify-center text-[#6a6a6a]">
                          <ChevronUp
                            className="w-[18px] h-[18px]"
                            strokeWidth={1.7}
                          />
                        </div>
                        <div className="absolute inset-x-0 bottom-2 text-center text-[#6a6a6a] text-xs font-semibold">
                          {upvotes}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        <ForumsSidebar />
      </div>
    </div>
  );
}
