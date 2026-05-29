"use client";

import React, { useState } from "react";
import { ArrowCircle } from "@/icons/ArrowCircle";
import { DownloadCloud } from "@/icons/DownloadCloud";
import { ArchiveBoxIcon, TrashIcon } from "@heroicons/react/20/solid";
import { useAccount } from "wagmi";
import { useForum } from "@/hooks/useForum";
import { useHasPermission } from "@/hooks/useRbacPermissions";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import useRequireLogin from "@/hooks/useRequireLogin";
import { useStableCallback } from "@/hooks/useStableCallback";

interface FinancialStatement {
  id: number;
  name: string;
  url: string;
  ipfsCid: string;
  createdAt: string;
  uploadedBy: string;
  archived?: boolean;
  revealTime?: string | null;
  expirationTime?: string | null;
  topicId?: number;
  topicTitle?: string;
}

interface FinancialStatementsSectionProps {
  statements: FinancialStatement[];
  onStatementClick: (statement: FinancialStatement) => void;
  title: string;
}

function formatStatementDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function FinancialStatementsSection({
  statements,
  onStatementClick,
  title,
}: FinancialStatementsSectionProps) {
  const [localStatements, setLocalStatements] = useState<FinancialStatement[]>(
    statements || []
  );

  const { address } = useAccount();
  const { deleteAttachment, archiveAttachment } = useForum();
  const openDialog = useOpenDialog();
  const requireLogin = useRequireLogin();
  const stableDeleteAttachment = useStableCallback(deleteAttachment);
  const stableArchiveAttachment = useStableCallback(archiveAttachment);

  const { hasPermission: canArchiveFilings } = useHasPermission(
    "duna_filings",
    "filings",
    "archive"
  );
  const { hasPermission: canDeleteFilings } = useHasPermission(
    "duna_filings",
    "filings",
    "delete"
  );

  const handleDeleteAttachment = async (
    attachmentId: number,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    openDialog({
      type: "CONFIRM",
      params: {
        title: "Delete Attachment",
        message: "Are you sure you want to delete this attachment?",
        onConfirm: async () => {
          const loggedInAddress = await requireLogin();
          if (!loggedInAddress) {
            return;
          }

          const isAuthor =
            localStatements
              .find((doc) => doc.id === attachmentId)
              ?.uploadedBy?.toLowerCase() === loggedInAddress.toLowerCase();
          const success = await stableDeleteAttachment(
            attachmentId,
            "category",
            isAuthor
          );
          if (success) {
            setLocalStatements((prev) =>
              prev.filter((doc) => doc.id !== attachmentId)
            );
          }
        },
      },
    });
  };

  const handleArchiveAttachment = async (
    attachmentId: number,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    openDialog({
      type: "CONFIRM",
      params: {
        title: "Archive Attachment",
        message: "Are you sure you want to archive this attachment?",
        onConfirm: async () => {
          const loggedInAddress = await requireLogin();
          if (!loggedInAddress) {
            return;
          }

          const isAuthor =
            localStatements
              .find((doc) => doc.id === attachmentId)
              ?.uploadedBy?.toLowerCase() === loggedInAddress.toLowerCase();
          const success = await stableArchiveAttachment(
            attachmentId,
            "category",
            isAuthor
          );
          if (success) {
            setLocalStatements((prev) =>
              prev.filter((doc) => doc.id !== attachmentId)
            );
          }
        },
      },
    });
  };

  if (localStatements.length === 0) return null;
  const sortedStatements = [...localStatements].sort((a, b) => {
    const dateA = new Date(a.revealTime ?? a.createdAt);
    const dateB = new Date(b.revealTime ?? b.createdAt);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div>
      {title && (
        <h4 className="text-xs font-semibold text-tertiary uppercase tracking-wide mb-4">
          {title}
        </h4>
      )}
      <div className="flex flex-col divide-y divide-line">
        {sortedStatements.map((statement) => {
          const displayDate = formatStatementDate(
            statement.revealTime ?? statement.createdAt
          );
          const displayName = statement.name.replace(/\.[^/.]+$/, "");
          const isAuthor =
            address?.toLowerCase() === statement.uploadedBy?.toLowerCase();
          const canArchive = canArchiveFilings || isAuthor;
          const canDelete = canDeleteFilings;

          return (
            <div
              key={statement.id}
              className="flex items-center justify-between py-6 gap-4 group"
            >
              <div className="flex flex-col gap-1 min-w-0">
                <p className="text-base font-medium text-primary truncate">
                  {displayName}
                </p>
                <p className="text-xs text-tertiary">Published {displayDate}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => onStatementClick(statement)}
                  className="p-1.5 rounded-full hover:bg-wash transition-colors text-tertiary hover:text-primary"
                  title="Open"
                  aria-label="Open statement"
                >
                  <ArrowCircle className="w-5 h-5" />
                </button>
                {statement.url && (
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      try {
                        const response = await fetch(statement.url);
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const link = window.document.createElement("a");
                        link.href = url;
                        link.download = statement.name;
                        window.document.body.appendChild(link);
                        link.click();
                        window.document.body.removeChild(link);
                        window.URL.revokeObjectURL(url);
                      } catch (error) {
                        console.error("Download failed:", error);
                        // Fallback to opening in new tab
                        window.open(statement.url, "_blank");
                      }
                    }}
                    className="p-1.5 rounded-full hover:bg-wash transition-colors text-tertiary hover:text-primary"
                    title="Download"
                    aria-label="Download statement"
                  >
                    <DownloadCloud className="w-5 h-5" />
                  </button>
                )}
                {canArchive && !statement.archived && (
                  <button
                    onClick={(e) => handleArchiveAttachment(statement.id, e)}
                    className="p-1.5 rounded-full hover:bg-wash transition-colors text-tertiary hover:text-primary"
                    title="Archive"
                    aria-label="Archive statement"
                  >
                    <ArchiveBoxIcon className="w-5 h-5" />
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={(e) => handleDeleteAttachment(statement.id, e)}
                    className="p-1.5 rounded-full hover:bg-wash transition-colors text-tertiary hover:text-red-600"
                    title="Delete"
                    aria-label="Delete statement"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
