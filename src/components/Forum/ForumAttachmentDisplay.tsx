"use client";

import { useState } from "react";
import { formatFileSize } from "@/hooks/useForumAttachmentUpload";
import {
  PaperClipIcon,
  PhotoIcon,
  DocumentTextIcon,
  DocumentIcon,
  ArrowDownTrayIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

interface ForumAttachment {
  id: number;
  ipfsCid: string;
  fileName: string | null;
  contentType: string | null;
  fileSize: bigint | null;
  createdAt: Date;
}

interface ForumAttachmentDisplayProps {
  attachments: ForumAttachment[];
  className?: string;
  showPreview?: boolean;
}

function getFileIcon(contentType: string | null) {
  if (!contentType) return DocumentIcon;

  if (contentType.startsWith("image/")) return PhotoIcon;
  if (contentType === "application/pdf") return DocumentTextIcon;
  if (contentType.startsWith("text/")) return DocumentTextIcon;

  return DocumentIcon;
}

function getIPFSUrl(ipfsCid: string) {
  return `https://gateway.pinata.cloud/ipfs/${ipfsCid}`;
}

function isImageType(contentType: string | null): boolean {
  return contentType?.startsWith("image/") ?? false;
}

function ImagePreview({ attachment }: { attachment: ForumAttachment }) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (imageError) {
    return (
      <div className="flex items-center justify-center w-full h-32 bg-gray-100 dark:bg-gray-800 rounded border">
        <span className="text-sm text-gray-500">Failed to load image</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <img
        src={getIPFSUrl(attachment.ipfsCid)}
        alt={attachment.fileName || "Forum attachment"}
        className={`max-w-full h-auto rounded border transition-opacity ${isLoading ? "opacity-0" : "opacity-100"}`}
        style={{ maxHeight: "300px" }}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setImageError(true);
          setIsLoading(false);
        }}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded border">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
}

export default function ForumAttachmentDisplay({
  attachments,
  className = "",
  showPreview = true,
}: ForumAttachmentDisplayProps) {
  if (!attachments || attachments.length === 0) {
    return null;
  }

  return (
    <div className={`forum-attachments ${className}`}>
      <div className="space-y-3">
        {attachments.map((attachment) => {
          const FileIcon = getFileIcon(attachment.contentType);
          const ipfsUrl = getIPFSUrl(attachment.ipfsCid);
          const isImage = isImageType(attachment.contentType);
          const fileSize = attachment.fileSize
            ? Number(attachment.fileSize)
            : 0;

          return (
            <div
              key={attachment.id}
              className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-900/50"
            >
              {/* File Info */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <FileIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {attachment.fileName || `File ${attachment.id}`}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                      {attachment.contentType && (
                        <span>{attachment.contentType}</span>
                      )}
                      {fileSize > 0 && (
                        <>
                          <span>•</span>
                          <span>{formatFileSize(fileSize)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <a
                    href={ipfsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                    title="View file"
                  >
                    <EyeIcon className="h-4 w-4 mr-1" />
                    View
                  </a>
                  <a
                    href={ipfsUrl}
                    download={attachment.fileName || undefined}
                    className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    title="Download file"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                    Download
                  </a>
                </div>
              </div>

              {/* Image Preview */}
              {showPreview && isImage && (
                <div className="mt-2">
                  <ImagePreview attachment={attachment} />
                </div>
              )}

              {/* IPFS Hash */}
              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    IPFS:
                  </span>
                  <code className="text-xs font-mono text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">
                    {attachment.ipfsCid}
                  </code>
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(attachment.ipfsCid)
                    }
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                    title="Copy IPFS hash"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
