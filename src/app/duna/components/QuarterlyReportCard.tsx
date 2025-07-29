"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChatBubbleLeftIcon,
  ClockIcon,
  PaperClipIcon,
} from "@heroicons/react/20/solid";
import ENSName from "@/components/shared/ENSName";
import { format } from "date-fns";

interface Report {
  id: number;
  title: string;
  author: string;
  content: string;
  createdAt: string;
  comments: any[];
  attachments: any[];
}

interface QuarterlyReportCardProps {
  report: Report;
  onClick: () => void;
}

const QuarterlyReportCard = ({ report, onClick }: QuarterlyReportCardProps) => {
  const excerpt =
    report.content.length > 100
      ? report.content.substring(0, 100) + "..."
      : report.content;

  const commentsCount = report.comments ? report.comments.length : 0;
  const lastCommentDate =
    report.comments && report.comments.length > 0
      ? format(
          new Date(report.comments[report.comments.length - 1].createdAt),
          "yyyy-MM-dd"
        )
      : format(new Date(report.createdAt), "yyyy-MM-dd");

  return (
    <Card
      className="border border-line bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h5 className="font-bold text-primary text-base mb-1">
              {report.title}
            </h5>
            <div className="flex items-center gap-2 text-sm text-secondary">
              <ENSName address={report.author} />
            </div>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-secondary leading-relaxed">{excerpt}</p>
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
      </CardContent>
    </Card>
  );
};

export default QuarterlyReportCard;
