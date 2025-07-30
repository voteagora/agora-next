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
import { useAccount } from "wagmi";
import { ConnectKitButton } from "connectkit";

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
  const { address, isConnected } = useAccount();

  useEffect(() => {
    if (report) {
      setComments(report.comments || []);
    }
  }, [report]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted, comment:", newComment);
    console.log("Report:", report);

    if (!newComment.trim() || !report) {
      console.log("Early return - no comment or report");
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("Creating post for report ID:", report.id);
      console.log("Current wallet address:", address);
      const newCommentData = await createPost(report.id, {
        content: newComment.trim(),
      });

      console.log("New comment data:", newCommentData);
      console.log("New comment author:", newCommentData?.author);
      console.log("New comment author type:", typeof newCommentData?.author);
      if (newCommentData) {
        // Ensure the comment has the correct author
        const commentWithAuthor = {
          ...newCommentData,
          author: newCommentData.author || address || "",
        };
        console.log("Comment with author:", commentWithAuthor);
        console.log("Using author:", commentWithAuthor.author);
        setComments((prev) => [...prev, commentWithAuthor]);
        setNewComment("");
      } else {
        console.log("No newCommentData returned");
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
              <ENSName address={comment.author || ""} />
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

  // Debug logging
  console.log("Report author:", report.author);
  console.log("Comments:", comments);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-full max-h-[90vh] overflow-y-auto overflow-x-hidden bg-white">
        <DialogHeader className="pb-6 border-b border-line">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-black text-primary mb-2">
                {report.title}
              </DialogTitle>
              <div className="text-sm text-secondary">
                Created {format(new Date(report.createdAt), "MMM d, yyyy")} •{" "}
                {comments.length} comments {report.attachments?.length || 0}{" "}
                attachment{(report.attachments?.length || 0) !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6 overflow-x-hidden">
          {/* Author and Content Section */}
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <ENSAvatar ensName={report.author} className="w-10 h-10" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <ENSName address={report.author || ""} />
                <span className="text-sm text-secondary">
                  posted {format(new Date(report.createdAt), "MMM d, yyyy")}
                </span>
              </div>

              {/* Report Content */}
              <div className="text-secondary leading-relaxed space-y-4">
                {report.content.split("\n\n").map((paragraph, index) => (
                  <p
                    key={index}
                    className="text-sm break-words whitespace-pre-wrap leading-relaxed"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Attachments */}
          {report.attachments && report.attachments.length > 0 && (
            <div className="border-t border-line pt-4">
              <div className="text-sm font-semibold text-primary mb-3">
                Attachment
              </div>
              <div className="space-y-2">
                {report.attachments.map((attachment) => (
                  <Button
                    key={attachment.id}
                    variant="outline"
                    className="w-full justify-start bg-gray-50 border-gray-200 hover:bg-gray-100"
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
              {!isConnected ? (
                <div className="text-center py-4">
                  <p className="text-sm text-secondary mb-3">
                    Connect your wallet to comment
                  </p>
                  <ConnectKitButton.Custom>
                    {({ show }) => (
                      <Button
                        onClick={() => show?.()}
                        className="text-white border border-black hover:bg-gray-800 text-sm"
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
                        Connect Wallet
                      </Button>
                    )}
                  </ConnectKitButton.Custom>
                </div>
              ) : (
                <form onSubmit={handleSubmitComment}>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full p-3 border rounded-md bg-white text-primary focus:outline-none focus:ring-1 focus:ring-gray-200 resize-none font-normal"
                    style={{ borderColor: "#E5E5E5" }}
                    rows={3}
                    placeholder="Write a comment..."
                    disabled={isSubmitting}
                  />
                  <div className="flex justify-end mt-2">
                    <Button
                      type="submit"
                      disabled={isSubmitting || !newComment.trim()}
                      className="text-white border border-black hover:bg-gray-800 text-sm"
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
