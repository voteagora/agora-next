"use client";

import { useState, useRef, useCallback } from "react";
import {
  useForumAttachmentUpload,
  validateForumAttachmentFile,
  formatFileSize,
  type ForumAttachmentUploadResult,
} from "@/hooks/useForumAttachmentUpload";
import {
  PaperClipIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

interface ForumAttachmentUploadProps {
  address: string;
  targetType: "topic" | "post";
  targetId: number;
  onUploadComplete?: (attachment: ForumAttachmentUploadResult) => void;
  onUploadError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
}

export default function ForumAttachmentUpload({
  address,
  targetType,
  targetId,
  onUploadComplete,
  onUploadError,
  className = "",
  disabled = false,
}: ForumAttachmentUploadProps) {
  const { upload, isUploading, progress, error, reset } =
    useForumAttachmentUpload();
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    (file: File) => {
      const validation = validateForumAttachmentFile(file);
      if (!validation.valid) {
        onUploadError?.(validation.error!);
        return;
      }

      setSelectedFile(file);
      reset();
    },
    [onUploadError, reset]
  );

  const handleFileUpload = useCallback(async () => {
    if (!selectedFile) return;

    try {
      const result = await upload(selectedFile, address, targetType, targetId);
      onUploadComplete?.(result);
      setSelectedFile(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Upload failed";
      onUploadError?.(errorMessage);
    }
  }, [
    selectedFile,
    upload,
    address,
    targetType,
    targetId,
    onUploadComplete,
    onUploadError,
  ]);

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

  const handleClearFile = useCallback(() => {
    setSelectedFile(null);
    reset();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [reset]);

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  if (disabled) {
    return null;
  }

  return (
    <div className={`forum-attachment-upload ${className}`}>
      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleInputChange}
        accept="image/jpeg,image/png,image/gif,image/webp,application/pdf,text/plain,application/json,text/markdown,text/csv"
      />

      {/* Drop Zone */}
      {!selectedFile && (
        <div
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${
              isDragOver
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
            }
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileInput}
        >
          <PaperClipIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium text-blue-600 dark:text-blue-400">
              Click to upload
            </span>{" "}
            or drag and drop
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Images, PDFs, text files up to 10MB
          </p>
        </div>
      )}

      {/* Selected File */}
      {selectedFile && (
        <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <PaperClipIcon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatFileSize(selectedFile.size)} • {selectedFile.type}
                </p>
              </div>
            </div>

            {!isUploading && (
              <button
                onClick={handleClearFile}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                title="Remove file"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                <span>Uploading...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="mt-3 flex items-center space-x-2 text-red-600 dark:text-red-400">
              <ExclamationTriangleIcon className="h-4 w-4" />
              <span className="text-xs">{error.message}</span>
            </div>
          )}

          {/* Upload Button */}
          {!isUploading && !error && (
            <div className="mt-3">
              <button
                onClick={handleFileUpload}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors"
              >
                Upload to IPFS
              </button>
            </div>
          )}
        </div>
      )}

      {/* Success State */}
      {progress === 100 && !error && !isUploading && (
        <div className="mt-2 flex items-center space-x-2 text-green-600 dark:text-green-400">
          <CheckCircleIcon className="h-4 w-4" />
          <span className="text-xs">File uploaded successfully!</span>
        </div>
      )}
    </div>
  );
}
