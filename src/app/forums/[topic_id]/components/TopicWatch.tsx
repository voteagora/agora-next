"use client";

import { Bell, Loader2 } from "lucide-react";
import { useAccount } from "wagmi";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useForumSubscriptions } from "@/contexts/ForumSubscriptionsContext";

interface TopicWatchProps {
  topicId: number;
  topicTitle?: string;
}

export default function TopicWatch({ topicId, topicTitle }: TopicWatchProps) {
  const { address } = useAccount();
  const { isTopicWatched, toggleTopicWatch, isLoading, isReady } =
    useForumSubscriptions();

  const isWatching = isTopicWatched(topicId);

  const handleToggle = () => {
    toggleTopicWatch(topicId, topicTitle);
  };

  // Don't render until ready (hydration safety) or if not connected
  if (!isReady || !address) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={handleToggle}
            disabled={isLoading}
            className={`w-8 h-[42px] bg-neutral rounded inline-flex items-center justify-center ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            title={isWatching ? "Stop watching" : "Watch topic"}
          >
            {isLoading ? (
              <Loader2 className="w-[18px] h-[18px] animate-spin text-gray-400" />
            ) : isWatching ? (
              <Bell className="w-[18px] h-[18px] fill-amber-500 text-amber-500" />
            ) : (
              <Bell className="w-[18px] h-[18px] text-secondary" strokeWidth={2} />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isWatching ? "Stop watching this topic" : "Get notified of new comments"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
