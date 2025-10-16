"use client";

import { useState } from "react";
import { useForum } from "@/hooks/useForum";
import { InsufficientVPModal } from "./InsufficientVPModal";

interface CreatePostWithVPCheckProps {
  topicId: number;
  onSuccess?: () => void;
}

/**
 * Example component showing how to use VP checks with the modal
 * This can be used as a reference for implementing VP checks in other components
 */
export function CreatePostWithVPCheck({
  topicId,
  onSuccess,
}: CreatePostWithVPCheckProps) {
  const { createPost, permissions, checkVPBeforeAction } = useForum();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVPModal, setShowVPModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check VP before proceeding
    const vpCheck = checkVPBeforeAction("post");

    if (!vpCheck.canProceed) {
      // Show modal instead of blocking
      setShowVPModal(true);
      return;
    }

    // Proceed with post creation
    setIsSubmitting(true);
    try {
      const result = await createPost(topicId, { content });

      if (result && "id" in result) {
        setContent("");
        onSuccess?.();
      }
    } catch (error) {
      console.error("Failed to create post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your reply..."
          className="w-full min-h-[100px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isSubmitting}
        />

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "Posting..." : "Post Reply"}
          </button>
        </div>
      </form>

      {/* VP Modal */}
      <InsufficientVPModal
        isOpen={showVPModal}
        onClose={() => setShowVPModal(false)}
        action="post"
      />
    </>
  );
}
