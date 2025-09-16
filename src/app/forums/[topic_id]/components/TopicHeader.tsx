import React from "react";
import { truncateAddress } from "@/app/lib/utils/text";
import ENSAvatar from "@/components/shared/ENSAvatar";
import ForumAdminBadge from "@/components/Forum/ForumAdminBadge";

import TopicUpvote from "./TopicUpvote";
import { formatRelative } from "@/components/ForumShared/utils";

interface TopicHeaderProps {
  topic: {
    id: number;
    title: string;
    address?: string;
    authorName?: string;
    createdAt: string;
  };
  isAdmin?: boolean;
}

export default function TopicHeader({ topic, isAdmin = false }: TopicHeaderProps) {
  const displayName =
    topic.authorName || (topic.address ? truncateAddress(topic.address) : "");

  return (
    <div className="pb-2">
      <div className="flex items-start mb-1.5 justify-between">
        <div className="flex items-center gap-2">
          <ENSAvatar ensName={topic.address} size={20} />
          <div className="flex items-center gap-1">
            <div className="font-medium text-sm">{displayName}</div>
            {isAdmin && <ForumAdminBadge className="text-[9px]" />}
          </div>
          <div className="text-xs text-gray-500 self-center">
            {formatRelative(topic.createdAt)}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <TopicUpvote topicId={topic.id} />
        </div>
      </div>

      <h1 className="text-xl font-semibold text-gray-900">{topic.title}</h1>
    </div>
  );
}
