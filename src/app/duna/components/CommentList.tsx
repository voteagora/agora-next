import React from "react";
import { ForumPost } from "@/lib/forumUtils";
import Thread from "@/components/ForumShared/Thread";
import { useDunaCategory } from "@/hooks/useDunaCategory";
import { useForumAdminsList } from "@/hooks/useForum";

interface CommentListProps {
  comments: ForumPost[];
  onDelete?: (commentId: number) => void;
  onUpdate?: (commentId: number, updates: Partial<ForumPost>) => void;
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
  onUpdate,
}: CommentListProps) => {
  const { dunaCategoryId } = useDunaCategory();
  const { admins } = useForumAdminsList();
  const adminAddresses = React.useMemo(
    () => admins.map((admin) => admin.address).filter(Boolean),
    [admins]
  );
  return (
    <Thread
      comments={comments}
      categoryId={dunaCategoryId ?? undefined}
      forForums={false}
      onReply={onReply}
      isReplying={isReplying}
      replyingToId={replyingToId}
      replyContent={replyContent}
      onReplyContentChange={onReplyContentChange}
      onSubmitReply={onSubmitReply}
      onCancelReply={onCancelReply}
      onDelete={onDelete}
      onUpdate={onUpdate}
      adminAddresses={adminAddresses}
    />
  );
};

export default CommentList;
