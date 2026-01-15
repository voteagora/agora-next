"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Megaphone, X } from "lucide-react";
import { useRecentlyReleasedStatement } from "@/hooks/useRecentlyReleasedStatement";
import { buildForumArticlePath } from "@/lib/forumUtils";
import Tenant from "@/lib/tenant/tenant";

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
  const pathname = usePathname();
  const { ui } = Tenant.current();
  const infoBannerBackground = ui.customization?.infoBannerBackground;
  const bannerStyle = infoBannerBackground
    ? {
        backgroundColor: infoBannerBackground.startsWith("#")
          ? infoBannerBackground
          : `rgb(${infoBannerBackground})`,
      }
    : undefined;
  const textColorClass = infoBannerBackground ? "text-white" : "text-green-100";
  const iconBgClass = infoBannerBackground ? "bg-white/10" : "bg-green-900";

  useEffect(() => {
    if (!recentlyReleasedStatement || isDismissed) return;

    const articlePath = buildForumArticlePath(
      recentlyReleasedStatement.id,
      recentlyReleasedStatement.title
    );

    if (
      pathname === articlePath ||
      pathname?.startsWith(`/forum-article/${recentlyReleasedStatement.id}`)
    ) {
      dismiss();
    }
  }, [pathname, recentlyReleasedStatement, isDismissed, dismiss]);

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
    dismiss();
  };

  return (
    <div
      className="relative rounded-lg mb-4 p-2 flex items-center justify-between gap-2 cursor-pointer bg-green-700"
      style={bannerStyle}
      onClick={handleClick}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className={`p-1 rounded-lg ${iconBgClass}`}>
          <Megaphone className={`w-5 h-5 ${textColorClass}`} />
        </div>
        <p className={`${textColorClass} text-sm truncate`}>
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
