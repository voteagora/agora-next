"use client";

import React from "react";
import Link from "next/link";
import ENSAvatar from "@/components/shared/ENSAvatar";
import { MessageCircle, Clock, ChevronUp } from "lucide-react";
import { formatRelative } from "@/components/ForumShared/utils";
import { buildForumTopicPath } from "@/lib/forumUtils";
import ForumAdminBadge from "@/components/Forum/ForumAdminBadge";
import { ADMIN_TYPES } from "@/lib/constants";
import { useForum } from "@/hooks/useForum";
import { useAccount } from "wagmi";
import useRequireLogin from "@/hooks/useRequireLogin";
import { rgbStringToHex } from "@/app/lib/utils/color";
import Tenant from "@/lib/tenant/tenant";
import { useStableCallback } from "@/hooks/useStableCallback";
import { InsufficientVPModal } from "@/components/Forum/InsufficientVPModal";
import ENSName from "@/components/shared/ENSName";

const { ui } = Tenant.current();

interface ForumTopicCardProps {
  topic: any;
  admins: Record<string, string | null>;
}

export default function ForumTopicCard({ topic, admins }: ForumTopicCardProps) {
  const { address } = useAccount();
  const {
    upvoteTopic,
    removeUpvoteTopic,
    fetchTopicUpvotes,
    hasUpvotedTopic,
    checkVPBeforeAction,
  } = useForum();
  const [count, setCount] = React.useState<number>(topic.upvotes || 0);
  const [mine, setMine] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);
  const requireLogin = useRequireLogin();
  const stableUpvoteTopic = useStableCallback(upvoteTopic);
  const stableRemoveUpvoteTopic = useStableCallback(removeUpvoteTopic);
  const mineRef = React.useRef(mine);
  const [showVPModal, setShowVPModal] = React.useState(false);

  React.useEffect(() => {
    mineRef.current = mine;
  }, [mine]);

  React.useEffect(() => {
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
  }, [topic.id, address, fetchTopicUpvotes, hasUpvotedTopic]);

  const handleUpvote = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;
    const loggedIn = await requireLogin();
    if (!loggedIn) return;

    // Only check VP when adding upvote (not removing)
    if (!mineRef.current) {
      const vpCheck = checkVPBeforeAction("upvote");
      if (!vpCheck.canProceed) {
        setShowVPModal(true);
        return;
      }
    }

    setLoading(true);
    try {
      if (mineRef.current) {
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
      setLoading(false);
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
                <ENSName address={topic.address} />
              )}
            </p>
          </div>

          {/* Right compact stat (upvotes) - now clickable */}
          <button
            type="button"
            onClick={handleUpvote}
            disabled={loading}
            title={mine ? "Remove upvote" : "Upvote"}
            className="flex flex-col items-center justify-center text-secondary py-1 px-2 rounded-md min-w-[52px] hover:bg-neutral transition-colors"
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
      </Link>

      <InsufficientVPModal
        isOpen={showVPModal}
        onClose={() => setShowVPModal(false)}
        action="upvote"
      />
    </>
  );
}
