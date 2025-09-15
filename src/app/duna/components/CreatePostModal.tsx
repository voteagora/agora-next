"use client";

import React from "react";
import ComposerModal from "@/components/ForumShared/ComposerModal";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; content: string; attachment?: File }) => Promise<void>;
}

const CreatePostModal = ({ isOpen, onClose, onSubmit }: CreatePostModalProps) => {
  return (
    <ComposerModal
      isOpen={isOpen}
      onClose={onClose}
      dialogTitle="Create New Post"
      titleLabel="Title"
      contentLabel="Content"
      titleRequired
      submitLabel="Create Post"
      contentPlaceholder="Write your DUNA post…"
      onSubmit={async ({ title, content, attachment }) => {
        await onSubmit({
          title: (title || "").trim(),
          content: content.trim(),
          attachment: attachment || undefined,
        });
      }}
    />
  );
};

export default CreatePostModal;
