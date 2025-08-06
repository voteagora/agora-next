"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useForum, useForumAdmin } from "@/hooks/useForum";
import { useAccount } from "wagmi";
import { TrashIcon, ArchiveBoxIcon } from "@heroicons/react/20/solid";
import DocumentUploadModal from "./DocumentUploadModal";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { canArchiveContent, canDeleteContent } from "@/lib/forumAdminUtils";
import { DUNA_CATEGORY_ID } from "@/lib/constants";
import { FileIcon } from "lucide-react";

const DocumentsSection = () => {
  const [documents, setDocuments] = useState<any[]>([]);
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
  const { isAdmin } = useForumAdmin(DUNA_CATEGORY_ID);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    const documentsData = await fetchDocuments();
    setDocuments(documentsData);
  };

  const handleUploadComplete = async (uploadedDocument: {
    name: string;
    url: string;
    ipfsCid: string;
    fileSize: number;
    contentType: string;
  }) => {
    await loadDocuments();
    setIsUploadModalOpen(false);
  };

  const handleDocumentClick = (document: any) => {
    if (document.url && document.url !== "#") {
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
          const success = await deleteAttachment(attachmentId);
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
          const success = await archiveAttachment(attachmentId);
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
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <h4 className="text-lg font-bold text-primary">Documents</h4>
        {!!address && (
          <Button
            onClick={() => setIsUploadModalOpen(true)}
            className="text-white border border-black hover:bg-gray-800 text-sm w-full sm:w-auto"
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
            Upload new document
          </Button>
        )}
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="text-secondary">Loading documents...</div>
        </div>
      )}

      {error && (
        <div className="text-center py-4">
          <div className="text-red-500">{error}</div>
        </div>
      )}

      {!loading && !error && documents.length === 0 && (
        <div className="text-center py-8">
          <div className="text-secondary">
            No documents found. Upload the first one!
          </div>
        </div>
      )}

      {!loading && !error && documents.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {documents.map((document, index) => {
            const canArchive = canArchiveContent(
              address || "",
              document.uploadedBy || "",
              isAdmin
            );
            const canDelete = canDeleteContent(
              address || "",
              document.uploadedBy || "",
              isAdmin
            );

            return (
              <div
                key={document.id || index}
                className="flex items-center gap-2 px-3 py-2 rounded border bg-white hover:bg-gray-50 transition-colors cursor-pointer"
                style={{ borderColor: "#E5E5E5" }}
                onClick={() => handleDocumentClick(document)}
              >
                <FileIcon className="w-4 h-4 text-gray-900 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {document.name}
                  </p>
                </div>
                {(canArchive || canDelete) && (
                  <>
                    {canArchive && (
                      <button
                        onClick={(e) => handleArchiveAttachment(document.id, e)}
                        className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                        title="Archive attachment"
                      >
                        <ArchiveBoxIcon className="w-4 h-4" />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={(e) => handleDeleteAttachment(document.id, e)}
                        className="p-1 text-red-500 hover:text-red-700 transition-colors"
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
