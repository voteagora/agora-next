"use client";

import React, { useState } from "react";
import { useForum } from "@/hooks/useForum";
import { useNavigate } from "@tanstack/react-router";
import ComposerModal from "@/components/ForumShared/ComposerModal";
import { buildForumTopicPath } from "@/lib/forumUtils";
import useRequireLogin from "@/hooks/useRequireLogin";
import { useStableCallback } from "@/hooks/useStableCallback";
import { InsufficientVPModal } from "@/components/Forum/InsufficientVPModal";

interface CreateTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateTopicModal({
  isOpen,
  onClose,
}: CreateTopicModalProps) {
  const navigate = useNavigate();
  const { createTopic, checkVPBeforeAction } = useForum();
  const requireLogin = useRequireLogin();
  const stableCreateTopic = useStableCallback(createTopic);
  const [showVPModal, setShowVPModal] = useState(false);

  return (
    <>
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
          const loggedIn = await requireLogin();
          if (!loggedIn) {
            return;
          }

          // Check VP before creating topic
          const vpCheck = checkVPBeforeAction("topic");
          if (!vpCheck.canProceed) {
            setShowVPModal(true);
            return;
          }

          const created = await stableCreateTopic({
            title: (title || "").trim(),
            content: content.trim(),
            attachment: attachment || undefined,
            categoryId: categoryId || undefined,
          });
          if (created?.id) {
            onClose();
            navigate({
              to: buildForumTopicPath(created.id, created.title) as never,
            });
          }
        }}
      />

      <InsufficientVPModal
        isOpen={showVPModal}
        onClose={() => setShowVPModal(false)}
        action="topic"
      />
    </>
  );
}
