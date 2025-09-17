import React from "react";
import Link from "next/link";
import { getForumCategories, getLatestForumPost } from "@/lib/actions/forum";
import { formatRelative } from "@/components/ForumShared/utils";

interface ForumsSidebarProps {
  selectedCategoryId?: number | null;
}

export default async function ForumsSidebar({
  selectedCategoryId = null,
}: ForumsSidebarProps = {}) {
  const [categoriesResult, latestPostResult] = await Promise.all([
    getForumCategories(),
    getLatestForumPost(),
  ]);

  const categories = categoriesResult?.success
    ? categoriesResult.data.sort((a: any, b: any) => {
        const aTop =
          a?.isDuna === true ||
          (typeof a?.name === "string" && a.name.toUpperCase() === "DUNA");
        const bTop =
          b?.isDuna === true ||
          (typeof b?.name === "string" && b.name.toUpperCase() === "DUNA");
        if (aTop && !bTop) return -1;
        if (bTop && !aTop) return 1;
        return a.name.localeCompare(b.name);
      })
    : [];
  const totalTopics = categories.reduce(
    (sum: number, cat: any) => sum + (cat.topicsCount ?? 0),
    0
  );
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
    <div className="w-80 bg-card rounded-lg border border-cardBorder h-[100%]">
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">Categories</h3>

        <div className="space-y-3">
          {categories.length === 0 ? (
            <div className="text-sm text-gray-500">No categories found</div>
          ) : (
            <div className="space-y-2">
              <Link
                href="/forums"
                aria-current={selectedCategoryId == null ? "page" : undefined}
                className={`flex items-center justify-between px-3 py-2 rounded-md transition-colors ${
                  selectedCategoryId == null
                    ? "bg-black text-white"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                  <span className="text-sm">All discussions</span>
                </div>
                <span className="text-xs">
                  {totalTopics}
                  {totalTopics === 1 ? " topic" : " topics"}
                </span>
              </Link>

              {categories.map((cat: any, idx: number) => {
                const isSelected = selectedCategoryId === cat.id;
                return (
                  <Link
                    key={cat.id}
                    href={`/forums?id=${encodeURIComponent(cat.id)}&title=${encodeURIComponent(cat.name)}`}
                    aria-current={isSelected ? "page" : undefined}
                    className={`flex items-center justify-between px-3 py-2 rounded-md transition-colors ${
                      isSelected
                        ? "bg-black text-white"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          palette[idx % palette.length]
                        }`}
                      ></div>
                      <span className="text-sm">{cat.name}</span>
                    </div>
                    <span className="text-xs">
                      {cat.topicsCount ?? 0}
                      {(cat.topicsCount ?? 0) === 1 ? " topic" : " topics"}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <div>
        <div className="border-t">
          <div className="space-y-2 text-sm p-6">
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
