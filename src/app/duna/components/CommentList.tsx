import React from "react";
import ENSAvatar from "@/components/shared/ENSAvatar";
import ENSName from "@/components/shared/ENSName";
import { ForumPost } from "@/lib/forumUtils";
import { format } from "date-fns";
import { useAccount } from "wagmi";
import { useForum } from "@/hooks/useForum";
import { TrashIcon } from "@heroicons/react/20/solid";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { canDeleteContent } from "@/lib/forumAdminUtils";

interface CommentItemProps {
  comment: ForumPost;
  depth: number;
  onDelete?: (commentId: number) => void;
  isAdmin: boolean;
}

const CommentItem = ({
  comment,
  depth,
  onDelete,
  isAdmin,
}: CommentItemProps) => {
  const { address } = useAccount();
  const { deletePost } = useForum();
  const openDialog = useOpenDialog();

  const canDelete = canDeleteContent(
    address || "",
    comment.author || "",
    isAdmin
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
            <ENSName address={comment.author || ""} />
            <span className="text-xs sm:text-sm text-secondary">
              posted {format(new Date(comment.createdAt), "MMM d, yyyy hh:mm")}
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
  onDelete?: (commentId: number) => void;
  isAdmin: boolean;
}

const CommentThread = ({
  comments,
  parentId,
  depth,
  onDelete,
  isAdmin,
}: CommentThreadProps) => {
  const filteredComments = comments.filter(
    (comment) => (comment.parentId || null) === parentId
  );

  return (
    <>
      {filteredComments.map((comment) => (
        <div key={comment.id}>
          <CommentItem
            comment={comment}
            depth={depth}
            onDelete={onDelete}
            isAdmin={isAdmin}
          />
          <CommentThread
            comments={comments}
            parentId={comment.id}
            depth={depth + 1}
            onDelete={onDelete}
            isAdmin={isAdmin}
          />
        </div>
      ))}
    </>
  );
};

interface CommentListProps {
  comments: ForumPost[];
  onDelete?: (commentId: number) => void;
  isAdmin: boolean;
}

const CommentList = ({ comments, onDelete, isAdmin }: CommentListProps) => {
  return (
    <div className="space-y-3 sm:space-y-4">
      <CommentThread
        comments={comments}
        parentId={null}
        depth={0}
        onDelete={onDelete}
        isAdmin={isAdmin}
      />
    </div>
  );
};

export default CommentList;
