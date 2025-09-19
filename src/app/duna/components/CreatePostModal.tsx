"use client";

import React, { useState } from "react";
import { useAccount } from "wagmi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PaperClipIcon } from "@heroicons/react/20/solid";
import toast from "react-hot-toast";
import { ConnectKitButton } from "connectkit";
import { DunaEditor } from "@/components/duna-editor";
import Tenant from "@/lib/tenant/tenant";
import { TENANT_NAMESPACES } from "@/lib/constants";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    content: string;
    attachment?: File;
  }) => Promise<void>;
}

const CreatePostModal = ({
  isOpen,
  onClose,
  onSubmit,
}: CreatePostModalProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isConnected } = useAccount();

  const { ui } = Tenant.current();
  const useDarkStyling = ui.toggle("ui/use-dark-theme-styling")?.enabled;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Strip HTML tags for validation
    const plainTextContent = content.replace(/<[^>]*>/g, "").trim();
    if (!title.trim() || !plainTextContent) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        content: content.trim(),
        attachment: attachment || undefined,
      });
      // Reset form
      setTitle("");
      setContent("");
      setAttachment(null);
      onClose();
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachment(file);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setTitle("");
      setContent("");
      setAttachment(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className={`max-w-2xl w-[calc(100vw-2rem)] sm:max-w-2xl max-h-[90vh] overflow-y-auto ${
          useDarkStyling ? "bg-modalBackgroundDark border-cardBorder" : ""
        }`}
      >
        <DialogHeader>
          <DialogTitle
            className={`text-xl font-bold ${
              useDarkStyling ? "text-white" : "text-primary"
            }`}
          >
            Create New Post
          </DialogTitle>
        </DialogHeader>

        {!isConnected ? (
          <div className="text-center py-8 flex items-center justify-center">
            <ConnectKitButton.Custom>
              {({ show }) => (
                <Button
                  onClick={() => show?.()}
                  className={`${
                    useDarkStyling
                      ? "bg-buttonPrimaryDark text-white border-[#5A4B7A] hover:bg-buttonPrimaryDark/80"
                      : "text-white border border-black hover:bg-gray-800"
                  } text-sm`}
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
                  Connect your wallet to create a post
                </Button>
              )}
            </ConnectKitButton.Custom>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="title"
                className={`block text-sm font-medium mb-2 ${
                  useDarkStyling ? "text-white" : "text-primary"
                }`}
              >
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 ${
                  useDarkStyling
                    ? "bg-inputBackgroundDark text-white border-[#2B2449] placeholder-[#87819F] focus:ring-[#5A4B7A] focus:border-[#5A4B7A]"
                    : "bg-white text-primary border-[#E5E5E5] focus:ring-gray-200"
                }`}
                placeholder="Enter post title..."
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label
                htmlFor="content"
                className={`block text-sm font-medium mb-2 ${
                  useDarkStyling ? "text-white" : "text-primary"
                }`}
              >
                Content
              </label>
              <DunaEditor
                variant="post"
                placeholder="Write your DUNA post…"
                value={content}
                onChange={(html) => setContent(html)}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label
                htmlFor="attachment"
                className={`block text-sm font-medium mb-2 ${
                  useDarkStyling ? "text-white" : "text-primary"
                }`}
              >
                Attachment (Optional)
              </label>
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
                  className={`w-full sm:w-auto ${
                    useDarkStyling
                      ? "bg-buttonSecondaryDark text-white border-[#2B2449] hover:bg-buttonPrimaryDark"
                      : "bg-neutral text-primary border border-line hover:bg-wash"
                  }`}
                  disabled={isSubmitting}
                >
                  <PaperClipIcon className="w-4 h-4 mr-2" />
                  Choose File
                </Button>
                {attachment && (
                  <span
                    className={`text-sm truncate max-w-[200px] ${
                      useDarkStyling ? "text-[#87819F]" : "text-primary"
                    }`}
                  >
                    {attachment.name}
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                onClick={handleClose}
                className={`${
                  useDarkStyling
                    ? "bg-buttonSecondaryDark text-white border-[#2B2449] hover:bg-buttonPrimaryDark"
                    : "bg-neutral text-primary border border-line hover:bg-wash"
                }`}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className={`${
                  useDarkStyling
                    ? "bg-buttonPrimaryDark text-white border-[#5A4B7A] hover:bg-buttonPrimaryDark/80"
                    : "text-white border border-black hover:bg-gray-800"
                } text-sm`}
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
                disabled={
                  isSubmitting ||
                  !title.trim() ||
                  !content.replace(/<[^>]*>/g, "").trim()
                }
              >
                {isSubmitting ? "Creating..." : "Create Post"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;
