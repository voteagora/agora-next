"use client";

import React from "react";
import { FileIcon } from "lucide-react";
import { TrashIcon, ArchiveBoxIcon } from "@heroicons/react/20/solid";
import {
  ForumAttachment,
  canArchiveContent,
  canDeleteContent,
} from "@/lib/forumUtils";

import { useForum, useForumAdmin } from "@/hooks/useForum";
import { useAccount } from "wagmi";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";

interface PostAttachmentsProps {
  attachments: ForumAttachment[];
  postId: number;
  postAuthor: string;
  categoryId?: number | null;
}

export default function PostAttachments({
  attachments,
  postId,
  postAuthor,
  categoryId,
}: PostAttachmentsProps) {
  const [items, setItems] = React.useState<ForumAttachment[]>(
    attachments || []
  );
  React.useEffect(() => setItems(attachments || []), [attachments]);

  const { deleteAttachment, archiveAttachment } = useForum();
  const { address } = useAccount();
  const { isAdmin, canManageAttachments } = useForumAdmin(
    categoryId || undefined
  );
  const openDialog = useOpenDialog();

  if (!items.length) return null;

  const isImageAttachment = (attachment: ForumAttachment) => {
    return attachment.contentType?.startsWith("image/") || false;
  };

  const documentAttachments = items.filter((att) => !isImageAttachment(att));

  const handleDelete = (attachmentId: number) => {
    openDialog({
      type: "CONFIRM",
      params: {
        title: "Delete Attachment",
        message: "Are you sure you want to delete this attachment?",
        onConfirm: async () => {
          const isAuthor =
            (address || "").toLowerCase() === (postAuthor || "").toLowerCase();
          const ok = await deleteAttachment(attachmentId, "post", isAuthor);
          if (ok) setItems((prev) => prev.filter((a) => a.id !== attachmentId));
        },
      },
    });
  };

  const handleArchive = (attachmentId: number) => {
    openDialog({
      type: "CONFIRM",
      params: {
        title: "Archive Attachment",
        message: "Are you sure you want to archive this attachment?",
        onConfirm: async () => {
          const isAuthor =
            (address || "").toLowerCase() === (postAuthor || "").toLowerCase();
          const ok = await archiveAttachment(attachmentId, "post", isAuthor);
          if (ok) setItems((prev) => prev.filter((a) => a.id !== attachmentId));
        },
      },
    });
  };

  const canManage = (uploadedBy: string) => {
    return canDeleteContent(
      address || "",
      uploadedBy || postAuthor || "",
      isAdmin,
      canManageAttachments
    );
  };

  return (
    <div className="my-4">
      {documentAttachments.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-2">
            Attachments
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {documentAttachments.map((att) => (
              <a
                key={att.id}
                href={att.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded border bg-white hover:bg-gray-50 transition-colors"
                style={{ borderColor: "#E5E5E5" }}
              >
                <FileIcon className="w-4 h-4 text-gray-900 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {att.fileName}
                  </p>
                </div>
                {canManage(att.uploadedBy || postAuthor) && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleArchive(att.id);
                      }}
                      className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                      title="Archive attachment"
                    >
                      <ArchiveBoxIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDelete(att.id);
                      }}
                      className="p-1 text-red-500 hover:text-red-700 transition-colors"
                      title="Delete attachment"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
