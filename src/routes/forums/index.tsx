/*
 * TanStack Start port of src/app/forums/page.tsx.
 * URL: /forums/
 */

import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

import Tenant from "@/lib/tenant/tenant";
import ForumsHeader from "@/components/Forum/ForumsHeader";
import ForumsSidebar from "@/components/Forum/ForumsSidebar";
import TopicList from "@/components/Forum/TopicList";

const serverLoadForums = createServerFn({ method: "GET" }).handler(async () => {
  const { getForumData } = await import("@/lib/actions/forum/topics");
  const result = await getForumData({ categoryId: undefined });
  if (!result.success) {
    return { error: true };
  }
  const {
    topics,
    totalCount,
    admins,
    categories,
    latestPost,
    uncategorizedCount,
  } = result.data;
  const sortedTopics = topics
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  return {
    error: false,
    sortedTopics,
    totalCount,
    admins,
    categories,
    latestPost,
    uncategorizedCount,
  };
});

export const Route = createFileRoute("/forums/")({
  beforeLoad: () => {
    const { ui } = Tenant.current();
    if (!ui.toggle("forums")?.enabled) {
      throw redirect({ to: "/" });
    }
  },
  head: () => {
    const { brandName } = Tenant.current();
    return {
      meta: [
        { title: `${brandName} Forum Discussions` },
        {
          name: "description",
          content: `Browse the latest topics, questions, and community updates from the ${brandName} forum.`,
        },
      ],
    };
  },
  loader: async () => serverLoadForums(),
  component: function ForumsPage() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = Route.useLoaderData() as any;
    if (!data || data.error) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-red-500">Error loading forum data</p>
        </div>
      );
    }

    const {
      sortedTopics,
      totalCount,
      admins,
      categories,
      latestPost,
      uncategorizedCount,
    } = data;

    return (
      <div className="min-h-screen">
        <ForumsHeader breadcrumbs={[]} showBreadcrumb={false} isDuna={false} />
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-6 max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="order-1 w-full min-w-0 lg:order-2 lg:w-64 lg:flex-shrink-0">
            <ForumsSidebar
              selectedCategoryId={null}
              categories={categories}
              latestPost={latestPost}
              totalTopicsCount={totalCount}
              uncategorizedCount={uncategorizedCount}
            />
          </div>
          <div className="order-2 min-w-0 flex-1 lg:order-1 lg:basis-0">
            <div className="space-y-3">
              {sortedTopics.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-tertiary">No topics found</p>
                </div>
              ) : (
                <TopicList topics={sortedTopics} admins={admins} />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
});
