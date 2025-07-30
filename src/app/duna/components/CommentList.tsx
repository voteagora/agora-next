import React from "react";
import ENSAvatar from "@/components/shared/ENSAvatar";
import ENSName from "@/components/shared/ENSName";
import { ForumPost } from "@/lib/forumUtils";
import { format } from "date-fns";

interface CommentItemProps {
  comment: ForumPost;
  depth: number;
}

const CommentItem = ({ comment, depth }: CommentItemProps) => {
  return (
    <div
      className={`${depth > 0 ? "ml-4 sm:ml-8 mt-3 sm:mt-4" : "mt-3 sm:mt-4"}`}
    >
      <div className="flex gap-2 sm:gap-3">
        <div className="flex-shrink-0">
          <ENSAvatar
            ensName={comment.author}
            className="w-6 h-6 sm:w-8 sm:h-8"
          />
        </div>
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
            <ENSName address={comment.author || ""} />
            <span className="text-xs sm:text-sm text-secondary">
              posted {format(new Date(comment.createdAt), "MMM d, yyyy hh:mm")}
            </span>
          </div>
          <div className="text-secondary text-xs sm:text-sm">
            {comment.content}
          </div>
        </div>
      </div>
    </div>
  );
};

interface CommentThreadProps {
  comments: ForumPost[];
  parentId: number | null;
  depth: number;
}

const CommentThread = ({ comments, parentId, depth }: CommentThreadProps) => {
  const filteredComments = comments.filter(
    (comment) => (comment.parentId || null) === parentId
  );

  return (
    <>
      {filteredComments.map((comment) => (
        <div key={comment.id}>
          <CommentItem comment={comment} depth={depth} />
          <CommentThread
            comments={comments}
            parentId={comment.id}
            depth={depth + 1}
          />
        </div>
      ))}
    </>
  );
};

interface CommentListProps {
  comments: ForumPost[];
}

const CommentList = ({ comments }: CommentListProps) => {
  return (
    <div className="space-y-3 sm:space-y-4">
      <CommentThread comments={comments} parentId={null} depth={0} />
    </div>
  );
};

export default CommentList;
