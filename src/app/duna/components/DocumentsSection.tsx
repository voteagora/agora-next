"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useForum } from "@/hooks/useForum";
import { useAccount } from "wagmi";

// Custom document icon with folded corner (outline)
const DocumentIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" />
    <path d="M14 2V8H20" />
  </svg>
);

import DocumentUploadModal from "./DocumentUploadModal";

const DocumentsSection = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const { fetchDocuments, loading, error } = useForum();
  const { address } = useAccount();

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
          {documents.map((document, index) => (
            <div
              key={document.id || index}
              className="flex items-center gap-2 px-3 py-2 rounded border bg-white hover:bg-gray-50 transition-colors cursor-pointer"
              style={{ borderColor: "#E5E5E5" }}
              onClick={() => handleDocumentClick(document)}
            >
              <DocumentIcon className="w-4 h-4 text-gray-900 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {document.name}
                </p>
              </div>
            </div>
          ))}
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
