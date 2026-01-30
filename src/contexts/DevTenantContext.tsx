"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { TenantNamespace } from "@/lib/types";
import { TENANT_NAMESPACES } from "@/lib/constants";
import TenantUIFactory from "@/lib/tenant/tenantUIFactory";
import { TenantUI } from "@/lib/tenant/tenantUI";
import { fontMapper, inter } from "@/styles/fonts";

type DevTenantContextType = {
  selectedTenant: TenantNamespace | null;
  setSelectedTenant: (tenant: TenantNamespace) => void;
  overrideUI: TenantUI | null;
  isDevMode: boolean;
};

const DevTenantContext = createContext<DevTenantContextType | undefined>(
  undefined
);

const defaults = {
  primary: "23 23 23",
  secondary: "64 64 64",
  tertiary: "115 115 115",
  neutral: "255 255 255",
  wash: "250 250 250",
  line: "229 229 229",
  positive: "0 153 43",
  negative: "197 47 0",
  brandPrimary: "23 23 23",
  brandSecondary: "255 255 255",
  letterSpacing: "0",
};

function applyThemeColors(ui: TenantUI) {
  const root = document.documentElement;
  const customization = ui.customization;

  const primary = customization?.primary || defaults.primary;
  const secondary = customization?.secondary || defaults.secondary;
  const tertiary = customization?.tertiary || defaults.tertiary;
  const neutral = customization?.neutral || defaults.neutral;
  const wash = customization?.wash || defaults.wash;
  const line = customization?.line || defaults.line;
  const positive = customization?.positive || defaults.positive;
  const negative = customization?.negative || defaults.negative;
  const brandPrimary = customization?.brandPrimary || defaults.brandPrimary;
  const brandSecondary =
    customization?.brandSecondary || defaults.brandSecondary;
  const letterSpacing = customization?.letterSpacing || defaults.letterSpacing;
  const font =
    fontMapper[customization?.font || ""]?.style.fontFamily ||
    inter.style.fontFamily;

  root.style.setProperty("--primary", primary);
  root.style.setProperty("--secondary", secondary);
  root.style.setProperty("--tertiary", tertiary);
  root.style.setProperty("--neutral", neutral);
  root.style.setProperty("--wash", wash);
  root.style.setProperty("--line", line);
  root.style.setProperty("--positive", positive);
  root.style.setProperty("--negative", negative);
  root.style.setProperty("--brand-primary", brandPrimary);
  root.style.setProperty("--brand-secondary", brandSecondary);
  root.style.setProperty(
    "--info-section-background",
    customization?.infoSectionBackground || neutral
  );
  root.style.setProperty(
    "--header-background",
    customization?.headerBackground || wash
  );
  root.style.setProperty(
    "--info-tab-background",
    customization?.infoTabBackground || neutral
  );
  root.style.setProperty(
    "--button-background",
    customization?.buttonBackground || primary
  );
  root.style.setProperty(
    "--card-background",
    customization?.cardBackground || "255 255 255"
  );
  root.style.setProperty("--card-border", customization?.cardBorder || line);
  root.style.setProperty(
    "--card-background-light",
    customization?.cardBackground || "255 255 255"
  );
  root.style.setProperty(
    "--card-background-dark",
    customization?.cardBackground || "30 26 47"
  );
  root.style.setProperty(
    "--hover-background-light",
    customization?.hoverBackground || "249 250 251"
  );
  root.style.setProperty(
    "--hover-background-dark",
    customization?.hoverBackground || "42 35 56"
  );
  root.style.setProperty(
    "--modal-background-dark",
    customization?.cardBackground || "30 26 47"
  );
  root.style.setProperty(
    "--input-background-dark",
    customization?.cardBackground || "42 35 56"
  );
  root.style.setProperty(
    "--button-primary-dark",
    customization?.buttonBackground || "89 75 122"
  );
  root.style.setProperty(
    "--button-secondary-dark",
    customization?.buttonBackground || "25 16 62"
  );
  root.style.setProperty(
    "--hover-background",
    customization?.hoverBackground || tertiary
  );
  root.style.setProperty(
    "--text-secondary",
    customization?.textSecondary || secondary
  );
  root.style.setProperty(
    "--footer-background",
    customization?.footerBackground || neutral
  );
  root.style.setProperty(
    "--inner-footer-background",
    customization?.innerFooterBackground || wash
  );
  root.style.fontFamily = font;
  root.style.letterSpacing = letterSpacing;

  if (ui.theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export function DevTenantProvider({ children }: { children: React.ReactNode }) {
  const isDevMode =
    typeof window !== "undefined" &&
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_AGORA_ENV !== "prod";

  const [selectedTenant, setSelectedTenantState] =
    useState<TenantNamespace | null>(null);
  const [overrideUI, setOverrideUI] = useState<TenantUI | null>(null);

  const setSelectedTenant = (tenant: TenantNamespace) => {
    if (!isDevMode) return;

    setSelectedTenantState(tenant);
    const newUI = TenantUIFactory.create(tenant);
    setOverrideUI(newUI);
    applyThemeColors(newUI);
  };

  return (
    <DevTenantContext.Provider
      value={{
        selectedTenant,
        setSelectedTenant,
        overrideUI,
        isDevMode,
      }}
    >
      {children}
    </DevTenantContext.Provider>
  );
}

export function useDevTenant() {
  const context = useContext(DevTenantContext);
  if (context === undefined) {
    throw new Error("useDevTenant must be used within a DevTenantProvider");
  }
  return context;
}
