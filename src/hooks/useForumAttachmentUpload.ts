import { useState, useCallback } from "react";

export interface ForumAttachmentUploadResult {
  id: number;
  ipfsCid: string;
  fileName: string;
  contentType: string;
  fileSize: number;
  createdAt: string;
  ipfsUrl: string;
}

export interface ForumAttachmentUploadError {
  message: string;
  code?: string;
}

export interface UseForumAttachmentUploadReturn {
  upload: (
    file: File,
    address: string,
    targetType: "topic" | "post",
    targetId: number
  ) => Promise<ForumAttachmentUploadResult>;
  isUploading: boolean;
  progress: number;
  error: ForumAttachmentUploadError | null;
  reset: () => void;
}

export function useForumAttachmentUpload(): UseForumAttachmentUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<ForumAttachmentUploadError | null>(null);

  const reset = useCallback(() => {
    setIsUploading(false);
    setProgress(0);
    setError(null);
  }, []);

  const upload = useCallback(
    async (
      file: File,
      address: string,
      targetType: "topic" | "post",
      targetId: number
    ): Promise<ForumAttachmentUploadResult> => {
      setIsUploading(true);
      setProgress(0);
      setError(null);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("address", address);
        formData.append("targetType", targetType);
        formData.append("targetId", targetId.toString());

        // Create XMLHttpRequest to track progress
        const xhr = new XMLHttpRequest();

        const uploadPromise = new Promise<ForumAttachmentUploadResult>(
          (resolve, reject) => {
            xhr.upload.addEventListener("progress", (event) => {
              if (event.lengthComputable) {
                const percentComplete = (event.loaded / event.total) * 100;
                setProgress(percentComplete);
              }
            });

            xhr.addEventListener("load", () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                try {
                  const response = JSON.parse(xhr.responseText);
                  if (response.success) {
                    resolve(response.attachment);
                  } else {
                    reject(new Error(response.error || "Upload failed"));
                  }
                } catch (err) {
                  reject(new Error("Invalid response format"));
                }
              } else {
                try {
                  const errorResponse = JSON.parse(xhr.responseText);
                  reject(
                    new Error(
                      errorResponse.error ||
                        `Upload failed with status ${xhr.status}`
                    )
                  );
                } catch {
                  reject(new Error(`Upload failed with status ${xhr.status}`));
                }
              }
            });

            xhr.addEventListener("error", () => {
              reject(new Error("Network error during upload"));
            });

            xhr.addEventListener("abort", () => {
              reject(new Error("Upload was aborted"));
            });

            xhr.open("POST", "/api/forum/attachments/upload");
            xhr.send(formData);
          }
        );

        const result = await uploadPromise;
        setProgress(100);
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError({ message: errorMessage });
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    []
  );

  return {
    upload,
    isUploading,
    progress,
    error,
    reset,
  };
}

// Utility function for validating files before upload
export function validateForumAttachmentFile(file: File): {
  valid: boolean;
  error?: string;
} {
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_FILE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
    "text/plain",
    "application/json",
    "text/markdown",
    "text/csv",
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
      error: `File type '${file.type}' is not allowed. Allowed types: ${ALLOWED_FILE_TYPES.join(", ")}`,
    };
  }

  return { valid: true };
}

// Utility function to format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
