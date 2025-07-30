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
import { ForumTopic, ForumPost } from "@/lib/forumUtils";
import { format } from "date-fns";
import { useAccount } from "wagmi";
import { ConnectKitButton } from "connectkit";
import CommentList from "./CommentList";

interface ReportModalProps {
  report: ForumTopic | null;
  isOpen: boolean;
  onClose: () => void;
}

const ReportModal = ({ report, isOpen, onClose }: ReportModalProps) => {
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<ForumPost[]>(report?.comments || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createPost } = useForum();
  const { address, isConnected } = useAccount();

  useEffect(() => {
    if (report) {
      setComments(report.comments || []);
    }
  }, [report]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim() || !report) {
      return;
    }

    setIsSubmitting(true);
    try {
      const newCommentData = await createPost(report.id, {
        content: newComment.trim(),
      });

      if (newCommentData) {
        const commentWithAuthor = {
          ...newCommentData,
          author: newCommentData.author || address || "",
        };
        setComments((prev) => [...prev, commentWithAuthor]);
        setNewComment("");
      }
    } catch (error) {
      console.error("Error creating comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!report) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-[calc(100vw-2rem)] sm:w-full max-h-[90vh] overflow-y-auto overflow-x-hidden bg-white">
        <DialogHeader className="pb-4 sm:pb-6 border-b border-line">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl sm:text-2xl font-black text-primary mb-2">
                {report.title}
              </DialogTitle>
              <div className="text-xs sm:text-sm text-secondary">
                Created{" "}
                {format(new Date(report.createdAt), "MMM d, yyyy hh:mm")}{" "}
                {comments.length} comments {report.attachments?.length || 0}{" "}
                attachment{(report.attachments?.length || 0) !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-x-hidden">
          {/* Author and Content Section */}
          <div className="flex gap-3 sm:gap-4">
            <div className="flex-shrink-0">
              <ENSAvatar
                ensName={report.author}
                className="w-8 h-8 sm:w-10 sm:h-10"
              />
            </div>
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                <ENSName address={report.author || ""} />
                <span className="text-xs sm:text-sm text-secondary">
                  posted{" "}
                  {format(new Date(report.createdAt), "MMM d, yyyy hh:mm")}
                </span>
              </div>

              {/* Report Content */}
              <div className="text-secondary leading-relaxed space-y-3 sm:space-y-4">
                {report.content.split("\n\n").map((paragraph, index) => (
                  <p
                    key={index}
                    className="text-xs sm:text-sm break-words whitespace-pre-wrap leading-relaxed"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Attachments */}
          {report.attachments && report.attachments.length > 0 && (
            <div className="border-t border-line pt-3 sm:pt-4">
              <div className="text-xs sm:text-sm font-semibold text-primary mb-2 sm:mb-3">
                Attachment
              </div>
              <div className="space-y-2">
                {report.attachments.map((attachment) => (
                  <Button
                    key={attachment.id}
                    variant="outline"
                    className="w-full justify-start bg-gray-50 border-gray-200 hover:bg-gray-100 text-xs sm:text-sm"
                    onClick={() => window.open(attachment.url, "_blank")}
                  >
                    <PaperClipIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    {attachment.fileName || `Attachment ${attachment.id}`}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Comments Section */}
          <div className="border-t border-line pt-3 sm:pt-4">
            <h4 className="text-base sm:text-lg font-bold text-primary mb-3 sm:mb-4">
              Comments ({comments.length})
            </h4>

            <CommentList comments={comments} />

            {/* Comment Input */}
            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-line">
              {!isConnected ? (
                <div className="text-center py-3 sm:py-4 flex items-center justify-center">
                  <ConnectKitButton.Custom>
                    {({ show }) => (
                      <Button
                        onClick={() => show?.()}
                        className="text-white border border-black hover:bg-gray-800 text-xs sm:text-sm w-full sm:w-auto"
                        style={{
                          display: "flex",
                          height: "36px",
                          padding: "12px 20px",
                          justifyContent: "center",
                          alignItems: "center",
                          gap: "8px",
                          flexShrink: 0,
                          borderRadius: "8px",
                          background: "#171717",
                          boxShadow:
                            "0 4px 12px 0 rgba(0, 0, 0, 0.02), 0 2px 2px 0 rgba(0, 0, 0, 0.03)",
                        }}
                      >
                        Connect your wallet to comment
                      </Button>
                    )}
                  </ConnectKitButton.Custom>
                </div>
              ) : (
                <form onSubmit={handleSubmitComment}>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full p-2 sm:p-3 border rounded-md bg-white text-primary focus:outline-none focus:ring-1 focus:ring-gray-200 resize-none font-normal text-xs sm:text-sm"
                    style={{ borderColor: "#E5E5E5" }}
                    rows={3}
                    placeholder="Write a comment..."
                    disabled={isSubmitting}
                  />
                  <div className="flex justify-end mt-2">
                    <Button
                      type="submit"
                      disabled={isSubmitting || !newComment.trim()}
                      className="text-white border border-black hover:bg-gray-800 text-xs sm:text-sm w-full sm:w-auto"
                      style={{
                        display: "flex",
                        height: "36px",
                        padding: "12px 20px",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "8px",
                        flexShrink: 0,
                        borderRadius: "8px",
                        background: "#171717",
                        boxShadow:
                          "0 4px 12px 0 rgba(0, 0, 0, 0.02), 0 2px 2px 0 rgba(0, 0, 0, 0.03)",
                      }}
                    >
                      {isSubmitting ? "Posting..." : "Post"}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportModal;
