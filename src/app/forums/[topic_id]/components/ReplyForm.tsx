"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, Send, Bold, Italic, Link, User } from "lucide-react";

interface ReplyFormProps {
  topicId: string;
  parentId?: number;
  onReply?: () => void;
}

export default function ReplyForm({
  topicId,
  parentId,
  onReply,
}: ReplyFormProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Reset form
    setContent("");
    setIsSubmitting(false);
    onReply?.();
  };

  const insertAtCursor = (textToInsert: string) => {
    const textarea = document.querySelector("textarea") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent =
      content.slice(0, start) + textToInsert + content.slice(end);

    setContent(newContent);

    // Set cursor position after inserted text
    setTimeout(() => {
      textarea.setSelectionRange(
        start + textToInsert.length,
        start + textToInsert.length
      );
      textarea.focus();
    }, 0);
  };

  return (
    <div className="border-t pt-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-gray-600 text-sm">Join the discussion</span>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Comment"
          className="min-h-[80px] resize-none border-gray-300 rounded-md text-sm"
        />

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!content.trim() || isSubmitting}
            className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-md text-sm"
          >
            {isSubmitting ? "Posting..." : "Comment"}
          </Button>
        </div>
      </form>
    </div>
  );
}
