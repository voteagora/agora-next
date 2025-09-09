import React from "react";
import { Button } from "@/components/ui/button";
import { Heart, Reply, MoreHorizontal, User, Clock } from "lucide-react";

interface Reply {
  id: number;
  author: string;
  authorName: string;
  content: string;
  createdAt: string;
  likes: number;
  parentId: number | null;
}

interface ReplyItemProps {
  reply: Reply;
  isNested?: boolean;
}

interface ReplyListProps {
  replies: Reply[];
}

function ReplyItem({ reply, isNested = false }: ReplyItemProps) {
  const formatDate = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      return diffHours === 0 ? "now" : `${diffHours}h ago`;
    }
    return `${diffDays} days ago`;
  };

  const formatContent = (content: string) => {
    // Simple mention highlighting
    return content.replace(
      /@(\w+\.\w+)/g,
      '<span class="text-blue-600 font-medium">@$1</span>'
    );
  };

  return (
    <div className={`${isNested ? "ml-12" : ""} mb-6`}>
      <div className="flex gap-3">
        {/* Avatar placeholder */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-gray-600" />
          </div>
        </div>

        {/* Reply content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">
              {reply.authorName}
            </span>
            <span className="text-gray-500 text-sm">{formatDate(reply.createdAt)}</span>
          </div>

          {/* Content */}
          <div className="mb-3">
            <p
              className="text-gray-700 text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: formatContent(reply.content) }}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-gray-500 hover:text-gray-700 font-normal"
            >
              <span className="mr-1">↑</span>
              {reply.likes > 0 ? reply.likes : 1}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-gray-500 hover:text-gray-700 font-normal"
            >
              Reply
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReplyList({ replies }: ReplyListProps) {
  // Organize replies with threading
  const organizeReplies = (replies: Reply[]) => {
    const topLevel = replies.filter((reply) => !reply.parentId);
    const nested = replies.filter((reply) => reply.parentId);

    return topLevel.map((reply) => ({
      ...reply,
      children: nested.filter((child) => child.parentId === reply.id),
    }));
  };

  const organizedReplies = organizeReplies(replies);

  if (replies.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No replies yet. Be the first to reply!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {organizedReplies.map((reply) => (
        <div key={reply.id} className="space-y-4">
          <ReplyItem reply={reply} />
          {reply.children?.map((childReply) => (
            <ReplyItem key={childReply.id} reply={childReply} isNested={true} />
          ))}
        </div>
      ))}
    </div>
  );
}
