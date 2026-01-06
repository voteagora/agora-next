import React from "react";
import Link from "next/link";
import { formatRelative } from "@/components/ForumShared/utils";
import { ForumCategory, ForumPost } from "@/lib/forumUtils";
import Tenant from "@/lib/tenant/tenant";
import { TENANT_NAMESPACES } from "@/lib/constants";
import ForumAdminBadge from "@/components/Forum/ForumAdminBadge";
import CategoryList from "./CategoryList";

const { namespace } = Tenant.current();

interface ForumsSidebarProps {
  selectedCategoryId?: number | null;
  categories?: ForumCategory[];
  latestPost?: ForumPost;
  totalTopicsCount: number;
  uncategorizedCount?: number;
}

export default function ForumsSidebar({
  selectedCategoryId = null,
  categories = [],
  latestPost,
  totalTopicsCount,
  uncategorizedCount = 0,
}: ForumsSidebarProps) {
  const sortedCategories = (categories || [])
    .sort((a, b) => {
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
    .filter((cat) => (cat.topicsCount ?? 0) > 0);

  const lastActivityAt = latestPost?.createdAt;

  const palette = [
    "bg-orange-500",
    "bg-blue-500",
    "bg-yellow-500",
    "bg-green-500",
    "bg-purple-500",
  ];

  const bgStyle =
    namespace === TENANT_NAMESPACES.SYNDICATE
      ? "bg-hoverBackground text-neutral"
      : "bg-neutral text-primary hover:bg-hoverBackground";

  const textStyle =
    namespace === TENANT_NAMESPACES.SYNDICATE
      ? "text-primary"
      : "text-secondary";

  return (
    <div className="w-80 bg-cardBackground rounded-lg border border-cardBorder max-h-max">
      <div className="p-4">
        <h3 className="text-lg text-primary font-semibold mb-4">Categories</h3>

        <div className="space-y-3">
          {sortedCategories.length === 0 ? (
            <div className="text-sm text-tertiary">No categories found</div>
          ) : (
            <div className="space-y-2">
              <Link
                href="/forums"
                aria-current={selectedCategoryId == null ? "page" : undefined}
                className={`flex items-center justify-between px-3 py-2 rounded-md transition-colors ${
                  selectedCategoryId == null
                    ? bgStyle
                    : "hover:bg-hoverBackground/5 text-secondary"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-tertiary"></div>
                  <span className="text-sm">All discussions</span>
                </div>
                <span className="text-xs">
                  {totalTopicsCount}
                  {totalTopicsCount === 1 ? " topic" : " topics"}
                </span>
              </Link>

              <CategoryList
                categories={sortedCategories}
                selectedCategoryId={selectedCategoryId}
                bgStyle={bgStyle}
                palette={palette}
              />

              {uncategorizedCount > 0 && (
                <Link
                  href="/forums/category/0/uncategorized"
                  aria-current={selectedCategoryId === 0 ? "page" : undefined}
                  className={`flex items-center justify-between px-3 py-2 rounded-md transition-colors ${
                    selectedCategoryId === 0
                      ? bgStyle
                      : "hover:bg-hoverBackground/5 text-secondary"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                    <span className="text-sm">Uncategorized</span>
                  </div>
                  <span className="text-xs">
                    {uncategorizedCount}
                    {uncategorizedCount === 1 ? " topic" : " topics"}
                  </span>
                </Link>
              )}
            </div>
          )}
        </div>
        {/* Official DUNA Admin Badge */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="bg-wash border border-line rounded-lg shadow-sm p-3">
            <div className="flex items-center gap-2 text-sm">
              <ForumAdminBadge type="ADMIN" />
              <span className="text-primary font-medium">
                Official DUNA Admin
              </span>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className="border-t border-border">
          <div className="space-y-2 text-sm p-6">
            <div className="flex justify-between">
              <span className="text-tertiary">Last comment</span>
              <span className="text-secondary">
                {lastActivityAt ? formatRelative(lastActivityAt) : "—"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
