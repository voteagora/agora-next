"use client";

import Tenant from "@/lib/tenant/tenant";
import { UIMiradorConfig } from "@/lib/tenant/tenantUI";

function isMiradorGloballyDisabled() {
  return process.env.NEXT_PUBLIC_MIRADOR_ENABLED === "false";
}

export function getMiradorConfig(): UIMiradorConfig | null {
  if (isMiradorGloballyDisabled()) {
    return null;
  }

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

export function isMiradorProposalCreationTracingEnabled(): boolean {
  const config = getMiradorConfig();
  return config?.proposalCreation === true;
}

export function isMiradorSiweLoginTracingEnabled(): boolean {
  const config = getMiradorConfig();
  return config?.siweLoginTracing === true;
}

export function isMiradorEnabled(): boolean {
  return getMiradorConfig() !== null;
}

export function shouldEnableMiradorWebClient(): boolean {
  return isMiradorEnabled();
}
