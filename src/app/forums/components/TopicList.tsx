"use client";

import { useEffect, useState } from "react";
import { Bell, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAccount } from "wagmi";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ENSAvatar from "@/components/shared/ENSAvatar";
import ENSName from "@/components/shared/ENSName";
import { MessageCircle, Clock, ChevronUp } from "lucide-react";
import { formatRelative } from "@/components/ForumShared/utils";
import { buildForumTopicPath } from "@/lib/forumUtils";
import ForumAdminBadge from "@/components/Forum/ForumAdminBadge";
import { ADMIN_TYPES } from "@/lib/constants";
import { useForum } from "@/hooks/useForum";
import useRequireLogin from "@/hooks/useRequireLogin";
import { rgbStringToHex } from "@/app/lib/utils/color";
import Tenant from "@/lib/tenant/tenant";
import { useStableCallback } from "@/hooks/useStableCallback";
import { InsufficientVPModal } from "@/components/Forum/InsufficientVPModal";
import { useForumSubscriptions } from "@/contexts/ForumSubscriptionsContext";

const { ui } = Tenant.current();

interface Topic {
  id: number;
  title: string;
  address?: string;
  createdAt: string;
  postsCount?: number;
  upvotes?: number;
}

interface TopicListProps {
  topics: Topic[];
  admins: Record<string, string | null>;
}

export default function TopicList({ topics, admins }: TopicListProps) {
  const { address } = useAccount();
  const { isTopicWatched, toggleTopicWatch, isLoading, isReady } =
    useForumSubscriptions();
  const watchBusy = !isReady || isLoading;

  const handleToggleWatch = (
    e: React.MouseEvent,
    topicId: number,
    topicTitle: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    toggleTopicWatch(topicId, topicTitle);
  };

  return (
    <>
      {topics.map((topic) => (
        <TopicCard
          key={topic.id}
          topic={topic}
          admins={admins}
          isWatching={isTopicWatched(topic.id)}
          watchLoading={watchBusy}
          showWatchButton={!!address}
          onToggleWatch={(e) => handleToggleWatch(e, topic.id, topic.title)}
        />
      ))}
    </>
  );
}

interface TopicCardProps {
  topic: Topic;
  admins: Record<string, string | null>;
  isWatching: boolean;
  watchLoading: boolean;
  showWatchButton: boolean;
  onToggleWatch: (e: React.MouseEvent) => void;
}

