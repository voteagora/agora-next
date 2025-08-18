"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  PaperClipIcon,
  TrashIcon,
  ArchiveBoxIcon,
} from "@heroicons/react/20/solid";
import ENSAvatar from "@/components/shared/ENSAvatar";
import { DunaEditor, DunaContentRenderer } from "@/components/duna-editor";
import ENSName from "@/components/shared/ENSName";
import { ForumTopic, ForumPost } from "@/lib/forumUtils";
import { format } from "date-fns";
import { useForum, useForumAdmin } from "@/hooks/useForum";
import { useAccount } from "wagmi";
import { ConnectKitButton } from "connectkit";
import CommentList from "./CommentList";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { useDunaCategory } from "@/hooks/useDunaCategory";
import { canArchiveContent, canDeleteContent } from "@/lib/forumAdminUtils";
import Tenant from "@/lib/tenant/tenant";

interface ReportModalProps {
  report: ForumTopic | null;
  onDelete?: () => void;
  onArchive?: () => void;
  onCommentAdded?: (newComment: ForumPost) => void;
  onCommentDeleted?: (commentId: number) => void;
  closeDialog: () => void;
}

const ReportModal = ({
  report,
  onDelete,
  onArchive,
  onCommentAdded,
  onCommentDeleted,
  closeDialog,
}: ReportModalProps) => {
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<ForumPost[]>(report?.comments || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingToId, setReplyingToId] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const { createPost, deleteTopic, archiveTopic } = useForum();
  const { address, isConnected } = useAccount();
  const openDialog = useOpenDialog();
  const { dunaCategoryId } = useDunaCategory();
  const { isAdmin, canManageTopics } = useForumAdmin(
    dunaCategoryId || undefined
  );

  const { ui } = Tenant.current();
  const useDarkStyling = ui.toggle("ui/use-dark-theme-styling")?.enabled;

  // Check if current tenant is Towns
  const { namespace } = Tenant.current();
  const isTowns = namespace === TENANT_NAMESPACES.TOWNS;

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
        onCommentAdded?.(commentWithAuthor);
        setNewComment("");
      }
    } catch (error) {
      console.error("Error creating comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = (commentId: number) => {
    setComments((prev) => prev.filter((comment) => comment.id !== commentId));
    onCommentDeleted?.(commentId);
  };

  const handleDeleteTopic = async () => {
    if (!report) return;

    openDialog({
      type: "CONFIRM",
      params: {
        title: "Delete Topic",
        message:
          "Are you sure you want to delete this topic? This action cannot be undone.",
        onConfirm: async () => {
          const success = await deleteTopic(report.id);
          if (success && onDelete) {
            onDelete();
            closeDialog();
          }
        },
      },
    });
  };

  const handleArchiveTopic = async () => {
    if (!report) return;

    openDialog({
      type: "CONFIRM",
      params: {
        title: "Archive Topic",
        message:
          "Are you sure you want to archive this topic? This action cannot be undone.",
        onConfirm: async () => {
          const success = await archiveTopic(report.id);
          if (success && onArchive) {
            onArchive();
            closeDialog();
          }
        },
      },
    });
  };

  const handleReply = (commentId: number) => {
    setReplyingToId(commentId);
  };

  const handleCancelReply = () => {
    setReplyingToId(null);
    setReplyContent("");
  };

  const handleSubmitReply = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!replyContent.trim() || !report || !replyingToId) {
      return;
    }

    setIsSubmitting(true);
    try {
      const newReplyData = await createPost(report.id, {
        content: replyContent.trim(),
        parentId: replyingToId,
      });

      if (newReplyData) {
        const replyWithAuthor = {
          ...newReplyData,
          author: newReplyData.author || address || "",
          parentId: newReplyData.parentId || replyingToId,
        };
        setComments((prev) => [...prev, replyWithAuthor]);
        onCommentAdded?.(replyWithAuthor);
        setReplyContent("");
        setReplyingToId(null);
      }
    } catch (error) {
      console.error("Error creating reply:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!report) {
    return null;
  }

  const canArchive = canArchiveContent(
    address || "",
    report.author || "",
    isAdmin,
    canManageTopics
  );
  const canDelete = canDeleteContent(
    address || "",
    report.author || "",
    isAdmin,
    canManageTopics
  );

  return (
    <div
      className={`max-w-3xl p-4 ${useDarkStyling ? "bg-modalBackgroundDark" : "bg-white"}`}
    >
      <div
        className={`pb-4 sm:pb-6 border-b ${
          useDarkStyling ? "border-cardBorder" : "border-line"
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2
              className={`text-xl sm:text-2xl font-black mb-2 ${
                useDarkStyling ? "text-white" : "text-primary"
              }`}
            >
              {report.title}
            </h2>
            <div
              className={`text-xs sm:text-sm flex gap-2 divide-x ${
                useDarkStyling ? "text-[#87819F]" : "text-secondary"
              }`}
            >
              <span>
                Created{" "}
                {format(new Date(report.createdAt), "MMM d, yyyy hh:mm")}
              </span>
              <span className="pl-2">{comments.length} comments</span>
              <span className="pl-2">
                {report.attachments?.length || 0} attachment
                {(report.attachments?.length || 0) !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
          {(canArchive || canDelete) && (
            <div className="flex gap-2 mr-4">
              {canArchive && (
                <button
                  onClick={handleArchiveTopic}
                  className={`p-2 transition-colors cursor-pointer border rounded-md ${
                    useDarkStyling
                      ? "text-textSecondary hover:text-white border-cardBorder hover:border-buttonPrimaryDark"
                      : "text-gray-500 hover:text-gray-700 border-gray-500"
                  }`}
                  title="Archive topic"
                >
                  <ArchiveBoxIcon className="w-5 h-5" />
                </button>
              )}
              {canDelete && (
                <button
                  onClick={handleDeleteTopic}
                  className={`p-2 transition-colors cursor-pointer border rounded-md ${
                    useDarkStyling
                      ? "text-red-400 hover:text-red-300 border-red-400 hover:border-red-300"
                      : "text-red-500 hover:text-red-700 border-red-500"
                  }`}
                  title="Delete topic"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
        </div>

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
                <div
                  className={`${useDarkStyling ? "text-white" : "text-primary"}`}
                >
                  <ENSName address={report.author || ""} />
                </div>
                <span
                  className={`text-xs sm:text-sm ${
                    useDarkStyling ? "text-[#87819F]" : "text-secondary"
                  }`}
                >
                  posted{" "}
                  {format(new Date(report.createdAt), "MMM d, yyyy hh:mm")}
                </span>
              </div>

              {/* Report Content */}
              <div
                className={`leading-relaxed ${
                  useDarkStyling ? "text-white" : "text-secondary"
                }`}
              >
                <DunaContentRenderer content={report.content} />
              </div>
            </div>
          </div>

          {/* Attachments */}
          {report.attachments && report.attachments.length > 0 && (
            <div
              className={`border-t pt-3 sm:pt-4 ${
                useDarkStyling ? "border-cardBorder" : "border-line"
              }`}
            >
              <div
                className={`text-xs sm:text-sm font-semibold mb-2 sm:mb-3 ${
                  useDarkStyling ? "text-white" : "text-primary"
                }`}
              >
                Attachment
              </div>
              <div className="space-y-2">
                {report.attachments.map((attachment) => (
                  <Button
                    key={attachment.id}
                    variant="outline"
                    className={`w-full justify-start text-xs sm:text-sm ${
                      useDarkStyling
                        ? "bg-inputBackgroundDark border-cardBorder hover:bg-buttonPrimaryDark text-white"
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                    }`}
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
          <div
            className={`border-t pt-3 sm:pt-4 ${
              useDarkStyling ? "border-cardBorder" : "border-line"
            }`}
          >
            <h4
              className={`text-base sm:text-lg font-bold mb-3 sm:mb-4 ${
                useDarkStyling ? "text-white" : "text-primary"
              }`}
            >
              Comments ({comments.length})
            </h4>

            <CommentList
              comments={comments}
              onReply={handleReply}
              isReplying={replyingToId !== null}
              replyingToId={replyingToId}
              replyContent={replyContent}
              onReplyContentChange={setReplyContent}
              onSubmitReply={handleSubmitReply}
              onCancelReply={handleCancelReply}
              onDelete={handleDeleteComment}
            />

            {/* Comment Input */}
            <div
              className={`mt-4 sm:mt-6 pt-3 sm:pt-4 border-t ${
                useDarkStyling ? "border-cardBorder" : "border-line"
              }`}
            >
              {!isConnected ? (
                <div className="text-center py-3 sm:py-4 flex items-center justify-center">
                  <ConnectKitButton.Custom>
                    {({ show }) => (
                      <Button
                        onClick={() => show?.()}
                        className={`${
                          useDarkStyling
                            ? "bg-buttonPrimaryDark text-white border-[#5A4B7A] hover:bg-buttonPrimaryDark/80"
                            : "text-white border border-black hover:bg-gray-800"
                        } text-xs sm:text-sm w-full sm:w-auto`}
                        style={
                          !useDarkStyling
                            ? {
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
                              }
                            : undefined
                        }
                      >
                        Connect your wallet to comment
                      </Button>
                    )}
                  </ConnectKitButton.Custom>
                </div>
              ) : (
                <form onSubmit={handleSubmitComment}>
                  <DunaEditor
                    variant="comment"
                    placeholder="Write a comment…"
                    value={newComment}
                    onChange={(html) => setNewComment(html)}
                    disabled={isSubmitting}
                  />
                  <div className="flex justify-end mt-2">
                    <Button
                      type="submit"
                      disabled={isSubmitting || !newComment.trim()}
                      className={`${
                        useDarkStyling
                          ? "bg-buttonPrimaryDark text-white border-[#5A4B7A] hover:bg-buttonPrimaryDark/80"
                          : "text-white border border-black hover:bg-gray-800"
                      } text-xs sm:text-sm w-full sm:w-auto`}
                      style={
                        !useDarkStyling
                          ? {
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
                            }
                          : undefined
                      }
                    >
                      {isSubmitting ? "Posting..." : "Post"}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
