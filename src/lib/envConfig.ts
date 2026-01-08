export type InfraEnv = "dev" | "prod";
export type ContractDeployment = "test" | "main";

// Legacy fallback for backwards compatibility
const legacyEnv = process.env.NEXT_PUBLIC_AGORA_ENV as InfraEnv | undefined;

export function getInfraEnv(): InfraEnv {
  return (
    (process.env.NEXT_PUBLIC_AGORA_INFRA_ENV as InfraEnv) || legacyEnv || "dev"
  );
}

export function getContractDeployment(): ContractDeployment {
  const explicit = process.env
    .NEXT_PUBLIC_AGORA_CONTRACT_DEPLOYMENT as ContractDeployment;
  if (explicit) return explicit;

  // Fallback: use legacy env if set, otherwise derive from infra env
  if (legacyEnv) {
    return legacyEnv === "prod" ? "main" : "test";
  }

  return getInfraEnv() === "prod" ? "main" : "test";
}

export function isMainContractDeployment(): boolean {
  return getContractDeployment() === "main";
}

export function isProdInfra(): boolean {
  return getInfraEnv() === "prod";
}

export function isTestContractDeployment(): boolean {
  return getContractDeployment() === "test";
}

export function isDevInfra(): boolean {
  return getInfraEnv() === "dev";
}
