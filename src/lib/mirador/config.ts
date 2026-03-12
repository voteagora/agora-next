"use client";

import Tenant from "@/lib/tenant/tenant";
import { UIMiradorConfig } from "@/lib/tenant/tenantUI";

export function getMiradorConfig(): UIMiradorConfig | null {
  try {
    const toggle = Tenant.current().ui.toggle("mirador");
    if (!toggle?.enabled) {
      return null;
    }

    return (toggle.config as UIMiradorConfig | undefined) ?? null;
  } catch {
    return null;
  }
}

export function isMiradorProposalCreationEnabled(): boolean {
  return getMiradorConfig()?.proposalCreation === true;
}

export function isMiradorSiweTracingEnabled(): boolean {
  return getMiradorConfig()?.proposalCreationSiwe === true;
}

export function shouldEnableMiradorWebClient(): boolean {
  const config = getMiradorConfig();
  return (
    config?.proposalCreation === true || config?.proposalCreationSiwe === true
  );
}
