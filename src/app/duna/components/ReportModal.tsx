"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PaperClipIcon } from "@heroicons/react/20/solid";
import ENSAvatar from "@/components/shared/ENSAvatar";
import ENSName from "@/components/shared/ENSName";
import { useForum } from "@/hooks/useForum";
import { format } from "date-fns";

interface Comment {
  id: number;
  author: string;
  content: string;
  createdAt: string;
  parentId?: number;
}

interface Report {
  id: number;
  title: string;
  author: string;
  content: string;
  createdAt: string;
  attachments: {
    id: number;
    fileName: string;
    url: string;
    contentType: string;
    fileSize: number;
  }[];
  comments: Comment[];
}

interface ReportModalProps {
  report: Report | null;
  isOpen: boolean;
  onClose: () => void;
}

const ReportModal = ({ report, isOpen, onClose }: ReportModalProps) => {
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createPost, loading, error } = useForum();

  useEffect(() => {
    if (report) {
      setComments(report.comments || []);
    }
  }, [report]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !report) return;

    setIsSubmitting(true);
    try {
      const newCommentData = await createPost(report.id, {
        content: newComment.trim(),
      });

      if (newCommentData) {
        setComments((prev) => [...prev, newCommentData]);
        setNewComment("");
      }
    } catch (error) {
      console.error("Error creating comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to render comments with proper threading
  const renderComments = (
    comments: Comment[],
    parentId: number | null = null,
    depth: number = 0
  ) => {
    const filteredComments = comments.filter(
      (comment) => (comment.parentId || null) === parentId
    );

    return filteredComments.map((comment) => (
      <div key={comment.id} className={`${depth > 0 ? "ml-8 mt-4" : "mt-4"}`}>
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <ENSAvatar ensName={comment.author} className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <ENSName address={comment.author} />
              <span className="text-sm text-secondary">
                posted {format(new Date(comment.createdAt), "yyyy-MM-dd")}
              </span>
            </div>
            <div className="text-secondary">{comment.content}</div>
          </div>
        </div>
        {renderComments(comments, comment.id, depth + 1)}
      </div>
    ));
  };

  // Don't render if no report is provided
  if (!report) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader className="pb-4 border-b border-line">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-black text-primary pr-8">
              {report.title}
            </DialogTitle>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <ENSAvatar ensName={report.author} className="w-8 h-8" />
            <ENSName address={report.author} />
            <span className="text-sm text-secondary">
              posted {format(new Date(report.createdAt), "yyyy-MM-dd")}
            </span>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Report Content */}
          <div className="text-secondary leading-relaxed whitespace-pre-wrap">
            {report.content}
          </div>

          {/* Attachments */}
          {report.attachments && report.attachments.length > 0 && (
            <div className="border-t border-line pt-4">
              <div className="text-sm font-semibold text-primary mb-2">
                Attachment{report.attachments.length > 1 ? "s" : ""} (
                {report.attachments.length})
              </div>
              <div className="space-y-2">
                {report.attachments.map((attachment) => (
                  <Button
                    key={attachment.id}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => window.open(attachment.url, "_blank")}
                  >
                    <PaperClipIcon className="w-4 h-4 mr-2" />
                    {attachment.fileName || `Attachment ${attachment.id}`}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Comments Section */}
          <div className="border-t border-line pt-4">
            <h4 className="text-lg font-bold text-primary mb-4">
              Comments ({comments.length})
            </h4>

            <div className="space-y-4">{renderComments(comments)}</div>

            {/* Comment Input */}
            <div className="mt-6 pt-4 border-t border-line">
              <form onSubmit={handleSubmitComment}>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full p-3 border border-line rounded-md bg-white text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  placeholder="Write a comment..."
                  disabled={isSubmitting}
                />
                <div className="flex justify-end mt-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting || !newComment.trim()}
                    className="bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSubmitting ? "Posting..." : "Post"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportModal;
