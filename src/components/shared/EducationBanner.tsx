"use client";

import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/20/solid";
import Link from "next/link";

interface EducationBannerProps {
  icon: React.ReactNode;
  message: string;
  href: string;
  storageKey: string;
}

export function EducationBanner({
  icon,
  message,
  href,
  storageKey,
}: EducationBannerProps) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(localStorage.getItem(storageKey) === "true");
  }, [storageKey]);

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.setItem(storageKey, "true");
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <div className="bg-tertiary/10 border-b border-line px-6 py-4 flex items-center justify-between">
      <Link
        href={href}
        className="flex items-center gap-3 text-secondary hover:text-primary transition-colors"
      >
        <div className="text-tertiary">{icon}</div>
        <span className="text-sm font-medium">{message}</span>
      </Link>
      <button
        onClick={handleDismiss}
        className="text-secondary hover:text-primary transition-colors"
        aria-label="Dismiss banner"
      >
        <XMarkIcon className="h-5 w-5" />
      </button>
    </div>
  );
}
