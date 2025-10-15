import React from "react";
import ForumsSidebar from "./ForumsSidebar";
import { getForumData } from "@/lib/actions/forum/topics";
import ForumsHeader from "./components/ForumsHeader";
import ForumTopicCard from "./components/ForumTopicCard";

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

  const breadcrumbs = selectedCategoryTitle
    ? [
        { label: "Discussions", href: "/forums" },
        { label: selectedCategoryTitle },
      ]
    : [];

  return (
    <div className="min-h-screen">
      <ForumsHeader
        breadcrumbs={breadcrumbs}
        showBreadcrumb={selectedCategoryTitle !== null}
        description={description}
        isDuna={categoryTitle === "DUNA"}
      />
      <div className="flex gap-8 max-w-7xl mx-auto px-6 sm:px-0">
        <div className="flex-1">
          <div className="space-y-3">
            {sortedTopics.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-tertiary">No topics found</p>
              </div>
            ) : (
              sortedTopics.map((topic: any) => (
                <ForumTopicCard key={topic.id} topic={topic} admins={admins} />
              ))
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
