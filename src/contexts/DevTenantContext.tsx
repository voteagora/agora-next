"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { TenantNamespace } from "@/lib/types";
import { TENANT_NAMESPACES } from "@/lib/constants";
import TenantUIFactory from "@/lib/tenant/tenantUIFactory";
import { TenantUI } from "@/lib/tenant/tenantUI";
import { fontMapper, inter } from "@/styles/fonts";
import {
  buildTenantCssVars,
  CSS_VAR_DEFAULTS,
} from "@/lib/tenant/tenantCssVars";

type DevTenantContextType = {
  selectedTenant: TenantNamespace | null;
  setSelectedTenant: (tenant: TenantNamespace) => void;
  overrideUI: TenantUI | null;
  isTenantSwitcherEnabled: boolean;
};

const DevTenantContext = createContext<DevTenantContextType | undefined>(
  undefined
);

function applyThemeColors(ui: TenantUI) {
  const root = document.documentElement;
  const customization = ui.customization;
  const vars = buildTenantCssVars(customization);

  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  const letterSpacing =
    customization?.letterSpacing || CSS_VAR_DEFAULTS.letterSpacing;
  const font =
    fontMapper[customization?.font || ""]?.style.fontFamily ||
    inter.style.fontFamily;

  root.style.fontFamily = font;
  root.style.letterSpacing = letterSpacing;

  if (ui.theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export function DevTenantProvider({ children }: { children: React.ReactNode }) {
  const isTenantSwitcherEnabled =
    typeof window !== "undefined" &&
    process.env.NEXT_PUBLIC_AGORA_ENV !== "prod" &&
    process.env.NEXT_PUBLIC_TENANT_SWITCHER_ENABLED !== "false";

  const [selectedTenant, setSelectedTenantState] =
    useState<TenantNamespace | null>(null);
  const [overrideUI, setOverrideUI] = useState<TenantUI | null>(null);

  const setSelectedTenant = (tenant: TenantNamespace) => {
    if (!isTenantSwitcherEnabled) return;

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
        isTenantSwitcherEnabled,
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