function TopicCard({
  topic,
  admins,
  isWatching,
  watchLoading,
  showWatchButton,
  onToggleWatch,
}: TopicCardProps) {
  const { address } = useAccount();
  const {
    upvoteTopic,
    removeUpvoteTopic,
    fetchTopicUpvotes,
    hasUpvotedTopic,
    checkVPBeforeAction,
  } = useForum();
  const [count, setCount] = useState<number>(topic.upvotes || 0);
  const [mine, setMine] = useState<boolean>(false);
  const [upvoteLoading, setUpvoteLoading] = useState<boolean>(false);
  const requireLogin = useRequireLogin();
  const stableUpvoteTopic = useStableCallback(upvoteTopic);
  const stableRemoveUpvoteTopic = useStableCallback(removeUpvoteTopic);
  const [showVPModal, setShowVPModal] = useState(false);

  useEffect(() => {
    if (watchLoading) return;

    let mounted = true;
    (async () => {
      const c = await fetchTopicUpvotes(topic.id);
      const m = await hasUpvotedTopic(topic.id);
      if (mounted) {
        setCount(c);
        setMine(m);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [watchLoading, topic.id, address, fetchTopicUpvotes, hasUpvotedTopic]);

  const handleUpvote = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (upvoteLoading) return;
    const loggedIn = await requireLogin();
    if (!loggedIn) return;

    if (!mine) {
      const vpCheck = checkVPBeforeAction("upvote");
      if (!vpCheck.canProceed) {
        setShowVPModal(true);
        return;
      }
    }

    setUpvoteLoading(true);
    try {
      if (mine) {
        const updated = await stableRemoveUpvoteTopic(topic.id);
        if (updated !== null) {
          setCount(updated);
          setMine(false);
        }
      } else {
        const updated = await stableUpvoteTopic(topic.id);
        if (updated !== null) {
          setCount(updated);
          setMine(true);
        }
      }
    } finally {
      setUpvoteLoading(false);
    }
  };

  const createdAt = topic.createdAt;
  const replies = Math.max((topic.postsCount || 1) - 1, 0);
  const authorAddress = (topic.address || "").toLowerCase();
  const adminRole = admins[authorAddress] || null;
  const isAuthorAdmin = authorAddress in admins;

  return (
    <>
      <Link
        href={buildForumTopicPath(topic.id, topic.title)}
        className="group block bg-cardBackground border border-cardBorder rounded-lg p-3 hover:shadow-sm transition-shadow"
      >
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="flex-shrink-0 relative self-center">
            <ENSAvatar
              ensName={topic.address}
              className="w-[42px] h-[42px]"
              size={42}
            />
            {isAuthorAdmin && (
              <ForumAdminBadge
                className="absolute -bottom-1 -right-1"
                type={adminRole ? ADMIN_TYPES[adminRole] : "Admin"}
              />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title + Meta */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <h3 className="text-base font-semibold text-primary truncate group-hover:underline">
                  {topic.title}
                </h3>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold text-secondary">
                {/* Replies */}
                <div className="inline-flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5" strokeWidth={1.7} />
                  <span>{replies}</span>
                </div>
                {/* Time */}
                <div className="hidden lg:inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" strokeWidth={1.7} />
                  <span>{formatRelative(createdAt)}</span>
                </div>
              </div>
            </div>

            <p className="mt-1 text-secondary text-sm leading-relaxed line-clamp-1 overflow-hidden max-w-full md:max-w-[556px] break-words">
              By:{" "}
              {isAuthorAdmin ? (
                <span className="text-primary">Cowrie</span>
              ) : (
                <ENSName address={topic.address || ""} />
              )}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center">
            {/* Watch button */}
            {showWatchButton && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={onToggleWatch}
                      disabled={watchLoading}
                      title={
                        watchLoading
                          ? "Loading watch status"
                          : isWatching
                          ? "Stop watching"
                          : "Watch topic"
                      }
                      className={`flex items-center justify-center text-secondary rounded-md min-w-[40px] h-[42px] hover:bg-neutral transition-colors ${
                        watchLoading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      aria-label={
                        watchLoading
                          ? "Loading watch status"
                          : isWatching
                          ? "Stop watching"
                          : "Watch topic"
                      }
                    >
                      {watchLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                      ) : isWatching ? (
                        <Bell className="w-4 h-4 fill-amber-500 text-amber-500" />
                      ) : (
                        <Bell className="w-4 h-4" strokeWidth={1.7} />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {watchLoading
                        ? "Loading watch status"
                        : isWatching
                        ? "Stop watching"
                        : "Get notified of new comments"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* Upvote button */}
            <button
              type="button"
              onClick={handleUpvote}
              disabled={upvoteLoading}
              title={mine ? "Remove upvote" : "Upvote"}
              className="flex flex-col items-center justify-center text-secondary rounded-md min-w-[40px] h-[42px] hover:bg-neutral transition-colors"
              aria-label={`${count} upvotes`}
            >
              <ChevronUp
                className="w-4 h-4"
                strokeWidth={1.7}
                color={
                  mine
                    ? rgbStringToHex(ui.customization?.positive)
                    : "currentColor"
                }
              />
              <span className="text-sm font-semibold">{count}</span>
            </button>
          </div>
        </div>
      </Link>

      <InsufficientVPModal
        isOpen={showVPModal}
        onClose={() => setShowVPModal(false)}
        action="upvote"
      />
    </>
  );
}
