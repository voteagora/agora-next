"use client";

import { useState, useCallback } from "react";
import { ClipboardDocumentIcon, CheckIcon } from "@heroicons/react/20/solid";

export default function ShareDraftLink({
  draftUuid,
  authorAddress,
}: {
  draftUuid: string;
  authorAddress: string;
}) {
  const [copied, setCopied] = useState(false);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/proposals/draft/${draftUuid}?share=${authorAddress}`
      : "";

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, [shareUrl]);

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-secondary hover:text-primary border border-line rounded-lg hover:border-tertiary transition-all"
    >
      <span>Share draft</span>
      {copied ? (
        <CheckIcon className="h-4 w-4 text-positive" />
      ) : (
        <ClipboardDocumentIcon className="h-4 w-4" />
      )}
    </button>
  );
}
