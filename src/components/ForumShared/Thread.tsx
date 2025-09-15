"use client";

import React from "react";
import ENSAvatar from "@/components/shared/ENSAvatar";
import ENSName from "@/components/shared/ENSName";
import { ForumPost } from "@/lib/forumUtils";

import { useAccount } from "wagmi";
import { useForum, useForumAdmin } from "@/hooks/useForum";
import { TrashIcon } from "@heroicons/react/20/solid";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { canDeleteContent } from "@/lib/forumUtils";
import { DunaContentRenderer, DunaEditor } from "@/components/duna-editor";
import { Button } from "@/components/ui/button";
import { Reply } from "lucide-react";
import SoftDeletedContent from "@/components/Forum/SoftDeletedContent";
import EmojiReactions from "@/components/Forum/EmojiReactions";
import { cn } from "@/lib/utils";
import { formatRelative } from "@/components/ForumShared/utils";

export interface ThreadProps {
  comments: ForumPost[];
  categoryId?: number | null;
  onDelete?: (commentId: number) => void;
  onUpdate?: (commentId: number, updates: Partial<ForumPost>) => void;

  // Controlled reply state managed by parent
  onReply: (commentId: number) => void;
  isReplying: boolean;
  replyingToId: number | null;
  replyContent: string;
  onReplyContentChange: (content: string) => void;
  onSubmitReply: (e?: React.FormEvent) => void;
  onCancelReply: () => void;

  // Forums UX: reactions on. Replies always shown (no toggle)
  // Duna UX: reactions off. Replies always shown (no toggle)
  forForums?: boolean;
}

interface CommentItemProps extends Omit<ThreadProps, "comments"> {
  comment: ForumPost;
  depth: number;
  comments: ForumPost[];
}

