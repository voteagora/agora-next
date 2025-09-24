"use client";

import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PaperClipIcon, XMarkIcon } from "@heroicons/react/20/solid";
import toast from "react-hot-toast";
import { ConnectKitButton } from "connectkit";
import { DunaEditor } from "@/components/duna-editor";
import { useForum } from "@/hooks/useForum";
import type { ForumCategory } from "@/lib/forumUtils";
import { uploadToIPFSOnly } from "@/lib/actions/attachment";
import { convertFileToAttachmentData } from "@/lib/fileUtils";

export interface ComposerModalSubmitData {
  title?: string;
  content: string;
  attachment?: File;
  categoryId?: number;
}

export interface ComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ComposerModalSubmitData) => Promise<void>;
  dialogTitle: string;
  titleLabel?: string;
  contentLabel?: string;
  titleRequired?: boolean;
  submitLabel?: string;
  contentPlaceholder?: string;
  // If true, render a forum category selector and include categoryId in submit
  renderCategory?: boolean;
  categoryLabel?: string;
}

export default function ComposerModal({
  isOpen,
  onClose,
  onSubmit,
  dialogTitle,
  titleLabel = "Title",
  contentLabel = "Content",
  titleRequired = true,
  submitLabel = "Submit",
  contentPlaceholder = "Write your content…",
  renderCategory = false,
  categoryLabel = "Category",
}: ComposerModalProps) {
  const { isConnected, address } = useAccount();
  const { fetchCategories } = useForum();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [categoryId, setCategoryId] = useState<number | "">("");

  useEffect(() => {
    if (!isOpen || !renderCategory) return;
    let active = true;
    fetchCategories()
      .then((cats) => {
        if (active) setCategories(cats);
      })
      .catch(() => {
        if (active) setCategories([]);
      });
    return () => {
      active = false;
    };
  }, [isOpen, renderCategory, fetchCategories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const plainTextContent = content.replace(/<[^>]*>/g, "").trim();
    const categoryInvalid = renderCategory && !categoryId;
    if (
      (titleRequired && !title.trim()) ||
      !plainTextContent ||
      categoryInvalid
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: titleRequired ? title.trim() : undefined,
        content: content.trim(),
        attachment: attachment || undefined,
        categoryId: categoryId || undefined,
      });
      setTitle("");
      setContent("");
      setAttachment(null);
      setAttachmentPreview(null);
      setCategoryId("");
      onClose();
    } catch (error) {
      console.error("Composer submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachment(file);
      setAttachmentPreview(null);
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
    setAttachmentPreview(null);
    const fileInput = document.getElementById("attachment") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    if (!address) {
      throw new Error("Wallet not connected");
    }

    // Upload to IPFS only (no database record yet)
    const attachmentData = await convertFileToAttachmentData(file);
    const uploadResult = await uploadToIPFSOnly(attachmentData, address);

    if (!uploadResult.success || !uploadResult.ipfsUrl) {
      throw new Error(uploadResult.error || "Upload failed");
    }

    return uploadResult.ipfsUrl;
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setTitle("");
      setContent("");
      setAttachment(null);
      setAttachmentPreview(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl w-[calc(100vw-2rem)] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary">
            {dialogTitle}
          </DialogTitle>
        </DialogHeader>

        {!isConnected ? (
          <div className="text-center py-8 flex items-center justify-center">
            <ConnectKitButton.Custom>
              {({ show }) => (
                <Button
                  onClick={() => show?.()}
                  className="text-white border border-black hover:bg-gray-800 text-sm"
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
                  Connect your wallet to continue
                </Button>
              )}
            </ConnectKitButton.Custom>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {titleRequired && (
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-primary mb-2"
                >
                  {titleLabel}
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-white text-primary focus:outline-none focus:ring-1 focus:ring-gray-200"
                  style={{ borderColor: "#E5E5E5" }}
                  placeholder="Enter title..."
                  required={titleRequired}
                  disabled={isSubmitting}
                />
              </div>
            )}
            {renderCategory && (
              <div>
                <label
                  htmlFor="forum-category"
                  className="block text-sm font-medium text-primary mb-2"
                >
                  {categoryLabel}
                </label>
                <select
                  id="forum-category"
                  value={categoryId}
                  onChange={(e) =>
                    setCategoryId(e.target.value ? Number(e.target.value) : "")
                  }
                  className="w-full px-3 py-2 border rounded-md bg-white text-primary focus:outline-none focus:ring-1 focus:ring-gray-200"
                  style={{ borderColor: "#E5E5E5" }}
                  disabled={isSubmitting}
                >
                  <option value="">No category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-primary mb-2"
              >
                {contentLabel}
              </label>
              <DunaEditor
                variant="post"
                placeholder={contentPlaceholder}
                value={content}
                onChange={(html) => setContent(html)}
                disabled={isSubmitting}
                onImageUpload={handleImageUpload}
              />
            </div>

            <div>
              <label
                htmlFor="attachment"
                className="block text-sm font-medium text-primary mb-2"
              >
                Attach Document (Optional)
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Use the image button in the editor toolbar to add images inline. Documents will be attached as downloads.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    id="attachment"
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt"
                    disabled={isSubmitting}
                  />
                  <Button
                    type="button"
                    onClick={() => document.getElementById("attachment")?.click()}
                    className="bg-neutral text-primary border border-line hover:bg-wash w-full sm:w-auto"
                    disabled={isSubmitting}
                  >
                    <PaperClipIcon className="w-4 h-4 mr-2" />
                    Attach Document
                  </Button>
                  {attachment && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-primary truncate max-w-[200px]">
                        {attachment.name}
                      </span>
                      <button
                        type="button"
                        onClick={removeAttachment}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        disabled={isSubmitting}
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                onClick={handleClose}
                className="bg-neutral text-primary border border-line hover:bg-wash"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="text-white border border-black hover:bg-gray-800 text-sm"
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
                disabled={
                  isSubmitting ||
                  !content.replace(/<[^>]*>/g, "").trim() ||
                  (titleRequired && !title.trim())
                }
              >
                {isSubmitting ? "Submitting..." : submitLabel}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
