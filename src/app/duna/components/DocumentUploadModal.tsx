"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentIcon,
} from "@heroicons/react/24/outline";
import { useForum } from "@/hooks/useForum";
import { convertFileToAttachmentData } from "@/lib/fileUtils";
import Tenant from "@/lib/tenant/tenant";

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: number;
  onUploadComplete: (document: {
    name: string;
    url: string;
    ipfsCid: string;
    fileSize: number;
    contentType: string;
  }) => void;
}

export default function DocumentUploadModal({
  isOpen,
  onClose,
  categoryId,
  onUploadComplete,
}: DocumentUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { ui } = Tenant.current();
  const useDarkStyling = ui.toggle("ui/use-dark-theme-styling")?.enabled;

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_FILE_TYPES = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "text/plain",
      "text/csv",
      "application/json",
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum limit of 10MB`,
      };
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: `File type '${file.type}' is not supported`,
      };
    }

    return { valid: true };
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleFileSelect = useCallback((file: File) => {
    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error!);
      return;
    }

    setSelectedFile(file);
    setError(null);
    setProgress(0);
  }, []);

  const { uploadDocument, error: forumError } = useForum();

  useEffect(() => {
    if (forumError) {
      setError(forumError);
    }
  }, [forumError]);

  const handleFileUpload = useCallback(async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          const increment = Math.random() * 10 + 2; // 2-12% increments
          return Math.min(prev + increment, 90); // Cap at 90%
        });
      }, 300);

      const attachmentData = await convertFileToAttachmentData(selectedFile);
      const result = await uploadDocument(attachmentData, categoryId);

      clearInterval(progressInterval);

      if (!result) {
        throw new Error("Failed to upload document");
      }

      setProgress(100);

      onUploadComplete({
        name: selectedFile.name,
        url: result.url,
        ipfsCid: result.ipfsCid,
        fileSize: selectedFile.size,
        contentType: selectedFile.type,
      });

      setSelectedFile(null);
      setProgress(0);
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Upload failed";
      console.error("Upload error:", err);

      if (forumError) {
        console.error("Forum error:", forumError);
        setError(`${errorMessage}. ${forumError}`);
      } else {
        setError(errorMessage);
      }
      setProgress(0);
    } finally {
      setIsUploading(false);
    }
  }, [selectedFile, uploadDocument, onUploadComplete, onClose, categoryId]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleClearFile = useCallback(() => {
    setSelectedFile(null);
    setError(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleModalClose = useCallback(() => {
    if (!isUploading) {
      setSelectedFile(null);
      setError(null);
      setProgress(0);
      onClose();
    }
  }, [isUploading, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <DialogContent
        className={`sm:max-w-md w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto ${
          useDarkStyling ? "bg-modalBackgroundDark border-cardBorder" : ""
        }`}
      >
        <DialogHeader>
          <DialogTitle className={useDarkStyling ? "text-white" : ""}>
            Upload Document
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleInputChange}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.json,.jpg,.jpeg,.png,.gif,.webp"
          />

          {!selectedFile && (
            <div
              className={`
                border-2 border-dashed rounded-lg p-4 sm:p-8 text-center cursor-pointer transition-colors
                ${
                  isDragOver
                    ? useDarkStyling
                      ? "border-[#5A4B7A] bg-inputBackgroundDark"
                      : "border-gray-400 bg-gray-50 dark:bg-gray-900/20"
                    : useDarkStyling
                      ? "border-[#2B2449] hover:border-[#5A4B7A]"
                      : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                }
              `}
              style={!useDarkStyling ? { borderColor: "#E5E5E5" } : {}}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={triggerFileInput}
            >
              <DocumentIcon
                className={`mx-auto h-8 w-8 sm:h-12 sm:w-12 mb-2 sm:mb-4 ${
                  useDarkStyling ? "text-[#87819F]" : "text-gray-400"
                }`}
              />
              <p
                className={`text-xs sm:text-sm ${
                  useDarkStyling
                    ? "text-[#87819F]"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                <span
                  className={`font-medium ${
                    useDarkStyling
                      ? "text-[#87819F]"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  Click to upload
                </span>{" "}
                or drag and drop
              </p>
              <p
                className={`text-xs mt-1 sm:mt-2 ${
                  useDarkStyling
                    ? "text-[#87819F]"
                    : "text-gray-500 dark:text-gray-500"
                }`}
              >
                PDF, Word, Excel, PowerPoint, images, and text files up to 10MB
              </p>
            </div>
          )}

          {selectedFile && (
            <div
              className={`border rounded-lg p-3 sm:p-4 ${
                useDarkStyling
                  ? "bg-inputBackgroundDark border-[#2B2449]"
                  : "bg-gray-50 dark:bg-gray-800"
              }`}
              style={!useDarkStyling ? { borderColor: "#E5E5E5" } : {}}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                  <DocumentIcon
                    className={`h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0 ${
                      useDarkStyling ? "text-[#87819F]" : "text-gray-400"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-xs sm:text-sm font-medium truncate max-w-[200px] ${
                        useDarkStyling
                          ? "text-white"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {selectedFile.name}
                    </p>
                    <p
                      className={`text-xs break-words ${
                        useDarkStyling
                          ? "text-[#87819F]"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {formatFileSize(selectedFile.size)} • {selectedFile.type}
                    </p>
                  </div>
                </div>

                {!isUploading && (
                  <button
                    onClick={handleClearFile}
                    className={`p-1 flex-shrink-0 ${
                      useDarkStyling
                        ? "text-[#87819F] hover:text-white"
                        : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    }`}
                    title="Remove file"
                  >
                    <XMarkIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                )}
              </div>

              {isUploading && (
                <div className="mt-4">
                  <div
                    className={`flex items-center justify-between text-xs mb-2 ${
                      useDarkStyling
                        ? "text-[#87819F]"
                        : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    <span>Uploading to IPFS...</span>
                    <span>{Math.min(Math.round(progress), 100)}%</span>
                  </div>
                  <div
                    className={`w-full rounded-full h-2 ${
                      useDarkStyling
                        ? "bg-buttonSecondaryDark"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  >
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-3 flex items-center space-x-2 text-red-600 dark:text-red-400">
                  <ExclamationTriangleIcon className="h-4 w-4 flex-shrink-0" />
                  <span className="text-xs">{error}</span>
                </div>
              )}

              {progress === 100 && !error && !isUploading && (
                <div className="mt-3 flex items-center space-x-2 text-green-600 dark:text-green-400">
                  <CheckCircleIcon className="h-4 w-4 flex-shrink-0" />
                  <span className="text-xs">File uploaded successfully!</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 w-full">
          <Button
            onClick={handleModalClose}
            disabled={isUploading}
            className={`w-full sm:w-auto order-2 sm:order-1 ${
              useDarkStyling
                ? "bg-buttonSecondaryDark text-white border-[#2B2449] hover:bg-buttonPrimaryDark"
                : "bg-neutral text-primary border hover:bg-wash"
            }`}
            style={!useDarkStyling ? { borderColor: "#E5E5E5" } : {}}
          >
            Cancel
          </Button>
          <Button
            onClick={handleFileUpload}
            disabled={!selectedFile || isUploading}
            className={`${
              useDarkStyling
                ? "bg-buttonPrimaryDark text-white border-[#5A4B7A] hover:bg-buttonPrimaryDark/80"
                : "text-white border border-black hover:bg-gray-800"
            } text-sm w-full sm:w-auto order-1 sm:order-2`}
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
            {isUploading ? "Uploading..." : "Upload Document"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
