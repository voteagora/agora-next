"use client";

import React from "react";
import Link from "next/link";
import { useAccount } from "wagmi";

import ENSAvatar from "@/components/shared/ENSAvatar";
import ForumAdminBadge from "@/components/Forum/ForumAdminBadge";
import ForumAuthorName from "@/components/Forum/ForumAuthorName";
import { formatRelative } from "@/components/ForumShared/utils";
import { ADMIN_TYPES } from "@/lib/constants";
import { forumTopicDisplayTimestamp } from "@/lib/forumUtils";
import Tenant from "@/lib/tenant/tenant";

import TopicUpvote from "./TopicUpvote";
import TopicWatch from "./TopicWatch";

interface TopicHeaderProps {
  topic: {
    id: number;
    title: string;
    address?: string;
    authorName?: string;
    authorDisplayName?: string | null;
    createdAt: string;
    revealTime?: string | null;
    adminRole?: string | null;
    isAuthorDeleted?: boolean;
  };
  isAdmin?: boolean;
}

export default function TopicHeader({
  topic,
  isAdmin = false,
}: TopicHeaderProps) {
  const { address } = useAccount();
  const { ui } = Tenant.current();
  const isDeletedUser = !!topic.isAuthorDeleted;
  const profileHref =
    topic.address && !isDeletedUser
      ? `/delegates/${encodeURIComponent(topic.address)}`
      : null;
  const profileLabel = topic.authorDisplayName?.trim()
    ? `View profile for ${topic.authorDisplayName.trim()}`
    : topic.address
      ? `View profile for ${topic.address}`
      : "View profile";
  const adminLabel = topic.adminRole || undefined;
  const isOwnTopic =
    address &&
    topic.address &&
    address.toLowerCase() === topic.address.toLowerCase();

  const authorName =
    isAdmin && !ui.isNgo ? (
      "Cowrie"
    ) : (
      <ForumAuthorName
        address={topic.address || ""}
        displayName={topic.authorDisplayName}
        isDeleted={isDeletedUser}
      />
    );

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
                  {authorName}
                </span>
                {isOwnTopic && (
                  <span className="text-xs text-tertiary font-normal">
                    (you)
                  </span>
                )}
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
              <ENSAvatar
                ensName={isDeletedUser ? undefined : topic.address}
                size={20}
              />
              <div className="flex items-center gap-1">
                <div className="font-medium text-sm">{authorName}</div>
                {isOwnTopic && (
                  <span className="text-xs text-tertiary font-normal">
                    (you)
                  </span>
                )}
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
            {formatRelative(
              forumTopicDisplayTimestamp(topic.createdAt, topic.revealTime)
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TopicWatch topicId={topic.id} topicTitle={topic.title} />
          <TopicUpvote topicId={topic.id} />
        </div>
      </div>

      <h1 className="text-xl font-semibold text-primary">{topic.title}</h1>
    </div>
  );
}
