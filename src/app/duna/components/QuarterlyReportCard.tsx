"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChatBubbleLeftIcon, ClockIcon, PaperClipIcon } from "@heroicons/react/20/solid";

interface Report {
  id: string;
  title: string;
  author: string;
  excerpt: string;
  comments: number;
  lastComment: string;
  attachments: number;
  createdAt: string;
}

interface QuarterlyReportCardProps {
  report: Report;
  onClick: () => void;
}

const QuarterlyReportCard = ({ report, onClick }: QuarterlyReportCardProps) => {
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
              <span>{report.author}</span>
            </div>
          </div>
        </div>
        
        <p className="text-secondary text-sm mb-4 line-clamp-2">
          {report.excerpt}
        </p>
        
        <div className="flex items-center gap-4 text-xs text-secondary">
          <div className="flex items-center gap-1">
            <ChatBubbleLeftIcon className="w-4 h-4" />
            <span>{report.comments} comments</span>
          </div>
          <div className="flex items-center gap-1">
            <ClockIcon className="w-4 h-4" />
            <span>Last comment {report.lastComment}</span>
          </div>
          <div className="flex items-center gap-1">
            <PaperClipIcon className="w-4 h-4" />
            <span>{report.attachments} attachment</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuarterlyReportCard; 