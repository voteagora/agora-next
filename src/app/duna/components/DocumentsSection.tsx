"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useForum } from "@/hooks/useForum";
import { useAccount } from "wagmi";
import { TrashIcon, ArchiveBoxIcon } from "@heroicons/react/20/solid";
import DocumentUploadModal from "./DocumentUploadModal";
import Tenant from "@/lib/tenant/tenant";
import { useDunaCategory } from "@/hooks/useDunaCategory";
import { useHasPermission } from "@/hooks/useRbacPermissions";
import { FileIcon } from "lucide-react";
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
}

interface DocumentsSectionProps {
  initialDocuments: ForumDocument[];
  hideHeader?: boolean;
  hideComms?: boolean;
}

const DocumentsSection = ({
  initialDocuments,
  hideHeader = false,
  hideComms = false,
}: DocumentsSectionProps) => {
  const [documents, setDocuments] = useState<ForumDocument[]>(
    initialDocuments || []
  );
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const openDialog = useOpenDialog();

  const { fetchDocuments, deleteAttachment, archiveAttachment } = useForum();

  const { address } = useAccount();
  const { dunaCategoryId } = useDunaCategory();

  // RBAC permissions for DUNA filings
  const { hasPermission: canCreateFilings } = useHasPermission(
    "duna_filings",
    "filings",
    "create"
  );
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

  const { ui } = Tenant.current();
  const useDarkStyling = ui.toggle("ui/use-dark-theme-styling")?.enabled;
  const requireLogin = useRequireLogin();
  const stableDeleteAttachment = useStableCallback(deleteAttachment);
  const stableArchiveAttachment = useStableCallback(archiveAttachment);

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
          {!!address && canCreateFilings && (
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
            No documents yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {documents.map((document: ForumDocument, index) => {
            // Check if user is the author
            const isAuthor =
              address?.toLowerCase() === document.uploadedBy?.toLowerCase();
            // Can archive if: has RBAC permission OR is author
            const canArchive = canArchiveFilings || isAuthor;
            // Can delete if: has RBAC permission
            const canDelete = canDeleteFilings;

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
                    {canArchive && !document.archived && (
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
    </div>
  );
};

export default DocumentsSection;
