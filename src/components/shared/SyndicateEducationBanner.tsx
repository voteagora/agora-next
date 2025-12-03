"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Info, X } from "lucide-react";

interface SyndicateEducationBannerProps {
  storageKey: string;
  message: string;
  linkHref: string;
  linkText?: string;
  className?: string;
}

export function SyndicateEducationBanner({
  storageKey,
  message,
  linkHref,
  linkText = "Learn more",
  className = "",
}: SyndicateEducationBannerProps) {
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    const dismissed = localStorage.getItem(storageKey) === "true";
    setIsDismissed(dismissed);
  }, [storageKey]);

  const handleDismiss = () => {
    localStorage.setItem(storageKey, "true");
    setIsDismissed(true);
  };

  if (isDismissed) {
    return null;
  }

  return (
    <div
      className={`w-full p-4 flex items-center justify-between gap-4 ${className}`}
    >
      <div className="flex items-center gap-3">
        <Info className="w-5 h-5 text-secondary shrink-0" />
        <span className="text-sm text-secondary">
          {message}{" "}
          <Link
            href={linkHref}
            className="text-primary font-medium hover:underline"
          >
            {linkText}
          </Link>
        </span>
      </div>
      <button
        onClick={handleDismiss}
        className="p-1 hover:bg-wash rounded-md transition-colors shrink-0"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4 text-tertiary" />
      </button>
    </div>
  );
}
