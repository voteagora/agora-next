import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DunaContentRenderer from "@/components/duna-editor/DunaContentRenderer";
import {
  Eye,
  MessageSquare,
  Pin,
  Lock,
  Clock,
  User,
  MoreHorizontal,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

interface TopicHeaderProps {
  topic: {
    id: number;
    title: string;
    author: string;
    authorName: string;
    createdAt: string;
    category: string;
    tags: string[];
    views: number;
    replies: number;
    isLocked: boolean;
    isPinned: boolean;
  };
  content: {
    content: string;
    attachments: any[];
  };
}

export default function TopicHeader({ topic, content }: TopicHeaderProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="border-b pb-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-gray-600" />
          </div>
          <div>
            <div className="font-medium text-sm">{topic.authorName}</div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="text-gray-400">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      <h1 className="text-xl font-semibold text-gray-900 mb-3">
        {topic.title}
      </h1>

      <div className="mb-4">
        <DunaContentRenderer
          content={content.content}
          className="text-gray-700 text-sm leading-relaxed"
        />
      </div>

      <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
        <div className="flex items-center gap-1">
          <ThumbsUp className="h-4 w-4 text-yellow-500" />
          <ThumbsDown className="h-4 w-4 text-yellow-500" />
          <span>21</span>
        </div>
        <div>Created 5 days ago</div>
        <div>Last activity 2h ago</div>
        <div>4 comments</div>
        <div>1.1k views</div>
        <Button
          variant="ghost"
          size="sm"
          className="text-pink-500 hover:bg-pink-50"
        >
          ↗
        </Button>
      </div>
    </div>
  );
}