const CommentItem = ({
  comment,
  depth,
  onDelete,
  onUpdate,
  comments,
  onReply,
  isReplying,
  replyingToId,
  replyContent,
  onReplyContentChange,
  onSubmitReply,
  onCancelReply,
  categoryId,
  forForums,
}: CommentItemProps) => {
  // Replies are always shown (no expand/collapse toggle)
  const { address } = useAccount();
  const { deletePost, restorePost } = useForum();
  const openDialog = useOpenDialog();
  const { isAdmin, canManageTopics } = useForumAdmin(categoryId || undefined);
  const [showReplies, setShowReplies] = React.useState(forForums ?? false);
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
        title: isAdmin ? "Permanently Delete Comment" : "Delete Comment",
        message: isAdmin
          ? "Are you sure you want to permanently delete this comment? This action cannot be undone."
          : "Are you sure you want to delete this comment?",
        onConfirm: async () => {
          const success = await deletePost(comment.id, isAdmin);
          if (success) {
            if (isAdmin) {
              onDelete?.(comment.id);
            } else {
              onUpdate?.(comment.id, {
                deletedAt: new Date().toISOString(),
                deletedBy: address || "",
              });
            }
          }
        },
      },
    });
  };

  const handleRestore = async (e: React.MouseEvent) => {
    openDialog({
      type: "CONFIRM",
      params: {
        title: "Restore Comment",
        message: "Are you sure you want to restore this comment?",
        onConfirm: async () => {
          const isAuthor =
            comment.author?.toLowerCase() === address?.toLowerCase();
          const success = await restorePost(comment.id, isAuthor);
          if (success) {
            onUpdate?.(comment.id, {
              deletedAt: null,
              deletedBy: null,
            });
          }
        },
      },
    });
  };

  if (comment.deletedAt) {
    const canDelete = canDeleteContent(
      address || "",
      comment.author || "",
      isAdmin,
      canManageTopics
    );
    return (
      <div
        className={`${depth > 0 ? "ml-2 sm:ml-4 mt-3 sm:mt-4" : "mt-3 sm:mt-4"}`}
      >
        <SoftDeletedContent
          contentType="comment"
          deletedAt={comment.deletedAt}
          deletedBy={comment.deletedBy || ""}
          canRestore={canDelete}
          onRestore={() => handleRestore({} as React.MouseEvent)}
          showRestoreButton={canDelete}
        />
      </div>
    );
  }

  return (
    // ml-2 sm:ml-4 mt-3 sm:mt-4 removed styles below
    <div className={`${depth > 0 ? "" : ""}`}>
      <div className="flex gap-2 sm:gap-3 relative">
        <div className="flex-shrink-0">
          <ENSAvatar
            ensName={comment.author}
            className="w-6 h-6 sm:w-8 sm:h-8"
          />
        </div>
        {hasReplies && forForums && (
          <>
            <div className="absolute top-8 sm:top-8 left-3 sm:left-4 h-[calc(100%-14px)] sm:h-[calc(100%-14px)] w-px bg-border"></div>
            <div className="absolute left-3 sm:left-4 bottom-[-16px] sm:bottom-[-30px] w-3 h-3 border-l border-b border-border rounded-bl-md"></div>
          </>
        )}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
            <ENSName address={comment.author || ""} />
            <span className="text-xs sm:text-sm text-secondary">
              {formatRelative(comment.createdAt)}
            </span>
            {canDelete && (
              <button
                onClick={handleDelete}
                className="p-1 text-red-500 hover:text-red-700 transition-colors"
                title="Delete comment"
              >
                <TrashIcon className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="text-secondary text-xs sm:text-sm mb-2">
            <DunaContentRenderer content={comment.content} />
          </div>

          <div className="flex items-center gap-3">
            {Boolean(forForums) && (
              <EmojiReactions
                targetType="post"
                targetId={comment.id}
                initialByEmoji={comment.reactionsByEmoji}
              />
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReply(comment.id)}
              className="text-xs text-secondary hover:text-primary p-1 h-6"
              disabled={isReplying}
            >
              <Reply className="w-3 h-3 mr-1" />
              Reply
            </Button>

            {hasReplies && !forForums && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="text-xs text-secondary hover:text-primary transition-colors cursor-pointer"
              >
                {replies.length} {replies.length === 1 ? "reply" : "replies"}
              </button>
            )}
          </div>
        </div>
      </div>

      {hasReplies && showReplies && (
        <div className="mt-3 ml-2 sm:ml-4 space-y-3">
          {replies.map((reply) => (
            <div
              key={reply.id}
              className={cn(
                "pl-3",
                forForums ? "" : "border-l-2 border-gray-200"
              )}
            >
              <CommentItem
                comment={reply}
                depth={depth + 1}
                onDelete={onDelete}
                onUpdate={onUpdate}
                comments={comments}
                onReply={onReply}
                isReplying={isReplying}
                replyingToId={replyingToId}
                replyContent={replyContent}
                onReplyContentChange={onReplyContentChange}
                onSubmitReply={onSubmitReply}
                onCancelReply={onCancelReply}
                categoryId={categoryId}
                forForums={forForums}
              />
            </div>
          ))}
          {!forForums && (
            <button
              onClick={() => setShowReplies(false)}
              className="text-xs text-secondary hover:text-primary transition-colors cursor-pointer"
            >
              Hide replies
            </button>
          )}
        </div>
      )}

      {isThisCommentBeingRepliedTo && (
        <div className="mt-3 ml-8 sm:ml-12 p-3 bg-gray-50 rounded-lg border border-line">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-secondary">
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
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={onSubmitReply}
              disabled={!replyContent.trim()}
              className="text-xs bg-black text-white hover:bg-black/90"
            >
              Reply
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

interface CommentThreadProps extends Omit<ThreadProps, "parentId" | "depth"> {
  comments: ForumPost[];
  parentId: number | null;
  depth: number;
}

const CommentThread = ({
  comments,
  parentId,
  depth,
  onDelete,
  onUpdate,
  onReply,
  isReplying,
  replyingToId,
  replyContent,
  onReplyContentChange,
  onSubmitReply,
  onCancelReply,
  categoryId,
  forForums,
}: CommentThreadProps) => {
  const filteredComments = comments.filter((comment) => {
    if (parentId === null) return !comment.parentId;
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
            onUpdate={onUpdate}
            comments={comments}
            onReply={onReply}
            isReplying={isReplying}
            replyingToId={replyingToId}
            replyContent={replyContent}
            onReplyContentChange={onReplyContentChange}
            onSubmitReply={onSubmitReply}
            onCancelReply={onCancelReply}
            categoryId={categoryId}
            forForums={forForums}
          />
        </div>
      ))}
    </>
  );
};

export default function Thread({
  comments,
  onReply,
  isReplying,
  replyingToId,
  replyContent,
  onReplyContentChange,
  onSubmitReply,
  onCancelReply,
  onDelete,
  onUpdate,
  categoryId,
  forForums = true,
}: ThreadProps) {
  return (
    <div className="space-y-3 sm:space-y-4">
      <CommentThread
        comments={comments}
        parentId={null}
        depth={0}
        onDelete={onDelete}
        onUpdate={onUpdate}
        onReply={onReply}
        isReplying={isReplying}
        replyingToId={replyingToId}
        replyContent={replyContent}
        onReplyContentChange={onReplyContentChange}
        onSubmitReply={onSubmitReply}
        onCancelReply={onCancelReply}
        categoryId={categoryId}
        forForums={forForums}
      />
    </div>
  );
}
