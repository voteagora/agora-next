import React from "react";
import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { rgbStringToHex } from "@/app/lib/utils/color";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

interface ForumAdminBadgeProps {
  className?: string;
  label?: string;
}

export default function ForumAdminBadge({
  className,
  label = "Forum admin",
}: ForumAdminBadgeProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="flex flex-row space-x-1">
          <span
            title={label}
            aria-label={label}
            className={cn(
              "inline-flex items-center justify-center rounded-full border border-white text-white shadow-sm",
              "w-4 h-4",
              className
            )}
          >
            <BadgeCheck className="w-3 h-3 text-positive" strokeWidth={2.4} />
            <span className="sr-only">{label}</span>
          </span>
        </TooltipTrigger>
        <TooltipContent className="text-sm max-w-[200px]">Admin</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
