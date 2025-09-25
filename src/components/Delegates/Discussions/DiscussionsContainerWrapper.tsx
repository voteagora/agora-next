import DiscussionsContainer from "./DiscussionsContainer";
import { getForumTopicsByUser, getForumPostsByUser } from "@/lib/actions/forum";
import { Delegate } from "@/app/api/common/delegates/delegate";
import { PaginatedResult } from "@/app/lib/pagination";

interface Props {
  delegate: Delegate;
}

const DiscussionsContainerWrapper = async ({ delegate }: Props) => {
  const [topicsResult, postsResult] = await Promise.all([
    getForumTopicsByUser(delegate.address, { limit: 10, offset: 0 }),
    getForumPostsByUser(delegate.address, { limit: 10, offset: 0 }),
  ]);

  const initialTopics: PaginatedResult<any[]> = topicsResult.success 
    ? {
        meta: topicsResult.data.meta,
        data: topicsResult.data.data.map(topic => ({
          id: topic.id,
          title: topic.title,
          address: topic.address,
          createdAt: topic.createdAt instanceof Date 
            ? topic.createdAt.toISOString() 
            : new Date(topic.createdAt).toISOString(),
          category: topic.category,
          postsCount: topic.postsCount,
        })),
      }
    : {
        meta: { has_next: false, total_returned: 0, next_offset: 0 },
        data: [],
      };

  const initialPosts: PaginatedResult<any[]> = postsResult.success 
    ? {
        meta: postsResult.data.meta,
        data: postsResult.data.data.map(post => ({
          id: post.id,
          address: post.address,
          content: post.content,
          createdAt: post.createdAt instanceof Date 
            ? post.createdAt.toISOString() 
            : new Date(post.createdAt).toISOString(),
          topic: post.topic,
        })),
      }
    : {
        meta: { has_next: false, total_returned: 0, next_offset: 0 },
        data: [],
      };

  return (
    <DiscussionsContainer
      initialTopics={initialTopics}
      initialPosts={initialPosts}
      fetchTopics={async (pagination) => {
        "use server";
        const result = await getForumTopicsByUser(delegate.address, pagination);
        if (result.success) {
          return {
            meta: result.data.meta,
            data: result.data.data.map(topic => ({
              id: topic.id,
              title: topic.title,
              address: topic.address,
              createdAt: topic.createdAt instanceof Date 
                ? topic.createdAt.toISOString() 
                : new Date(topic.createdAt).toISOString(),
              category: topic.category,
              postsCount: topic.postsCount,
            })),
          };
        }
        return { meta: { has_next: false, total_returned: 0, next_offset: 0 }, data: [] };
      }}
      fetchPosts={async (pagination) => {
        "use server";
        const result = await getForumPostsByUser(delegate.address, pagination);
        if (result.success) {
          return {
            meta: result.data.meta,
            data: result.data.data.map(post => ({
              id: post.id,
              address: post.address,
              content: post.content,
              createdAt: post.createdAt instanceof Date 
                ? post.createdAt.toISOString() 
                : new Date(post.createdAt).toISOString(),
              topic: post.topic,
            })),
          };
        }
        return { meta: { has_next: false, total_returned: 0, next_offset: 0 }, data: [] };
      }}
    />
  );
};

export const DiscussionsContainerSkeleton = () => {
  return (
    <div className="flex flex-col gap-4 animate-pulse p-12 rounded-lg bg-tertiary/10">
      <div className="h-4 w-1/2 bg-tertiary/20 rounded-md"></div>
      <div className="h-4 w-1/3 bg-tertiary/20 rounded-md"></div>
    </div>
  );
};

export default DiscussionsContainerWrapper;
