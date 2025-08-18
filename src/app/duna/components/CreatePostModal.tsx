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

  // Check if current tenant is Towns
  const { namespace } = Tenant.current();
  const isTowns = namespace === "towns";

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
          isTowns ? "bg-[#1E1A2F] border-[#43_36_73]" : ""
        }`}
      >
        <DialogHeader>
          <DialogTitle
            className={`text-xl font-bold ${
              isTowns ? "text-white" : "text-primary"
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
                  isTowns ? "text-white" : "text-primary"
                }`}
              >
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-200 ${
                  isTowns
                    ? "bg-[#2A2338] text-white border-[#43_36_73] placeholder-[#87819F]"
                    : "bg-white text-primary border-[#E5E5E5]"
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
                  isTowns ? "text-white" : "text-primary"
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
                  isTowns ? "text-white" : "text-primary"
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
                    isTowns
                      ? "bg-[#43_36_73] text-white border-[#43_36_73] hover:bg-[#5A4B7A]"
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
                      isTowns ? "text-[#87819F]" : "text-primary"
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
                  isTowns
                    ? "bg-[#43_36_73] text-white border-[#43_36_73] hover:bg-[#5A4B7A]"
                    : "bg-neutral text-primary border border-line hover:bg-wash"
                }`}
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
