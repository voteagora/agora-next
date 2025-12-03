"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CloseIcon } from "@/icons/closeIcon";
import { InfoIcon } from "@/icons/InfoIcon";

interface DismissableBannerProps {
  storageKey: string;
  message: string;
  linkText: string;
  linkHref: string;
}

export default function DismissableBanner({
  storageKey,
  message,
  linkText,
  linkHref,
}: DismissableBannerProps) {
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    const dismissed = localStorage.getItem(storageKey);
    setIsDismissed(dismissed === "true");
  }, [storageKey]);

  const handleDismiss = () => {
    localStorage.setItem(storageKey, "true");
    setIsDismissed(true);
  };

  if (isDismissed) {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 bg-wash border-b border-line text-sm">
      <div className="flex items-center gap-2">
        <InfoIcon className="w-4 h-4 shrink-0" fill="currentColor" />
        <span className="text-secondary">{message}</span>
        <Link
          href={linkHref}
          className="text-primary font-medium hover:underline whitespace-nowrap"
        >
          {linkText}
        </Link>
      </div>
      <button
        onClick={handleDismiss}
        className="p-1 hover:bg-tertiary/10 rounded transition-colors shrink-0"
        aria-label="Dismiss banner"
      >
        <CloseIcon className="w-3 h-3" fill="currentColor" />
      </button>
    </div>
  );
}
