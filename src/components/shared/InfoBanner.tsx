"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { BookOpenIcon } from "@heroicons/react/24/outline";
import { useAccount } from "wagmi";
import Tenant from "@/lib/tenant/tenant";
import { UIInfoBannerConfig } from "@/lib/tenant/tenantUI";

interface InfoBannerProps {
  toggleName: string;
}

export default function InfoBanner({ toggleName }: InfoBannerProps) {
  const { ui } = Tenant.current();
  const bannerConfig = ui.toggle(toggleName);
  const { address } = useAccount();

  const [isDismissed, setIsDismissed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (!bannerConfig?.enabled || !bannerConfig?.config) {
      return;
    }
    const config = bannerConfig.config as UIInfoBannerConfig;
    try {
      // Check if banner was dismissed for the current address
      const dismissedAddress = sessionStorage.getItem(
        `${config.storageKey}-address`
      );
      const dismissed = sessionStorage.getItem(config.storageKey) === "true";

      // If address changed (logout/login), reset the dismissal
      if (address && dismissedAddress !== address) {
        sessionStorage.removeItem(config.storageKey);
        sessionStorage.removeItem(`${config.storageKey}-address`);
        setIsDismissed(false);
      } else if (!address && dismissedAddress) {
        // User logged out, clear the dismissal so it shows again on next login
        sessionStorage.removeItem(config.storageKey);
        sessionStorage.removeItem(`${config.storageKey}-address`);
        setIsDismissed(false);
      } else {
        setIsDismissed(dismissed);
      }
    } catch (error) {
      // If sessionStorage is not available, show the banner
      setIsDismissed(false);
    }
  }, [bannerConfig, address]);

  const handleDismiss = () => {
    if (!bannerConfig?.config) return;
    const config = bannerConfig.config as UIInfoBannerConfig;
    try {
      sessionStorage.setItem(config.storageKey, "true");
      // Store the address so we can detect when it changes
      if (address) {
        sessionStorage.setItem(`${config.storageKey}-address`, address);
      }
      setIsDismissed(true);
    } catch (error) {
      // If sessionStorage is not available, just hide it
      setIsDismissed(true);
    }
  };

  // Don't render until mounted to avoid hydration issues
  if (!isMounted) {
    return null;
  }

  // Don't render if feature is disabled, config is missing, or banner is dismissed
  if (!bannerConfig?.enabled || !bannerConfig?.config || isDismissed) {
    return null;
  }

  const config = bannerConfig.config as UIInfoBannerConfig;

  return (
    <div className="flex items-center justify-between gap-4 px-4 pt-4 pb-6 mb-0 border border-line shadow-newDefault rounded-lg relative z-0 bg-wash">
      <div className="flex items-center gap-3 flex-1">
        <BookOpenIcon className="w-5 h-5 text-primary flex-shrink-0" />
        <Link
          href={config.link}
          className="text-sm text-primary font-medium hover:opacity-80 transition-opacity"
        >
          {config.text}
        </Link>
      </div>
      <button
        onClick={handleDismiss}
        className="flex-shrink-0 p-1 hover:bg-tertiary/10 rounded transition-colors"
        aria-label="Dismiss banner"
      >
        <XMarkIcon className="w-5 h-5 text-primary" />
      </button>
    </div>
  );
}
