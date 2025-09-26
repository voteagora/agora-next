"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useForum, useForumAdmin } from "@/hooks/useForum";
import { useAccount } from "wagmi";
import { TrashIcon, ArchiveBoxIcon } from "@heroicons/react/20/solid";
import DocumentUploadModal from "./DocumentUploadModal";
import Tenant from "@/lib/tenant/tenant";
import { useDunaCategory } from "@/hooks/useDunaCategory";
import {
  buildForumCategoryPath,
  canArchiveContent,
  canDeleteContent,
} from "@/lib/forumUtils";
import { FileIcon } from "lucide-react";
import Link from "next/link";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";

interface ForumDocument {
  id: number;
  name: string;
  url: string;
  ipfsCid: string;
  createdAt: string;
  uploadedBy: string;
}

interface ForumDocument {
  id: number;
  name: string;
  url: string;
  ipfsCid: string;
  createdAt: string;
  uploadedBy: string;
}

interface DocumentsSectionProps {
  initialDocuments: ForumDocument[];
  hideHeader?: boolean;
}

const DocumentsSection = ({
  initialDocuments,
  hideHeader = false,
}: DocumentsSectionProps) => {
  const [documents, setDocuments] = useState<ForumDocument[]>(
    initialDocuments || []
  );
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const openDialog = useOpenDialog();

  const { fetchDocuments, deleteAttachment, archiveAttachment } = useForum();

  const { address } = useAccount();
  const { dunaCategoryId } = useDunaCategory();
  const { isAdmin, canManageAttachments } = useForumAdmin(
    dunaCategoryId || undefined
  );

  const { ui } = Tenant.current();
  const useDarkStyling = ui.toggle("ui/use-dark-theme-styling")?.enabled;

  const handleUploadComplete = async () => {
    const documentsData = await fetchDocuments();
    setDocuments(documentsData);
    setIsUploadModalOpen(false);
  };

  const handleDocumentClick = (document: ForumDocument) => {
    if (document.url) {
      window.open(document.url, "_blank");
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
          const isAuthor =
            documents
              .find((doc) => doc.id === attachmentId)
              ?.uploadedBy?.toLowerCase() === address?.toLowerCase();
          const success = await deleteAttachment(
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
          const isAuthor =
            documents
              .find((doc) => doc.id === attachmentId)
              ?.uploadedBy?.toLowerCase() === address?.toLowerCase();
          const success = await archiveAttachment(
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

  return (
    <div className="space-y-4">
      {!hideHeader && (
        <div className="flex items-center justify-between">
          <h3
            className={`text-lg font-semibold ${
              useDarkStyling ? "text-white" : "text-primary"
            }`}
          >
            Documents
          </h3>
          {!!address && canManageAttachments && (
            <Button
              onClick={() => setIsUploadModalOpen(true)}
              className={`${
                useDarkStyling
                  ? "bg-buttonPrimaryDark text-white border-buttonPrimaryDark hover:bg-buttonPrimaryDark/80"
                  : "text-white border border-black hover:bg-gray-800"
              } text-sm`}
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
              Upload new document
            </Button>
          )}
        </div>
      )}
      {documents.length === 0 ? (
        <div className="text-center py-8">
          <p
            className={`text-sm opacity-75 ${
              useDarkStyling ? "text-white" : "text-secondary"
            }`}
          >
            No documents uploaded yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {documents.map((document, index) => {
            const canArchive = canArchiveContent(
              address || "",
              document.uploadedBy || "",
              isAdmin,
              canManageAttachments
            );
            const canDelete = canDeleteContent(
              address || "",
              document.uploadedBy || "",
              isAdmin,
              canManageAttachments
            );

            return (
              <div
                key={document.id || index}
                className={`flex items-center gap-2 px-3 py-2 rounded border transition-colors cursor-pointer ${
                  useDarkStyling
                    ? "border-cardBorder hover:bg-inputBackgroundDark"
                    : "bg-white hover:bg-gray-50"
                }`}
                style={
                  useDarkStyling
                    ? {
                        backgroundColor: "transparent",
                        borderColor: "#2B2449",
                      }
                    : {
                        borderColor: "#E5E5E5",
                      }
                }
                onClick={() => handleDocumentClick(document)}
              >
                <FileIcon
                  className={`w-4 h-4 flex-shrink-0 ${
                    useDarkStyling ? "text-white" : "text-gray-900"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm font-medium truncate ${
                      useDarkStyling ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {document.name}
                  </p>
                </div>
                {(canArchive || canDelete) && (
                  <>
                    {canArchive && (
                      <button
                        onClick={(e) => handleArchiveAttachment(document.id, e)}
                        className={`p-1 transition-colors ${
                          useDarkStyling
                            ? "text-[#87819F] hover:text-white"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                        title="Archive attachment"
                      >
                        <ArchiveBoxIcon className="w-4 h-4" />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={(e) => handleDeleteAttachment(document.id, e)}
                        className={`p-1 transition-colors ${
                          useDarkStyling
                            ? "text-red-400 hover:text-red-300"
                            : "text-red-500 hover:text-red-700"
                        }`}
                        title="Delete attachment"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        categoryId={dunaCategoryId!}
        onUploadComplete={handleUploadComplete}
      />
      <p className="text-md text-primary font-semibold ">
        Official DUNA Communications
      </p>
      <p className="text-sm text-primary">
        Want to talk about official items for the DUNA or discover discussions
        on it? Please head to the{" "}
        <Link
          href={buildForumCategoryPath(dunaCategoryId!, "DUNA")}
          className="underline"
        >
          DUNA forum.
        </Link>
      </p>
    </div>
  );
};

export default DocumentsSection;
