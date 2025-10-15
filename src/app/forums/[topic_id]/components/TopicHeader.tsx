import React from "react";
import Link from "next/link";
import { truncateAddress } from "@/app/lib/utils/text";
import ENSAvatar from "@/components/shared/ENSAvatar";
import ForumAdminBadge from "@/components/Forum/ForumAdminBadge";

import TopicUpvote from "./TopicUpvote";
import { formatRelative } from "@/components/ForumShared/utils";
import { ADMIN_TYPES } from "@/lib/constants";

interface TopicHeaderProps {
  topic: {
    id: number;
    title: string;
    address?: string;
    authorName?: string;
    createdAt: string;
    adminRole?: string | null;
  };
  isAdmin?: boolean;
}

export default function TopicHeader({
  topic,
  isAdmin = false,
}: TopicHeaderProps) {
  const displayName =
    topic.authorName || (topic.address ? truncateAddress(topic.address) : "");
  const profileHref = topic.address
    ? `/delegates/${encodeURIComponent(topic.address)}`
    : null;
  const profileLabel = displayName
    ? `View profile for ${displayName}`
    : "View profile";
  const adminLabel = topic.adminRole || undefined;

  return (
    <div className="pb-2">
      <div className="flex items-start mb-1.5 justify-between">
        <div className="flex items-center gap-2">
          {profileHref ? (
            <Link
              href={profileHref}
              aria-label={profileLabel}
              className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black rounded"
            >
              <ENSAvatar ensName={topic.address} size={20} />
              <div className="flex items-center gap-1">
                <span className="font-medium text-sm text-primary hover:underline">
                  {isAdmin ? displayName : "Cowrie"}
                </span>
                {isAdmin && (
                  <ForumAdminBadge
                    className="text-[9px]"
                    type={adminLabel ? ADMIN_TYPES[adminLabel] : "Admin"}
                  />
                )}
              </div>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <ENSAvatar ensName={topic.address} size={20} />
              <div className="flex items-center gap-1">
                <div className="font-medium text-sm">{displayName}</div>
                {isAdmin && (
                  <ForumAdminBadge
                    className="text-[9px]"
                    type={adminLabel ? ADMIN_TYPES[adminLabel] : "Admin"}
                  />
                )}
              </div>
            </div>
          )}
          <div className="text-xs text-tertiary self-center">
            {formatRelative(topic.createdAt)}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <TopicUpvote topicId={topic.id} />
        </div>
      </div>

      <h1 className="text-xl font-semibold text-primary">{topic.title}</h1>
    </div>
  );
}
