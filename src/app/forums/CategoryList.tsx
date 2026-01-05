"use client";

import Link from "next/link";
import { Bell, Loader2 } from "lucide-react";
import { useAccount } from "wagmi";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { buildForumCategoryPath } from "@/lib/forumUtils";
import { useForumSubscriptions } from "@/contexts/ForumSubscriptionsContext";

interface Category {
  id: number;
  name: string;
  topicsCount?: number;
}

interface CategoryListProps {
  categories: Category[];
  selectedCategoryId: number | null;
  bgStyle: string;
  palette: string[];
}

export default function CategoryList({
  categories,
  selectedCategoryId,
  bgStyle,
  palette,
}: CategoryListProps) {
  const { address } = useAccount();
  const { isCategoryWatched, toggleCategoryWatch, isLoading, isReady } =
    useForumSubscriptions();

  const handleToggle = (
    e: React.MouseEvent,
    categoryId: number,
    categoryName: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    toggleCategoryWatch(categoryId, categoryName);
  };

  return (
    <>
      {categories.map((cat, idx) => {
        const isSelected = selectedCategoryId === cat.id;
        const href = buildForumCategoryPath(cat.id, cat.name);
        const isWatching = isCategoryWatched(cat.id);

        return (
          <div
            key={cat.id}
            className={`flex items-center justify-between px-3 py-2 rounded-md transition-colors ${
              isSelected ? bgStyle : "hover:bg-hoverBackground/5 text-secondary"
            }`}
          >
            <Link
              href={href}
              aria-current={isSelected ? "page" : undefined}
              className="flex items-center gap-2 flex-1 min-w-0"
            >
              <div
                className={`w-3 h-3 rounded-full flex-shrink-0 ${
                  palette[idx % palette.length]
                }`}
              ></div>
              <span className="text-sm truncate">{cat.name}</span>
            </Link>
            <div className="flex items-center gap-1 flex-shrink-0">
              {isReady && address && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={(e) => handleToggle(e, cat.id, cat.name)}
                        disabled={isLoading}
                        className={`p-1 rounded transition-colors ${
                          isLoading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        aria-label={
                          isWatching
                            ? `Unwatch ${cat.name}`
                            : `Watch ${cat.name}`
                        }
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                        ) : isWatching ? (
                          <Bell className="w-4 h-4 fill-amber-500 text-amber-500 hover:text-amber-600" />
                        ) : (
                          <Bell className="w-4 h-4 text-gray-400 hover:text-gray-500" />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {isWatching ? "Stop watching" : "Watch for new topics"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <span className="text-xs">
                {cat.topicsCount ?? 0}
                {(cat.topicsCount ?? 0) === 1 ? " topic" : " topics"}
              </span>
            </div>
          </div>
        );
      })}
    </>
  );
}
