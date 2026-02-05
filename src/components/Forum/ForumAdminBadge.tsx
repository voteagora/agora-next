import React from "react";
import { BadgeCheck, Star } from "lucide-react";
import { cn } from "@/lib/utils";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

interface ForumAdminBadgeProps {
  className?: string;
  type?: string;
  forumCategory?: string;
}

export default function ForumAdminBadge({
  className,
  type = "Forum admin",
  forumCategory,
}: ForumAdminBadgeProps) {
  const normalizedType = (type || "").toUpperCase();
  const isDunaCategory = forumCategory === "DUNA";
  const isDunaAdmin =
    normalizedType === "DUNA_ADMIN" ||
    (isDunaCategory && normalizedType === "SUPER_ADMIN");
  const displayLabel = isDunaAdmin ? "DUNA Official" : "Admin";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="flex flex-row space-x-1">
          <span
            title={displayLabel}
            aria-label={displayLabel}
            className={cn(
              "inline-flex items-center justify-center rounded-full shadow-sm",
              "w-4 h-4",
              className,
              isDunaAdmin
                ? "border border-primary text-primary bg-primary"
                : "text-[#3868c7]"
            )}
          >
            {isDunaAdmin ? (
              <Star className="w-4 h-4 fill-neutral" strokeWidth={2} />
            ) : (
              <BadgeCheck
                className="w-4 h-4 stroke-[#3868c7] fill-neutral"
                strokeWidth={2.4}
              />
            )}
            <span className="sr-only">{displayLabel}</span>
          </span>
        </TooltipTrigger>
        <TooltipContent className="text-sm max-w-[200px]">
          {displayLabel}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
