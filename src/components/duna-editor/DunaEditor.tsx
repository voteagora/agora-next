"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Strike from "@tiptap/extension-strike";
import Code from "@tiptap/extension-code";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import Blockquote from "@tiptap/extension-blockquote";
import HardBreak from "@tiptap/extension-hard-break";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ListOrdered, Quote } from "lucide-react";
import Tenant from "@/lib/tenant/tenant";

// Toolbar button component
const ToolbarButton = ({
  isActive,
  onClick,
  disabled,
  children,
  tooltip,
  shortcut,
}: {
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  tooltip: string;
  shortcut?: string;
}) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          className={cn(
            "h-8 w-8 p-1.5 rounded-md transition-colors inline-flex items-center justify-center",
            isActive && !disabled
              ? "bg-black text-white hover:bg-black/90"
              : "text-secondary hover:text-primary hover:bg-wash",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          aria-pressed={isActive}
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <div className="flex flex-col items-center gap-1">
          <span>{tooltip}</span>
          {shortcut && (
            <span className="text-xs text-tertiary">{shortcut}</span>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

// Link dialog component
const LinkDialog = ({
  isOpen,
  onClose,
  onConfirm,
  initialUrl = "",
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (url: string) => void;
  initialUrl?: string;
}) => {
  const [url, setUrl] = useState(initialUrl);

  useEffect(() => {
    setUrl(initialUrl);
  }, [initialUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onConfirm(url.trim());
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
      <div className="bg-white rounded-lg shadow-lg p-4 w-80 max-w-[90vw]">
        <h3 className="text-sm font-medium text-primary mb-3">Add Link</h3>
        <form>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="https://example.com"
            className="w-full px-3 py-2 border border-line rounded-md bg-wash text-primary outline-none"
            autoFocus
          />
          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-3 py-2 border border-line rounded-md bg-white text-primary hover:bg-wash transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!url.trim()}
              onClick={handleSubmit}
              className="flex-1 px-3 py-2 rounded-md bg-black text-white hover:bg-black/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Link
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export interface DunaEditorProps {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  onChange?: (html: string, text: string) => void;
  onSubmit?: (html: string, text: string) => void;
  disabled?: boolean;
  className?: string;
  variant?: "post" | "comment";
}

export default function DunaEditor({
  value,
  defaultValue = "",
  placeholder = "Write your message…",
  onChange,
  onSubmit,
  disabled = false,
  className,
  variant = "post",
}: DunaEditorProps) {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkDialogUrl, setLinkDialogUrl] = useState("");
  const { ui } = Tenant.current();

  // Debug link dialog state
  useEffect(() => {
    console.log("Link dialog state:", { linkDialogOpen, linkDialogUrl });
  }, [linkDialogOpen, linkDialogUrl]);
  const [isMounted, setIsMounted] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);

  // Ensure we're on the client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Bold,
      Italic,
      Strike,
      Code,
      BulletList,
      OrderedList,
      ListItem,
      Blockquote,
      HardBreak,
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          target: "_blank",
          rel: "noopener noreferrer",
        },
        validate: (href) => /^https?:\/\//.test(href),
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value || defaultValue,
    editable: !disabled,
    immediatelyRender: false, // Fix hydration issues
    onUpdate: ({ editor }) => {
      if (onChange) {
        const html = editor.getHTML();
        const text = editor.getText();
        console.log("DunaEditor onUpdate - HTML:", html);
        console.log("DunaEditor onUpdate - Text:", text);
        onChange(html, text);
      }
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm max-w-none outline-none",
          "prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-blockquote:my-1",
          "prose-li:my-0 prose-p:leading-relaxed",
          ui.customization?.cardBackground
            ? "prose-ol:text-white prose-ul:text-white prose-li:text-white prose-ol:marker:text-white prose-ul:marker:text-white prose-a:text-white prose-a:underline hover:prose-a:no-underline prose-p:text-white prose-blockquote:text-white prose-code:text-white prose-pre:text-white prose-headings:text-white prose-strong:text-white prose-b:text-white prose-em:text-white prose-i:text-white prose-del:text-white prose-s:text-white prose-ins:text-white prose-mark:text-white"
            : "prose-ol:text-primary prose-ul:text-primary prose-li:text-primary prose-ol:marker:text-primary prose-ul:marker:text-primary prose-a:text-primary prose-a:underline hover:prose-a:no-underline",
          "prose-ol:list-decimal prose-ul:list-disc"
        ),
      },
    },
  });

  // Handle controlled value updates
  useEffect(() => {
    if (value !== undefined && editor && editor.getHTML() !== value) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  // Listen for editor updates to force re-renders
  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      setForceUpdate((prev) => prev + 1);
    };

    editor.on("update", handleUpdate);
    editor.on("selectionUpdate", handleUpdate);

    return () => {
      editor.off("update", handleUpdate);
      editor.off("selectionUpdate", handleUpdate);
    };
  }, [editor]);

  // Handle submit
  const handleSubmit = useCallback(() => {
    if (editor && onSubmit) {
      const html = editor.getHTML();
      const text = editor.getText();
      console.log("DunaEditor handleSubmit - HTML:", html);
      console.log("DunaEditor handleSubmit - Text:", text);
      onSubmit(html, text);
    }
  }, [editor, onSubmit]);

  // Handle Enter key for submit
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  // Toolbar actions
  const toggleBold = useCallback(() => {
    editor?.chain().focus().toggleBold().run();
    setForceUpdate((prev) => prev + 1);
  }, [editor]);

  const toggleItalic = useCallback(() => {
    editor?.chain().focus().toggleItalic().run();
    setForceUpdate((prev) => prev + 1);
  }, [editor]);

  const toggleStrike = useCallback(() => {
    editor?.chain().focus().toggleStrike().run();
    setForceUpdate((prev) => prev + 1);
  }, [editor]);

  const toggleCode = useCallback(() => {
    editor?.chain().focus().toggleCode().run();
    setForceUpdate((prev) => prev + 1);
  }, [editor]);

  const toggleOrderedList = useCallback(() => {
    editor?.chain().focus().toggleOrderedList().run();
    setForceUpdate((prev) => prev + 1);
  }, [editor]);

  const toggleBulletList = useCallback(() => {
    editor?.chain().focus().toggleBulletList().run();
    setForceUpdate((prev) => prev + 1);
  }, [editor]);

  const toggleBlockquote = useCallback(() => {
    editor?.chain().focus().toggleBlockquote().run();
    setForceUpdate((prev) => prev + 1);
  }, [editor]);

  const handleLink = useCallback(() => {
    if (!editor) return;

    const { from, to } = editor.state.selection;
    const isLink = editor.isActive("link");

    if (isLink) {
      // Remove link if already active
      editor.chain().focus().unsetLink().run();
      setForceUpdate((prev) => prev + 1);
    } else {
      // Open link dialog
      const selectedText = editor.state.doc.textBetween(from, to);
      console.log("Opening link dialog with selected text:", selectedText);
      setLinkDialogUrl(selectedText);
      setLinkDialogOpen(true);
    }
  }, [editor]);

  const confirmLink = useCallback(
    (url: string) => {
      if (!editor) return;

      const { from, to } = editor.state.selection;
      const hasSelection = from !== to;

      console.log("Confirming link:", { url, hasSelection, from, to });

      if (hasSelection) {
        // Apply link to selection
        editor.chain().focus().setLink({ href: url }).run();
        console.log("Applied link to selection");
      } else {
        // Insert link as text
        editor
          .chain()
          .focus()
          .insertContent(`<a href="${url}">${url}</a>`)
          .run();
        console.log("Inserted link as text");
      }
      setForceUpdate((prev) => prev + 1);
    },
    [editor]
  );

  // Add custom keymaps
  useEffect(() => {
    if (!editor) return;

    // Add custom keymaps for lists and link
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey) {
        if (event.shiftKey && event.key === "7") {
          event.preventDefault();
          toggleOrderedList();
        } else if (event.shiftKey && event.key === "8") {
          event.preventDefault();
          toggleBulletList();
        } else if (event.key === "k") {
          event.preventDefault();
          handleLink();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [editor, toggleOrderedList, toggleBulletList, handleLink]);

  if (!isMounted || !editor) return null;

  return (
    <div
      className={cn(
        "border rounded-lg shadow-sm transition-all",
        variant === "post" ? "min-h-[200px]" : "min-h-[120px]",
        className
      )}
      style={{
        backgroundColor: ui.customization?.cardBackground
          ? `rgb(${ui.customization.cardBackground})`
          : "white",
        borderColor: ui.customization?.cardBorder
          ? `rgb(${ui.customization.cardBorder})`
          : "",
      }}
    >
      {/* Toolbar */}
      <div
        className="flex items-center gap-1 p-2 border-b rounded-t-lg"
        style={{
          backgroundColor: ui.customization?.hoverBackground
            ? `rgb(${ui.customization.hoverBackground})`
            : "var(--wash)",
          borderColor: ui.customization?.cardBorder
            ? `rgb(${ui.customization.cardBorder})`
            : "",
        }}
      >
        <ToolbarButton
          isActive={editor.isActive("bold")}
          onClick={toggleBold}
          disabled={disabled}
          tooltip="Bold"
          shortcut="⌘B"
        >
          <span className="font-bold text-sm">B</span>
        </ToolbarButton>

        <ToolbarButton
          isActive={editor.isActive("italic")}
          onClick={toggleItalic}
          disabled={disabled}
          tooltip="Italic"
          shortcut="⌘I"
        >
          <span className="italic text-sm">I</span>
        </ToolbarButton>

        <ToolbarButton
          isActive={editor.isActive("strike")}
          onClick={toggleStrike}
          disabled={disabled}
          tooltip="Strikethrough"
        >
          <span className="line-through text-sm">S</span>
        </ToolbarButton>

        <div className="w-px h-6 bg-line mx-1" />

        <ToolbarButton
          isActive={editor.isActive("link")}
          onClick={handleLink}
          disabled={disabled}
          tooltip="Link"
          shortcut="⌘K"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
        </ToolbarButton>

        <div className="w-px h-6 bg-line mx-1" />

        <ToolbarButton
          isActive={editor.isActive("orderedList")}
          onClick={toggleOrderedList}
          disabled={disabled}
          tooltip="Numbered list"
          shortcut="⌘⇧7"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          isActive={editor.isActive("bulletList")}
          onClick={toggleBulletList}
          disabled={disabled}
          tooltip="Bulleted list"
          shortcut="⌘⇧8"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 10h16M4 14h16M4 18h16"
            />
          </svg>
        </ToolbarButton>

        <ToolbarButton
          isActive={editor.isActive("blockquote")}
          onClick={toggleBlockquote}
          disabled={disabled}
          tooltip="Quote"
        >
          <Quote className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          isActive={editor.isActive("code")}
          onClick={toggleCode}
          disabled={disabled}
          tooltip="Inline code"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
            />
          </svg>
        </ToolbarButton>
      </div>

      {/* Editor content */}
      <div
        className={cn(
          "p-3 outline-none",
          variant === "post" ? "min-h-[160px]" : "min-h-[80px]"
        )}
        onKeyDown={handleKeyDown}
        style={{
          color: ui.customization?.cardBackground ? "white" : "inherit",
        }}
      >
        <EditorContent editor={editor} />
      </div>

      {/* Link dialog */}
      <LinkDialog
        isOpen={linkDialogOpen}
        onClose={() => setLinkDialogOpen(false)}
        onConfirm={confirmLink}
        initialUrl={linkDialogUrl}
      />
    </div>
  );
}
