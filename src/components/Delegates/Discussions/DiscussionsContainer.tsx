"use client";

import { useRef, useState } from "react";
import { PaginatedResult } from "@/app/lib/pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InfiniteScroll from "react-infinite-scroller";
import { MessageCircle, Clock, User } from "lucide-react";
import { formatRelative } from "@/components/ForumShared/utils";
import { stripHtmlToText } from "@/app/forums/stripHtml";
import { buildForumTopicPath } from "@/lib/forumUtils";
import Link from "next/link";

interface ForumTopicData {
  id: number;
  title: string;
  address: string;
  createdAt: string;
  category?: {
    name: string;
    id: number;
  } | null;
  postsCount: number;
}

interface ForumPostData {
  id: number;
  address: string;
  content: string;
  createdAt: string;
  topic?: {
    title: string;
    id: number;
    category?: {
      name: string;
      id: number;
    } | null;
  } | null;
}

interface Props {
  initialTopics: PaginatedResult<ForumTopicData[]>;
  initialPosts: PaginatedResult<ForumPostData[]>;
  fetchTopics: (pagination: {
    limit: number;
    offset: number;
  }) => Promise<PaginatedResult<ForumTopicData[]>>;
  fetchPosts: (pagination: {
    limit: number;
    offset: number;
  }) => Promise<PaginatedResult<ForumPostData[]>>;
}

const DiscussionsContainer = ({
  initialTopics,
  initialPosts,
  fetchTopics,
  fetchPosts,
}: Props) => {
  const [activeTab, setActiveTab] = useState("topics");
  const [topics, setTopics] = useState(initialTopics.data);
  const [posts, setPosts] = useState(initialPosts.data);
  const [topicsMeta, setTopicsMeta] = useState(initialTopics.meta);
  const [postsMeta, setPostsMeta] = useState(initialPosts.meta);
  const topicsLoadingRef = useRef(false);
  const postsLoadingRef = useRef(false);

  const loadMoreTopics = async () => {
    if (!topicsLoadingRef.current && topicsMeta.has_next) {
      topicsLoadingRef.current = true;
      try {
        const data = await fetchTopics({
          limit: 10,
          offset: topicsMeta.next_offset,
        });
        setTopicsMeta(data.meta);
        setTopics((prev) => [...prev, ...data.data]);
      } catch (error) {
        console.error("Error loading more topics:", error);
      } finally {
        topicsLoadingRef.current = false;
      }
    }
  };

  const loadMorePosts = async () => {
    if (!postsLoadingRef.current && postsMeta.has_next) {
      postsLoadingRef.current = true;
      try {
        const data = await fetchPosts({
          limit: 10,
          offset: postsMeta.next_offset,
        });
        setPostsMeta(data.meta);
        setPosts((prev) => [...prev, ...data.data]);
      } catch (error) {
        console.error("Error loading more posts:", error);
      } finally {
        postsLoadingRef.current = false;
      }
    }
  };

  const hasContent = topics.length > 0 || posts.length > 0;

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-row justify-between items-center relative">
        <h2 className="text-primary text-2xl font-bold flex-grow">
          Discussions
        </h2>
      </div>

      {!hasContent ? (
        <div className="p-8 text-center text-secondary align-middle bg-wash border border-line rounded-xl shadow-newDefault">
          No discussions found.
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              className="opacity-60 data-[state=active]:opacity-100"
              value="topics"
            >
              Topics Created ({topics.length})
            </TabsTrigger>
            <TabsTrigger
              className="opacity-60 data-[state=active]:opacity-100"
              value="posts"
            >
              Recent Posts ({posts.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="topics" className="space-y-4">
            {topics.length > 0 ? (
              <InfiniteScroll
                hasMore={topicsMeta.has_next}
                pageStart={0}
                loadMore={loadMoreTopics}
                useWindow={false}
                loader={
                  <div
                    key={0}
                    className="flex justify-center py-6 text-sm text-secondary"
                  >
                    Loading...
                  </div>
                }
                element="div"
                className="space-y-3"
              >
                {topics.map((topic) => (
                  <Link
                    key={topic.id}
                    href={buildForumTopicPath(topic.id, topic.title)}
                    className="group block bg-card border border-cardBorder rounded-lg p-3 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-[42px] h-[42px] bg-wash rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-secondary" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="text-base font-semibold text-black truncate group-hover:underline">
                            {topic.title}
                          </h3>
                          <div className="flex items-center gap-4 text-xs font-semibold text-[#6a6a6a]">
                            <div className="inline-flex items-center gap-1.5">
                              <MessageCircle
                                className="w-3.5 h-3.5"
                                strokeWidth={1.7}
                              />
                              <span>{topic.postsCount}</span>
                            </div>
                            <div className="inline-flex items-center gap-1.5">
                              <Clock
                                className="w-3.5 h-3.5"
                                strokeWidth={1.7}
                              />
                              <span>{formatRelative(topic.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-secondary">
                          <span>Category: {topic.category?.name}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </InfiniteScroll>
            ) : (
              <div className="p-8 text-center text-secondary align-middle bg-wash border border-line rounded-xl">
                No topics created yet.
              </div>
            )}
          </TabsContent>

          <TabsContent value="posts" className="space-y-4">
            {posts.length > 0 ? (
              <InfiniteScroll
                hasMore={postsMeta.has_next}
                pageStart={0}
                loadMore={loadMorePosts}
                useWindow={false}
                loader={
                  <div
                    key={0}
                    className="flex justify-center py-6 text-sm text-secondary"
                  >
                    Loading...
                  </div>
                }
                element="div"
                className="space-y-3"
              >
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    href={buildForumTopicPath(
                      post.topic?.id || 0,
                      post.topic?.title || ""
                    )}
                    className="group block bg-card border border-cardBorder rounded-lg p-3 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-[42px] h-[42px] bg-wash rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-secondary" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="text-base font-semibold text-black truncate group-hover:underline">
                            {post.topic?.title}
                          </h3>
                          <div className="flex items-center gap-4 text-xs font-semibold text-[#6a6a6a]">
                            <div className="inline-flex items-center gap-1.5">
                              <Clock
                                className="w-3.5 h-3.5"
                                strokeWidth={1.7}
                              />
                              <span>{formatRelative(post.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-1 text-sm text-secondary line-clamp-2">
                          {stripHtmlToText(post.content)}
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-secondary">
                          <span>Category: {post.topic?.category?.name}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </InfiniteScroll>
            ) : (
              <div className="p-8 text-center text-secondary align-middle bg-wash border border-line rounded-xl">
                No posts made yet.
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default DiscussionsContainer;
