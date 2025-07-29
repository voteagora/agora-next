"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DocumentIcon } from "@heroicons/react/20/solid";
import { useDunaAPI } from "@/hooks/useDunaAPI";

const DocumentsSection = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const { fetchDocuments, uploadDocument, loading, error } = useDunaAPI();

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    const documentsData = await fetchDocuments();
    setDocuments(documentsData);
  };

  const handleUploadDocument = async () => {
    // For now, we'll just show an alert. In a real implementation,
    // this would open a file picker and upload to IPFS or similar.
    alert("Document upload functionality will be implemented with IPFS integration");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-lg font-bold text-primary">Documents</h4>
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
      
      {!loading && !error && (
        <>
          <div className="flex flex-wrap justify-between gap-3">
            {documents.map((document, index) => (
              <div 
                key={document.id || index} 
                className="flex items-center gap-2 text-primary hover:text-secondary cursor-pointer p-3 rounded-md hover:bg-neutral transition-colors"
              >
                <DocumentIcon className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm break-words leading-relaxed">{document.name}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-4">
            <Button 
              onClick={handleUploadDocument}
              className="w-full bg-neutral text-primary border border-line hover:bg-wash"
            >
              Upload new document
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default DocumentsSection; 