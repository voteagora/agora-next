import { useState, useEffect } from "react";
import Tenant from "@/lib/tenant/tenant";
import { UIInfoBannerConfig } from "@/lib/tenant/tenantUI";

export function useInfoBannerVisibility(toggleName: string): boolean {
  const { ui } = Tenant.current();
  const bannerConfig = ui.toggle(toggleName);
  const [isBannerVisible, setIsBannerVisible] = useState(false);

  useEffect(() => {
    const checkBannerVisibility = () => {
      if (!bannerConfig?.enabled || !bannerConfig?.config) {
        setIsBannerVisible(false);
        return;
      }
      const config = bannerConfig.config as UIInfoBannerConfig;
      try {
        const dismissed = sessionStorage.getItem(config.storageKey) === "true";
        setIsBannerVisible(!dismissed);
      } catch (error) {
        setIsBannerVisible(false);
      }
    };

    checkBannerVisibility();

    // Listen for storage changes (when banner is dismissed)
    const handleStorageChange = (e: StorageEvent) => {
      const config = bannerConfig?.config as UIInfoBannerConfig | undefined;
      if (e.key === config?.storageKey) {
        checkBannerVisibility();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Also check periodically for same-window changes (storage event doesn't fire for same window)
    const interval = setInterval(checkBannerVisibility, 100);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [bannerConfig]);

  return isBannerVisible;
}
