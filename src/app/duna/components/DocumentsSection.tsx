"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useForum, useForumAdmin } from "@/hooks/useForum";
import { useAccount } from "wagmi";
import { TrashIcon, ArchiveBoxIcon } from "@heroicons/react/20/solid";
import DocumentUploadModal from "./DocumentUploadModal";
import Tenant from "@/lib/tenant/tenant";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { canArchiveContent, canDeleteContent } from "@/lib/forumAdminUtils";
import { useDunaCategory } from "@/hooks/useDunaCategory";
import { FileIcon } from "lucide-react";
import { DUNA_CATEGORY_ID } from "@/lib/constants";
import { TENANT_NAMESPACES } from "@/lib/constants";

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
  const {
    fetchDocuments,
    deleteAttachment,
    archiveAttachment,
    loading,
    error,
  } = useForum();
  const { address } = useAccount();
  const openDialog = useOpenDialog();
  const { dunaCategoryId } = useDunaCategory();
  const { isAdmin, canCreateAttachments, canManageAttachments } = useForumAdmin(
    dunaCategoryId || undefined
  );

  // Check if current tenant is Towns
  const { namespace } = Tenant.current();
  const isTowns = namespace === TENANT_NAMESPACES.TOWNS;

  const { fetchDocuments, deleteAttachment, archiveAttachment } = useForum();

  const { address } = useAccount();
  const { isAdmin, canManageAttachments } = useForumAdmin(DUNA_CATEGORY_ID);

  const handleUploadComplete = async () => {
    const documentsData = await fetchDocuments();
    setDocuments(documentsData);
  };

  const handleUploadComplete = async () => {
    await loadDocuments();
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
    // Find the document to get uploadedBy
    const doc = documents.find((d) => d.id === attachmentId);
    if (
      doc &&
      (await canDeleteContent(
        address || "",
        doc.uploadedBy || "",
        isAdmin || canManageAttachments
      ))
    ) {
      try {
        await deleteAttachment(attachmentId);
        const documentsData = await fetchDocuments();
        setDocuments(documentsData);
      } catch (error) {
        console.error("Error deleting attachment:", error);
      }
    }
  };

  const handleArchiveAttachment = async (
    attachmentId: number,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    // Find the document to get uploadedBy
    const doc = documents.find((d) => d.id === attachmentId);
    if (
      doc &&
      (await canArchiveContent(
        address || "",
        doc.uploadedBy || "",
        isAdmin || canManageAttachments
      ))
    ) {
      try {
        await archiveAttachment(attachmentId);
        const documentsData = await fetchDocuments();
        setDocuments(documentsData);
      } catch (error) {
        console.error("Error archiving attachment:", error);
      }
    }
  };

  return (
    <div className="space-y-4">
      {!hideHeader && (
        <div className="flex items-center justify-between">
          <h3
            className={`text-lg font-semibold ${
              isTowns ? "text-white" : "text-primary"
            }`}
          >
            Documents
          </h3>
          {!!address && canManageAttachments && (
            <Button
              onClick={() => setIsUploadModalOpen(true)}
              className={`${
                isTowns
                  ? "bg-[#5A4B7A] text-white border-[#5A4B7A] hover:bg-[#6B5C8B]"
                  : "text-white border border-black hover:bg-gray-800"
              } text-sm`}
              style={
                !isTowns
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
              isTowns ? "text-white" : "text-secondary"
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
                  isTowns
                    ? "border-[#2B2449] hover:bg-[#2A2338]"
                    : "bg-white hover:bg-gray-50"
                }`}
                style={
                  isTowns
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
                    isTowns ? "text-white" : "text-gray-900"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm font-medium truncate ${
                      isTowns ? "text-white" : "text-gray-900"
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
                          isTowns
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
                          isTowns
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
        onUploadComplete={handleUploadComplete}
      />
    </div>
  );
};

export default DocumentsSection;
