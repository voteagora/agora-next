"use client";

import React from "react";
import Thread from "@/components/ForumShared/Thread";
import type { ForumPost } from "@/lib/forumUtils";
import { useForum } from "@/hooks/useForum";
import { DunaEditor } from "@/components/duna-editor";
import { Button } from "@/components/ui/button";

interface ForumThreadProps {
  topicId: number;
  initialComments: ForumPost[];
  categoryId?: number | null;
}

export default function ForumThread({
  topicId,
  initialComments,
  categoryId,
}: ForumThreadProps) {
  const [comments, setComments] = React.useState<ForumPost[]>(initialComments);
  const [isReplying, setIsReplying] = React.useState(false);
  const [replyingToId, setReplyingToId] = React.useState<number | null>(null);
  const [replyContent, setReplyContent] = React.useState("");
  const { createPost } = useForum();
  const [rootContent, setRootContent] = React.useState("");
  const [postingRoot, setPostingRoot] = React.useState(false);

  React.useEffect(() => setComments(initialComments), [initialComments]);

  const onReply = (commentId: number) => {
    setIsReplying(true);
    setReplyingToId(commentId);
    setReplyContent("");
  };

  const onCancelReply = () => {
    setIsReplying(false);
    setReplyingToId(null);
    setReplyContent("");
  };

  const onSubmitReply = async () => {
    if (!replyContent.trim() || replyingToId == null) return;
    const newPost = await createPost(Number(topicId), {
      content: replyContent.trim(),
      parentId: replyingToId,
    });
    if (newPost) {
      setComments((prev) => [
        ...prev,
        {
          id: newPost.id,
          author: newPost.author,
          content: newPost.content,
          createdAt: newPost.createdAt,
          parentId: newPost.parentId,
          attachments: newPost.attachments,
          deletedAt: newPost.deletedAt,
          deletedBy: newPost.deletedBy,
          reactionsByEmoji: newPost.reactionsByEmoji,
        } as ForumPost,
      ]);
      onCancelReply();
    }
  };

  const onDelete = (commentId: number) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  const onUpdate = (commentId: number, updates: Partial<ForumPost>) => {
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, ...updates } : c))
    );
  };

  const submitRootReply = async () => {
    if (!rootContent.trim()) return;
    setPostingRoot(true);
    try {
      const newPost = await createPost(Number(topicId), {
        content: rootContent.trim(),
      });
      if (newPost) {
        setComments((prev) => [
          ...prev,
          {
            id: newPost.id,
            author: newPost.author,
            content: newPost.content,
            createdAt: newPost.createdAt,
            parentId: undefined,
            attachments: newPost.attachments,
            deletedAt: newPost.deletedAt,
            deletedBy: newPost.deletedBy,
            reactionsByEmoji: newPost.reactionsByEmoji,
          } as ForumPost,
        ]);
        setRootContent("");
      }
    } finally {
      setPostingRoot(false);
    }
  };

  return (
    <div className="space-y-6">
      <Thread
        comments={comments}
        forForums
        categoryId={categoryId ?? undefined}
        onReply={onReply}
        isReplying={isReplying}
        replyingToId={replyingToId}
        replyContent={replyContent}
        onReplyContentChange={setReplyContent}
        onSubmitReply={onSubmitReply}
        onCancelReply={onCancelReply}
        onDelete={onDelete}
        onUpdate={onUpdate}
      />

      {/* Root-level reply composer */}
      <div className="mt-4 sticky bottom-[45px] bg-neutral pb-[10px]">
        <DunaEditor
          variant="comment"
          placeholder="Comment"
          value={rootContent}
          onChange={setRootContent}
          disabled={postingRoot}
        />
        <div className="flex justify-end mt-2">
          <Button
            onClick={submitRootReply}
            disabled={
              !rootContent.replace(/<[^>]*>/g, "").trim() || postingRoot
            }
            className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-md text-sm"
          >
            {postingRoot ? "Posting..." : "Comment"}
          </Button>
        </div>
      </div>
    </div>
  );
}
