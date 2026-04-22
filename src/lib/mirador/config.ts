import Tenant from "@/lib/tenant/tenant";
import { MIRADOR_FLOW } from "@/lib/mirador/constants";
import { MiradorFlow } from "@/lib/mirador/types";
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

const MIRADOR_CONFIG_KEY_BY_FLOW: Record<MiradorFlow, keyof UIMiradorConfig> = {
  [MIRADOR_FLOW.proposalCreation]: "proposalCreation",
  [MIRADOR_FLOW.governanceVote]: "governanceVote",
  [MIRADOR_FLOW.governanceDelegation]: "governanceDelegation",
  [MIRADOR_FLOW.staking]: "staking",
  [MIRADOR_FLOW.governanceAdmin]: "governanceAdmin",
  [MIRADOR_FLOW.proposalAttestation]: "proposalAttestation",
  [MIRADOR_FLOW.membershipAdmin]: "membershipAdmin",
  [MIRADOR_FLOW.notificationPreferences]: "siweLoginTracing",
  [MIRADOR_FLOW.delegateStatement]: "siweLoginTracing",
};

const MIRADOR_CONFIG_KEYS = [
  "proposalCreation",
  "siweLoginTracing",
  "governanceVote",
  "governanceDelegation",
  "staking",
  "governanceAdmin",
  "proposalAttestation",
  "membershipAdmin",
] as const satisfies ReadonlyArray<keyof UIMiradorConfig>;

export function isMiradorProposalCreationTracingEnabled(): boolean {
  return isMiradorFlowTracingEnabled(MIRADOR_FLOW.proposalCreation);
}

export function isMiradorSiweLoginTracingEnabled(): boolean {
  const config = getMiradorConfig();
  return config?.siweLoginTracing === true;
}

export function isMiradorFlowTracingEnabled(
  flow?: MiradorFlow | null
): boolean {
  if (!flow) {
    return false;
  }

  const config = getMiradorConfig();
  const configKey = MIRADOR_CONFIG_KEY_BY_FLOW[flow];
  return config?.[configKey] === true;
}

export function isMiradorEnabled(): boolean {
  const config = getMiradorConfig();
  return MIRADOR_CONFIG_KEYS.some((configKey) => config?.[configKey] === true);
}

export function shouldEnableMiradorWebClient(): boolean {
  return isMiradorEnabled();
}
