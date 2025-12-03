"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface DismissibleInfoBannerProps {
  id: string;
  message: string;
  linkText: string;
  linkHref: string;
}

export default function DismissibleInfoBanner({
  id,
  message,
  linkText,
  linkHref,
}: DismissibleInfoBannerProps) {
  const [isDismissed, setIsDismissed] = useState(true); // Default to true to prevent flash

  useEffect(() => {
    // Check localStorage on mount
    const dismissed = localStorage.getItem(`banner-dismissed-${id}`);
    setIsDismissed(dismissed === "true");
  }, [id]);

  const handleDismiss = () => {
    localStorage.setItem(`banner-dismissed-${id}`, "true");
    setIsDismissed(true);
  };

  if (isDismissed) {
    return null;
  }

  return (
    <div className="mb-6 bg-wash border border-line rounded-lg p-4 flex items-center justify-between gap-4 shadow-sm">
      <div className="flex items-center gap-3 flex-1">
        <div className="flex-shrink-0">
          <svg
            className="w-5 h-5 text-secondary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p className="text-sm text-secondary">
          {message}{" "}
          <Link
            href={linkHref}
            className="text-primary font-medium hover:underline inline-flex items-center gap-1"
          >
            {linkText}
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
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </p>
      </div>
      <button
        onClick={handleDismiss}
        className="flex-shrink-0 text-secondary hover:text-primary transition-colors p-1"
        aria-label="Dismiss banner"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}
