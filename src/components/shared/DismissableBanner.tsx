"use client";

import React, { useState, useEffect } from "react";
import { LucideIcon, X } from "lucide-react";
import Link from "next/link";

interface DismissableBannerProps {
  storageKey: string;
  icon: LucideIcon;
  message: string;
  linkText: string;
  linkHref: string;
  variant?: "standalone" | "table-header";
}

export function DismissableBanner({
  storageKey,
  icon: Icon,
  message,
  linkText,
  linkHref,
  variant = "standalone",
}: DismissableBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(storageKey) === "true";
    setIsDismissed(dismissed);
    setIsLoaded(true);
  }, [storageKey]);

  const handleDismiss = () => {
    localStorage.setItem(storageKey, "true");
    setIsDismissed(true);
  };

  if (!isLoaded || isDismissed) {
    return null;
  }

  const isStandalone = variant === "standalone";
  const baseClasses =
    "flex items-center justify-between gap-4 bg-wash border-line px-6 py-4";
  const variantClasses = isStandalone
    ? "rounded-xl border shadow-newDefault mb-6"
    : "border-b";

  return (
    <div className={`${baseClasses} ${variantClasses}`}>
      <div className="flex items-center gap-3 flex-1">
        <Icon className="w-5 h-5 text-secondary flex-shrink-0" />
        <span className="text-sm text-secondary">{message}</span>
        <Link
          href={linkHref}
          className="text-sm font-medium text-blue-600 hover:text-blue-700 whitespace-nowrap"
        >
          {linkText}
        </Link>
      </div>
      <button
        onClick={handleDismiss}
        className="text-secondary hover:text-primary transition-colors p-1 flex-shrink-0"
        aria-label="Dismiss banner"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
