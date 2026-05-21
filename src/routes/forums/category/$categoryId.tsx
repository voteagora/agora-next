/*
 * TanStack Start port of src/app/forums/category/[categoryId]/[[...categoryTitle]]/page.tsx.
 * URL: /forums/category/:categoryId
 */

import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

import Tenant from "@/lib/tenant/tenant";
import ForumsHeader from "@/components/Forum/ForumsHeader";
import ForumsSidebar from "@/components/Forum/ForumsSidebar";
import TopicList from "@/components/Forum/TopicList";

const serverLoadForumsCategory = createServerFn({ method: "GET" })
  .inputValidator((data: { categoryId: string }) => data)
  .handler(async ({ data }) => {
    const { getForumCategory } = await import("@/lib/actions/forum/categories");

    const rawId = data.categoryId;
    const parsed = Number(rawId);
    if (!Number.isFinite(parsed)) {
      return { redirectToForums: true as const };
    }
    const id = Math.abs(Math.trunc(parsed));

    let categoryName: string | null = null;
    let description: string | null = null;

    if (id === 0) {
      categoryName = "Uncategorized";
      description = "Topics without a category";
    } else {
      const response = await getForumCategory(id);
      if (!response?.success || !response.data) {
        return { redirectToForums: true as const };
      }
      categoryName = response.data.name || null;
      description = response.data.description || null;
    }

    const { getForumData } = await import("@/lib/actions/forum/topics");
    const result = await getForumData({ categoryId: id });
    if (!result.success) {
      return { error: true, categoryId: id, categoryName, description };
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
      categoryId: id,
      categoryName,
      description,
      sortedTopics,
      totalCount,
      admins,
      categories,
      latestPost,
      uncategorizedCount,
    };
  });

export const Route = createFileRoute("/forums/category/$categoryId")({
  beforeLoad: () => {
    const { ui } = Tenant.current();
    if (!ui.toggle("forums")?.enabled) {
      throw redirect({ to: "/" });
    }
  },
  head: ({ loaderData }) => {
    const d = loaderData as { categoryName?: string | null } | undefined;
    const { brandName } = Tenant.current();
    const categoryName = d?.categoryName;
    const pageTitle = categoryName
      ? `${brandName} Forum – ${categoryName}`
      : `${brandName} Forum Discussions`;
    return {
      meta: [
        { title: pageTitle },
        {
          name: "description",
          content: `Explore discussions in the ${categoryName || "selected"} forum category for ${brandName}.`,
        },
      ],
    };
  },
  loader: async ({ params }) => {
    const data = await serverLoadForumsCategory({
      data: { categoryId: params.categoryId },
    });
    if ("redirectToForums" in data) {
      throw redirect({ to: "/forums" });
    }
    return data;
  },
  component: function ForumsCategoryPage() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = Route.useLoaderData() as any;
    if (!data) return null;

    const { categoryId, categoryName, description } = data;

    if (data.error) {
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

    const breadcrumbs = categoryName
      ? [{ label: "Discussions", href: "/forums" }, { label: categoryName }]
      : [];

    return (
      <div className="min-h-screen">
        <ForumsHeader
          breadcrumbs={breadcrumbs}
          showBreadcrumb={categoryName !== null}
          description={description}
          isDuna={categoryName === "DUNA"}
        />
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-6 max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="order-1 w-full min-w-0 lg:order-2 lg:w-64 lg:flex-shrink-0">
            <ForumsSidebar
              selectedCategoryId={categoryId}
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
