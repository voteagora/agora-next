"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRecentlyReleasedStatement } from "@/hooks/useRecentlyReleasedStatement";
import { Megaphone, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { buildForumArticlePath } from "@/lib/forumUtils";

function useBannerDismissal(statementId: number | null) {
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (!statementId) {
      setIsDismissed(false);
      return;
    }

    const storageKey = `recently-released-banner-${statementId}`;

    try {
      const dismissed = localStorage.getItem(storageKey) === "true";

      setIsDismissed(dismissed);
    } catch {
      setIsDismissed(false);
    }
  }, [statementId]);

  const dismiss = useCallback(() => {
    if (!statementId) return;

    const storageKey = `recently-released-banner-${statementId}`;

    try {
      localStorage.setItem(storageKey, "true");
      setIsDismissed(true);
    } catch {
      setIsDismissed(true);
    }
  }, [statementId]);

  return { isDismissed, dismiss };
}

export default function RecentlyReleasedBanner() {
  const { recentlyReleasedStatement, isLoading } =
    useRecentlyReleasedStatement();
  const { isDismissed, dismiss } = useBannerDismissal(
    recentlyReleasedStatement?.id ?? null
  );
  const router = useRouter();

  if (isLoading || !recentlyReleasedStatement || isDismissed) {
    return null;
  }

  const articlePath = buildForumArticlePath(
    recentlyReleasedStatement.id,
    recentlyReleasedStatement.title
  );

  const handleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }
    router.push(articlePath);
  };

  return (
    <div
      className="relative rounded-lg mb-4 p-2 flex items-center justify-between gap-2 cursor-pointer bg-green-700"
      onClick={handleClick}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="p-1 bg-green-900 rounded-lg">
          <Megaphone className="w-5 h-5 text-green-100" />
        </div>
        <p className="text-green-100 text-sm truncate">
          New - <strong>{recentlyReleasedStatement.title}</strong> now available
        </p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          dismiss();
        }}
        className="flex-shrink-0 text-white hover:bg-white/10 rounded p-1 transition-colors"
        aria-label="Dismiss banner"
      >
        <X size={20} />
      </button>
    </div>
  );
}
