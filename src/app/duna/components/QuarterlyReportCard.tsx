"use client";

import React from "react";
import {
  ChatBubbleLeftIcon,
  ClockIcon,
  PaperClipIcon,
} from "@heroicons/react/20/solid";
import ENSName from "@/components/shared/ENSName";
import ENSAvatar from "@/components/shared/ENSAvatar";
import { ForumTopic } from "@/lib/forumUtils";
import { formatDistanceToNow } from "date-fns";

interface QuarterlyReportCardProps {
  report: ForumTopic;
  onClick: () => void;
  isLast?: boolean;
}

const QuarterlyReportCard = ({
  report,
  onClick,
  isLast,
}: QuarterlyReportCardProps) => {
  // Use the full content and let CSS handle the line clamping
  const content = report.content;

  const commentsCount = report.comments ? report.comments.length : 0;
  const lastCommentDate =
    report.comments && report.comments.length > 0
      ? formatDistanceToNow(
          new Date(report.comments[report.comments.length - 1].createdAt),
          { addSuffix: true }
        )
      : formatDistanceToNow(new Date(report.createdAt), { addSuffix: true });

  return (
    <div
      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
        !isLast ? "border-b" : ""
      }`}
      style={!isLast ? { borderBottomColor: "#E5E5E5" } : {}}
      onClick={onClick}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3 gap-2">
        <div className="flex-1">
          <h5 className="font-bold text-primary text-base mb-1">
            {report.title}
          </h5>
        </div>
        <div className="flex items-center gap-2 text-sm text-secondary sm:ml-4">
          <ENSAvatar ensName={report.author} className="w-6 h-6" />
          <ENSName address={report.author} />
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-secondary leading-relaxed line-clamp-2">
          {content}
        </p>
      </div>

      <div className="flex items-center justify-between text-xs text-tertiary">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <ChatBubbleLeftIcon className="w-4 h-4" />
            <span>{commentsCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <ClockIcon className="w-4 h-4" />
            <span>{lastCommentDate}</span>
          </div>
          <div className="flex items-center gap-1">
            <PaperClipIcon className="w-4 h-4" />
            <span>
              {report.attachments?.length || 0} attachment
              {(report.attachments?.length || 0) !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuarterlyReportCard;
