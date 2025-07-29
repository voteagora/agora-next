"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DocumentIcon, ArrowDownTrayIcon } from "@heroicons/react/20/solid";
import { useForum } from "@/hooks/useForum";
import { format } from "date-fns";
import DocumentUploadModal from "./DocumentUploadModal";

const DocumentsSection = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const { fetchDocuments, loading, error } = useForum();

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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-lg font-bold text-primary">Documents</h4>
        <Button
          onClick={() => setIsUploadModalOpen(true)}
          className="bg-black text-white border border-black hover:bg-gray-800"
        >
          Upload new document
        </Button>
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
        <div className="space-y-3">
          {documents.map((document, index) => (
            <div
              key={document.id || index}
              className="flex items-center justify-between p-4 rounded-lg border border-line bg-neutral/50 hover:bg-neutral transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <DocumentIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-primary truncate">
                    {document.name}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-secondary">
                    <span>
                      {format(new Date(document.createdAt), "MMM d, yyyy")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {document.url && document.url !== "#" && (
                  <>
                    <a
                      href={document.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View
                    </a>
                  </>
                )}
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
