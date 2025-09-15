import React from "react";
import { getForumCategories, getLatestForumPost } from "@/lib/actions/forum";
import { formatRelative } from "@/components/ForumShared/utils";

export default async function ForumsSidebar() {
  const [categoriesResult, latestPostResult] = await Promise.all([
    getForumCategories(),
    getLatestForumPost(),
  ]);

  const categories = categoriesResult?.success
    ? categoriesResult.data.filter((cat: any) => cat.name !== "DUNA")
    : [];
  const lastActivityAt = latestPostResult?.success
    ? (latestPostResult.data?.createdAt as string | undefined)
    : undefined;

  const palette = [
    "bg-orange-500",
    "bg-blue-500",
    "bg-yellow-500",
    "bg-green-500",
    "bg-purple-500",
  ];

  return (
    <div className="w-80 flex-shrink-0">
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Categories</h3>

        <div className="space-y-3">
          {categories.length === 0 ? (
            <div className="text-sm text-gray-500">No categories found</div>
          ) : (
            categories.map((cat: any, idx: number) => (
              <div key={cat.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      palette[idx % palette.length]
                    }`}
                  ></div>
                  <span className="text-sm">{cat.name}</span>
                </div>
                <span className="text-xs text-gray-500">
                  {cat.topicsCount ?? 0} topics
                </span>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 pt-4 border-t">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Last comment</span>
              <span>
                {lastActivityAt ? formatRelative(lastActivityAt) : "—"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
