"use client";

import React, { useState } from "react";
import Thread from "@/components/ForumShared/Thread";
import type { ForumPost } from "@/lib/forumUtils";
import { useForum } from "@/hooks/useForum";
import useRequireLogin from "@/hooks/useRequireLogin";
import { DunaEditor } from "@/components/duna-editor";
import { Button } from "@/components/ui/button";
import { uploadToIPFSOnly } from "@/lib/actions/attachment";
import { convertFileToAttachmentData } from "@/lib/fileUtils";
import { useStableCallback } from "@/hooks/useStableCallback";
import { InsufficientVPModal } from "@/components/Forum/InsufficientVPModal";
import Tenant from "@/lib/tenant/tenant";
import { TENANT_NAMESPACES } from "@/lib/constants";

const { namespace } = Tenant.current();

interface ForumThreadProps {
  topicId: number;
  initialComments: ForumPost[];
  categoryId?: number | null;
  adminDirectory?: { address: string; role?: string | null }[];
}

export default function ForumThread({
  topicId,
  initialComments,
  categoryId,
  adminDirectory,
}: ForumThreadProps) {
  const [comments, setComments] = React.useState<ForumPost[]>(initialComments);
  const [isReplying, setIsReplying] = React.useState(false);
  const [replyingToId, setReplyingToId] = React.useState<number | null>(null);
  const [replyContent, setReplyContent] = React.useState("");
  const { createPost, permissions, checkVPBeforeAction } = useForum();
  const [rootContent, setRootContent] = React.useState("");
  const [postingRoot, setPostingRoot] = React.useState(false);
  const requireLogin = useRequireLogin();
  const stableCreatePost = useStableCallback(createPost);
  const [showVPModal, setShowVPModal] = useState(false);

  React.useEffect(() => setComments(initialComments), [initialComments]);

  const bgStyle =
    namespace === TENANT_NAMESPACES.SYNDICATE
      ? "bg-white"
      : "bg-buttonBackground";
  const textStyle =
    namespace === TENANT_NAMESPACES.SYNDICATE ||
    namespace === TENANT_NAMESPACES.TOWNS
      ? "text-primary"
      : "text-neutral";

  const onReply = async (commentId: number) => {
    if (!(await requireLogin())) {
      return;
    }
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
    const loggedIn = await requireLogin();
    if (!loggedIn) return;

    // Check VP before posting
    const vpCheck = checkVPBeforeAction("post");
    if (!vpCheck.canProceed) {
      setShowVPModal(true);
      return;
    }

    const newPost = await stableCreatePost(Number(topicId), {
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

  const handleImageUpload = React.useCallback(
    async (file: File) => {
      const loggedInAddress = await requireLogin();
      if (!loggedInAddress) return;

      // Upload to IPFS only (no database record yet)
      const attachmentData = await convertFileToAttachmentData(file);
      const uploadResult = await uploadToIPFSOnly(
        attachmentData,
        loggedInAddress
      );

      if (!uploadResult.success || !uploadResult.ipfsUrl) {
        throw new Error(uploadResult.error || "Upload failed");
      }

      return uploadResult.ipfsUrl;
    },
    [requireLogin]
  );

  const submitRootReply = async () => {
    if (!rootContent.trim()) return;
    const loggedIn = await requireLogin();
    if (!loggedIn) return;

    // Check VP before posting
    const vpCheck = checkVPBeforeAction("post");
    if (!vpCheck.canProceed) {
      setShowVPModal(true);
      return;
    }

    setPostingRoot(true);
    try {
      const newPost = await stableCreatePost(Number(topicId), {
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
    <>
      <div className="space-y-6">
        <Thread
          comments={comments}
          forForums
          categoryId={categoryId ?? undefined}
          topicId={topicId}
          adminDirectory={adminDirectory}
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
        <div className="mt-4 sticky bottom-[45px] bg-brandSecondary pb-[10px]">
          <DunaEditor
            variant="comment"
            placeholder="Comment"
            value={rootContent}
            onChange={setRootContent}
            disabled={postingRoot}
            onImageUpload={handleImageUpload}
          />
          <div className="flex justify-end mt-2">
            <Button
              onClick={submitRootReply}
              disabled={
                !rootContent.replace(/<[^>]*>/g, "").trim() || postingRoot
              }
              className={`bg-buttonBackground shadow-sm hover:bg-hoverBackground text-sm px-6 py-2 rounded-md ${bgStyle} ${textStyle}`}
            >
              {postingRoot ? "Posting..." : "Comment"}
            </Button>
          </div>
        </div>
      </div>

      <InsufficientVPModal
        isOpen={showVPModal}
        onClose={() => setShowVPModal(false)}
        action="post"
      />
    </>
  );
}
