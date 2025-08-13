"use client";

import React, { useState } from "react";
import { useForum } from "@/hooks/useForum";
import { useAccount } from "wagmi";
import { ArrowUpIcon, EyeIcon } from "@heroicons/react/20/solid";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { FileIcon } from "lucide-react";
import { toast } from "react-hot-toast";
import Tenant from "@/lib/tenant/tenant";
import { UIForumConfig } from "@/lib/tenant/tenantUI";

interface ArchivedDocumentCardProps {
  document: any;
  onUnarchive?: () => void;
}

const ArchivedDocumentCard = ({
  document,
  onUnarchive,
}: ArchivedDocumentCardProps) => {
  const { address } = useAccount();
  const { unarchiveAttachment } = useForum();
  const openDialog = useOpenDialog();

  const tenant = Tenant.current();
  const forumToggle = tenant.ui.toggle("duna");
  const forumConfig = forumToggle?.config as UIForumConfig | undefined;
  const forumAdmins = forumConfig?.adminAddresses || [];
  const isAdmin = forumAdmins.includes(address as `0x${string}`);

  const handleUnarchive = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isAdmin) {
      toast.error("Only forum admins can unarchive documents.");
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
    <div className="flex items-center gap-2 px-3 py-2 rounded border bg-white hover:bg-gray-50 transition-colors">
      <FileIcon className="w-4 h-4 text-gray-900 flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-900 truncate">
            {document.name}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={handleViewDocument}
          className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
          title="View document"
        >
          <EyeIcon className="w-4 h-4" />
        </button>
        <button
          onClick={handleUnarchive}
          className={`p-1 transition-colors ${
            isAdmin
              ? "text-blue-500 hover:text-blue-700"
              : "text-gray-400 cursor-not-allowed"
          }`}
          title={
            isAdmin ? "Unarchive document" : "Only forum admins can unarchive"
          }
          disabled={!isAdmin}
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

  const handleUnarchiveDocument = (documentToUnarchive: any) => {
    setDocuments((prev) =>
      prev.filter((doc) => doc.id !== documentToUnarchive.id)
    );
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <h4 className="text-lg font-bold text-primary">Archived Documents</h4>
        <div className="text-sm text-secondary">
          {documents.length} archived document
          {documents.length !== 1 ? "s" : ""}
        </div>
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="text-secondary">Loading archived documents...</div>
        </div>
      )}

      {documents.length === 0 && (
        <div className="text-center py-8">
          <div className="text-secondary">No archived documents found.</div>
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
