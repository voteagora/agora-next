"use client";

import React, { useState } from "react";
import { useForum, useForumAdmin } from "@/hooks/useForum";
import { ArrowUpIcon, EyeIcon } from "@heroicons/react/20/solid";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { FileIcon } from "lucide-react";
import { toast } from "react-hot-toast";
import Tenant from "@/lib/tenant/tenant";
import { useDunaCategory } from "@/hooks/useDunaCategory";

interface ArchivedDocumentCardProps {
  document: any;
  onUnarchive?: () => void;
}

const ArchivedDocumentCard = ({
  document,
  onUnarchive,
}: ArchivedDocumentCardProps) => {
  const { unarchiveAttachment } = useForum();
  const openDialog = useOpenDialog();
  const { dunaCategoryId } = useDunaCategory();
  const { isAdmin, canManageAttachments } = useForumAdmin(
    dunaCategoryId || undefined
  );

  const { ui } = Tenant.current();
  const useDarkStyling = ui.toggle("ui/use-dark-theme-styling")?.enabled;

  const handleUnarchive = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isAdmin && !canManageAttachments) {
      toast.error("You don't have permission to unarchive documents.");
      return;
    }

    openDialog({
      type: "CONFIRM",
      params: {
        title: "Unarchive Document",
        message: "Are you sure you want to unarchive this document?",
        onConfirm: async () => {
          const success = await unarchiveAttachment(document.id);
          if (success && onUnarchive) {
            onUnarchive();
          }
        },
      },
    });
  };

  const handleViewDocument = () => {
    if (document.url && document.url !== "#") {
      window.open(document.url, "_blank");
    }
  };

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded border transition-colors ${
        useDarkStyling
          ? "bg-inputBackgroundDark border-cardBorder hover:bg-buttonPrimaryDark"
          : "bg-white hover:bg-gray-50"
      }`}
    >
      <FileIcon
        className={`w-4 h-4 flex-shrink-0 ${
          useDarkStyling ? "text-white" : "text-gray-900"
        }`}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p
            className={`text-sm font-medium truncate ${
              useDarkStyling ? "text-white" : "text-gray-900"
            }`}
          >
            {document.name}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={handleViewDocument}
          className={`p-1 transition-colors ${
            useDarkStyling
              ? "text-[#87819F] hover:text-white"
              : "text-gray-500 hover:text-gray-700"
          }`}
          title="View document"
        >
          <EyeIcon className="w-4 h-4" />
        </button>
        <button
          onClick={handleUnarchive}
          className={`p-1 transition-colors ${
            isAdmin || canManageAttachments
              ? useDarkStyling
                ? "text-[#5A4B7A] hover:text-[#6B5C8B]"
                : "text-blue-500 hover:text-blue-700"
              : useDarkStyling
                ? "text-[#87819F] cursor-not-allowed"
                : "text-gray-400 cursor-not-allowed"
          }`}
          title={
            isAdmin || canManageAttachments
              ? "Unarchive document"
              : "You don't have permission to unarchive"
          }
          disabled={!isAdmin && !canManageAttachments}
        >
          <ArrowUpIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

interface ArchivedDocumentsSectionProps {
  initialDocuments: any[];
}

const ArchivedDocumentsSection = ({
  initialDocuments,
}: ArchivedDocumentsSectionProps) => {
  const [documents, setDocuments] = useState<any[]>(initialDocuments || []);
  const { loading } = useForum();

  const { ui } = Tenant.current();
  const useDarkStyling = ui.toggle("ui/use-dark-theme-styling")?.enabled;

  const handleUnarchiveDocument = (documentToUnarchive: any) => {
    setDocuments((prev) =>
      prev.filter((doc) => doc.id !== documentToUnarchive.id)
    );
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <h4
          className={`text-lg font-bold ${
            useDarkStyling ? "text-white" : "text-primary"
          }`}
        >
          Archived Documents
        </h4>
        <div
          className={`text-sm ${useDarkStyling ? "text-[#87819F]" : "text-secondary"}`}
        >
          {documents.length} archived document
          {documents.length !== 1 ? "s" : ""}
        </div>
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className={useDarkStyling ? "text-white" : "text-secondary"}>
            Loading archived documents...
          </div>
        </div>
      )}

      {documents.length === 0 && (
        <div className="text-center py-8">
          <div className={useDarkStyling ? "text-white" : "text-secondary"}>
            No archived documents found.
          </div>
        </div>
      )}

      {documents.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {documents.map((document) => (
            <ArchivedDocumentCard
              key={document.id}
              document={document}
              onUnarchive={() => handleUnarchiveDocument(document)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ArchivedDocumentsSection;
