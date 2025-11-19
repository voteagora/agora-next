"use client";

import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { useAccount } from "wagmi";

interface DismissibleBannerProps {
  id: string; // Unique ID for localStorage
  icon?: React.ReactNode;
  title?: string;
  children: React.ReactNode;
  className?: string;
  attachedToCard?: boolean; // If true, banner appears inside/attached to a card
}

export default function DismissibleBanner({
  id,
  icon,
  title,
  children,
  className = "",
  attachedToCard = false,
}: DismissibleBannerProps) {
  const { address } = useAccount();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check localStorage on mount, including wallet address if available
    const storageKey = address
      ? `banner-dismissed-${id}-${address.toLowerCase()}`
      : `banner-dismissed-${id}`;
    const dismissed = localStorage.getItem(storageKey);
    setIsDismissed(dismissed === "true");
    setIsLoaded(true);
  }, [id, address]);

  const handleDismiss = () => {
    const storageKey = address
      ? `banner-dismissed-${id}-${address.toLowerCase()}`
      : `banner-dismissed-${id}`;
    localStorage.setItem(storageKey, "true");
    setIsDismissed(true);
  };

  // Don't render anything if dismissed after loading
  if (isLoaded && isDismissed) {
    return null;
  }

  // While loading or if not dismissed, render the banner
  // Use opacity to hide during load instead of not rendering
  const bannerClasses = isLoaded ? "" : "opacity-0";

  // Attached banner style (thin, minimal, integrated into parent card)
  if (attachedToCard) {
    return (
      <div
        className={`flex items-center gap-3 px-4 py-2.5 bg-wash/50 border-b border-line transition-opacity duration-150 ${bannerClasses} ${className}`}
      >
        {icon && <div className="flex-shrink-0">{icon}</div>}
        <div className="flex-1 min-w-0">
          {title && (
            <div className="text-sm font-semibold text-primary mb-0.5">
              {title}
            </div>
          )}
          <div className="text-sm text-secondary">{children}</div>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-tertiary hover:text-secondary transition-colors"
          aria-label="Dismiss banner"
          disabled={!isLoaded}
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Standalone banner style (for non-attached use cases)
  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 bg-neutral border border-line rounded-lg shadow-newDefault transition-opacity duration-150 ${bannerClasses} ${className}`}
    >
      {icon && <div className="flex-shrink-0 mt-0.5">{icon}</div>}
      <div className="flex-1 min-w-0">
        {title && (
          <div className="text-sm font-semibold text-primary mb-1">
            {title}
          </div>
        )}
        <div className="text-sm text-secondary leading-relaxed">{children}</div>
      </div>
      <button
        onClick={handleDismiss}
        className="flex-shrink-0 text-tertiary hover:text-secondary transition-colors"
        aria-label="Dismiss banner"
        disabled={!isLoaded}
      >
        <XMarkIcon className="w-5 h-5" />
      </button>
    </div>
  );
}
