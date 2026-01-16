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
  const isBusy = !isReady || isLoading;

  const handleToggle = () => {
    toggleTopicWatch(topicId, topicTitle);
  };

  if (!address) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={handleToggle}
            disabled={isBusy}
            className={`w-8 h-[42px] bg-neutral rounded inline-flex items-center justify-center ${
              isBusy ? "opacity-50 cursor-not-allowed" : ""
            }`}
            title={
              isBusy
                ? "Loading watch status"
                : isWatching
                  ? "Stop watching"
                  : "Watch topic"
            }
          >
            {isBusy ? (
              <Loader2 className="w-[18px] h-[18px] animate-spin text-gray-400" />
            ) : isWatching ? (
              <Bell className="w-[18px] h-[18px] fill-amber-500 text-amber-500" />
            ) : (
              <Bell
                className="w-[18px] h-[18px] text-secondary"
                strokeWidth={2}
              />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {isWatching
              ? "Stop watching this topic"
              : "Get notified of new comments"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
