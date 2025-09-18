"use client";

import React from "react";
import { useForum } from "@/hooks/useForum";
import { useRouter } from "next/navigation";
import ComposerModal from "@/components/ForumShared/ComposerModal";
import { buildForumTopicPath } from "@/lib/forumUtils";

interface CreateTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateTopicModal({ isOpen, onClose }: CreateTopicModalProps) {
  const router = useRouter();
  const { createTopic } = useForum();

  return (
    <ComposerModal
      isOpen={isOpen}
      onClose={onClose}
      dialogTitle="Create New Topic"
      titleLabel="Title"
      contentLabel="Content"
      titleRequired
      submitLabel="Create Topic"
      contentPlaceholder="Write your topic…"
      renderCategory
      onSubmit={async ({ title, content, attachment, categoryId }) => {
        const created = await createTopic({
          title: (title || "").trim(),
          content: content.trim(),
          attachment: attachment || undefined,
          categoryId: categoryId || undefined,
        });
        if (created?.id) {
          onClose();
          router.push(buildForumTopicPath(created.id, created.title));
        }
      }}
    />
  );
}
