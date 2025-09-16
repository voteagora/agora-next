import React, { useState } from "react";
import ENSAvatar from "@/components/shared/ENSAvatar";
import ENSName from "@/components/shared/ENSName";
import { ForumPost } from "@/lib/forumUtils";
import { format } from "date-fns";
import { useAccount } from "wagmi";
import { useForum, useForumAdmin } from "@/hooks/useForum";
import { TrashIcon } from "@heroicons/react/20/solid";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { canDeleteContent } from "@/lib/forumAdminUtils";
import { DunaContentRenderer, DunaEditor } from "@/components/duna-editor";
import { Button } from "@/components/ui/button";
import { Reply } from "lucide-react";
import Tenant from "@/lib/tenant/tenant";
import { useDunaCategory } from "@/hooks/useDunaCategory";

interface CommentItemProps {
  comment: ForumPost;
  depth: number;
  onDelete?: (commentId: number) => void;
  comments: ForumPost[]; // Need this to count replies
  onReply: (commentId: number) => void;
  isReplying: boolean;
  replyingToId: number | null;
  replyContent: string;
  onReplyContentChange: (content: string) => void;
  onSubmitReply: (e?: React.FormEvent) => void;
  onCancelReply: () => void;
}

const CommentItem = ({
  comment,
  depth,
  onDelete,
  comments,
  onReply,
  isReplying,
  replyingToId,
  replyContent,
  onReplyContentChange,
  onSubmitReply,
  onCancelReply,
}: CommentItemProps) => {
  const [showReplies, setShowReplies] = useState(false);
  const { address } = useAccount();
  const { deletePost } = useForum();
  const openDialog = useOpenDialog();
  const { dunaCategoryId } = useDunaCategory();
  const { isAdmin, canManageTopics } = useForumAdmin(
    dunaCategoryId || undefined
  );

  const { ui } = Tenant.current();
  const useDarkStyling = ui.toggle("ui/use-dark-theme-styling")?.enabled;

  // Get replies for this comment
  const replies = comments.filter(
    (reply: ForumPost) => reply.parentId === comment.id
  );
  const hasReplies = replies.length > 0;
  const isThisCommentBeingRepliedTo = replyingToId === comment.id;

  const canDelete = canDeleteContent(
    address || "",
    comment.author || "",
    isAdmin,
    canManageTopics
  );

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    openDialog({
      type: "CONFIRM",
      params: {
        title: "Delete Comment",
        message: "Are you sure you want to delete this comment?",
        onConfirm: async () => {
          const success = await deletePost(comment.id);
          if (success && onDelete) {
            onDelete(comment.id);
          }
        },
      },
    });
  };

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
            <div
              className={`${useDarkStyling ? "text-white" : "text-primary"}`}
            >
              <ENSName address={comment.author || ""} />
            </div>
            <span
              className={`text-xs sm:text-sm ${
                useDarkStyling ? "text-[#87819F]" : "text-secondary"
              }`}
            >
              posted {format(new Date(comment.createdAt), "MMM d, yyyy hh:mm")}
            </span>
            {canDelete && (
              <button
                onClick={handleDelete}
                className={`p-1 transition-colors ${
                  useDarkStyling
                    ? "text-red-400 hover:text-red-300"
                    : "text-red-500 hover:text-red-700"
                }`}
                title="Delete comment"
              >
                <TrashIcon className="w-3 h-3" />
              </button>
            )}
          </div>
          <div
            className={`text-xs sm:text-sm mb-2 ${
              useDarkStyling ? "text-white" : "text-secondary"
            }`}
          >
            <DunaContentRenderer content={comment.content} />
          </div>

          {/* Reply preview and actions */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReply(comment.id)}
              className={`text-xs p-1 h-6 ${
                useDarkStyling
                  ? "text-[#87819F] hover:text-white"
                  : "text-secondary hover:text-primary"
              }`}
              disabled={isReplying}
            >
              <Reply className="w-3 h-3 mr-1" />
              Reply
            </Button>

            {/* Reply count */}
            {hasReplies && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className={`text-xs transition-colors cursor-pointer ${
                  useDarkStyling
                    ? "text-[#87819F] hover:text-white"
                    : "text-secondary hover:text-primary"
                }`}
              >
                {replies.length} {replies.length === 1 ? "reply" : "replies"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Expandable replies section */}
      {hasReplies && showReplies && (
        <div className="mt-3 ml-8 sm:ml-12 space-y-3">
          {replies.map((reply) => (
            <div
              key={reply.id}
              className={`border-l-2 pl-3 ${
                useDarkStyling ? "border-[#2B2449]" : "border-gray-200"
              }`}
            >
              <CommentItem
                comment={reply}
                depth={depth + 1}
                comments={comments}
                onReply={onReply}
                isReplying={isReplying}
                replyingToId={replyingToId}
                replyContent={replyContent}
                onReplyContentChange={onReplyContentChange}
                onSubmitReply={onSubmitReply}
                onCancelReply={onCancelReply}
              />
            </div>
          ))}

          {/* Collapse button */}
          <button
            onClick={() => setShowReplies(false)}
            className={`text-xs transition-colors cursor-pointer ${
              useDarkStyling
                ? "text-[#87819F] hover:text-white"
                : "text-secondary hover:text-primary"
            }`}
          >
            Hide replies
          </button>
        </div>
      )}

      {/* Reply form appears right below this comment */}
      {isThisCommentBeingRepliedTo && (
        <div
          className={`mt-3 ml-8 sm:ml-12 p-3 rounded-lg border ${
            useDarkStyling
              ? "bg-inputBackgroundDark border-cardBorder"
              : "bg-gray-50 border-line"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`text-xs ${
                useDarkStyling ? "text-[#87819F]" : "text-secondary"
              }`}
            >
              Replying to this comment
            </span>
          </div>
          <DunaEditor
            variant="comment"
            placeholder="Write your reply…"
            value={replyContent}
            onChange={(html) => onReplyContentChange(html)}
            disabled={false}
          />
          <div className="flex justify-end gap-2 mt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancelReply}
              className={`text-xs ${
                useDarkStyling
                  ? "border-[#2B2449] text-[#87819F] hover:bg-inputBackgroundDark"
                  : ""
              }`}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={onSubmitReply}
              disabled={!replyContent.trim()}
              className={`text-xs ${
                useDarkStyling
                  ? "bg-buttonPrimaryDark text-white hover:bg-buttonPrimaryDark/80"
                  : "bg-black text-white hover:bg-black/90"
              }`}
            >
              Reply
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

interface CommentThreadProps {
  comments: ForumPost[];
  parentId: number | null;
  depth: number;
  onDelete?: (commentId: number) => void;
  onReply: (commentId: number) => void;
  isReplying: boolean;
  replyingToId: number | null;
  replyContent: string;
  onReplyContentChange: (content: string) => void;
  onSubmitReply: (e?: React.FormEvent) => void;
  onCancelReply: () => void;
}

const CommentThread = ({
  comments,
  parentId,
  depth,
  onDelete,
  onReply,
  isReplying,
  replyingToId,
  replyContent,
  onReplyContentChange,
  onSubmitReply,
  onCancelReply,
}: CommentThreadProps) => {
  const filteredComments = comments.filter((comment) => {
    if (parentId === null) {
      return !comment.parentId;
    }
    return comment.parentId === parentId;
  });

  return (
    <>
      {filteredComments.map((comment) => (
        <div key={comment.id}>
          <CommentItem
            comment={comment}
            depth={depth}
            onDelete={onDelete}
            comments={comments}
            onReply={onReply}
            isReplying={isReplying}
            replyingToId={replyingToId}
            replyContent={replyContent}
            onReplyContentChange={onReplyContentChange}
            onSubmitReply={onSubmitReply}
            onCancelReply={onCancelReply}
          />
        </div>
      ))}
    </>
  );
};

interface CommentListProps {
  comments: ForumPost[];
  onDelete?: (commentId: number) => void;
  onReply: (commentId: number) => void;
  isReplying: boolean;
  replyingToId: number | null;
  replyContent: string;
  onReplyContentChange: (content: string) => void;
  onSubmitReply: (e?: React.FormEvent) => void;
  onCancelReply: () => void;
}

const CommentList = ({
  comments,
  onReply,
  isReplying,
  replyingToId,
  replyContent,
  onReplyContentChange,
  onSubmitReply,
  onCancelReply,
  onDelete,
}: CommentListProps) => {
  return (
    <div className="space-y-3 sm:space-y-4">
      <CommentThread
        comments={comments}
        parentId={null}
        depth={0}
        onDelete={onDelete}
        onReply={onReply}
        isReplying={isReplying}
        replyingToId={replyingToId}
        replyContent={replyContent}
        onReplyContentChange={onReplyContentChange}
        onSubmitReply={onSubmitReply}
        onCancelReply={onCancelReply}
      />
    </div>
  );
};

export default CommentList;
