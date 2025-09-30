"use client";

import React from "react";
import {
  ChatBubbleLeftIcon,
  ClockIcon,
  PaperClipIcon,
  TrashIcon,
  ArchiveBoxIcon,
} from "@heroicons/react/20/solid";
import ENSName from "@/components/shared/ENSName";
import ENSAvatar from "@/components/shared/ENSAvatar";
import { ForumTopic } from "@/lib/forumUtils";
import { formatDistanceToNow } from "date-fns";
import { useAccount } from "wagmi";
import { useForum, useForumAdmin } from "@/hooks/useForum";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { useDunaCategory } from "@/hooks/useDunaCategory";
import { canArchiveContent, canDeleteContent } from "@/lib/forumUtils";
import { DunaContentRenderer } from "@/components/duna-editor";
import Tenant from "@/lib/tenant/tenant";
import SoftDeletedContent from "@/components/Forum/SoftDeletedContent";
import useRequireLogin from "@/hooks/useRequireLogin";
import { useStableCallback } from "@/hooks/useStableCallback";

interface QuarterlyReportCardProps {
  report: ForumTopic;
  onClick: () => void;
  isLast?: boolean;
  onDelete?: () => void;
  onArchive?: () => void;
}

const QuarterlyReportCard = ({
  report,
  onClick,
  isLast,
  onDelete,
  onArchive,
}: QuarterlyReportCardProps) => {
  const { address } = useAccount();
  const { deleteTopic, archiveTopic, restoreTopic } = useForum();
  const openDialog = useOpenDialog();
  const { dunaCategoryId } = useDunaCategory();
  const { isAdmin, canManageTopics } = useForumAdmin(
    dunaCategoryId || undefined
  );
  const requireLogin = useRequireLogin();
  const stableDeleteTopic = useStableCallback(deleteTopic);
  const stableArchiveTopic = useStableCallback(archiveTopic);
  const stableRestoreTopic = useStableCallback(restoreTopic);

  const { ui } = Tenant.current();
  const useDarkStyling = ui.toggle("ui/use-dark-theme-styling")?.enabled;

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

  const content = report.content;

  const commentsCount = report.comments ? report.comments.length : 0;
  const createdAt = new Date(report.createdAt);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    openDialog({
      type: "CONFIRM",
      params: {
        title: isAdmin ? "Permanently Delete Post" : "Delete Post",
        message: isAdmin
          ? "Are you sure you want to permanently delete this post? This action cannot be undone."
          : "Are you sure you want to delete this post?",
        onConfirm: async () => {
          const loggedInAddress = await requireLogin();
          if (!loggedInAddress) {
            return;
          }

          const success = await stableDeleteTopic(report.id, isAdmin);
          if (success && onDelete) {
            onDelete();
          }
        },
      },
    });
  };

  const handleRestore = async (e: React.MouseEvent) => {
    openDialog({
      type: "CONFIRM",
      params: {
        title: "Restore Post",
        message: "Are you sure you want to restore this post?",
        onConfirm: async () => {
          const loggedInAddress = await requireLogin();
          if (!loggedInAddress) {
            return;
          }

          const isAuthor =
            report.author?.toLowerCase() === loggedInAddress.toLowerCase();
          const success = await stableRestoreTopic(report.id, isAuthor);
          if (success && onDelete) {
            onDelete();
          }
        },
      },
    });
  };

  const handleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    openDialog({
      type: "CONFIRM",
      params: {
        title: "Archive Post",
        message: "Are you sure you want to archive this post?",
        onConfirm: async () => {
          const loggedInAddress = await requireLogin();
          if (!loggedInAddress) {
            return;
          }

          const isAuthor =
            report.author?.toLowerCase() === loggedInAddress.toLowerCase();
          const success = await stableArchiveTopic(report.id, isAuthor);
          if (success && onArchive) {
            onArchive();
          }
        },
      },
    });
  };

  if (report.deletedAt) {
    const canDelete = canDeleteContent(
      address || "",
      report.author || "",
      isAdmin,
      canManageTopics
    );
    return (
      <div
        className={`p-4 ${!isLast ? "border-b" : ""}`}
        style={!isLast ? { borderBottomColor: "#E5E5E5" } : {}}
      >
        <SoftDeletedContent
          contentType="topic"
          deletedAt={report.deletedAt}
          deletedBy={report.deletedBy || ""}
          canRestore={canDelete}
          onRestore={() => handleRestore({} as React.MouseEvent)}
          showRestoreButton={canDelete}
        />
      </div>
    );
  }

  return (
    <div
      className={`p-4 cursor-pointer transition-colors ${
        !isLast ? "border-b" : ""
      } ${useDarkStyling ? "hover:bg-inputBackgroundDark" : "hover:bg-gray-50"}`}
      style={
        !isLast
          ? {
              borderBottomColor: useDarkStyling ? "#2B2449" : "#E5E5E5",
            }
          : {}
      }
      onClick={onClick}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3 gap-2">
        <div className="flex-1">
          <h5
            className={`font-bold text-base mb-1 ${
              useDarkStyling ? "text-white" : "text-primary"
            }`}
          >
            {report.title}
          </h5>
        </div>
        <div className="flex items-center gap-2 text-sm sm:ml-4">
          <ENSAvatar ensName={report.author} className="w-6 h-6" />
          <div
            className={`${useDarkStyling ? "text-white" : "text-[#87819F]"}`}
          >
            <ENSName address={report.author} />
          </div>
          {(canArchive || canDelete) && (
            <>
              {canArchive && (
                <button
                  onClick={handleArchive}
                  className={`p-1 transition-colors ${
                    useDarkStyling
                      ? "text-[#87819F] hover:text-white"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  title="Archive post"
                >
                  <ArchiveBoxIcon className="w-4 h-4" />
                </button>
              )}
              {canDelete && (
                <button
                  onClick={handleDelete}
                  className={`p-1 transition-colors ${
                    useDarkStyling
                      ? "text-red-400 hover:text-red-300"
                      : "text-red-500 hover:text-red-700"
                  }`}
                  title="Delete post"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="mb-4">
        <div
          className={`text-sm leading-relaxed line-clamp-2 ${
            useDarkStyling ? "text-white" : "text-secondary"
          }`}
        >
          <DunaContentRenderer content={content} />
        </div>
      </div>

      <div
        className={`flex items-center justify-between text-xs ${
          useDarkStyling ? "text-[#87819F]" : "text-tertiary"
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <ChatBubbleLeftIcon className="w-4 h-4" />
            <span>{commentsCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <ClockIcon className="w-4 h-4" />
            <span>{formatDistanceToNow(createdAt, { addSuffix: true })}</span>
          </div>
          <div className="flex items-center gap-1">
            <PaperClipIcon className="w-4 h-4" />
            <span>
              {report.attachments?.length || 0} attachment
              {(report.attachments?.length || 0) !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuarterlyReportCard;
