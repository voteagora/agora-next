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

interface ForumDocument {
  id: number;
  name: string;
  url: string;
  ipfsCid: string;
  createdAt: string;
  uploadedBy: string;
  archived?: boolean;
  revealTime?: string | null;
  expirationTime?: string | null;
  fileSize?: number;
}

interface FormationDocumentsListProps {
  initialDocuments: ForumDocument[];
  onDocumentOpen?: (document: ForumDocument) => void;
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return "";
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function formatDocumentDate(dateStr: string): string {
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

export default function FormationDocumentsList({
  initialDocuments,
  onDocumentOpen,
}: FormationDocumentsListProps) {
  const [documents, setDocuments] = useState<ForumDocument[]>(
    initialDocuments || []
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

  const handleDocumentClick = (document: ForumDocument) => {
    if (onDocumentOpen) {
      onDocumentOpen(document);
    } else if (document.url) {
      window.open(document.url, "_blank");
    }
  };

  const handleDownload = async (
    e: React.MouseEvent,
    document: ForumDocument
  ) => {
    e.stopPropagation();
    if (document.url) {
      try {
        const response = await fetch(document.url);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = window.document.createElement("a");
        link.href = url;
        link.download = document.name;
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Download failed:", error);
        // Fallback to opening in new tab
        window.open(document.url, "_blank");
      }
    }
  };

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
            documents
              .find((doc) => doc.id === attachmentId)
              ?.uploadedBy?.toLowerCase() === loggedInAddress.toLowerCase();
          const success = await stableDeleteAttachment(
            attachmentId,
            "category",
            isAuthor
          );
          if (success) {
            setDocuments((prev) =>
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
            documents
              .find((doc) => doc.id === attachmentId)
              ?.uploadedBy?.toLowerCase() === loggedInAddress.toLowerCase();
          const success = await stableArchiveAttachment(
            attachmentId,
            "category",
            isAuthor
          );
          if (success) {
            setDocuments((prev) =>
              prev.filter((doc) => doc.id !== attachmentId)
            );
          }
        },
      },
    });
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-tertiary opacity-75">No documents yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {documents.map((document, index) => {
        const displayName = document.name.replace(/\.[^/.]+$/, "");
        const displayDate = formatDocumentDate(document.createdAt);
        const displaySize = formatFileSize(document.fileSize);
        const isLast = index === documents.length - 1;
        const isAuthor =
          address?.toLowerCase() === document.uploadedBy?.toLowerCase();
        const canArchive = canArchiveFilings || isAuthor;
        const canDelete = canDeleteFilings;

        return (
          <div
            key={document.id}
            className={`flex items-center gap-6 py-6 ${
              !isLast ? "border-b border-line" : ""
            }`}
          >
            <div className="flex-1 min-w-0">
              <p className="text-base font-medium text-primary truncate">
                {displayName}
              </p>
              <p className="text-xs font-semibold text-tertiary mt-px">
                Published {displayDate}
                {displaySize && ` • ${displaySize}`}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => handleDocumentClick(document)}
                className="p-1.5 rounded-full hover:bg-wash transition-colors text-tertiary hover:text-primary"
                title="Open"
                aria-label="Open document"
              >
                <ArrowCircle className="w-6 h-6" />
              </button>
              {document.url && (
                <button
                  onClick={(e) => handleDownload(e, document)}
                  className="p-1.5 rounded-full hover:bg-wash transition-colors text-tertiary hover:text-primary"
                  title="Download"
                  aria-label="Download document"
                >
                  <DownloadCloud className="w-6 h-6" />
                </button>
              )}
              {canArchive && !document.archived && (
                <button
                  onClick={(e) => handleArchiveAttachment(document.id, e)}
                  className="p-1.5 rounded-full hover:bg-wash transition-colors text-tertiary hover:text-primary"
                  title="Archive"
                  aria-label="Archive document"
                >
                  <ArchiveBoxIcon className="w-5 h-5" />
                </button>
              )}
              {canDelete && (
                <button
                  onClick={(e) => handleDeleteAttachment(document.id, e)}
                  className="p-1.5 rounded-full hover:bg-wash transition-colors text-tertiary hover:text-red-600"
                  title="Delete"
                  aria-label="Delete document"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
