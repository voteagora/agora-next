import Tenant from "@/lib/tenant/tenant";
import { isSafeProposalFlowSupported } from "@/lib/safeChains";
import { UISafeTrackingConfig } from "@/lib/tenant/tenantUI";

export const SAFE_OFFCHAIN_MESSAGE_TRACKING_DISABLED_MESSAGE =
  "Safe offchain message tracking is disabled for this tenant.";
export const SAFE_ONCHAIN_TRANSACTION_TRACKING_DISABLED_MESSAGE =
  "Safe onchain transaction tracking is disabled for this tenant.";

function readOptionalBooleanEnv(name: string): boolean | undefined {
  const value = process.env[name];
  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return undefined;
}

function getSafeTrackingToggle() {
  try {
    return Tenant.current().ui.toggle("safe-tracking");
  } catch {
    return null;
  }
}

export function getSafeTrackingConfig(): UISafeTrackingConfig | null {
  const toggle = getSafeTrackingToggle();
  if (!toggle) {
    return null;
  }

  if (!toggle.enabled) {
    return {
      offchainMessageTracking: false,
      onchainTransactionTracking: false,
    };
  }

  return (toggle.config as UISafeTrackingConfig | undefined) ?? null;
}

export function isSafeTrackingEnabled(): boolean {
  const envOverride = readOptionalBooleanEnv(
    "NEXT_PUBLIC_SAFE_TRACKING_ENABLED"
  );
  if (typeof envOverride === "boolean") {
    return envOverride;
  }

  const toggle = getSafeTrackingToggle();
  return toggle?.enabled === true;
}

export function isSafeOffchainMessageTrackingEnabled(): boolean {
  if (!isSafeTrackingEnabled()) {
    return false;
  }

  const envOverride = readOptionalBooleanEnv(
    "NEXT_PUBLIC_SAFE_OFFCHAIN_MESSAGE_TRACKING_ENABLED"
  );
  if (typeof envOverride === "boolean") {
    return envOverride;
  }

  return getSafeTrackingConfig()?.offchainMessageTracking !== false;
}

export function isSafeOnchainTransactionTrackingEnabled(): boolean {
  if (!isSafeTrackingEnabled()) {
    return false;
  }

  const envOverride = readOptionalBooleanEnv(
    "NEXT_PUBLIC_SAFE_ONCHAIN_TRANSACTION_TRACKING_ENABLED"
  );
  if (typeof envOverride === "boolean") {
    return envOverride;
  }

  return getSafeTrackingConfig()?.onchainTransactionTracking !== false;
}

export function shouldTrackSafeOnchainTransactions(chainId?: number): boolean {
  return (
    typeof chainId === "number" &&
    isSafeOnchainTransactionTrackingEnabled() &&
    isSafeProposalFlowSupported(chainId)
  );
}
