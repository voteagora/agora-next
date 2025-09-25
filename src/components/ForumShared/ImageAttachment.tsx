"use client";

import React, { useState } from "react";
import { TrashIcon, ArchiveBoxIcon, EyeIcon, XMarkIcon } from "@heroicons/react/20/solid";
import {
  ForumAttachment,
  canArchiveContent,
  canDeleteContent,
} from "@/lib/forumUtils";
import { useForum, useForumAdmin } from "@/hooks/useForum";
import { useAccount } from "wagmi";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";

interface ImageAttachmentProps {
  attachment: ForumAttachment;
  postId: number;
  postAuthor: string;
  categoryId?: number | null;
}

export default function ImageAttachment({
  attachment,
  postId,
  postAuthor,
  categoryId,
}: ImageAttachmentProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const { deleteAttachment, archiveAttachment } = useForum();
  const { address } = useAccount();
  const { isAdmin, canManageAttachments } = useForumAdmin(
    categoryId || undefined
  );
  const openDialog = useOpenDialog();

  const canDelete = (uploadedBy: string) =>
    canDeleteContent(
      address || "",
      uploadedBy || postAuthor || "",
      isAdmin,
      canManageAttachments
    );

  const canArchive = (uploadedBy: string) =>
    canArchiveContent(
      address || "",
      uploadedBy || postAuthor || "",
      isAdmin,
      canManageAttachments
    );

  const handleDelete = () => {
    openDialog({
      type: "CONFIRM",
      params: {
        title: "Delete Image",
        message: "Are you sure you want to delete this image?",
        onConfirm: async () => {
          const isAuthor =
            (address || "").toLowerCase() === (postAuthor || "").toLowerCase();
          const ok = await deleteAttachment(attachment.id, "post", isAuthor);
          if (ok) {
            // The parent component will handle removing from the list
          }
        },
      },
    });
  };

  const handleArchive = () => {
    openDialog({
      type: "CONFIRM",
      params: {
        title: "Archive Image",
        message: "Are you sure you want to archive this image?",
        onConfirm: async () => {
          const isAuthor =
            (address || "").toLowerCase() === (postAuthor || "").toLowerCase();
          const ok = await archiveAttachment(attachment.id, "post", isAuthor);
          if (ok) {
            // The parent component will handle removing from the list
          }
        },
      },
    });
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  if (imageError) {
    return (
      <div className="my-4 p-4 border border-red-200 bg-red-50 rounded-lg">
        <div className="flex items-center gap-2 text-red-600">
          <XMarkIcon className="w-5 h-5" />
          <span className="text-sm font-medium">Failed to load image</span>
        </div>
        <p className="text-sm text-red-500 mt-1">
          {attachment.fileName} - <a href={attachment.url} target="_blank" rel="noreferrer" className="underline">View original</a>
        </p>
      </div>
    );
  }

  return (
    <div className="my-4">
      <div className="relative inline-block">
        <img
          src={attachment.url}
          alt={attachment.fileName}
          className={`rounded-lg border border-line cursor-pointer transition-all duration-200 ${
            isExpanded 
              ? "max-w-none max-h-96" 
              : "max-w-xs max-h-48 hover:shadow-lg"
          } object-contain`}
          onClick={toggleExpanded}
          onError={handleImageError}
        />
        
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleExpanded();
            }}
            className="p-1 bg-black/50 text-white rounded hover:bg-black/70 transition-colors"
            title={isExpanded ? "Shrink image" : "Expand image"}
          >
            <EyeIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-2">
        <div className="text-sm text-gray-600">
          <span className="font-medium">{attachment.fileName}</span>
          <span className="ml-2 text-gray-500">
            ({Math.round(attachment.fileSize / 1024)} KB)
          </span>
        </div>
        
        {(canArchive(attachment.uploadedBy || postAuthor) || canDelete(attachment.uploadedBy || postAuthor)) && (
          <div className="flex items-center gap-1">
            {canArchive(attachment.uploadedBy || postAuthor) && (
              <button
                onClick={handleArchive}
                className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                title="Archive image"
              >
                <ArchiveBoxIcon className="w-4 h-4" />
              </button>
            )}
            {canDelete(attachment.uploadedBy || postAuthor) && (
            <button
              onClick={handleDelete}
              className="p-1 text-red-500 hover:text-red-700 transition-colors"
              title="Delete image"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
